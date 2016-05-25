TransGraph = Ext.extend(Ext.Panel, {
	layout: 'border',
	iconCls: 'trans',
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
						url: GetUrl('trans/save.do'),
						params: {graphXml: mxUtils.getPrettyXml(node)},
						method: 'POST',
						success: function(response) {
							
						}
					});
				}
			},'-',{
				iconCls: 'run', handler: me.run
			},{
				iconCls: 'pause', handler: function() { }
			},{
				iconCls: 'stop'
			},{
				iconCls: 'preview'
			},{
				iconCls: 'debug'
			},{
				iconCls: 'replay'
			},'-',{
				iconCls: 'check', scope: this, handler: this.check
			},{
				iconCls: 'impact'
			},{
				iconCls: 'SQLbutton'
			},{
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
		
		TransGraph.superclass.initComponent.call(this);
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

			if(!isNaN(child.getAttribute('copies'))) {
				me.showCopies(graph, child);
			}
			if(child.getAttribute('cluster_schema')) {
				me.showCluster(graph, child);
			}
			
			if(child.value && child.value.nodeName && 'Note' == child.value.nodeName) {
				child.setConnectable(false);
			}
			
			loadPluginScript(child.getAttribute('ctype'));
			
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
						url: GetUrl('trans/engineXml.do'),
						params: {graphXml: mxUtils.getPrettyXml(node)},
						method: 'POST',
						success: function(response) {
							var debugWin = new DebugWin({fcontent: response.responseText});
							debugWin.show();
						}
					});
				}, null, null, true);
				menu.addSeparator(null);
				menu.addItem('转换设置', null, function() {
					var transDialog = new TransDialog();
					transDialog.show();
				}, null, null, true);
			} else {
				menu.addItem('编辑步骤', null, function(){
					var dialog = Ext.create({}, cell.getAttribute('ctype'));
					dialog.show();
				}, null, null, true);
				menu.addItem('编辑步骤描述', null, function(){alert(1);}, null, null, true);
				menu.addSeparator(null);
				menu.addItem('数据发送......', null, function(){alert(1);}, null, null, true);
				menu.addItem('改变开始复制的数量...', null, function(){
					var dialog = new TextFieldDialog({
						title: '步骤复制的数量...',
						fieldLabel: '复制的数量（1或更多）：',
						value: cell.getAttribute('copies'),
						listeners: {
							sure: function(num) {
								graph.getModel().beginUpdate();
								try {
									var edit = new mxCellAttributeChange(cell, 'copies', num);
									graph.getModel().execute(edit);
									me.showCopies(graph, cell);
								} finally {
									graph.getModel().endUpdate();
								}
							}
						}
					});
					dialog.show();
				}, null, null, true);
				menu.addSeparator(null);
				menu.addItem('复制到剪贴板', null, function(){alert(1);}, null, null, true);
				menu.addItem('复制步骤', null, function(){alert(1);}, null, null, true);
				menu.addItem('删除步骤', null, function(){alert(1);}, null, null, true);
				menu.addItem('隐藏步骤', null, function(){alert(1);}, null, null, true);
				menu.addItem('分离步骤', null, function(){alert(1);}, null, null, true);
				menu.addSeparator(null);
				menu.addItem('显示输入字段', null, function(){
					var stepFieldsDialog = new StepFieldsDialog({before: true});
					stepFieldsDialog.show();
				}, null, null, true);
				menu.addItem('显示输出字段', null, function(){
					var stepFieldsDialog = new StepFieldsDialog({before: false});
					stepFieldsDialog.show();
				}, null, null, true);
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
         		
         		var doc = mxUtils.createXmlDocument();
         		var node = doc.createElement('Step');
         		node.setAttribute('label', data.node.text);
         		node.setAttribute('ctype', data.node.id);
         		
         		graph.getModel().beginUpdate();
				try
				{
					graph.insertVertex(graph.getDefaultParent(), null, node, left, top, 40, 40, "icon;image=" + data.node.attributes.dragIcon);
				} finally
				{
					graph.getModel().endUpdate();
				}
         		
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
	
	check: function() {
		var checkResultDialog = new CheckResultDialog();
		checkResultDialog.show();
	},
	
	run: function() {
		var dialog = new TransExecutionConfigurationDialog();
		dialog.show();
	},
	
	showCopies: function(graph, cell) {
		var overlays = graph.getCellOverlays(cell) || [];
		for(var i=0; i<overlays.length; i++) {
			var overlay = overlays[i];
			
			if(overlay.align == mxConstants.ALIGN_LEFT && overlay.verticalAlign == mxConstants.ALIGN_TOP) {
				graph.removeCellOverlay(cell, overlay);
			}
		}
		var copies = parseInt(cell.getAttribute('copies'));
		if(copies > 1) {
			Ext.Ajax.request({
				url: 'system/text2image/width.do?text=X' + cell.getAttribute('copies'),
				method: 'GET',
				success: function(response) {
					var w = parseInt(response.responseText);
					
					var offset = new mxPoint(0, -10);
					var overlay = new mxCellOverlay(new mxImage('system/text2image.do?text=X' + cell.getAttribute('copies'), w, 12), 'update: ', mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, offset);
					graph.addCellOverlay(cell, overlay);
				}
			});
		}
	},
	
	showCluster: function(graph, cell) {
		var overlays = graph.getCellOverlays(cell) || [];
		for(var i=0; i<overlays.length; i++) {
			var overlay = overlays[i];
			
			if(overlay.align == mxConstants.ALIGN_RIGHT && overlay.verticalAlign == mxConstants.ALIGN_TOP) {
				graph.removeCellOverlay(cell, overlay);
			}
		}
		var cluster_schema = cell.getAttribute('cluster_schema');
		if(cluster_schema) {
			Ext.Ajax.request({
				url: 'system/text2image/width.do?text=' + cluster_schema,
				method: 'GET',
				success: function(response) {
					var w = parseInt(response.responseText);
					
					var offset = new mxPoint(0, -10);
					var overlay = new mxCellOverlay(new mxImage('system/text2image.do?text=X' + cluster_schema, w, 12), 'update: ', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, offset);
					graph.addCellOverlay(cell, overlay);
				}
			});
		}
	},
	
	updateStatus: function(status) {
		var graph = this.graph;
		
		for(var i=0; i<status.length; i++) {
			var cells = graph.getModel().getChildCells(graph.getDefaultParent(), true, false);
			for(var j=0; j<cells.length; j++) {
				var cell = cells[j];
				if(cell.getAttribute('label') == status[i].stepName) {
					var overlays = graph.getCellOverlays(cell) || [];
					for(var k=0; k<overlays.length; k++) {
						var overlay = overlays[k];
						
						if(overlay.align == mxConstants.ALIGN_RIGHT && overlay.verticalAlign == mxConstants.ALIGN_TOP
								&& overlay.offset.x == 0 && overlay.offset.y == 0) {
							graph.removeCellOverlay(cell, overlay);
						}
					}
					
					if(status[i].stepStatus > 0) {
						var overlay = new mxCellOverlay(new mxImage('ui/images/false.png', 16, 16), status[i].logText, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP);
						graph.addCellOverlay(cell, overlay);
					} else {
						var overlay = new mxCellOverlay(new mxImage('ui/images/true.png', 16, 16), null, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP);
						graph.addCellOverlay(cell, overlay);
					}
					break;
				}
			}
		}
	}
});

Ext.reg('TransGraph', TransGraph);
