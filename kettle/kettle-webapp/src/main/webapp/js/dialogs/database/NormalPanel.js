NormalPanel = Ext.extend(Ext.Panel, {
	defaults: {border: false},
	layout: {
        type:'vbox',
        align:'stretch'
    },
    bodyStyle: 'padding: 10px',
	
	initComponent: function() {
		
		var store = getActiveTransGraph().getDatabaseStore(), database = this.initialConfig.database;
		var rec = store.getById(database);
		var dbinfo = rec ? rec.json : {};
		
		var store2 = new Ext.data.JsonStore({
			fields: ['value','text'],
			proxy: new Ext.data.HttpProxy({
				url: 'database/accessData.do',
				method: 'POST'
			})
		});
		var listBox2 = new ListBox({	//connection type
			flex: 1,
			store: store2,
			value: dbinfo.type
		});
		store2.load();
		
		var store3 = new Ext.data.JsonStore({
			fields: ['value','text'],
			proxy: new Ext.data.HttpProxy({
				url: 'database/accessMethod.do',
				method: 'POST'
			})
		});
		var listBox3 = new ListBox({	//connection method: jndi/jdbc/odbc...
			height: 80,
			store: store3,
			value: dbinfo.access
		});
		
		listBox2.on('valueChange', function(s) {
			store3.baseParams.accessData = s;
			store3.load();
		});
		
		var form = new Ext.form.FormPanel({
			labelWidth: 60,
			bodyStyle: 'padding: 5px 0px',
			items: [{
				fieldLabel: '连接名称',
				anchor: '-5',
				xtype: 'textfield',
				value: dbinfo.name
			}]
		});
		
		var fieldset = new Ext.form.FieldSet({
			title: '设置',
			style: 'height: 96%'
		});
		
		var settingsForm = new Ext.form.FormPanel({
			flex: 1,
			bodyStyle: 'padding: 0px 5px 0px 5px',
			labelWidth: 1,
			items: fieldset
		});
		
		listBox3.on('valueChange', function(s) {
			Ext.Ajax.request({
				url: 'database/accessSettings.do',
				params: {accessMethod: s},
				success: function(response) {
					fieldset.removeAll(true);
					fieldset.doLayout();
					
					Ext.each(Ext.decode(response.responseText), function(item) {
						fieldset.add(item);
					});
					fieldset.doLayout();
					
					settingsForm.getForm().setValues(dbinfo);
				}
			});
		});
		
		this.items = [form, {
			flex: 1,
			defaults: {border: false},
			layout: {
                type:'hbox',
                align:'stretch'
            },
			items: [{
				flex: 1,
				layout: {
	                type:'vbox',
	                align:'stretch'
	            },
				items: [{
					xtype: 'label',
					text: '连接类型：',
					style: 'padding-top: 5px',
					height: 25
				},listBox2,{
					xtype: 'label',
					text: '连接方式：',
					style: 'padding-top: 5px',
					height: 25
				}, listBox3]
			}, settingsForm]
		}];
		
		NormalPanel.superclass.initComponent.call(this);
	}
});