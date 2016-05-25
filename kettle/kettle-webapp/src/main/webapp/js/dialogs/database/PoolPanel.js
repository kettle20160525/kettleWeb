PoolPanel = Ext.extend(Ext.Panel, {
	layout: 'fit',
	defaults: {border: false},
	initComponent: function() {
		var usePool = this.usePool = new Ext.form.Checkbox({
			boxLabel: '使用连接池'
		});
		
		var initPoolSize = this.initPoolSize = new Ext.form.TextField({
			flex: 1,
    		name: 'initialPoolSize'
		});
		
		var maxPoolSize = this.maxPoolSize = new Ext.form.TextField({
			flex: 1,
    		name: 'maximumPoolSize'
		});
		
		var fieldset = new Ext.form.FieldSet({
			title: '连接池大小',
			anchor: '-1',
			disabled: true,
			items: [{
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px;padding-left: 24px',
            		text: '初始大小：'
            	}, initPoolSize]
            },{
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px',
            		text: '最大空闲空间：'
            	}, maxPoolSize]
            }]
		});
		
		var form = new Ext.form.FormPanel({
			defaultType: 'textfield',
			height: 120,
			labelWidth: 1,
			border: false,
			
			region: 'north',
			margins: '0 0 0 0',
			
			items: [usePool, fieldset]
		});
		
		var store = this.store = new Ext.data.JsonStore({
			fields: [{name: 'enabled', type: 'boolean'}, 'name', 'defValue', 'description'],
			data: []
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			title: '命名参数',
			region: 'center',
			disabled: true,
			autoExpandColumn: 'columnDesc',
			columns: [{
				header: '', dataIndex: 'enabled', xtype: 'checkcolumn', width: 40
			},{
				header: '参数名', dataIndex: 'name', width: 150
			},{
				id: 'columnDesc', header: '值', dataIndex: 'defValue', width: 100, editor: new Ext.form.TextField()
			}],
			store: store
		});
		
		var textArea = new Ext.form.TextArea({
			emptyText: '参数描述',
			readOnly: true
		});
		
		var form2 = new Ext.form.FormPanel({
			height: 80,
			labelWidth: 1,
			border: false,
			region: 'south',
			bodyStyle: 'padding-top: 5px',
			layout: 'fit',
			items: textArea
		});
		
		grid.on('cellclick', function(g, row) {
			var rec = grid.getStore().getAt(row);
			textArea.setValue(decodeURIComponent(rec.get('description')));
		});
		
		usePool.on('check', function(s, checked) {
			if(checked == true) {
				grid.enable();
				fieldset.enable();
			} else {
				grid.disable();
				fieldset.disable();
			}
		});
		
		this.items = {
			defaults: {border: false},
			layout: 'fit',
			bodyStyle: 'padding: 5px',
			items: {
				layout: 'border',
				items: [form, grid, form2]
			}
		};
		
		PoolPanel.superclass.initComponent.call(this);
	},
	
	initData: function(dbinfo) {
		this.usePool.setValue(dbinfo.usingConnectionPool);
		if(dbinfo.usingConnectionPool) {
			this.initPoolSize.setValue(dbinfo.initialPoolSize);
			this.maxPoolSize.setValue(dbinfo.maximumPoolSize);
			this.store.loadData(dbinfo.pool_params);
		}
	},
	
	getValue: function(dbinfo) {
		if(this.usePool.getValue()) {
			dbinfo.usingConnectionPool = this.usePool.getValue();
			
			if(!Ext.isEmpty(this.initPoolSize.getValue()))
				dbinfo.initialPoolSize = this.initPoolSize.getValue();
			if(!Ext.isEmpty(this.maxPoolSize.getValue()))
				dbinfo.maximumPoolSize = this.maxPoolSize.getValue();
			
			var pool_params = [];
			this.store.each(function(record) {
				if(record.get('enabled'))
					pool_params.push({
						enabled: true,
						name: record.get('name'), 
						defValue: record.get('defValue')
					});
			});
			if(pool_params.length > 0)
				dbinfo.pool_params = pool_params;
		}
	}
});