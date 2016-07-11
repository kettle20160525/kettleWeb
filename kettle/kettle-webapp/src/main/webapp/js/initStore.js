var system = new Ext.util.MixedCollection();

Ext.onReady(function() {
	
	new Ext.data.JsonStore({
		storeId: 'valueMetaStore',
		fields: ['id', 'name'],
		proxy: new Ext.data.HttpProxy({
			url: 'system/valueMeta.do',
			method: 'POST'
		})
	}).load();	//字段类型，如Integer, String等
	
	new Ext.data.JsonStore({
		storeId: 'valueFormatStore',
		fields: ['id', 'name'],
		baseParams: {valueType: 'all'},
		proxy: new Ext.data.HttpProxy({
			url: 'system/valueFormat.do',
			method: 'POST'
		})
	}).load();	//字段值格式，如yyyy-MM-dd
	
	new Ext.data.JsonStore({
		storeId: 'systemDataTypesStore',
		fields: ['code', 'descrp'],
		proxy: new Ext.data.HttpProxy({
			url: 'system/systemDataTypes.do',
			method: 'POST'
		})
	}).load();	//获取系统变量组件使用
	
	new Ext.data.JsonStore({
		storeId: 'randomValueFuncStore',
		fields: ['type', 'code', 'descrp'],
		proxy: new Ext.data.HttpProxy({
			url: 'system/randomValueFunc.do',
			method: 'POST'
		})
	}).load();	//获取随机数组件使用
	
	new Ext.data.JsonStore({
		storeId: 'databaseAccessData',
		fields: ['value','text'],
		proxy: new Ext.data.HttpProxy({
			url: GetUrl('database/accessData.do'),
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId: 'datetimeFormatStore',
		fields: ['name'],
		proxy: new Ext.data.HttpProxy({
			url: GetUrl('system/datetimeformat.do'),
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId: 'formatMapperLineTerminatorStore',
		fields: ['name'],
		proxy: new Ext.data.HttpProxy({
			url: GetUrl('system/formatMapperLineTerminator.do'),
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId: 'compressionProviderNamesStore',
		fields: ['name'],
		proxy: new Ext.data.HttpProxy({
			url: GetUrl('system/compressionProviderNames.do'),
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId: 'availableCharsetsStore',
		fields: ['name'],
		proxy: new Ext.data.HttpProxy({
			url: GetUrl('system/availableCharsets.do'),
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId: 'proxyTypeStore',
		fields: ['name'],
		proxy: new Ext.data.HttpProxy({
			url: GetUrl('system/proxyType.do'),
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId: 'logLevelStore',
		fields: ['id', 'code', 'desc'],
		proxy: new Ext.data.HttpProxy({
			url: GetUrl('system/logLevel.do'),
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId: 'variableTypeStore',
		fields: ['id', 'code', 'desc'],
		idProperty: 'code',
		proxy: new Ext.data.HttpProxy({
			url: GetUrl('system/variableType.do'),
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId:'successConditionStore',
		fields: ['value','text'],
		proxy: new Ext.data.HttpProxy({
			url: GetUrl('system/successCondition.do'),
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId:'successNumberConditionStore',
		fields: ['value','text'],
		proxy: new Ext.data.HttpProxy({
			url: GetUrl('system/successNumberCondition.do'),
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId: 'databaseAccessMethod',
		fields: ['value','text'],
		proxy: new Ext.data.HttpProxy({
			url: 'database/accessMethod.do',
			method: 'POST'
		})
	});
	
	Ext.Ajax.request({
		url: GetUrl('system/images.do'),
		method: 'POST',
		success: function(response) {
			system.addAll(Ext.decode(response.responseText));
		}
	});
	
	
});