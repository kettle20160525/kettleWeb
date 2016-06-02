JobGraph = Ext.extend(Ext.Panel, {
	layout: 'border',
	iconCls: 'job',
	defaults: {border: false},
	title: '正在加载...',
	
	initComponent: function() {
		var me = this;
		var resultPanel = new ResultPanel({
			region: 'south',
			hidden: true,
			height: 250
		});
		
		var graphPanel = new Ext.Panel({
			region: 'center',
			bodyStyle:'overflow: auto',
			tbar: [{
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
				iconCls: 'run', handler: me.run
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
			}]
		});
		
		this.items = [graphPanel, resultPanel];
		
		this.on('run', function(executionId) {
			if(resultPanel.isVisible() == false) {
				resultPanel.show();
				me.doLayout();
			}
			
			resultPanel.loadResult(executionId);
		});
		
		graphPanel.on('afterrender', function(comp) {
			var container = comp.body.dom;
			this.initGraph(container);
			this.installDragDrop(container);
			this.installPopupMenu(container);
		}, this);
		
		JobGraph.superclass.initComponent.call(this);
		this.addEvents('run');
	},
	
	initGraph: function(container) {
		var me = this;
		var graph = this.graph = new mxGraph(container);
		var node = mxUtils.load(GetUrl('mxgraph2/style/default-style.xml')).getDocumentElement();
		var dec = new mxCodec(node.ownerDocument);
		dec.decode(node, graph.getStylesheet());
		
		new mxRubberband(graph);
		graph.setTooltips(true);
		graph.setPanning(true);
		graph.setConnectable(true);
		graph.setDropEnabled(true);
		
		graph.setAllowDanglingEdges(false);
		graph.setDisconnectOnMove(false);
		
		var insert = mxCell.prototype.insert;
		mxCell.prototype.insert = function(child, index) {
			child = insert.apply(this, arguments);

			if(child.value && child.value.nodeName && 'Note' == child.value.nodeName) {
				child.setConnectable(false);
			}
			
			if(child.getAttribute('dummy') != 'Y')
				loadPluginScript(child.getAttribute('ctype'));
			if(child.getAttribute('draw') == 'N')
				child.setVisible(false);
			
			return child;
		};
		
		var database_store = this.database_store = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['name']
		});
		graph.addListener(mxEvent.ROOT, function(sender, evt){ 
			var cell = graph.getDefaultParent();
			var databases = Ext.decode(cell.getAttribute('databases') || '[]');
			database_store.loadData(databases);
		});
	},
	
	installPopupMenu: function(container) {
		var graph = this.graph, me = this;
		
		var textEditing =  mxUtils.bind(this, function(evt)
		{
			if (evt == null)
			{
				evt = window.event;
			}
			return graph.isEditing();
		});
		if (mxClient.IS_IE && (typeof(document.documentMode) === 'undefined' || document.documentMode < 9))
		{
			mxEvent.addListener(container, 'contextmenu', textEditing);
		}
		else
		{
			container.oncontextmenu = textEditing;
		}
		
		var graphFireMouseEvent = graph.fireMouseEvent;
	   	graph.fireMouseEvent = function(evtName, me, sender)
	   	{
	   		if (evtName == mxEvent.MOUSE_DOWN)
	   		{
	   			this.container.focus();
	   		}
	   		
	   		graphFireMouseEvent.apply(this, arguments);
	   	};
	   	
	   	graph.popupMenuHandler.autoExpand = true;
		graph.popupMenuHandler.factoryMethod = mxUtils.bind(this, function(menu, cell, evt)
		{
			
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
		});
		mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt)
		{
			graph.popupMenuHandler.hideMenu();
		}));
	},
	
	installDragDrop: function(ct) {
		var graph = this.graph;
		new Ext.dd.DropTarget(ct,
        {
       		ddGroup: 'TreePanelDDGroup',  
            notifyDrop: function(ddSource, e, data) {  
            	var xy1 = Ext.fly(ct).getXY(), xy2 = e.getXY();
         		var top = xy2[1] - xy1[1], left = xy2[0]-xy1[0];
         		
         		var enc = new mxCodec(mxUtils.createXmlDocument());
				var node = enc.encode(graph.getModel());
         		Ext.Ajax.request({
					url: GetUrl('job/newJobEntry.do'),
					params: {graphXml: mxUtils.getPrettyXml(node), entryId: data.node.id,entryName: data.node.text},
					method: 'POST',
					success: function(response) {
						var doc = response.responseXML;
		         		graph.getModel().beginUpdate();
						try
						{
							graph.insertVertex(graph.getDefaultParent(), null, doc.documentElement, left, top, 40, 40, "icon;image=" + data.node.attributes.dragIcon);
						} finally
						{
							graph.getModel().endUpdate();
						}
					}
				});
         		
         		return true;
            }
        });
	},
	
	getGraph: function() {
		return this.graph;
	},
	
	getDatabaseStore: function() {
		return this.database_store;
	},
	
	run: function() {
		var dialog = new TransExecutionConfigurationDialog();
		dialog.show();
	}
	
	
	
});

Ext.reg('JobGraph', JobGraph);
