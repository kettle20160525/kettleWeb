FilterRowsDialog = Ext.extend(KettleDialog, {
	title: '过滤记录',
	width: 600,
	height: 400,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var wTrueTo = new Ext.form.ComboBox({
			fieldLabel: '发送true数据给步骤',
			anchor: '-1',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().nextSteps(cell.getAttribute('label')),
			value: cell.getAttribute('send_true_to')
		});
		var wFalseTo = new Ext.form.ComboBox({
			fieldLabel: '发送false数据给步骤',
			anchor: '-1',
		    displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().nextSteps(cell.getAttribute('label')),
			value: cell.getAttribute('send_false_to')
		});
		var wCondition = new ConditionEditor({ anchor: '-1', height: 250, autoScroll: true, value: cell.getAttribute('condition') });
		
		this.getValues = function(){
			return {
				send_true_to: wTrueTo.getValue(),
				send_false_to: wFalseTo.getValue(),
				condition: Ext.encode(wCondition.getValue())
			};
		};
		
		this.fitItems = new KettleForm({
			labelWidth: 120,
			bodyStyle: 'padding: 15px',
			items: [wTrueTo, wFalseTo, wCondition]
		});
		
		FilterRowsDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('FilterRows', FilterRowsDialog);