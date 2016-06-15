SampleRowsDialog = Ext.extend(KettleDialog, {
	title: '样本行',
	width: 300,
	height: 190,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();

		var wLinesRange = new Ext.form.TextField({fieldLabel: '行范围', anchor: '-10', value: cell.getAttribute('linesrange')});
		var wLineNumberField = new Ext.form.TextField({fieldLabel: '行号字段名', anchor: '-10', value: cell.getAttribute('linenumfield')});
		
		this.fitItem = new KettleForm({
			labelWidth: 80,
			items: [wLinesRange, wLineNumberField]
		});
		
		this.getValues = function(){
			return {
				linesrange: wLinesRange.getValue(),
				linenumfield: wLineNumberField.getValue()
			};
		};
		
		SampleRowsDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SampleRows', SampleRowsDialog);