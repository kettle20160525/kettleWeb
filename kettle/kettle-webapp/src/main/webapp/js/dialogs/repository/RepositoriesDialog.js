RepositoriesDialog = Ext.extend(Ext.Window, {
	width: 350,
	height: 500,
	modal: true,
	title: '资源库连接',
	layout: 'fit',
	plain: true,
	initComponent: function() {
		var me = this;
		
		var store = new Ext.data.JsonStore({
			fields: ['type', 'name', 'description'],
			proxy: new Ext.data.HttpProxy({
				url: GetUrl('repository/load.do'),
				method: 'POST'
			})
		});
		var listBox = this.listBox = new ListBox({	//connection type
			region: 'center',
			displayField: 'name',
			valueField: 'name',
			store: store
		});
		
		store.load();
		
		var username = this.username = new Ext.form.TextField({
			fieldLabel: '用户名',
			anchor: '-1',
			value: 'admin'
		});
		
		var password = this.password = new Ext.form.TextField({
			fieldLabel: '密码',
			anchor: '-1'
		});
		
		var cb = this.cb = new Ext.form.Checkbox({
			boxLabel: '在启动时显示此对话框'
		});
		
		var form = new Ext.form.FormPanel({
			region: 'south',
			height: 90,
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 50,
			items: [username, password, cb]
		});
		
		this.items = [{
			layout: 'fit',
			border: false,
			defaults: {border: false},
			bodyStyle: 'padding: 5px',
			items: {
				layout: 'border',
				defaults: {border: false},
				items: [listBox, form]
			}
		}];
		
		this.tbar = [{
			text: '新增资源库', handler: function() {
				var dialog = new EnterSelectionDialog({
					title: '选择仓库类型',
					width: 500, height: 130,
					valueField: 'type',
					dataUrl: GetUrl('repository/type.do')
				});
				dialog.on('sure', function(ct) {
					var d = Ext.create({}, ct);
					d.on('create', function() {
						store.load();
						d.close();
					});
					d.show();
				});
				dialog.show(null, function() {
					dialog.load();
				});
			}
		}, {
			text: '修改资源库', handler: function() {
				if(!Ext.isEmpty(listBox.getValue())) {
					
					Ext.Ajax.request({
						url: GetUrl('repository/' + listBox.getValue() + '.do'),
						method: 'GET',
						success: function(response) {
							var meta = Ext.decode(response.responseText);
							var dialog = Ext.create({}, meta.type);
							dialog.on('create', function() {
								dialog.close();
							});
							dialog.show(null, function() {
								dialog.initData(meta);
							});
						}
					});
				}
			}
		}, {
			text: '删除资源库', handler: function() {
				if(!Ext.isEmpty(listBox.getValue())) {
					
					Ext.Ajax.request({
						url: GetUrl('repository/remove.do'),
						params: {repositoryName: listBox.getValue()},
						method: 'POST',
						success: function(response) {
							var reply = Ext.decode(response.responseText);
							if(reply.success)
								store.load();
						}
					});
				}
			}
		}];
		
		this.bbar = ['->', {
			text: '确定', handler: me.login, scope: this
		}, {
			text: '取消', handler: function() {
				me.close();
			}
		}];
		
		RepositoriesDialog.superclass.initComponent.call(this);
		this.addEvents('loginSuccess');
		
		this.on('afterrender', function(c) {
			new Ext.KeyMap(c.getEl(), [{
	            key: [10,13],
	            fn: function(){ 
	            	me.login();
	            }
	        }]);
		});
	},
	
	login: function() {
		var me = this, listBox = this.listBox, 
			username = this.username, password = this.password,
			cb = this.cb;
		if(Ext.isEmpty(listBox.getValue())) {
			alert('请选择资源库！');
		} else if(Ext.isEmpty(username.getValue())) {
			alert('用户名不能为空！');
		} else if(Ext.isEmpty(password.getValue())) {
			alert('密码不能为空！');
		} else {
			Ext.Ajax.request({
				url: GetUrl('repository/login.do'),
				method: 'POST',
				params: {loginInfo: Ext.encode({
					reposityId: listBox.getValue(),
					username: username.getValue(),
					password: password.getValue(),
					atStartupShown: cb.getValue()
				})},
				success: function(response) {
					var ret = Ext.decode(response.responseText);
					if(ret.success) {
						me.fireEvent('loginSuccess');
					} else {
						Ext.Msg.alert(ret.title, ret.msg);
					}
				}
		   });
		}
	}
	
});