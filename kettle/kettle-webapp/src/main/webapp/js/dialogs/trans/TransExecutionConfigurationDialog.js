TransExecutionConfigurationDialog = Ext.extend(Ext.Window, {
	width: 600,
	height: 400,
	layout: 'fit',
	title: '执行转换',
	modal: true,
	bodyStyle: 'padding: 5px',
	
	initComponent: function() {
		var  root = getActiveGraph().getGraph().getDefaultParent();
		var executeMethod = new Ext.form.FormPanel({
			title: '执行方式',
			labelWidth: 1,
			bodyStyle: 'padding: 10px 15px;',
			items: [{
                    xtype: 'radio',
                    name: 'execMethod',
                    boxLabel: '本地执行',
                    inputValue: 1
            	},{
                    xtype: 'radio',
                    name: 'execMethod',
                    boxLabel: '远程执行',
                    inputValue: 2
            	},{
            		xtype: 'radiogroup',
                    itemCls: 'x-check-group-alt',
                    columns: 1,
                    width: 300,
                    items: [
                        {
                            xtype     : 'compositefield',
                            items: [{
                            	xtype: 'label',
                            	style: 'line-height: 22px',
                            	text: '远程机器：'
                            }, new Ext.form.ComboBox({
                				displayField: 'name',
                				valueField: 'name',
                				typeAhead: true,
                		        mode: 'local',
                		        forceSelection: true,
                		        triggerAction: 'all',
                		        selectOnFocus:true,
                				store: getActiveGraph().getSlaveServerStore(),
                			    hiddenName: 'remoteServer'
                			})]
                        },
                        {
                            xtype     : 'checkbox',
                            name	  : 'passingExport',
                            boxLabel  : '将导出的文件发送到远程服务器'
                        }
                    ]
                },{
                    xtype: 'radio',
                    name: 'execMethod',
                    boxLabel: '集群方式执行',
                    inputValue: 3
            	},{
                    xtype: 'checkboxgroup',
                    columns: 1,
                    itemCls: 'x-check-group-alt',
                    width: 100,
                    items: [
                        {boxLabel: '提交转换', name: 'clusterPosting', checked: true},
                        {boxLabel: '准备执行', name: 'clusterPreparing', checked: true},
                        {boxLabel: '开始执行', name: 'clusterStarting', checked: true},
                        {boxLabel: '显示转换', name: 'clusterShowingTransformation'}
                    ]
                }]
		});
		
		this.on('afterrender', function() {
			var arrays = executeMethod.find('name', 'execMethod');
			var rbChecked = function(rb) {
				var v = rb.getRawValue();
				
				if(v == 1) {
					Ext.each(executeMethod.find('itemCls', 'x-check-group-alt'), function(group) {
						group.disable();
					});
				} else if(v == 2) {
					Ext.each(executeMethod.find('xtype', 'radiogroup'), function(group) {
						group.enable();
					});
					Ext.each(executeMethod.find('xtype', 'checkboxgroup'), function(group) {
						group.disable();
					});
				} else if(v == 3) {
					Ext.each(executeMethod.find('xtype', 'radiogroup'), function(group) {
						group.disable();
					});
					Ext.each(executeMethod.find('xtype', 'checkboxgroup'), function(group) {
						group.enable();
					});
				}
				
			};
			
			Ext.each(arrays, function(radio) {
				radio.on('check', function(rb, checked) {
					if(checked == true) rbChecked(rb);
				});
			});
			arrays[0].setValue(true);
		});
		
		
		var details = new Ext.form.FormPanel({
			title: '细节',
            labelWidth: 190,
            labelAlign: 'right',
            bodyStyle: 'padding: 10px 15px;',
            items: [{
            	name: 'safeModeEnabled',
                xtype: 'checkbox',
                boxLabel: '启用安全模式'
            },{
            	name: 'gatheringMetrics',
                xtype: 'checkbox',
                boxLabel: 'Gather performance metrics',
                checked: true
            },{
            	name: 'clearingLog',
                xtype: 'checkbox',
                boxLabel: 'Clear the log before execution',
                checked: true
            },new Ext.form.ComboBox({
				fieldLabel: '日志级别',
				displayField: 'text',
				valueField: 'value',
				anchor: '-20',
				typeAhead: true,
		        mode: 'local',
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: new Ext.data.JsonStore({
		        	fields: ['value', 'text'],
		        	data: [{value: '0', text: '没有日志'},
		        	       {value: '1', text: '错误日志'},
		        	       {value: '2', text: '最小日志'},
		        	       {value: '3', text: '基本日志'},
		        	       {value: '4', text: '详细日志'},
		        	       {value: '5', text: '调试'},
		        	       {value: '6', text: '行级日志（非常详细）'}]
			    }),
			    hiddenName: 'logLevel',
			    value: 3
			}),{
            	name: 'replayDate',
            	anchor: '-20',
                xtype: 'textfield',
                fieldLabel: '重放日期(yyyy/MM/dd HH:mm:ss)'
            }]
		});
		
		var parameterGrid = new Ext.grid.EditorGridPanel({
			title: '命名参数',
			tbar: [{
				iconCls: 'add', handler: function() {
					var RecordType = parameterGrid.getStore().recordType;
	                var p = new RecordType({
	                    name: '',
	                    value: '',
	                    default_value: ''
	                });
	                parameterGrid.stopEditing();
	                parameterGrid.getStore().insert(0, p);
	                parameterGrid.startEditing(0, 0);
				}
			},{
				iconCls: 'delete'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '命名参数', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '值', dataIndex: 'value', width: 100, editor: new Ext.form.TextField()
			},{
				header: '默认值', dataIndex: 'default_value', width: 100, editor: new Ext.form.TextField()
			}],
			store: new Ext.data.JsonStore({
				fields: ['name', 'value', 'default_value'],
				data: Ext.decode(root.getAttribute('parameters'))
			})
		});
		
		var variableGrid = new Ext.grid.EditorGridPanel({
			title: '变量',
			tbar: [{
				iconCls: 'add', handler: function() {
					var RecordType = variableGrid.getStore().recordType;
	                var p = new RecordType({
	                    name: '',
	                    value: ''
	                });
	                variableGrid.stopEditing();
	                variableGrid.getStore().insert(0, p);
	                variableGrid.startEditing(0, 0);
				}
			},{
				iconCls: 'delete'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '变量', dataIndex: 'var_name', width: 200, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '值', dataIndex: 'var_value', width: 250, editor: new Ext.form.TextField()
			}],
			store: new Ext.data.JsonStore({
				fields: ['var_name', 'var_value'],
				data: Ext.decode(root.getAttribute('variables') || '[]')
			})
		});
		
		var table = new Ext.TabPanel({
			activeTab: 0,
			plain: true,
			deferredRender: false,
		    items: [executeMethod, details, parameterGrid, variableGrid]
		});
		
		this.items = table;
		
		var bCancel = new Ext.Button({
			text: '取消', scope: this, handler: function() {this.close();}
		});
		
		var me = this;
		var bGo = new Ext.Button({
			text: '启动', scope: this, handler: function() {
				parameterGrid.getStore().commitChanges();
				variableGrid.getStore().commitChanges();
				
				var parameters = [], variables = [];
				parameterGrid.getStore().each(function(rec) {
					parameters.push(rec.data);
				});
				variableGrid.getStore().each(function(rec) {
					variables.push(rec.data);
				});
				
				var executionConfig = {
					executeMethod: executeMethod.getForm().getValues(),
					details: details.getForm().getValues(),
					parameters: parameters,
					variables: variables
				};
				
				me.setDisabled(true);
				Ext.Ajax.request({
					url: GetUrl('trans/run.do'),
					params: {graphXml: getActiveGraph().toXml(), executionConfig: Ext.encode(executionConfig)},
					method: 'POST',
					success: function(response) {
						me.setDisabled(false);
						decodeResponse(response, function(resObj) {
							me.close();
							setTimeout(function() {
								getActiveGraph().fireEvent('doRun', resObj.message);
							}, 500);
						});
					},
					failure: failureResponse
				});
			}
		});
		
		this.bbar = ['->', bCancel, bGo];
		
		TransExecutionConfigurationDialog.superclass.initComponent.call(this);
	}
});