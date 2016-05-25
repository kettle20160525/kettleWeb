CheckSumDialog = Ext.extend(Ext.Window, {
	title: '增加校验列',
	width: 400,
	height: 400,
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
			height: 150,
			defaultType: 'textfield',
			labelWidth: 60,
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-10',
				name: 'label',
				value: cell.getAttribute('label')
			}, new Ext.form.ComboBox({
				fieldLabel: '类型',
				anchor: '-10',
				displayField: 'text',
				valueField: 'value',
				typeAhead: true,
		        mode: 'local',
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: new Ext.data.JsonStore({
		        	fields: ['value', 'text'],
		        	data: [{value: '0', text: 'CRC 32'},
		        	       {value: '1', text: 'ADLER 32'},
		        	       {value: '2', text: 'MD5'},
		        	       {value: '3', text: 'SHA-1'}]
			    }),
			    hiddenName: 'checkSumType',
				value: cell.getAttribute('checkSumType') || 0
			}), new Ext.form.ComboBox({
				fieldLabel: '结果类型',
				anchor: '-10',
			    displayField: 'text',
				valueField: 'value',
				typeAhead: true,
		        mode: 'local',
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: new Ext.data.JsonStore({
		        	fields: ['value', 'text'],
		        	data: [{value: '0', text: 'String'},
		        	       {value: '1', text: 'Hexadecimal'},
		        	       {value: '2', text: 'Binary'}]
			    }),
			    hiddenName: 'resultType',
				value: cell.getAttribute('resultType') || 0,
			    disabled: true
			}),{
				fieldLabel: '结果字段',
				anchor: '-10',
				name: 'resultfieldName',
				value: cell.getAttribute('resultfieldName')
			},{
				fieldLabel: '兼容模式',
				xtype: 'checkbox',
				anchor: '-10',
				name: 'compatibilityMode',
				checked: cell.getAttribute('compatibilityMode') == 'true'
			}]
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			region: 'center',
			title: '校验使用的字段',
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
				header: '名称', dataIndex: 'name', width: 200, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value'],
			        	data: [{value: 'Date'}]
			        }),
			        displayField:'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			}],
			store: new Ext.data.JsonStore({
				fields: ['name'],
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
                	formValues.compatibilityMode = formValues.compatibilityMode ? true : false;
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
		
		CheckSumDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('CheckSum', CheckSumDialog);
