FilesFromResultDialog = Ext.extend(KettleDialog, {
	title: '从以前的结果获取文件',
	width: 300,
	height: 120,
	initComponent: function() {
		this.fitItems = [];
		FilesFromResultDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('FilesFromResult', FilesFromResultDialog);