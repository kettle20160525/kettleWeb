SQLFileOutputDialog = Ext.extend(Ext.Window, {
	title: 'SQL 文件输出',
	width: 600,
	height: 650,
	closeAction: 'close',
	modal: true,
	layout: 'border',
	initComponent: function() {
		var me = this, 
			transGraph = getActiveGraph(),
			graph = transGraph.getGraph(), 
			cell = graph.getSelectionCell(), 
			store = transGraph.getDatabaseStore();
		
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
		
		var normal = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			labelWidth: 150,
			labelAlign: 'right',
			title: '一般',
			items: [{
				xtype: 'fieldset',
				title: '连接',
				items: [{
	            	xtype: 'compositefield',
	            	anchor: '-30',
	            	fieldLabel: '数据库连接',
	            	items: [{
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
		        	fieldLabel: '目标模式',
		        	xtype: 'textfield',
		        	anchor: '-30',
					value: cell.getAttribute('schema')
		        },{
	            	xtype: 'compositefield',
	            	anchor: '-30',
	            	fieldLabel: '目标表',
	            	items: [{
	    				xtype: 'compositefield',
	    				flex: 1,
	    				items: [{
	    					xtype: 'textfield',
	    					flex: 1,
	    					value: cell.getAttribute('table')
	    				},{
	    					xtype: 'button',
	    					text: '浏览...'
	    				}]
	    			}]
		        }]
			}, {
				xtype: 'fieldset',
				title: '输出文件',
				items: [{
					xtype: 'checkbox',
					fieldLabel: '增加 创建表 语句',
					checked: cell.getAttribute('create') == 'Y'
				},{
					xtype: 'checkbox',
					fieldLabel: '增加 清空表 语句',
					checked: cell.getAttribute('truncate') == 'Y'
				},{
					xtype: 'checkbox',
					fieldLabel: '每个语句另起一行',
					checked: cell.getAttribute('startnewline') == 'Y'
				},{
					xtype: 'compositefield',
					fieldLabel: '文件名',
					anchor: '-30',
					items: [{
	    				xtype: 'compositefield',
	    				flex: 1,
	    				items: [{
	    					xtype: 'textfield',
	    					flex: 1,
	    					checked: cell.getAttribute('name')
	    				},{
	    					xtype: 'button',
	    					text: '浏览...'
	    				},{
	    					xtype: 'button',
	    					text: '显示文件夹'
	    				}]
	    			}]
				},{
					xtype: 'checkbox',
					fieldLabel: '创建父目录',
					checked: cell.getAttribute('create_parent_folder') == 'Y'
				},{
					xtype: 'checkbox',
					fieldLabel: '启动时不创建文件',
					checked: cell.getAttribute('DoNotOpenNewFileInit') == 'Y'
				},{
					xtype: 'textfield',
					fieldLabel: '扩展名',
					anchor: '-30',
					value: cell.getAttribute('extention')
				},{
					xtype: 'checkbox',
					fieldLabel: '文件名中包含步骤号',
					checked: cell.getAttribute('split') == 'Y'
				},{
					xtype: 'checkbox',
					fieldLabel: '文件名中包含日期',
					checked: cell.getAttribute('add_date') == 'Y'
				},{
					xtype: 'checkbox',
					fieldLabel: '文件名中包含时间',
					checked: cell.getAttribute('add_time') == 'Y'
				},{
					xtype: 'checkbox',
					fieldLabel: '追加方式',
					checked: cell.getAttribute('append') == 'Y'
				},{
					xtype: 'textfield',
					fieldLabel: '每...行拆分',
					anchor: '-30',
					value: cell.getAttribute('splitevery')
				},{
					xtype: 'checkbox',
					fieldLabel: '将文件加入到结果文件中',
					checked: cell.getAttribute('addtoresult') == 'Y'
				}]
			}]
		});
		
		var content = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			labelWidth: 150,
			labelAlign: 'right',
			title: '内容',
			items: [{
				xtype: 'textfield',
				fieldLabel: '日期格式',
				anchor: '-30',
				checked: cell.getAttribute('dateformat')
			},{
				xtype: 'textfield',
				fieldLabel: '编码',
				anchor: '-30',
				checked: cell.getAttribute('encoding')
			}]
		});
		
		var tab = new Ext.TabPanel({
			activeTab: 0,
			deferredRender: false,
			region: 'center',
			items: [normal, content]
		});
		
		this.items = [form, tab];
		
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
		
		SQLFileOutputDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SQLFileOutput', SQLFileOutputDialog);
