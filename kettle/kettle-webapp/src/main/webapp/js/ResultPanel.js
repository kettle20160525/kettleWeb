ResultPanel = Ext.extend(Ext.TabPanel, {
	activeTab: 2,
	defaults: { border: false},
	initComponent: function() {
		var grid = new Ext.grid.GridPanel({
			title: '步骤度量',
			columns: [new Ext.grid.RowNumberer(), {
				header: '步骤名称', dataIndex: 'name', width: 150
			},{
				header: '复制的记录行数', dataIndex: 'num', width: 100
			},{
				header: '读', dataIndex: 'r', width: 70
			},{
				header: '写', dataIndex: 'x', width: 70
			},{
				header: '输入', dataIndex: 'i', width: 70
			},{
				header: '输出', dataIndex: 'o', width: 70
			},{
				header: '更新', dataIndex: 'u', width: 70
			},{
				header: '拒绝', dataIndex: 'f', width: 70
			},{
				header: '错误', dataIndex: 'e', width: 70
			},{
				header: '激活', dataIndex: 'a', width: 70
			},{
				header: '时间', dataIndex: 't', width: 60
			},{
				header: '速度(条记录/秒)', dataIndex: 's', width: 120
			},{
				header: 'Pri/in/out', dataIndex: 'pio', width: 100
			}],
			store: new Ext.data.ArrayStore({
				fields: ['name', 'num', 'r', 'x', 'i', 'o', 'u', 'f', 'e', 'a', 't', 's', 'pio']
			})
		});
		
		var form = new Ext.form.FormPanel({
			title: '日志',
			layout: 'fit',
			items: new Ext.form.TextArea({readOnly: true})
		});
		
		var previewGrid = new DynamicEditorGrid({
			title: 'Preview Data',
			rowNumberer: true,
			tbar: [{
				xtype: 'radio', name: 'preivew_method', boxLabel: '${TransPreview.FirstRows.Label}'
			}, '-', {
				xtype: 'radio', name: 'preivew_method', boxLabel: '${TransPreview.LastRows.Label}'
			}]
		});
		
		this.items = [{
			title: '执行历史'
		}, form, grid, {
			title: '性能图'
		},{
			title: 'Metrics'
		},previewGrid];

		ResultPanel.superclass.initComponent.call(this);
		
		var me = this;
        setTimeout(function() {
        	var transGraph = getActiveGraph();
        	if(!transGraph) return;
        	var graph = transGraph.getGraph();
            if(!graph) return; 
        	 
             graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt) {
     			var cell = graph.getSelectionCell();
     			if(cell != null && me.result) {
     				var records = me.result.previewData[cell.getAttribute('label')];
     				if(records) previewGrid.loadMetaAndValue(records);
     			}
     		});
        }, 500);
	},
	
	loadResult: function(executionId) {
		if(!executionId) return;
		var me = this, grid = this.items.get(2), log = this.items.get(1);
		
		Ext.Ajax.request({
			url: GetUrl('trans/result.do'),
			params: {executionId: executionId},
			method: 'POST',
			success: function(response) {
				var result = Ext.decode(response.responseText);
				var store = grid.getStore();
				store.removeAll();
				log.items.get(0).setValue('');
				
				store.loadData(result.stepMeasure);
				log.items.get(0).setValue(result.log);
				
				getActiveGraph().updateStatus(result.stepStatus);
				
				if(!result.finished) {
					setTimeout(function() { me.loadResult(executionId); }, 500);
				}
				delete me.result;
				me.result = result;
			}
		});
	}
});