SystemInfoDialog = Ext.extend(Ext.Window, {
	title: '获取系统信息',
	width: 600,
	height: 400,
	closeAction: 'close',
	modal: true,
	layout: 'fit',
	initComponent: function() {
		var me = this, graph = getActiveTransGraph().getGraph(), cell = graph.getSelectionCell();
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			border: false,
			region: 'north',
			height: 50,
			defaultType: 'textfield',
			labelWidth: 100,
			labelAlign: 'right',
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-10',
				name: 'label',
				value: cell.getAttribute('label')
			}]
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			title: '字段',
			region :'center',
			tbar: [{
				iconCls: 'add', text: '添加字段', handler: function() {
					var RecordType = grid.getStore().recordType;
	                var record = new RecordType({
	                    name: '',
	                    type: ''
	                });
	                grid.stopEditing();
	                grid.getStore().insert(0, record);
	                grid.startEditing(0, 0);
				}
			},{
				iconCls: 'delete', text: '删除字段'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 200, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '类型', dataIndex: 'type', width: 200, renderer: function(v)
				{
					var store = Ext.StoreMgr.get('systemDataTypesStore');
					var n = store.find('code', v);
					if(n == -1) return v;
					return store.getAt(n).get('descrp');
				}
			}],
			store: new Ext.data.JsonStore({
				fields: ['name', 'type'],
				data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
			})
		});
		
		grid.on('cellclick', function(g, r, c) {
			if(c == 2) {
				var listBox = new ListBox({
					height: 80,
					displayField: 'descrp',
					valueField: 'code',
					store: Ext.StoreMgr.get('systemDataTypesStore')
				});
				
				var win = new Ext.Window({
					width: 250,
					height: 500,
					model: true,
					closeAction: 'close',
					layout: 'fit',
					items: listBox
				});
				
				win.show();
			}
		});
		
		this.items = {
			layout: 'fit',
			border: false,
			bodyStyle: 'padding: 5px;',
			items: {
				layout: 'border',
				border: false,
				items: [form, grid]
			}
		};
		
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
                }
                finally
                {
                    graph.getModel().endUpdate();
                }
                
				me.close();
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		SystemInfoDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SystemInfo', SystemInfoDialog);
