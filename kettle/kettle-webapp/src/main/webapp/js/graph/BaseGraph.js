BaseGraph = Ext.extend(Ext.Panel, {
	layout: 'border',
	defaults: {border: false},
	title: '正在加载...',

	initComponent: function() {
		var me = this;
		var resultPanel = new Ext.Panel({
			region: 'south',
			hidden: true,
			height: 250,
			layout: 'fit'
		});
		
		var graphPanel = new Ext.Panel({
			region: 'center',
			bodyStyle:'overflow: auto'
		});
		
		this.items = [graphPanel, resultPanel];
		
		graphPanel.on('afterrender', function(comp) {
			var container = comp.body.dom;
			this.initGraph(container);
			this.installDragDrop(container);
			this.installPopupMenu(container);
		}, this);
		
		BaseGraph.superclass.initComponent.call(this);
		this.addEvents('doRun');
		
		this.on('doRun', function(executionId) {
			if(!resultPanel.isVisible()) {
				resultPanel.show();
				me.doLayout();
			}
			
			var rp = this.getResultPanel();
			if(rp) {
				resultPanel.removeAll();
				resultPanel.add(rp);
				resultPanel.doLayout();
			}
			
			rp.loadResult(executionId);
		}, this);
	},
	
	initGraph: function(container) {
		var graph = new mxGraph(container);
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
		
		graph.setCellsEditable(false);
		
		var doInsert = mxCell.prototype.insert, me = this;
		mxCell.prototype.insert = function(child, index) {
			child = doInsert.apply(this, arguments);
			
			if(child.getValue() != null) {
				if(child.value && child.value.nodeName && 'Note' == child.value.nodeName) {
					child.setConnectable(false);
				}
				if(child.getAttribute('draw') == 'N') {
					child.setVisible(false);
				}
				if(child.getAttribute('ctype'))
					loadPluginScript(child.getAttribute('ctype'));
				
				me.cellAdded(graph, child);
			}
			
			return child;
		};
		
//		graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt){  
//			Ext.each(evt.getProperty('edit').changes, function(change) {
//				if (change.constructor == mxChildChange && change.change.previous == null)    {
//					alert(1);
//				}
//			});
//		});
		graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){  
			var cell = evt.getProperty('cell');
			if(cell) {
				me.editCell(cell);
			}
		});
	
		
		
		this.getGraph = function() {
			return graph;
		};
		this.graphXml = function() {
			var enc = new mxCodec(mxUtils.createXmlDocument());
			var node = enc.encode(graph.getModel());
			return mxUtils.getPrettyXml(node);
		};
	},
	
	installDragDrop: function(ct) {
		var me = this;
		new Ext.dd.DropTarget(ct,
        {
       		ddGroup: 'TreePanelDDGroup',  
            notifyDrop: function(ddSource, e, data) {  
            	var xy1 = Ext.fly(ct).getXY(), xy2 = e.getXY();
         		var top = xy2[1] - xy1[1], left = xy2[0]-xy1[0];
				me.newStep( me.toXml(), data.node, left, top );
         		return true;
            }
        });
	},
	
	installPopupMenu: function(container) {
		var graph = this.getGraph();
		
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
		graph.popupMenuHandler.factoryMethod = mxUtils.bind(this, this.initContextMenu);
		mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt)
		{
			graph.popupMenuHandler.hideMenu();
		}));
	},
	
	initContextMenu: Ext.emptyFn,
	cellAdded: Ext.emptyFn,
	
	toXml: function() {
		var enc = new mxCodec(mxUtils.createXmlDocument());
		var node = enc.encode(this.getGraph().getModel());
		return mxUtils.getPrettyXml(node);
	},
	
	getDatabaseStore: function() {
		var databaseStore = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['name']
		}), graph = this.getGraph();
		var cell = graph.getDefaultParent(), data = [];
		if(cell.getAttribute('databases') != null)
			data = Ext.decode(cell.getAttribute('databases'));
		databaseStore.loadData(data);
		
		return databaseStore;
	},
	
	getSlaveServerStore: function() {
		var slaveServerStore = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['name']
		}), graph = this.getGraph();
		var cell = graph.getDefaultParent(), data = [];
		if(cell.getAttribute('slaveServers') != null)
			data = Ext.decode(cell.getAttribute('slaveServers'));
		slaveServerStore.loadData(data);
		
		return slaveServerStore;
	},
	
	listParameters: function() {
		//TODO
	}
});