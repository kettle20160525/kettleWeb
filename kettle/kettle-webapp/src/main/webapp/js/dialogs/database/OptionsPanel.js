OptionsPanel = Ext.extend(Ext.grid.EditorGridPanel, {
	initComponent: function() {
		var store = getActiveTransGraph().getDatabaseStore(), database = this.initialConfig.database, me = this;
		var rec = store.getById(database);
		var dbinfo = rec ? rec.json : {};
		var options = dbinfo.options ? dbinfo.options : [];
		
		var s = this.store= new Ext.data.JsonStore({
			fields: ['prefix', 'name', 'value'],
			data: options
		});
		
		this.tbar = [{
			iconCls: 'add', handler: function() {
				var RecordType = s.recordType;
                var p = new RecordType({
                    name: '',
                    type: '',
                    format: '',
                    length: 100
                });
                me.stopEditing();
                me.getStore().insert(0, p);
                me.startEditing(0, 0);
			}
		},{
			iconCls: 'delete'
		}];
		this.columns= [new Ext.grid.RowNumberer(), {
			dataIndex: 'prefix', width: 100, hidden: true
		},{
			header: '命名参数', dataIndex: 'name', width: 150, editor: new Ext.form.TextField({
                allowBlank: false
            })
		},{
			header: '值', dataIndex: 'value', width: 200, editor: new Ext.form.TextField()
		}];
		OptionsPanel.superclass.initComponent.call(this);
	}
});