Ext.onReady(function() {
	
	new Ext.data.JsonStore({
		storeId: 'valueMetaStore',
		fields: ['id', 'name'],
		proxy: new Ext.data.HttpProxy({
			url: 'system/valueMeta.do',
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId: 'valueFormatStore',
		fields: ['name'],
		proxy: new Ext.data.HttpProxy({
			url: 'system/valueFormat.do',
			method: 'POST'
		})
	}).load();
	
	new Ext.data.JsonStore({
		storeId: 'systemDataTypesStore',
		fields: ['code', 'descrp'],
		proxy: new Ext.data.HttpProxy({
			url: 'system/systemDataTypes.do',
			method: 'POST'
		})
	}).load();
});