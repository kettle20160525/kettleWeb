ClusterPanel = Ext.extend(Ext.Panel, {
	layout: 'fit',
	defaults: {border: false},
	initComponent: function() {
		var useCluster = this.useCluster = new Ext.form.Checkbox({
			boxLabel: '使用集群'
		});
		
		var form = new Ext.form.FormPanel({
			height: 30,
			labelWidth: 1,
			border: false,
			
			region: 'north',
			margins: '0 0 0 0',
			
			items: [useCluster]
		});
		
		var store = this.store = new Ext.data.JsonStore({
			fields: ['partitionId', 'hostname', 'port', 'databaseName', 'username', 'password'],
			data: []
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			title: '命名参数',
			region: 'center',
			disabled: true,
			tbar: [{
				text: '新增参数'
			}, {
				text: '删除参数'
			}],
			columns: [{
				header: '分区ID', dataIndex: 'partitionId', width: 100, editor: new Ext.form.TextField()
			},{
				header: '主机名称', dataIndex: 'hostname', width: 100, editor: new Ext.form.TextField()
			},{
				header: '端口', dataIndex: 'port', width: 60, editor: new Ext.form.TextField()
			},{
				header: '数据库名称', dataIndex: 'databaseName', width: 100, editor: new Ext.form.TextField()
			},{
				header: '用户名', dataIndex: 'username', width: 80, editor: new Ext.form.TextField()
			},{
				header: '密码', dataIndex: 'password', width: 80, editor: new Ext.form.TextField()
			}],
			store: store
		});
		
		useCluster.on('check', function(s, checked) {
			if(checked == true) {
				grid.enable();
			} else {
				grid.disable();
			}
		});
		
		this.items = {
			defaults: {border: false},
			layout: 'fit',
			bodyStyle: 'padding: 5px',
			items: {
				layout: 'border',
				items: [form, grid]
			}
		};
		
		ClusterPanel.superclass.initComponent.call(this);
	},
	
	initData: function(dbinfo) {
		this.useCluster.setValue(dbinfo.partitioned);
		this.store.loadData(dbinfo.partitionInfo);
	},
	
	getValue: function(dbinfo) {
		if(this.useCluster.getValue()) {
			alert(this.useCluster.getValue());
			dbinfo.partitioned = this.useCluster.getValue();
			
			var partitionInfo = [];
			this.store.each(function(record) {
				partitionInfo.push({
					partitionId: record.get('partitionId'), 
					hostname: record.get('hostname'),
					port: record.get('port'),
					databaseName: record.get('databaseName'),
					username: record.get('username'),
					password: record.get('password')
				});
			});
			if(partitionInfo.length > 0)
				dbinfo.partitionInfo = partitionInfo;
		}
	}
});