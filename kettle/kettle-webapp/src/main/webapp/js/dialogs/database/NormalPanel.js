NormalPanel = Ext.extend(Ext.Panel, {
	defaults: {border: false},
	layout: {
        type:'vbox',
        align:'stretch'
    },
    bodyStyle: 'padding: 10px',
	
	initComponent: function() {
		var me = this;
		
		var typeList = this.typeList = new ListBox({	//connection type
			flex: 1,
			store: Ext.StoreMgr.get('databaseAccessData')
		});
		var accessList = this.accessList = new ListBox({	//connection method: jndi/jdbc/odbc...
			height: 80,
			store: Ext.StoreMgr.get('databaseAccessMethod')
		});
		
		typeList.on('valueChange', function(s) {
			Ext.StoreMgr.get('databaseAccessMethod').baseParams.accessData = s;
			Ext.StoreMgr.get('databaseAccessMethod').load();
		});
		
		var connectName = this.connectName = new Ext.form.TextField({
			fieldLabel: '连接名称',
			anchor: '-5'
		});
		
		var form = new Ext.form.FormPanel({
			labelWidth: 60,
			bodyStyle: 'padding: 5px 0px',
			items: connectName
		});
		
		var fieldset = new Ext.form.FieldSet({
			title: '设置',
			style: 'height: 96%'
		});
		
		var settingsForm = this.settingsForm = new Ext.form.FormPanel({
			flex: 1,
			bodyStyle: 'padding: 0px 5px 0px 5px',
			labelWidth: 1,
			items: fieldset
		});
		
		accessList.on('valueChange', function(s) {
			Ext.Ajax.request({
				url: GetUrl('database/accessSettings.do'),
				params: {accessData: typeList.getValue(), accessMethod: s},
				success: function(response, opts) {
					decodeResponse(response, function(resObj) {
						fieldset.removeAll(true);
						fieldset.doLayout();
						
						Ext.each(Ext.decode(resObj.message), function(item) {
							fieldset.add(item);
						});
						fieldset.doLayout();
						
						settingsForm.getForm().setValues(me.dbinfo);
					});
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
				},typeList,{
					xtype: 'label',
					text: '连接方式：',
					style: 'padding-top: 5px',
					height: 25
				}, accessList]
			}, settingsForm]
		}];
		
		NormalPanel.superclass.initComponent.call(this);
	},
	
	initData: function(dbinfo) {
		this.connectName.setValue(dbinfo.name);
		this.typeList.setValue(dbinfo.type);
		this.accessList.setValue(dbinfo.access);
		this.dbinfo = dbinfo;
	},
	
	getValue: function(dbinfo) {
		var val = {
			name: this.connectName.getValue(),
			type: this.typeList.getValue(),
			access: this.accessList.getValue()
		};
		Ext.apply(val, this.settingsForm.getForm().getValues());
		
		return val;
	}
});