JobResult = Ext.extend(Ext.TabPanel, {
	region: 'south',
	hidden: true,
	height: 250,
	activeTab: 2,
	initComponent: function() {
		var me = this;
		var jobMeasure = new TreeGrid({
	        title: '作业度量',
	        columns:[{
	            header: '任务/任务条目', dataIndex: 'name', width: 150
	        },{
	            header: '注释', dataIndex: 'comment', width: 100
	        },{
	            header: '结果', dataIndex: 'result', width: 100
	        },{
	            header: '原因', dataIndex: 'reason', width: 200
	        },{
	            header: '文件名', dataIndex: 'fileName', width: 150
	        },{
	            header: '数量', dataIndex: 'number', width: 100
	        },{
	            header: '日志日期', dataIndex: 'logDate', width: 130
	        }]
	    });
		
		var log = new Ext.form.TextArea({readOnly: true});
		
		this.items = [{
			title: '历史',
			disabled: true
		}, {
			xtype: 'form',
			title: '日志',
			layout: 'fit',
			items: log
		}, jobMeasure, {
			title: 'Metrics',
			disabled: true
		}];

		this.loadResult = function(executionId) {
			if(!executionId) return;
			
			Ext.Ajax.request({
				url: GetUrl('job/result.do'),
				params: {executionId: executionId},
				method: 'POST',
				success: function(response) {
					var result = Ext.decode(response.responseText);
					
					if(result.jobMeasure.length > 0) {
						jobMeasure.getRootNode().removeAll(true);
						jobMeasure.getRootNode().appendChild(result.jobMeasure);
					}
					log.setValue(decodeURIComponent(result.log));
					
					if(!result.finished) {
						setTimeout(function() { me.loadResult(executionId); }, 500);
					}
				}
			});
		}
		
		JobResult.superclass.initComponent.call(this);
	}
	
});