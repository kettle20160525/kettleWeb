JobGraph = Ext.extend(BaseGraph, {
	iconCls: 'jobGraphIcon',
	
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
				var dialog = new JobExecutionConfigurationDialog();
				dialog.show(null, function() {
					dialog.initData();
				});
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
				this.showResultPanel();
			}
		}];
		
		this.resultPanel = new JobResult();
		
		JobGraph.superclass.initComponent.call(this);
	},
	
	initContextMenu: function(menu, cell, evt) {
		var graph = this.getGraph(), me = this;
		
		if(cell == null) {
			menu.addItem('新建注释', null, function(){alert(1);}, null, null, true);
			menu.addItem('从剪贴板粘贴步骤', null, function(){alert(1);}, null, null, !mxClipboard.isEmpty());
			menu.addSeparator(null);
			menu.addItem('全选', null, function(){me.getGraph().selectVertices();}, null, null, true);
			menu.addItem('清除选择', null, function(){me.getGraph().clearSelection();}, null, null, !graph.isSelectionEmpty());
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
			menu.addItem('复制被选择的作业入口到剪贴板', null, function(){mxClipboard.copy(graph);}, null, null, true);
			menu.addItem('复制作业入口', null, function(){mxClipboard.copy(graph);mxClipboard.paste(graph);}, null, null, true);
			menu.addItem('删除所有该作业入口的副本', null, function(){graph.removeCells();}, null, null, true);
			menu.addItem('隐藏作业入口', null, function(){alert(1);}, null, null, true);
			menu.addItem('拆开节点', null, function(){alert(1);}, null, null, true);
			menu.addSeparator(null);
			
			var text = 'Run Next Entries in Parallel';
			if('Y' == cell.getAttribute('parallel'))
				text = "[√]Run Next Entries in Parallel";
			
			menu.addItem(text, null, function(){
				graph.getModel().beginUpdate();
		        try
		        {
		        	var edit = new mxCellAttributeChange(cell, 'parallel', 'Y' == cell.getAttribute('parallel') ? 'N' : "Y");
		        	graph.getModel().execute(edit);
		        } finally
		        {
		            graph.getModel().endUpdate();
		        }
		        
			}, null, null, true);
		}
	},
	
	newStep: function(graphXml, node, x, y) {
		var graph = this.getGraph();
		Ext.Ajax.request({
			url: GetUrl('job/newJobEntry.do'),
			params: {graphXml: graphXml, pluginId: node.attributes.pluginId, name: encodeURIComponent(node.text)},
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
	
	newHop: function(cell) {
		var doc = mxUtils.createXmlDocument();
		var hop = doc.createElement('JobHop');
		
		hop.setAttribute('from', cell.source.getAttribute('label'));
		hop.setAttribute('to', cell.target.getAttribute('label'));
		hop.setAttribute('from_nr', cell.source.getAttribute('nr'));
		hop.setAttribute('to_nr', cell.target.getAttribute('nr'));
		cell.setValue(hop);
		
		var graph = this.getGraph();
		
		graph.getModel().beginUpdate();
        try
        {
        	var edit = new mxCellAttributeChange(cell, 'enabled', 'Y');
        	graph.getModel().execute(edit);
        	edit = new mxCellAttributeChange(cell, 'evaluation', 'Y');
        	graph.getModel().execute(edit);
        	if(cell.source.getAttribute('ctype') == 'SPECIAL' && cell.source.getAttribute('start') == 'Y') {
        		edit = new mxCellAttributeChange(cell, 'unconditional', 'Y');
            	graph.getModel().execute(edit);
        	} else {
        		edit = new mxCellAttributeChange(cell, 'unconditional', 'N');
            	graph.getModel().execute(edit);
        	}
        } finally
        {
            graph.getModel().endUpdate();
        }
	},
	
	editCell: function(cell) {
		if(cell.getAttribute('dummy') == 'Y')
			return;
		var dialog = Ext.create({}, cell.getAttribute('ctype'));
		dialog.show();
	},
	
	getResultPanel: function() {
		if(!this.resultview)
			this.resultview = new JobResult();
		
		return this.resultview;
	},
	
	getEntries: function(cb) {
		var store = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['name'],
			proxy: new Ext.data.HttpProxy({
				url: GetUrl('job/entries.do'),
				method: 'POST'
			})
		});
		
		store.on('load', function() {
			if(Ext.isFunction(cb))
				cb(store);
		});
		
		store.baseParams.graphXml = this.toXml();
		store.load();
		
		return store;
	}
	
});

Ext.reg('JobGraph', JobGraph);
