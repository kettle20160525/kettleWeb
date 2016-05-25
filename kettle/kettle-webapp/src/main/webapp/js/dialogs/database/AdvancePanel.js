AdvancePanel = Ext.extend(Ext.form.FormPanel, {
	labelWidth: 1,
	initComponent: function() {
		var store = getActiveTransGraph().getDatabaseStore(), database = this.initialConfig.database;
		var rec = store.getById(database);
		var dbinfo = rec ? rec.json : {};
		var attributes = dbinfo.attributes ? dbinfo.attributes : {};
		
		this.items = [{
			xtype: 'fieldset',
			anchor: '0',
			style: 'height: 100%;padding: 5px',
			items: [{
                xtype: 'checkboxgroup',
                columns: 1,
                itemCls: 'x-check-group-clt',
                anchor: '-5',
                items: [
                    {boxLabel: '支持布尔数据类型', name: 'SUPPORTS_BOOLEAN_DATA_TYPE', checked: attributes.SUPPORTS_BOOLEAN_DATA_TYPE == 'Y'},
                    {boxLabel: '支持Timestamp数据类型', name: 'SUPPORTS_TIMESTAMP_DATA_TYPE', checked: attributes.SUPPORTS_TIMESTAMP_DATA_TYPE == 'Y'},
                    {boxLabel: '标识符使用引号括起来', name: 'QUOTE_ALL_FIELDS', checked: attributes.QUOTE_ALL_FIELDS == 'Y'},
                    {boxLabel: '强制标识符使用小写字母', name: 'FORCE_IDENTIFIERS_TO_LOWERCASE', checked: attributes.FORCE_IDENTIFIERS_TO_LOWERCASE == 'Y'},
                    {boxLabel: '强制标识符使用大写字母', name: 'FORCE_IDENTIFIERS_TO_UPPERCASE', checked: attributes.FORCE_IDENTIFIERS_TO_UPPERCASE == 'Y'},
                    {boxLabel: 'Preserve case of reserved words', name: 'PRESERVE_RESERVED_WORD_CASE', checked: attributes.PRESERVE_RESERVED_WORD_CASE == 'Y'}
                ]
            }, {
            	xtype: 'label',
            	style: 'line-height:25px; padding-left: 5px',
            	text: '默认模式名称.在没有其他模式名时使用'
            }, {
            	xtype: 'textfield',
            	anchor: '0',
            	name: 'PREFERRED_SCHEMA_NAME',
            	value: attributes.PREFERRED_SCHEMA_NAME
            }, {
            	xtype: 'label',
            	style: 'line-height:25px; padding-left: 5px',
            	text: '请输入连接成功后要执行的SQL语句，用分号(;)隔开'
            }, {
            	xtype: 'textarea',
            	anchor: '0',
            	name: 'PREFERRED_SCHEMA_NAME',
            	value: decodeURIComponent(attributes.SQL_CONNECT)
            }]
		}];
		AdvancePanel.superclass.initComponent.call(this);
	}
});