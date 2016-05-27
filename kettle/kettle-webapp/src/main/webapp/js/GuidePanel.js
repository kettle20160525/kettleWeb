GuidePanel = Ext.extend(Ext.TabPanel, {
	activeTab: 0,
	plain: true,
	initComponent: function() {
		var me = this;
		
		var transTree = new Ext.tree.TreePanel({
			title: '核心对象',
			cls: 'core-tree',
			useArrows: true,
			root: new Ext.tree.AsyncTreeNode({text: 'root'}),
			loader: new Ext.tree.TreeLoader({
				dataUrl: GetUrl('system/steps.do')
			}),
			enableDD:true,
			ddGroup:'TreePanelDDGroup',
			autoScroll: true,
			animate: false,
			rootVisible: false
		});
		
		var jobTree = new Ext.tree.TreePanel({
			title: '核心对象',
			cls: 'core-tree',
			useArrows: true,
			root: new Ext.tree.AsyncTreeNode({text: 'root'}),
			loader: new Ext.tree.TreeLoader({
				dataUrl: GetUrl('system/jobentrys.do')
			}),
			enableDD:true,
			ddGroup:'TreePanelDDGroup',
			autoScroll: true,
			animate: false,
			rootVisible: false
		});
		
		this.activeCom = function(type) {
			if(type == 'job') {
				me.add(jobTree);
				me.setActiveTab(jobTree.getId());
				me.remove(transTree.getId(), false);
			} else if(type == 'trans') {
				me.add(transTree);
				me.setActiveTab(transTree.getId());
				me.remove(jobTree.getId(), false);
			}
		};
		
		var menu = new Ext.menu.Menu({
			items: [{
				text: '打开'
			},'-',{
                text: '新建目录'
            }, {
                iconCls: 'trans_tree',
                text: '新建转换'
            }, {
                iconCls: 'job_tree',
                text: '新建任务'
            }, '-', {
            	text: '重命名'
            }, {
                iconCls: 'delete',
                text: '删除'
            }]
		});
	    
	    var repository = new Ext.tree.TreePanel({
			title: '仓库',
			root: new Ext.tree.TreeNode({id: 'place'}),
			tbar: [{
				text: '连接资源库', handler: function() {
					var dialog = new RepositoriesDialog();
					dialog.on('loginSuccess', function() {
						dialog.close();
						repository.getRootNode().removeAll(true);
						repository.getRootNode().reload();
					});
					dialog.show();
				}
			}, {
				text: '断开资源库', handler: function() {
					Ext.Ajax.request({
						url: GetUrl('repository/logout.do'),
						method: 'POST',
						success: function(response) {
							var reply = Ext.decode(response.responseText);
							if(reply.success) {
								repository.getRootNode().removeAll(true);
								repository.getRootNode().reload();
							}
						}
					});
				}
			}],
			enableDD: true,
			useArrows: true,
			autoScroll: true,
			ddGroup:'TreePanelDDGroup',
			animate: false,
			rootVisible: false
		});
	    
	    repository.on('contextmenu', function(node, e) {
	    	menu.showAt(e.getXY());
	    });
	    
	    repository.on('dblclick', function(node) {
	    	if(node.isLeaf() == true) {
	    		var type = node.attributes.iconCls == 'job_tree' ? 1 : 0;
	    		me.openFile(node.attributes.objectId, type);
	    	}
	    });
	    
	    var count = 0;
	    repository.on('afterlayout', function() {
	    	count++;
	    	if(count < 3) return;
	    	if(repository.getRootNode().id == 'root') return;
	    	
	    	var root = new Ext.tree.AsyncTreeNode({
	    		id:'root', 
	    		text: 'root',
				loader: new Ext.tree.TreeLoader({
					dataUrl: GetUrl('repository/explorer.do'),
					listeners: {
						beforeload: function(l) {
							var el = repository.getEl();
							el.mask('资源库信息加载中...', 'x-mask-loading');
						},
						load: function(l, n) {
							n.firstChild.expand();
							repository.getEl().unmask();
						}
					}
				})
	    	});
	    	repository.setRootNode(root);
	    });
	    
	    jobTree.on("nodedragover", function(e){
	    	return false;
	    }); 
	    
	    transTree.on("nodedragover", function(e){
	    	return false;
	    }); 
		
	    this.items = [repository];
		
	    GuidePanel.superclass.initComponent.call(this);
	},
	
	openFile: function(objectId, type) {
		Ext.getBody().mask('正在加载，请稍后...');
		
		Ext.Ajax.request({
			url: GetUrl('repository/open.do'),
			params: {objectId: objectId, type: type},
			method: 'POST',
			success: function(response, opts) {
				try {
					var resObj = Ext.decode(response.responseText);
					var graphPanel = Ext.create({xtype: resObj.GraphType});
					var tabPanel = Ext.getCmp('TabPanel');
					tabPanel.add(graphPanel);
					tabPanel.setActiveTab(graphPanel.getId());
					
					var xmlDocument = mxUtils.parseXml(decodeURIComponent(resObj.graphXml));
					var decoder = new mxCodec(xmlDocument);
					var node = xmlDocument.documentElement;
					
					var graph = graphPanel.getGraph();
					decoder.decode(node, graph.getModel());
					
					var cell = graph.getDefaultParent();
					graphPanel.setTitle(cell.getAttribute('name'));
					Ext.getBody().unmask();
				} catch(e) {
					Ext.getBody().unmask();
				}
			},
			failure: failureResponse
		});
	}
});