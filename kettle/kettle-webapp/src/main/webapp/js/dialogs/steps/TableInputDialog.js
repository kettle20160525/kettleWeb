TableInputDialog = Ext.extend(Ext.Window, {
	title: '表输入',
	width: 600,
	height: 500,
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
			bodyStyle: 'padding: 10px',
			region: 'center',
			height: 150,
			labelWidth: 1,
			items: [{
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 12px',
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
            		style: 'line-height: 22px;',
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
            		style: 'line-height: 22px;padding-left: 14px',
            		text: 'SQL语句：',
            		flex: 1
            	},{
            		xtype: 'hidden',			// extjs bug
            		name: 'non_used_field'
            	}, {
            		xtype: 'button',
            		text: '获取SQL查询语句...'
            	}]
            }, {
        		xtype: 'textarea',
        		anchor: '0',
        		height: 200,
        		name: 'sql',
				value: decodeURIComponent(cell.getAttribute('sql'))
        	}, {
                xtype: 'checkboxgroup',
                columns: 1,
                anchor: '0',
                itemCls: 'x-check-group-clt',
                items: [
                    {boxLabel: '允许简易转换', name: 'lazy_conversion_active', checked: cell.getAttribute('lazy_conversion_active') == 'true'},
                    {boxLabel: '替换SQL语句里的变量', name: 'variables_active', checked: cell.getAttribute('variables_active') == 'true'},
                    {boxLabel: '执行每一行', name: 'execute_each_row', checked: cell.getAttribute('execute_each_row') == 'true'}
                ]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		text: '从步骤插入数据：'
            	},{
            		xtype: 'textfield',
            		flex: 1,
            		name: 'lookup',
    				value: cell.getAttribute('lookup')
            	}]
            }, {
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 12px',
            		text: '记录数量限制：'
            	},{
            		xtype: 'textfield',
            		flex: 1,
            		name: 'limit',
    				value: cell.getAttribute('limit')
            	}]
            }]
		});
		
		this.items = form;
		
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
		
		TableInputDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('TableInput', TableInputDialog);
