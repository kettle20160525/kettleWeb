JobResult = Ext.extend(Ext.TabPanel, {
	activeTab: 2,
	defaults: { border: false},
	initComponent: function() {
		
		this.items = [{
			title: '历史'
		}, {
			title: '日志'
		}, {
			title: '作业度量'
		},{
			title: 'Metrics'
		}];

		JobResult.superclass.initComponent.call(this);
	},
	
	loadResult: function(executionId) {
		if(!executionId) return;
		var me = this;
		
		Ext.Ajax.request({
			url: GetUrl('job/result.do'),
			params: {executionId: executionId},
			method: 'POST',
			success: function(response) {
				var result = Ext.decode(response.responseText);
				
				if(!result.finished) {
					setTimeout(function() { me.loadResult(executionId); }, 500);
				}
				
				delete me.result;
				me.result = result;
			}
		});
	}
});