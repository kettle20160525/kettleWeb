TableOutputDialog = Ext.extend(Ext.Window, {
	title: '表输入',
	width: 600,
	height: 590,
	closeAction: 'close',
	modal: true,
	layout: 'border',
	initComponent: function() {
		var me = this, 
			transGraph = getActiveTransGraph(),
			graph = transGraph.getGraph(), 
			cell = graph.getSelectionCell(), 
			store = transGraph.getDatabaseStore();
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			region: 'north',
			baseCls: 'x-plain',
			height: 220,
			labelWidth: 1,
			items: [{
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 36px',
            		text: '步骤名称：'
            	},{
            		xtype: 'textfield',
            		flex: 1,
            		name: 'label',
    				value: cell.getAttribute('label')
            	}]
            },{
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 24px',
            		text: '数据库连接：'
            	},{
    				xtype: 'compositefield',
    				flex: 1,
    				items: [new Ext.form.ComboBox({
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
    			}]
	        }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 36px',
            		text: '目标模式：'
            	},{
            		xtype: 'textfield',
            		flex: 1,
            		name: 'schema',
					value: cell.getAttribute('schema')
            	}, {
					xtype: 'button',
					text: '浏览'
				}]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 48px',
            		text: '目标表：'
            	},{
            		xtype: 'textfield',			// extjs bug
            		flex: 1,
            		name: 'table',
					value: cell.getAttribute('table')
            	}, {
					xtype: 'button',
					text: '浏览'
				}]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 12px',
            		text: '提交记录数量：'
            	},{
            		xtype: 'textfield',
            		flex: 1,
            		name: 'commit',
    				value: cell.getAttribute('commit')
            	}]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 48px',
            		text: '裁剪表：'
            	},{
            		xtype: 'checkbox',
            		name: 'truncate',
    				checked: cell.getAttribute('truncate') == 'Y'
            	}]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 12px',
            		text: '忽略插入错误：'
            	},{
            		xtype: 'checkbox',
            		name: 'ignore_errors',
            		checked: cell.getAttribute('ignore_errors') == 'Y'
            	}]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;',
            		text: '指定数据库字段：'
            	},{
            		xtype: 'checkbox',
            		name: 'specify_fields',
            		checked: cell.getAttribute('specify_fields') == 'Y'
            	}]
            }]
		});
		
		var mainForm = new Ext.form.FormPanel({
			title: '主选项',
			bodyStyle: 'padding: 20px 10px',
			labelWidth: 180,
			labelAlign: 'right',
			defaultType: 'textfield',
			items: [{
				xtype: 'checkbox',
				fieldLabel: '表分区数据',
				name: 'partitioning_enabled',
				checked: cell.getAttribute('partitioning_enabled') == 'Y'
			}, {
				fieldLabel: '分区字段',
				anchor: '-10',
				name: 'partitioning_field',
				value: cell.getAttribute('partitioning_field')
			}, {
				xtype: 'radio',
				fieldLabel: '每个月分区数据',
				name: 'partitioning_monthly',
				checked: cell.getAttribute('partitioning_monthly') == 'Y'
			}, {
				xtype: 'radio',
				fieldLabel: '每天分区数据',
				name: 'partitioning_daily',
				checked: cell.getAttribute('partitioning_daily') == 'Y'
			}, {
				xtype: 'checkbox',
				fieldLabel: '使用批量插入',
				name: 'use_batch',
				checked: cell.getAttribute('use_batch') == 'Y'
			}, {
				xtype: 'checkbox',
				fieldLabel: '表名定义在一个字段里?',
				name: 'tablename_in_field',
				checked: cell.getAttribute('tablename_in_field') == 'Y'
			}, {
				fieldLabel: '包含表名的字段',
				anchor: '-10',
				name: 'tablename_field',
				value: cell.getAttribute('tablename_field')
			}, {
				xtype: 'checkbox',
				fieldLabel: '存储表名字段',
				name: 'tablename_in_table',
				checked: cell.getAttribute('tablename_in_table') == 'Y'
			}, {
				xtype: 'checkbox',
				fieldLabel: '返回一个自动产生的关键字',
				name: 'return_keys',
				checked: cell.getAttribute('return_keys') == 'Y'
			}, {
				fieldLabel: '自动产生的关键字的字段名称',
				anchor: '-10',
				name: 'return_field',
				value: cell.getAttribute('return_field')
			}]
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			title: '数据库字段',
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'column_name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '流字段', dataIndex: 'stream_name', width: 100, editor: new Ext.form.TextField()
			}],
			store: new Ext.data.JsonStore({
				fields: ['column_name', 'stream_name'],
				data: Ext.decode(cell.getAttribute('fields'))
			})
		});
		
		this.items = [form, new Ext.TabPanel({
			region: 'center',
			activeTab: 0,
			plain: true,
			deferredRender: false,
			items: [mainForm, grid]
		})];
		
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
		
		TableOutputDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('TableOutput', TableOutputDialog);
