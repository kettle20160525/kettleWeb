RowGeneratorDialog = Ext.extend(Ext.Window, {
	title: '生成记录',
	width: 700,
	height: 500,
	closeAction: 'close',
	modal: true,
	layout: 'border',
	initComponent: function() {
		var me = this,
		graph = getActiveTransGraph().getGraph(), 
		cell = graph.getSelectionCell();
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			region: 'north',
			height: 185,
			defaultType: 'textfield',
			labelWidth: 170,
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-10',
				name: 'label',
				value: cell.getAttribute('label')
			},{
				fieldLabel: '限制',
				anchor: '-10',
				name: 'rowLimit',
				value: cell.getAttribute('rowLimit') || 100000
			},{
				fieldLabel: 'Never stop generating rows',
				xtype: 'checkbox',
				anchor: '-10',
				name: 'neverEnding',
				checked: cell.getAttribute('neverEnding') == 'true'
			},{
				fieldLabel: 'Interval in ms(delay)',
				anchor: '-10',
				name: 'intervalInMs',
				value: cell.getAttribute('intervalInMs')
			},{
				fieldLabel: 'Current row time field name',
				anchor: '-10',
				name: 'rowTimeField',
				value: cell.getAttribute('rowTimeField')
			},{
				fieldLabel: 'Previous row time field name',
				anchor: '-10',
				name: 'lastTimeField',
				value: cell.getAttribute('lastTimeField')
			}]
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			region: 'center',
			title: '字段',
			tbar: [{
				iconCls: 'add', handler: function() {
					var RecordType = grid.getStore().recordType;
	                var p = new RecordType({
	                    name: '',
	                    type: '',
	                    format: '',
	                    length: 100
	                });
	                grid.stopEditing();
	                grid.getStore().insert(0, p);
	                grid.startEditing(0, 0);
				}
			},{
				iconCls: 'delete'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '类型', dataIndex: 'type', width: 100, editor: new Ext.form.ComboBox({
			        store: Ext.StoreMgr.get('valueMetaStore'),
			        displayField: 'name',
			        valueField: 'name',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: '格式', dataIndex: 'format', width: 150, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value'],
			        	data: [{value: 'yyyy-MM-dd HH:mm:ss'},
			        	       {value: 'yyyy/MM/dd HH:mm:ss'},
			        	       {value: 'yyyy-MM-dd'},
			        	       {value: 'yyyy/MM/dd'},
			        	       {value: 'yyyyMMdd'},
			        	       {value: 'yyyyMMddHHmmss'}]
			        }),
			        displayField:'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: '长度', dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
			},{
				header: '精度', dataIndex: 'precision', width: 100, editor: new Ext.form.TextField()
			},{
				header: '货币类型', dataIndex: 'currencyType', width: 100, editor: new Ext.form.TextField()
			},{
				header: '小数', dataIndex: 'decimal', width: 100, editor: new Ext.form.TextField()
			},{
				header: '分组', dataIndex: 'group', width: 100, editor: new Ext.form.TextField()
			},{
				header: '值', dataIndex: 'value', width: 100, editor: new Ext.form.TextField()
			},{
				header: '设为空串?', dataIndex: 'nullable', xtype: 'checkcolumn', width: 80
			}],
			store: new Ext.data.JsonStore({
				fields: ['name', 'type', 'format', 'length', 'precision', 'currencyType', 'decimal', 'group', 'value', {name:'nullable', type:'boolean'}],
				data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
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
	            	formValues.neverEnding = formValues.neverEnding ? true : false;
	            	for(var fieldName in formValues) {
						var edit = new mxCellAttributeChange(cell, fieldName, formValues[fieldName]);
	                	graph.getModel().execute(edit);
					}
	            	
	            	var fields = [];
	            	grid.getStore().each(function(rec) {
	            		fields.push(rec.data);
	            	});
	            	
	            	var edit = new mxCellAttributeChange(cell, 'fields', Ext.encode(fields));
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
		
		RowGeneratorDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('RowGenerator', RowGeneratorDialog);
