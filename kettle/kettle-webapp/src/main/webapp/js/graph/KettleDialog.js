KettleForm = Ext.extend(Ext.form.FormPanel, {
	labeWidth: 100,
	labelAlign: 'right',
	defaultType: 'textfield'
});
Ext.reg('KettleForm', KettleForm);

KettleDialog = Ext.extend(Ext.Window, {
	modal: true,
	layout: 'border',
	closeAction: 'close',
	defaults: {border: false},
	
	initComponent: function() {
		var graph = getActiveGraph().getGraph(), cell = graph.getSelectionCell(), me = this;
		
		var wLabel = this.wLabel = new Ext.form.TextField({
			fieldLabel: '步骤名称',
			anchor: '-20',
			value: cell.getAttribute('label')
		});
		
		var form = new KettleForm({
			bodyStyle: 'padding: 10px',
			region: 'north',
			height: 35,
			labelWidth: 100,
			items: [wLabel]
		});
		
		this.items = [form, {
			region: 'center',
			bodyStyle: 'padding: 5px',
			layout: 'fit',
			items: this.fitItems
		}];
		
		var bCancel = new Ext.Button({
			text: '取消', handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', handler: function() {
				me.onSure(true);
			}
		});
		
		this.bbar = ['->', bCancel];
		if(this.showPreview)
			this.bbar.push({text: '预览', handler: function() {
				Ext.Ajax.request({
					url: GetUrl('trans/previewData.do'),
					params: {graphXml: getActiveGraph().toXml(), stepName: cell.getAttribute('label'), rowLimit: 100},
					method: 'POST',
					success: function(response) {
						var record = Ext.decode(response.responseText);
						
						var previewGrid = new DynamicEditorGrid({
							rowNumberer: true
						});
						
						var win = new Ext.Window({
							title: '预览数据',
							width: 700,
							height: 500,
							layout: 'fit',
							items: previewGrid
						});
						win.show();
						
						var records = Ext.decode(response.responseText);
						previewGrid.loadMetaAndValue(records);
						
					}
				});
			}});
		this.bbar.push(bOk);
		
		KettleDialog.superclass.initComponent.call(this);
	},
	
	onSure: function(closed) {
		var graph = getActiveGraph().getGraph();
		
		graph.getModel().beginUpdate();
        try
        {
        	var values = this.getValues();
        	for(var name in values) {
				var edit = new mxCellAttributeChange(cell, name, values[name]);
            	graph.getModel().execute(edit);
			}
        	var edit = new mxCellAttributeChange(cell, 'label', this.wLabel.getValue());
        	graph.getModel().execute(edit);
        } finally
        {
            graph.getModel().endUpdate();
        }
        
        if(closed === true)
        	this.close();
	},
	
	getValues: function() {
		return {};
	}
	
});

KettleTabDialog = Ext.extend(KettleDialog, {
	initComponent: function() {
		
		this.fitItems = new Ext.TabPanel({
			region: 'center',
			activeTab: 0,
			items: this.tabItems
		});
		
		KettleTabDialog.superclass.initComponent.call(this);
	}
});

