KettleDatabaseRepositoryDialog = Ext.extend(Ext.Window, {
	width: 400,
	height: 160,
	modal: true,
	title: '资源库信息',
	layout: 'fit',
	plain: true,
	initComponent: function() {
		var me = this;
		this.addFlag = true;
		
		var store = new Ext.data.JsonStore({
			fields: ['name'],
			url: GetUrl('database/listNames.do')
		});
		var combo = this.combo = new Ext.form.ComboBox({
			flex: 1,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			name: 'connection',
			store: store
		});
		combo.on('beforequery', function() {
		    delete combo.lastQuery; 
		});
		
		var nameField = this.nameField = new Ext.form.TextField({
			fieldLabel: '名称',
    		anchor: '-10'
		});
		
		var descrpField = this.descrpField = new Ext.form.TextField({
			fieldLabel: '描述',
    		anchor: '-10',
		});
		
		var onDatabaseCreate = function(dialog) {
			Ext.Ajax.request({
				url: GetUrl('database/create.do'),
				method: 'POST',
				params: {databaseInfo: Ext.encode(dialog.getValue())},
				success: function(response) {
					var json = Ext.decode(response.responseText);
					if(!json.success) {
						Ext.Msg.alert('系统提示', json.message);
					} else {
						dialog.close();
						store.load();
						combo.setValue(json.message);
					}
				}
			});
		};
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			labelWidth: 90,
			border: false,
			labelAlign: 'right',
			items: [{
            	xtype: 'compositefield',
            	fieldLabel: '选择数据库连接',
            	anchor: '-10',
            	items: [combo, {
					xtype: 'button', text: '编辑...', handler: function() {
						var val = combo.getValue();
						if(val != '') {
							var databaseDialog = new DatabaseDialog();
							databaseDialog.on('create', onDatabaseCreate);
							databaseDialog.show(null, function() {
								databaseDialog.initReposityDatabase(val);
							});
						}
					}
				}, {
					xtype: 'button', text: '新建...', handler: function() {
						var databaseDialog = new DatabaseDialog();
						databaseDialog.on('create', onDatabaseCreate);
						databaseDialog.show();
					}
				}, {
					xtype: 'button', text: '删除', handler: function() {
						if(!Ext.isEmpty(combo.getValue())) {
							Ext.Ajax.request({
								url: GetUrl('database/remove.do'),
								method: 'POST',
								params: {databaseName: combo.getValue()},
								success: function(response) {
									var json = Ext.decode(response.responseText);
									if(!json.success) {
										Ext.Msg.alert('系统提示', json.message);
									} else {
										store.load();
										combo.setValue('');
									}
								},
								failure: function() {
									Ext.Msg.alert('连接服务器失败！');
								}
							});
						}
					}
    			}]
	        }, nameField, descrpField]
		});
		
		this.items = form;
		
		this.bbar = ['->', {
			text: '确定', handler: function() {
				Ext.Ajax.request({
					url: GetUrl('repository/add.do'),
					method: 'POST',
					params: {reposityInfo: Ext.encode(me.getValue()), add: me.addFlag},
					success: function(response) {
						var reply = Ext.decode(response.responseText);
						if(reply.success) {
							me.fireEvent('create', me);
						} else {
							Ext.Msg.alert(reply.title, reply.message);
						}
					}
			   });
			}
		}, {
			text: '创建或更新', handler: function() {
				Ext.Ajax.request({
					url: GetUrl('database/checkInit.do'),
					method: 'POST',
					params: {connection: combo.getValue()},
					success: function(res) {
						var reply = Ext.decode(res.responseText);
						
						var execute = function(script) {
							var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"正在执行，请稍后..."});
							myMask.show();
							Ext.Ajax.request({
								url: GetUrl('database/execute.do'),
								method: 'POST',
								params: {reposityInfo: Ext.encode(me.getValue()), script: script},
								success: function(response) {
									var ret = Ext.decode(response.responseText);
									var dialog = new EnterTextDialog({title: '执行结果'});
									dialog.show(null, function() {
										dialog.setText(decodeURIComponent(ret.message));
									});
									myMask.hide();
								},
								failure: function() {
									Ext.Msg.alert('连接服务器失败！');
									myMask.hide();
								}
							});
						};
						
						var askMore = function() {
							var msg = '您确定是否要在该数据库中创建Kettle的数据表？', icon = Ext.MessageBox.QUESTION;
							if(reply.opertype == 'update') {
								icon = Ext.MessageBox.WARNING;
								msg = '该数据库已被初始化，是否更新？';
							}
							
							Ext.Msg.show({
							   title:'系统提示',
							   msg: msg,
							   buttons: Ext.Msg.YESNO,
							   icon: icon,
							   fn: function(bId) {
								   if(bId == 'yes') {
									   Ext.Ajax.request({
											url: GetUrl('database/schema.do'),
											method: 'POST',
											params: {reposityInfo: Ext.encode(me.getValue()), upgrade: reply.opertype == 'update'},
											success: function(response, opts) {
												decodeResponse(response, function(resObj) {
													var statements = decodeURIComponent(resObj.message);
													var dialog = new EnterTextDialog({
														title: '即将执行的SQL语句', 
														width: 800,
														height: 500,
														bbar: ['->', {
															text: '执行', handler: function() {execute(resObj.message);}
														}, {
															text: '清除缓存'
														}, {
															text: '关闭', handler: function() {dialog.close();}
														}]
													});
													dialog.show(null, function() {
														dialog.setText(statements);
													});
												});
											}
									   });
								   }
							   }
							});
						};
						
						var flag = true;
						if(reply.unSupportedDatabase) {
							Ext.Msg.show({
							   title:'系统提示',
							   msg: '您指定的数据库是Kettle不支持的类型，是否继续？',
							   buttons: Ext.Msg.YESNO,
							   fn: function(bId) {
								   if(bId == 'yes') {
									   askMore();
								   }
							   },
							   icon: Ext.MessageBox.QUESTION
							});
						} else {
							askMore();
						}
					}
				});
				
				
				
			}
		}, {
			text: '删除', handler: function() {
				Ext.Msg.show({
					   title:'系统提示',
					   msg: '您确信要删除该数据库中所有的资源库表？',
					   buttons: Ext.Msg.YESNO,
					   icon: Ext.MessageBox.WARNING,
					   fn: function(bId) {
						   if(bId == 'yes') {
							   Ext.Msg.prompt('系统提示', '请输入管理员密码:', function(btn, text){
								    if (btn == 'ok'){
								    	
								    	Ext.Ajax.request({
											url: GetUrl('database/drop.do'),
											method: 'POST',
											params: {reposityInfo: Ext.encode(me.getValue()), password: text},
											success: function(response) {
												var ret = Ext.decode(response.responseText);
												Ext.Msg.alert(ret.title, ret.message);
											}
									   });
								    	
								    }
								});
						   }
					   }
				});
			}
		}, {
			text: '取消', handler: function() {
				me.close();
			}
		}];
		
		KettleDatabaseRepositoryDialog.superclass.initComponent.call(this);
		this.addEvents('create');
	},
	
	initData: function(meta) {
		this.addFlag = false;
		this.combo.setValue(meta.extraOptions.database);
		this.nameField.setValue(meta.name);
		this.descrpField.setValue(meta.description);
	},
	
	getValue: function(meta) {
		return {
			name: this.nameField.getValue(),
			description: this.descrpField.getValue(),
			type: 'KettleDatabaseRepository',
			extraOptions: {
				database: this.combo.getValue()
			}
		};
	}
});

Ext.reg('KettleDatabaseRepository', KettleDatabaseRepositoryDialog);