InsertUpdateDialog = Ext.extend(Ext.Window, {
	title: '插入/更新',
	width: 800,
	height: 600,
	closeAction: 'close',
	modal: true,
	layout: 'border',
	defaults: {border: false},
	
	initComponent: function() {
		var me = this, 
			transGraph = getActiveTransGraph(),
			graph = transGraph.getGraph(), 
			cell = graph.getSelectionCell(), 
			store = transGraph.getDatabaseStore();
		
		var combo = new Ext.form.ComboBox({
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
		});
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			region: 'north',
			baseCls: 'x-plain',
			height: 170,
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
    				items: [combo, {
    					xtype: 'button', text: '编辑...', handler: function() {
    						var databaseDialog = new DatabaseDialog({database: combo.getValue()});
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
            		style: 'line-height: 22px;',
            		text: '不执行任何更新：'
            	},{
            		xtype: 'checkbox',
            		name: 'update_bypassed',
            		checked: cell.getAttribute('update_bypassed') == 'Y'
            	}]
            }]
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			title: '用来查询的关键字',
			region: 'center',
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'keyLookup', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '比较符', dataIndex: 'keyCondition', width: 100, editor: new Ext.form.TextField()
			},{
				header: '流里的字段1', dataIndex: 'keyStream1', width: 100, editor: new Ext.form.TextField()
			},{
				header: '流里的字段2', dataIndex: 'keyStream2', width: 100, editor: new Ext.form.TextField()
			}],
			store: new Ext.data.JsonStore({
				fields: ['keyLookup', 'keyCondition', 'keyStream1', 'keyStream2'],
				data: Ext.decode(cell.getAttribute('key'))
			})
		});
		
		var grid2 = new Ext.grid.EditorGridPanel({
			title: '更新字段',
			region: 'south',
			height: 150,
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'updateLookup', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '流字段', dataIndex: 'updateStream', width: 100, editor: new Ext.form.TextField()
			},{
				header: '更新', dataIndex: 'update', width: 100, editor: new Ext.form.TextField()
			}],
			store: new Ext.data.JsonStore({
				fields: ['updateLookup', 'updateStream', 'update'],
				data: Ext.decode(cell.getAttribute('value'))
			})
		});
		
		this.items = [form, grid, grid2];
		
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
		
		InsertUpdateDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('InsertUpdate', InsertUpdateDialog);
