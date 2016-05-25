EnterSelectionDialog = Ext.extend(Ext.Window, {
	title: '字段',
	width: 200,
	height: 300,
	closeAction: 'close',
	layout: 'fit',
	modal: true,
	bodyStyle: 'padding: 5px;',
	
	initComponent: function() {
		var me = this, graph = getActiveTransGraph().getGraph(), cell = graph.getSelectionCell();
		
		var store = Ext.isFunction(this.getExtraStore) ? this.getExtraStore() : new Ext.data.JsonStore({
			fields: ['name'],
			proxy: new Ext.data.HttpProxy({
				url: 'step/inputOutputFields.do',
				method: 'POST'
			})
		});
		
		var enc = new mxCodec(mxUtils.createXmlDocument());
		var node = enc.encode(graph.getModel());
		
		store.baseParams.stepName = cell.getAttribute('label');
		store.baseParams.graphXml = mxUtils.getPrettyXml(node);
		store.baseParams.before = true;
		
		var listBox = new ListBox({
			valueField: 'name',
			displayField: 'name',
			store: store
		});
		
		if(store.getTotalCount() < 1) {
			store.load();
		}
		
		this.items = listBox;
		
		var bCancel = new Ext.Button({
			text: '取消', handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', handler: function() {
				var value = listBox.getValue();
				if(value) {
					me.fireEvent('sure', value);
					me.close();
				}
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		EnterSelectionDialog.superclass.initComponent.call(this);
		this.addEvents('sure');
	}
});