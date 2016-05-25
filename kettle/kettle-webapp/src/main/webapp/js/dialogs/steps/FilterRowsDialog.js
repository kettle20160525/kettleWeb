FilterRowsDialog = Ext.extend(Ext.Window, {
	title: '过滤记录',
	width: 600,
	height: 400,
	closeAction: 'close',
	modal: true,
	layout: 'fit',
	initComponent: function() {
		var me = this,
		graph = getActiveTransGraph().getGraph(), 
		cell = graph.getSelectionCell();
		
		var store = new Ext.data.JsonStore({
			fields: ['name'],
			data: []
		}), data = [];
		var outputEdges = graph.getOutgoingEdges(cell, graph.getDefaultParent());
		Ext.each(outputEdges, function(edge) {
			if(edge.target) {
				data.push({name: edge.target.getAttribute('label')});
			}
		});
		store.loadData(data);
		
		var conditionEditor = new ConditionEditor({
			anchor: '-20',
			height: 200,
			value: cell.getAttribute('condition')
		});
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px 0px 15px 15px',
			region: 'north',
			height: 150,
			defaultType: 'textfield',
			labelWidth: 120,
			autoScroll: true,
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-20',
				name: 'label',
				value: cell.getAttribute('label')
			}, new Ext.form.ComboBox({
				fieldLabel: '发送true数据给步骤',
				anchor: '-20',
				displayField: 'name',
				valueField: 'name',
				typeAhead: true,
		        mode: 'local',
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: store,
				hiddenName: 'send_true_to',
				value: cell.getAttribute('send_true_to')
			}), new Ext.form.ComboBox({
				fieldLabel: '发送false数据给步骤',
				anchor: '-20',
			    displayField: 'name',
				valueField: 'name',
				typeAhead: true,
		        mode: 'local',
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: store,
				hiddenName: 'send_false_to',
				value: cell.getAttribute('send_false_to')
			}), conditionEditor]
		});
		
		
		this.items = form;
		
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
    				
    				var edit = new mxCellAttributeChange(cell, 'label', formValues.label);
                	graph.getModel().execute(edit);
                	edit = new mxCellAttributeChange(cell, 'send_true_to', formValues.send_true_to);
                	graph.getModel().execute(edit);
                	edit = new mxCellAttributeChange(cell, 'send_false_to', formValues.send_false_to);
                	graph.getModel().execute(edit);
                	edit = new mxCellAttributeChange(cell, 'condition', Ext.encode(conditionEditor.getValue()));
                	graph.getModel().execute(edit);	
                }
                finally
                {
                    graph.getModel().endUpdate();
                }
                
				me.close();
				
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		FilterRowsDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('FilterRows', FilterRowsDialog);
