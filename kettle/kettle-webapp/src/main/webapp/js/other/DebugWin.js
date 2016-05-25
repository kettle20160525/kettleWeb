DebugWin = Ext.extend(Ext.Window, {
	width: 1000,
	height: 500,
	layout: 'fit',
	closeAction: 'close',
	initComponent: function() {
		this.items = new Ext.form.TextArea({value: this.initialConfig.fcontent});
		DebugWin.superclass.initComponent.call(this);
	}
});