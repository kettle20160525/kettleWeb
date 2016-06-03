JobGraph = Ext.extend(BaseGraph, {
	iconCls: 'job',
	
	initComponent: function() {
		var me = this;
		
		this.tbar = [{
			iconCls: 'save', handler: function() {
				var enc = new mxCodec(mxUtils.createXmlDocument());
				var node = enc.encode(me.getGraph().getModel());
				Ext.Ajax.request({
					url: GetUrl('job/save.do'),
					params: {graphXml: mxUtils.getPrettyXml(node)},
					method: 'POST',
					success: function(response) {
						
					}
				});
			}
		},'-',{
			iconCls: 'run', handler: function() {
				var dialog = new TransExecutionConfigurationDialog();
				dialog.show();
			}
		},{
			iconCls: 'stop'
		},'-',{
			iconCls: 'replay'
		},'-',{
			iconCls: 'SQLbutton'
		},'-',{
			iconCls: 'exploredb'
		},'-',{
			iconCls: 'show-results', scope: this, handler: function() {
				resultPanel.setVisible(!resultPanel.isVisible());
				this.doLayout();
			}
		}];
		
		JobGraph.superclass.initComponent.call(this);
	},
	
	initContextMenu: function(menu, cell, evt) {
		var graph = this.getGraph(), me = this;
		
		if(cell == null) {
			menu.addItem('新建注释', null, function(){alert(1);}, null, null, true);
			menu.addItem('从剪贴板粘贴步骤', null, function(){alert(1);}, null, null, true);
			menu.addSeparator(null);
			menu.addItem('全选', null, function(){alert(1);}, null, null, true);
			menu.addItem('清除选择', null, function(){alert(1);}, null, null, true);
			menu.addSeparator(null);
			menu.addItem('查看图形文件', null, function(){
				var enc = new mxCodec(mxUtils.createXmlDocument());
				var node = enc.encode(graph.getModel());
				var debugWin = new DebugWin({fcontent: mxUtils.getPrettyXml(node)});
				debugWin.show();
			}, null, null, true);
			menu.addItem('查看引擎文件', null, function(){
				var enc = new mxCodec(mxUtils.createXmlDocument());
				var node = enc.encode(graph.getModel());
				
				Ext.Ajax.request({
					url: GetUrl('job/engineXml.do'),
					params: {graphXml: mxUtils.getPrettyXml(node)},
					method: 'POST',
					success: function(response) {
						var debugWin = new DebugWin({fcontent: response.responseText});
						debugWin.show();
					}
				});
			}, null, null, true);
			menu.addSeparator(null);
			menu.addItem('作业设置', null, function() {
				var transDialog = new TransDialog();
				transDialog.show();
			}, null, null, true);
		} else {
			menu.addItem('新节点', null, function(){alert(1);}, null, null, true);
			menu.addItem('编辑作业入口', null, function(){
				if(cell.getAttribute('dummy') != 'Y') {
					var dialog = Ext.create({}, cell.getAttribute('ctype'));
					dialog.show();
				}
			}, null, null, true);
			menu.addItem('编辑作业入口描述信息', null, function(){alert(1);}, null, null, true);
			menu.addSeparator(null);
			menu.addItem('复制被选择的作业入口到剪贴板', null, function(){alert(1);}, null, null, true);
			menu.addItem('复制作业入口', null, function(){alert(1);}, null, null, true);
			menu.addItem('删除所有该作业入口的副本', null, function(){alert(1);}, null, null, true);
			menu.addItem('隐藏作业入口', null, function(){alert(1);}, null, null, true);
			menu.addItem('拆开节点', null, function(){alert(1);}, null, null, true);
		}
	},
	
	newStep: function(graphXml, node, x, y) {
		var graph = this.getGraph();
		Ext.Ajax.request({
			url: GetUrl('job/newJobEntry.do'),
			params: {graphXml: graphXml, pluginId: node.attributes.pluginId, name: node.text},
			method: 'POST',
			success: function(response) {
				var doc = response.responseXML;
         		graph.getModel().beginUpdate();
				try
				{
					var cell = graph.insertVertex(graph.getDefaultParent(), null, doc.documentElement, x, y, 40, 40, "icon;image=" + node.attributes.dragIcon);
					graph.setSelectionCells([cell]);
				} finally
				{
					graph.getModel().endUpdate();
				}
			}
		});
	},
	
	editCell: function(cell) {
		if(cell.getAttribute('dummy') == 'Y')
			return;
		var dialog = Ext.create({}, cell.getAttribute('ctype'));
		dialog.show();
	},
	
	getResultPanel: function() {
		if(!this.resultview)
			this.resultview = new ResultPanel();
		return this.resultview;
	}
});

Ext.reg('JobGraph', JobGraph);
