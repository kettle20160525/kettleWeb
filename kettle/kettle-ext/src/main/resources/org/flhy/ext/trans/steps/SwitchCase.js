SwitchCaseDialog = Ext.extend(Ext.Window, {
	title: 'Switch / Case',
	width: 600,
	height: 500,
	closeAction: 'close',
	modal: true,
	layout: 'border',
	initComponent: function() {
		var me = this,
		graph = getActiveGraph().getGraph(), 
		cell = graph.getSelectionCell();
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'length', 'precision', 'origin', 'storageType', 'conversionMask', 'currencySymbol', 'decimalSymbol', 'groupingSymbol', 'trimType', 'comments'],
			proxy: new Ext.data.HttpProxy({
				url: GetUrl('step/inputOutputFields.do'),
				method: 'POST'
			})
		});
		
		var enc = new mxCodec(mxUtils.createXmlDocument());
		var node = enc.encode(graph.getModel());
		
		store.baseParams.stepName = cell.getAttribute('label');
		store.baseParams.graphXml = mxUtils.getPrettyXml(node);
		store.baseParams.before = true;
		store.load();
		
		var targetStore = new Ext.data.JsonStore({
			fields: ['name'],
			data: []
		}), data = [];
		var outputEdges = graph.getOutgoingEdges(cell, graph.getDefaultParent());
		Ext.each(outputEdges, function(edge) {
			if(edge.target) {
				data.push({name: edge.target.getAttribute('label')});
			}
		});
		targetStore.loadData(data);
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			region: 'north',
			height: 240,
			defaultType: 'textfield',
			labelAlign: 'right',
			labelWidth: 130,
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-10',
				name: 'label',
				value: cell.getAttribute('label')
			}, new Ext.form.ComboBox({
				fieldLabel: 'Switch 字段',
				anchor: '-10',
				displayField: 'name',
				valueField: 'name',
				typeAhead: true,
		        mode: 'local',
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: store,
			    hiddenName: 'fieldname',
				value: cell.getAttribute('fieldname')
			}),{
				fieldLabel: '使用字符串包含比较符',
				xtype: 'checkbox',
				anchor: '-10',
				name: 'use_contains',
				checked: cell.getAttribute('use_contains') == 'Y'
			}, new Ext.form.ComboBox({
				fieldLabel: 'Case值数据类型',
				anchor: '-10',
			    displayField: 'name',
				valueField: 'id',
				typeAhead: true,
		        mode: 'local',
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: Ext.StoreMgr.get('valueMetaStore'),
			    hiddenName: 'case_value_type',
				value: cell.getAttribute('case_value_type')
			}),{
				fieldLabel: 'Case值转换掩码',
				anchor: '-10',
				name: 'case_value_format',
				value: cell.getAttribute('case_value_format')
			},{
				fieldLabel: 'Case值小数点符号',
				anchor: '-10',
				name: 'case_value_decimal',
				value: cell.getAttribute('case_value_decimal')
			},{
				fieldLabel: 'Case值分组标志',
				anchor: '-10',
				name: 'case_value_group',
				value: cell.getAttribute('case_value_group')
			}, new Ext.form.ComboBox({
				fieldLabel: '默认目标步骤',
				anchor: '-10',
			    displayField: 'name',
				valueField: 'name',
				typeAhead: true,
		        mode: 'local',
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: targetStore,
			    hiddenName: 'default_target_step',
				value: cell.getAttribute('default_target_step')
			})]
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			region: 'center',
			title: 'Case值映射',
			tbar: [{
				iconCls: 'add', handler: function() {
					var RecordType = grid.getStore().recordType;
	                var p = new RecordType({
	                    name: ''
	                });
	                grid.stopEditing();
	                grid.getStore().insert(0, p);
	                grid.startEditing(0, 0);
				}
			},{
				iconCls: 'delete'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '值', dataIndex: 'value', width: 200, editor: new Ext.form.TextField()
				},{
				header: '目标步骤', dataIndex: 'target_step', width: 200, editor: new Ext.form.ComboBox({
			        store: targetStore,
			        displayField: 'name',
			        valueField: 'name',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			}],
			store: new Ext.data.JsonStore({
				fields: ['value', 'target_step'],
				data: Ext.decode(cell.getAttribute('cases') || Ext.encode([]))
			})
		});
		
		this.items = [form, grid];
		
		var bCancel = new Ext.Button({
			text: '取消', handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', handler: function() {
				graph.getModel().beginUpdate();
                try
                {
                	var formValues = form.getForm().getValues();
                	formValues.compatibilityMode = formValues.compatibilityMode ? true : false;
                	for(var fieldName in formValues) {
						var edit = new mxCellAttributeChange(cell, fieldName, formValues[fieldName]);
                    	graph.getModel().execute(edit);
					}
                	
                	var fields = [];
                	grid.getStore().each(function(rec) {
                		fields.push(rec.data);
                	});
                	
                	var edit = new mxCellAttributeChange(cell, 'cases', Ext.encode(fields));
                	graph.getModel().execute(edit);
                }
                finally
                {
                    graph.getModel().endUpdate();
                }
                
				me.close();
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		SwitchCaseDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SwitchCase', SwitchCaseDialog);
