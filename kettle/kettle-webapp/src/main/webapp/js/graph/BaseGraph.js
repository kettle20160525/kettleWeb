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
			this.installKeyHandler();
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
		

		graphPanel.on('resize', function() {
			me.getGraph().sizeDidChange();
		});
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
		container.style.background = 'url("' + GetUrl('ui/images/grid.gif') + '") repeat white';
		container.style.cursor = 'default';
		
		var cellExist = function(label) {
			var cells = graph.getChildVertices(graph.getDefaultParent());
			for(var i=0; i<cells.length; i++) {
				if(cells[i].getAttribute('label') == label) {
					return true;
				}
			}

			return false;
		};
		
		var doInsert = mxCell.prototype.insert, me = this;
		mxCell.prototype.insert = function(child, index) {
			var i = 2, name = child.getAttribute('label');
			while(cellExist(name)) {
				name = child.getAttribute('label') + i;
				i++;
			}
			child.setAttribute('label', name);
			
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
		
		graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt){  
			Ext.each(evt.getProperty('edit').changes, function(change) {
				if (change.constructor == mxCellAttributeChange && change.cell != null)    {
					var cell = change.cell, root = graph.getDefaultParent();
					if(cell.getId() == root.getId())
						me.getDatabaseStore();
				}
			});
		});
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
	
	installKeyHandler: function() {
		var graph = this.getGraph();
		var history = new mxUndoManager();
		var undoHandler = function(sender, evt)
		{
			var changes = evt.getProperty('edit').changes;
			graph.setSelectionCells(graph.getSelectionCellsForChanges(changes));
		};
		
		history.addListener(mxEvent.UNDO, undoHandler);
		history.addListener(mxEvent.REDO, undoHandler);
		
		var listener = function(sender, evt)
		{
			history.undoableEditHappened(evt.getProperty('edit'));
		};
		
		graph.getModel().addListener(mxEvent.UNDO, listener);
		graph.getView().addListener(mxEvent.UNDO, listener);
		
		var keyHandler = new mxKeyHandler(graph);
	    
	    // Ignores enter keystroke. Remove this line if you want the
	    // enter keystroke to stop editing
	    keyHandler.enter = function() {};
	    
	    keyHandler.bindKey(8, function()
	    {
	    	graph.foldCells(true);
	    });
	    
	    keyHandler.bindKey(13, function()
	    {
	    	graph.foldCells(false);
	    });
	    
	    keyHandler.bindKey(33, function()
	    {
	    	graph.exitGroup();
	    });
	    
	    keyHandler.bindKey(34, function()
	    {
	    	graph.enterGroup();
	    });
	    
	    keyHandler.bindKey(36, function()
	    {
	    	graph.home();
	    });

	    keyHandler.bindKey(35, function()
	    {
	    	graph.refresh();
	    });
	    
	    keyHandler.bindKey(37, function()
	    {
	    	graph.selectPreviousCell();
	    });
	        
	    keyHandler.bindKey(38, function()
	    {
	    	graph.selectParentCell();
	    });

	    keyHandler.bindKey(39, function()
	    {
	    	graph.selectNextCell();
	    });
	    
	    keyHandler.bindKey(40, function()
	    {
	    	graph.selectChildCell();
	    });
	    
	    keyHandler.bindKey(46, function()
	    {
	    	graph.removeCells();
	    });
	    
	    keyHandler.bindKey(107, function()
	    {
	    	graph.zoomIn();
	    });
	    
	    keyHandler.bindKey(109, function()
	    {
	    	graph.zoomOut();
	    });
	    
	    keyHandler.bindKey(113, function()
	    {
	    	graph.startEditingAtCell();
	    });
	  
	    keyHandler.bindControlKey(65, function()
	    {
	    	graph.selectAll();
	    });

	    keyHandler.bindControlKey(89, function()
	    {
	    	history.redo();
	    });
	    
	    keyHandler.bindControlKey(90, function()
	    {
	    	history.undo();
	    });
	    
	    keyHandler.bindControlKey(88, function()
	    {
	    	mxClipboard.cut(graph);
	    });
	    
	    keyHandler.bindControlKey(67, function()
	    {
	    	mxClipboard.copy(graph);
	    });
	    
	    keyHandler.bindControlKey(86, function()
	    {
	    	mxClipboard.paste(graph);
	    });
	    
	    keyHandler.bindControlKey(71, function()
	    {
	    	graph.setSelectionCell(graph.groupCells(null, 20));
	    });
	    
	    keyHandler.bindControlKey(85, function()
	    {
	    	graph.setSelectionCells(graph.ungroupCells());
	    });
	},
	
	initContextMenu: Ext.emptyFn,
	cellAdded: Ext.emptyFn,
	
	toXml: function() {
		var enc = new mxCodec(mxUtils.createXmlDocument());
		var node = enc.encode(this.getGraph().getModel());
		return mxUtils.getPrettyXml(node);
	},
	
	getDatabaseStore: function() {
		if(!this.databaseStore) {
			this.databaseStore = new Ext.data.JsonStore({
				idProperty: 'name',
				fields: ['name']
			});
		}
		var graph = this.getGraph();
		var root = graph.getDefaultParent(), data = [];
		if(root.getAttribute('databases') != null)
			data = Ext.decode(root.getAttribute('databases'));
		this.databaseStore.loadData(data);
		
		return this.databaseStore;
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