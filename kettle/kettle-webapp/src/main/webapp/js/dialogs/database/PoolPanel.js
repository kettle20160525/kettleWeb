PoolPanel = Ext.extend(Ext.Panel, {
	layout: 'border',
	defaults: {border: false},
	baseCls: 'x-plain',
	initComponent: function() {
		var store = getActiveTransGraph().getDatabaseStore(), database = this.initialConfig.database, me = this;
		var rec = store.getById(database);
		var dbinfo = rec ? rec.json : {};
		var attributes = dbinfo.attributes ? dbinfo.attributes : {};
		var pool_params = dbinfo.pool_params ? dbinfo.pool_params : [];
		
		var cb = new Ext.form.Checkbox({
			boxLabel: '使用连接池'
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
            	},{
            		xtype: 'textfield',
            		flex: 1,
            		name: 'INITIAL_POOL_SIZE',
            		value: attributes.INITIAL_POOL_SIZE
            	}]
            },{
            	xtype: 'compositefield',
            	items: [{
            		xtype: 'label',
            		style: 'line-height: 22px',
            		text: '最大空闲空间：'
            	},{
            		xtype: 'textfield',
            		flex: 1,
            		name: 'MAXIMUM_POOL_SI',
            		value: attributes.MAXIMUM_POOL_SIZE
            	}]
            }]
		});
		
		var form = new Ext.form.FormPanel({
			defaultType: 'textfield',
			height: 120,
			labelWidth: 1,
			bodyStyle: 'padding: 5px 5px',
			
			region: 'north',
			margins: '5 5 0 5',
			
			items: [cb, fieldset]
		});
		var grid = new Ext.grid.EditorGridPanel({
			title: '命名参数',
			region: 'center',
			margins: '0 5 0 5',
			disabled: true,
			autoExpandColumn: 'columnDesc',
			columns: [{
				header: '', dataIndex: 'enabled', xtype: 'checkcolumn', width: 40
			},{
				header: '参数名', dataIndex: 'name', width: 150
			},{
				id: 'columnDesc', header: '值', dataIndex: 'defValue', width: 100, editor: new Ext.form.TextField()
			}],
			store: new Ext.data.JsonStore({
				fields: [{name: 'enabled', type: 'boolean'}, 'name', 'defValue', 'description'],
				data: pool_params
			})
		});
		
		var textArea = new Ext.form.TextArea({
			emptyText: '参数描述',
			readOnly: true
		});
		
		var form2 = new Ext.form.FormPanel({
			height: 80,
			labelWidth: 1,
			
			region: 'south',
			margins: '0 5 0 5',
			layout: 'fit',
			items: textArea
		});
		
		grid.on('cellclick', function(g, row) {
			var rec = grid.getStore().getAt(row);
			textArea.setValue(decodeURIComponent(rec.get('description')));
		});
		
		cb.on('check', function(s, checked) {
			if(checked == true) {
				grid.enable();
//				form2.enable();
				fieldset.enable();
			} else {
				grid.disable();
//				form2.disable();
				fieldset.disable();
			}
		});
		
		this.on('afterrender', function() {
			cb.setValue(attributes.USE_POOLING == 'Y');
		});
		
		this.items = [form, grid, form2];
		
		PoolPanel.superclass.initComponent.call(this);
	}
});