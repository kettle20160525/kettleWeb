DummyDialog = Ext.extend(Ext.Window, {
	title: 'Dummy',
	width: 300,
	height: 120,
	closeAction: 'close',
	modal: true,
	layout: 'fit',
	initComponent: function() {
		var me = this, graph = getActiveTransGraph().getGraph(), cell = graph.getSelectionCell();
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			border: false,
			region: 'north',
			height: 150,
			defaultType: 'textfield',
			labelWidth: 60,
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-10',
				name: 'label',
				value: cell.getAttribute('label')
			}]
		});
		
		this.items = [form];
		
		var bCancel = new Ext.Button({
			text: '取消', handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', handler: function() {
				graph.getModel().beginUpdate();
                try
                {
                	var formValues = form.getForm().getValues();
                	formValues.compatibilityMode = formValues.compatibilityMode ? true : false;
                	for(var fieldName in formValues) {
						var edit = new mxCellAttributeChange(cell, fieldName, formValues[fieldName]);
                    	graph.getModel().execute(edit);
					}
                }
                finally
                {
                    graph.getModel().endUpdate();
                }
                
				me.close();
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		DummyDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('Dummy', DummyDialog);
