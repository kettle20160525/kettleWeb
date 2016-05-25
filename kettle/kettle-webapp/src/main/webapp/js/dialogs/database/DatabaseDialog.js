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
		
		var generate = new NormalPanel({database: this.initialConfig.database});
		var advance = new AdvancePanel({database: this.initialConfig.database});
		var options = new OptionsPanel({database: this.initialConfig.database});
		var pool = new PoolPanel({database: this.initialConfig.database});
		
		var content = new Ext.Panel({
			region: 'center',
			defaults: {border: false},
			layout: 'card',
			activeItem: 0,
			items: [generate, advance, options, pool]
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
				this.close();
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
				alert(listBox.getValue());
			}
		});
		
		this.bbar = ['->', bCancel, bTest, bFuture, bView, bOk];
		
		DatabaseDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('DatabaseDialog', DatabaseDialog);
