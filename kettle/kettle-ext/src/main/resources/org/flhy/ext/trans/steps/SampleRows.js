SampleRowsDialog = Ext.extend(KettleDialog, {
	title: '样本行',
	width: 300,
	height: 190,
	initComponent: function() {
		var me = this, 
			transGraph = getActiveGraph(),
			graph = transGraph.getGraph(), 
			cell = graph.getSelectionCell(), 
			store = transGraph.getDatabaseStore();

		this.fitItem = new KettleForm({
			labelWidth: 80,
			bodyStyle: 'padding: 15px 0px',
			items: [{
				fieldLabel: '行范围',
				xtype: 'textfield',
				value: cell.getAttribute('linesrange'),
				anchor: '-10'
			}, {
				fieldLabel: '行号字段名',
				xtype: 'textfield',
				value: cell.getAttribute('linenumfield'),
				anchor: '-10'
			}]
		});
		
		SampleRowsDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SampleRows', SampleRowsDialog);