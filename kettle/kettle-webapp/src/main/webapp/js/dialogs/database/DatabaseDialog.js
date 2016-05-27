DatabaseDialog = Ext.extend(Ext.Window, {
	title: '数据库连接',
	width: 700,
	height: 550,
	closeAction: 'close',
	modal: true,
	layout: 'border',
	initComponent: function() {
		var listBox = new ListBox({
			store: new Ext.data.JsonStore({
				fields: ['value','text'],
				data: [
				       {value: 0, text: '一般'}, 
				       {value: 1, text: '高级'}, 
				       {value: 2, text: '选项'},
				       {value: 3, text: '连接池'},
				       {value: 4, text: '集群'}]
			}),
			value: 0
		});
		
		var normal = new NormalPanel();
		var advance = new AdvancePanel();
		var options = new OptionsPanel();
		var pool = new PoolPanel();
		var cluster = new ClusterPanel();
		
		var me = this;
		this.initReposityDatabase = function(database) {
			Ext.Ajax.request({
				url: GetUrl('database/load.do'),
				method: 'POST',
				params: {database: database},
				success: function(response) {
					var dbinfo = Ext.decode(response.responseText);
					me.initDatabase(dbinfo);
				}
			})
		};
		
		this.initDatabase = function(dbinfo) {
			normal.initData(dbinfo);
			advance.initData(dbinfo);
			options.initData(dbinfo);
			pool.initData(dbinfo);
			cluster.initData(dbinfo);
		};
		
		this.getValue = function() {
			var val = normal.getValue();
			advance.getValue(val);
			options.getValue(val);
			pool.getValue(val);
			cluster.getValue(val);
			
			return val;
		};
		
		var content = new Ext.Panel({
			region: 'center',
			defaults: {border: false},
			layout: 'card',
			activeItem: 0,
			items: [normal, advance, options, pool, cluster]
		});
		
		listBox.on('valueChange', function(v) {
			content.getLayout().setActiveItem(parseInt(v));
		});
		
		this.items = [{
			region: 'west',
			width: 150,
			layout: 'fit',
			border: false,
			defaults: {border: false},
			items: listBox
		}, content];
		
		var bCancel = new Ext.Button({
			text: '取消', scope: this, handler: function() {
				this.close();
			}
		});
		var bTest = new Ext.Button({
			text: '测试', scope: this, handler: function() {
				Ext.Ajax.request({
					url: GetUrl('database/test.do'),
					method: 'POST',
					params: {databaseInfo: Ext.encode(me.getValue())},
					success: function(response) {
						decodeResponse(response, function(resObj) {
							var dialog = new EnterTextDialog();
							dialog.show(null, function() {
								dialog.setText(decodeURIComponent(resObj.message));
							});
						});
					}
				});
			}
		});
		var bFuture = new Ext.Button({
			text: '特征列表', scope: this, handler: function() {
				this.close();
			}
		});
		var bView = new Ext.Button({
			text: '浏览', scope: this, handler: function() {
				this.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', handler: function() {
				Ext.Ajax.request({
					url: GetUrl('database/check.do'),
					method: 'POST',
					params: {databaseInfo: Ext.encode(me.getValue())},
					success: function(response) {
						var json = Ext.decode(response.responseText);
						if(!json.success) {
							Ext.Msg.alert('系统提示', json.message);
						} else {
							me.fireEvent('create', me);
						}
					}
				});
			}
		});
		
		this.bbar = ['->', bCancel, bTest, bFuture, bView, bOk];
		
		DatabaseDialog.superclass.initComponent.call(this);
		
		this.addEvents('create')
	}
});

Ext.reg('DatabaseDialog', DatabaseDialog);
