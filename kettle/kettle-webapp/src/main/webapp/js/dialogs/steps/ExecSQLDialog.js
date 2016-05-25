ExecSQLDialog = Ext.extend(Ext.Window, {
	title: '执行SQL语句',
	width: 600,
	height: 400,
	closeAction: 'close',
	modal: true,
	layout: 'fit',
	bodyStyle: 'padding: 5px;',
	initComponent: function() {
		var me = this, 
			transGraph = getActiveTransGraph(),
			graph = transGraph.getGraph(), 
			cell = graph.getSelectionCell(), 
			store = transGraph.getDatabaseStore();
		
		var form = new Ext.form.FormPanel({
			title: '基本配置',
			bodyStyle: 'padding: 10px',
			region: 'center',
			height: 150,
			defaultType: 'textfield',
			labelWidth: 70,
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-10',
				name: 'label',
				value: cell.getAttribute('label')
			}, {
				xtype: 'compositefield',
				anchor: '-10',
				items: [new Ext.form.ComboBox({
					fieldLabel: '数据库连接',
					anchor: '-10',
					flex: 1,
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: store,
					name: 'connection',
					value: cell.getAttribute('connection')
				}), {
					xtype: 'button', text: '编辑...', handler: function() {
						var databaseDialog = new DatabaseDialog({database: cell.getAttribute('connection')});
						databaseDialog.show();
					}
				}, {
					xtype: 'button', text: '新建...', handler: function() {
						var databaseDialog = new DatabaseDialog();
						databaseDialog.show();
					}
				}, {
					xtype: 'button',
					text: '向导...'
				}]
			}, {
				xtype: 'textarea',
				fieldLabel: 'SQL语句',
				height: 200,
				emptyText: '多个SQL语句之间用;分割，问号(?)将被参数替换',
				anchor: '-10',
				name: 'sql',
				value: decodeURIComponent(cell.getAttribute('sql'))
			}]
		});
		
		var details = new Ext.form.FormPanel({
			title: '细节',
			bodyStyle: 'padding: 5px',
			labelWidth: 1,
			items: [{
                xtype: 'checkboxgroup',
                columns: 1,
                anchor: '-5',
                items: [
                    {boxLabel: '执行每一行', name: 'executedEachInputRow', checked: true},
                    {boxLabel: 'Execute as a single statement', name: 'singleStatement', checked: true},
                    {boxLabel: '变量替换', name: 'replaceVariables', checked: true},
                    {boxLabel: '绑定参数?', name: 'setParams'},
                    {boxLabel: 'Quote String?', name: 'quoteString'}
                ]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;',
            		text: '包含插入状态的字段：'
            	},{
            		xtype: 'textfield',
            		flex: 1
            	}]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;',
            		text: '包含更新状态的字段：'
            	},{
            		xtype: 'textfield',
            		flex: 1
            	}]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;',
            		text: '包含删除状态的字段：'
            	},{
            		xtype: 'textfield',
            		flex: 1
            	}]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 12px',
            		text: '包含读状态的字段：'
            	},{
            		xtype: 'textfield',
            		flex: 1
            	}]
            }]
		});
		
		var parameters = new Ext.grid.EditorGridPanel({
			title: '参数',
			tbar: [{
				iconCls: 'add', handler: function() {
					var RecordType = parameters.getStore().recordType;
	                var p = new RecordType({
	                    name: '',
	                    type: '',
	                    format: '',
	                    length: 100
	                });
	                parameters.stopEditing();
	                parameters.getStore().insert(0, p);
	                parameters.startEditing(0, 0);
				}
			},{
				iconCls: 'delete'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '作为参数的字段', dataIndex: 'name', width: 150, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}],
			store: new Ext.data.JsonStore({
				fields: ['name'],
				data: []
			})
		});
		
		this.items = new Ext.TabPanel({
			activeTab: 0,
			deferredRender: false,
			items: [form, details, parameters]
		});
		
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
                	formValues.sql = encodeURIComponent(formValues.sql);
                	//formValues.compatibilityMode = formValues.compatibilityMode ? true : false;
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
		
		ExecSQLDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('ExecSQL', ExecSQLDialog);
