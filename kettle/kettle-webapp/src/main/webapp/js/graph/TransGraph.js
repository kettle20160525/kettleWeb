TransGraph = Ext.extend(BaseGraph, {
	iconCls: 'trans',
	
	initComponent: function() {
		this.tbar = [{
			iconCls: 'save', scope: this, handler: function() {
				Ext.Ajax.request({
					url: GetUrl('trans/save.do'),
					params: {graphXml: this.graphXml()},
					method: 'POST',
					success: function(response) {
						decodeResponse(response, function(resObj) {
							Ext.Msg.alert('系统提示', resObj.message);
						});
					},
					failure: failureResponse
				});
			}
		},'-',{
			iconCls: 'run', handler: function() {
				var dialog = new TransExecutionConfigurationDialog();
				dialog.show(null, function() {
					dialog.initData();
				});
			}
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
			iconCls: 'check', handler: function() {
				var checkResultDialog = new CheckResultDialog();
				checkResultDialog.show();
			} 
		},{
			iconCls: 'impact'
		},{
			iconCls: 'SQLbutton'
		},{
			iconCls: 'exploredb'
		},'-',{
			iconCls: 'SlaveServer', scope: this, handler: this.showSlaves
		},{
			iconCls: 'ClusterSchema', scope: this, handler: function() {
				var dialog = new ClusterSchemaDialog();
				dialog.show();
			}
		},'-',{
			iconCls: 'show-results', scope: this, handler: function() {this.showResultPanel();}
		}];
		
		this.resultPanel = new TransResult();
		TransGraph.superclass.initComponent.call(this);
	},
	
	initContextMenu: function(menu, cell, evt) {
		var graph = this.getGraph(), me = this;
		if(cell == null) {
			menu.addItem('新建注释', null, function(){alert(1);}, null, null, true);
			menu.addItem('从剪贴板粘贴步骤', null, function(){alert(1);}, null, null, true);
			menu.addSeparator(null);
			menu.addItem('全选', null, function(){me.getGraph().selectVertices();}, null, null, true);
			menu.addItem('清除选择', null, function(){me.getGraph().clearSelection();}, null, null, true);
			menu.addSeparator(null);
			menu.addItem('查看图形文件', null, function(){
				var dialog = new TextAreaDialog();
				dialog.show(null, function() {
					dialog.initData(me.toXml());
				});
			}, null, null, true);
			menu.addItem('查看引擎文件', null, function(){
				Ext.Ajax.request({
					url: GetUrl('trans/engineXml.do'),
					params: {graphXml: me.toXml()},
					method: 'POST',
					success: function(response) {
						var dialog = new TextAreaDialog();
						dialog.show(null, function() {
							dialog.initData(response.responseText);
						});
					}
				});
			}, null, null, true);
			menu.addSeparator(null);
			menu.addItem('转换设置', null, function() {
				var transDialog = new TransDialog();
				transDialog.show();
			}, null, null, true);
		} else {
			menu.addItem('编辑步骤', null, function() {me.editCell(cell);}, null, null, true);
			menu.addItem('编辑步骤描述', null, function(){alert(1);}, null, null, true);
			menu.addSeparator(null);
			menu.addItem('数据发送......', null, function(){alert(1);}, null, null, true);
			menu.addItem('改变开始复制的数量...', null, function(){
				Ext.MessageBox.prompt('步骤复制的数量...', '复制的数量（1或更多）：', function(btn, text) {
					if(btn == 'ok' && text != '') {
						var num = parseInt(text);
						if(num > 0) {
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
			}, null, null, true);
			menu.addSeparator(null);
			menu.addItem('复制到剪贴板', null, function(){mxClipboard.cut(graph);}, null, null, true);
			menu.addItem('复制步骤', null, function(){mxClipboard.copy(graph);mxClipboard.paste(graph);}, null, null, true);
			menu.addItem('删除步骤', null, function(){graph.removeCells();}, null, null, true);
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
	},
	
	onClusterSchemaMerge: function(json) {
		var graph = this.getGraph();
		var root = graph.getDefaultParent();
		var clusterSchemas = root.getAttribute('clusterSchemas');
		var jsonArray = Ext.decode(clusterSchemas);
		
		if(jsonArray.length == 0) {
			jsonArray.push(json);
		} else {
			Ext.each(jsonArray, function(item, index) {
				if(item.name == json.name) {
					jsonArray.splice(index, 1, json);
				} else {
					if(index == jsonArray.length - 1)
						jsonArray.push(json);
				}
			});
		}
		
		graph.getModel().beginUpdate();
        try
        {
			var edit = new mxCellAttributeChange(root, 'clusterSchemas', Ext.encode(jsonArray));
        	graph.getModel().execute(edit);
        } finally
        {
            graph.getModel().endUpdate();
        }
	},
	
	onClusterSchemaDel: function(name) {
		var graph = this.getGraph();
		var root = graph.getDefaultParent();
		var clusterSchemas = root.getAttribute('clusterSchemas');
		var jsonArray = Ext.decode(clusterSchemas);
		
		Ext.each(jsonArray, function(item, index) {
			if(item.name == name) {
				jsonArray.splice(index, 1);
				return false;
			}
		});
		
		graph.getModel().beginUpdate();
        try
        {
			var edit = new mxCellAttributeChange(root, 'clusterSchemas', Ext.encode(jsonArray));
        	graph.getModel().execute(edit);
        } finally
        {
            graph.getModel().endUpdate();
        }
	},
	
	getClusterSchemaStore: function() {
		if(!this.clusterSchemaStore) {
			this.clusterSchemaStore = new Ext.data.JsonStore({
				idProperty: 'name',
				fields: ['name', '', 'base_port', 'sockets_buffer_size', 'sockets_flush_interval', 'sockets_compressed', 'dynamic', 'slaveservers']
			});
		}
		var graph = this.getGraph();
		var cell = graph.getDefaultParent(), data = [];
		if(cell.getAttribute('clusterSchemas') != null)
			data = Ext.decode(cell.getAttribute('clusterSchemas'));
		this.clusterSchemaStore.loadData(data);
		
		return this.clusterSchemaStore;
	},
	
	cellAdded: function(graph, child) {
		if(!isNaN(child.getAttribute('copies'))) {
			this.showCopies(graph, child);
		}
		if(child.getAttribute('cluster_schema')) {
			this.showCluster(graph, child);
		}		
	},
	
	newStep: function(graphXml, node, x, y) {
		var graph = this.getGraph();
		Ext.Ajax.request({
			url: GetUrl('trans/newStep.do'),
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
				graph.container.focus();
			}
		});
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
	
	getResultPanel: function() {
		if(!this.resultview)
			this.resultview = new ResultPanel();
		return this.resultview;
	},
	
	inputOutputFields: function(stepName, before, cb) {
		var graph = this.getGraph();
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'length', 'precision', 'origin', 'storageType', 'conversionMask', 'currencySymbol', 'decimalSymbol', 'groupingSymbol', 'trimType', 'comments'],
			proxy: new Ext.data.HttpProxy({
				url: GetUrl('trans/inputOutputFields.do'),
				method: 'POST'
			})
		});
		
		store.on('loadexception', function(misc, s, response) {
			failureResponse(response);
		});
		
		store.on('load', function() {
			if(Ext.isFunction(cb))
				cb(store);
		});
		
		store.baseParams.stepName = encodeURIComponent(stepName);
		store.baseParams.graphXml = this.toXml();
		store.baseParams.before = before;
		store.load();
		
		return store;
	},
	
	nextSteps: function(stepName, cb) {
		var graph = this.getGraph();
		var store = new Ext.data.JsonStore({
			fields: ['name'],
			proxy: new Ext.data.HttpProxy({
				url: GetUrl('trans/nextSteps.do'),
				method: 'POST'
			})
		});
		
		store.on('loadexception', function(misc, s, response) {
			failureResponse(response);
		});
		
		store.on('load', function() {
			if(Ext.isFunction(cb))
				cb(store);
		});
		
		store.baseParams.stepName = encodeURIComponent(stepName);
		store.baseParams.graphXml = this.toXml();
		store.load();
		
		return store;
	},
	
	updateStatus: function(status) {
		var graph = this.getGraph();
		
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