GuidePanel = Ext.extend(Ext.TabPanel, {
	activeTab: 0,
	plain: true,
	initComponent: function() {
		var me = this;
		
		var transTree = new Ext.tree.TreePanel({
			title: '核心对象',
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
		
		this.activeCom = function(item) {
			if(item == null) {
				me.remove(transTree.getId(), false);
				me.remove(jobTree.getId(), false);
			} else if(item.getXType() == 'JobGraph') {
				me.add(jobTree);
				me.setActiveTab(jobTree.getId());
				me.remove(transTree.getId(), false);
			} else if(item.getXType() == 'TransGraph') {
				me.add(transTree);
				me.setActiveTab(transTree.getId());
				me.remove(jobTree.getId(), false);
			}
		};
		
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
	    
	    var menu = new Ext.menu.Menu({
			items: [{
				text: '打开', handler: function() {
					var sm = repository.getSelectionModel();
					var node = sm.getSelectedNode();
					if(node && node.isLeaf()) {
			    		var type = node.attributes.iconCls == 'job' ? 1 : 0;
			    		me.openFile(node.attributes.objectId, type);
					}
				}
			},'-',{
                text: '新建目录', handler: function() {
                	var sm = repository.getSelectionModel();
					var node = sm.getSelectedNode();
					if(node && !node.isLeaf()) {
						Ext.Msg.prompt('系统提示', '请输入目录名称:', function(btn, text){
						    if (btn == 'ok' && text != ''){
						    	Ext.Ajax.request({
									url: GetUrl('repository/createDir.do'),
									method: 'POST',
									params: {dir: node.attributes.objectId, name: text},
									success: function(response) {
										decodeResponse(response, function(resObj) {
											var child = new Ext.tree.TreeNode({
												id: "directory_" + resObj.message,
												objectId: resObj.message,
												text: text,
												children:[]
											});
											node.appendChild(child);
										});
									},
									failure: failureResponse
							   });
						    	
						    }
						});
					}
                }
            }, {
                iconCls: 'trans',
                text: '新建转换', handler: function() {
                	var sm = repository.getSelectionModel();
					var node = sm.getSelectedNode();
					if(node && !node.isLeaf()) {
						Ext.Msg.prompt('系统提示', '请输入转换名称:', function(btn, text){
						    if (btn == 'ok' && text != ''){
						    	Ext.Ajax.request({
									url: GetUrl('repository/createTrans.do'),
									method: 'POST',
									params: {dir: node.attributes.objectId, transName: text},
									success: function(response) {
										decodeResponse(response, function(resObj) {
											var child = new Ext.tree.TreeNode({
												id: "transaction_" + resObj.message,
												objectId: resObj.message,
												text: text,
												iconCls: 'trans',
												leaf: true
											});
											node.appendChild(child);
											
											me.openFile(resObj.message, 0);
										});
									},
									failure: failureResponse
							   });
						    	
						    }
						});
					}
                }
            }, {
                iconCls: 'job', text: '新建任务', handler: function() {
                	var sm = repository.getSelectionModel();
					var node = sm.getSelectedNode();
					if(node && !node.isLeaf()) {
						Ext.Msg.prompt('系统提示', '请输入任务名称:', function(btn, text){
						    if (btn == 'ok' && text != ''){
						    	Ext.Ajax.request({
									url: GetUrl('repository/createJob.do'),
									method: 'POST',
									params: {dir: node.attributes.objectId, jobName: text},
									success: function(response) {
										decodeResponse(response, function(resObj) {
											var child = new Ext.tree.TreeNode({
												id: "job_" + resObj.message,
												objectId: resObj.message,
												text: text,
												iconCls: 'job',
												leaf: true
											});
											node.appendChild(child);
											
											me.openFile(resObj.message, 1);
										});
									},
									failure: failureResponse
							   });
						    	
						    }
						});
					}
                }
            }, '-', {
            	text: '重命名'
            }, {
                iconCls: 'delete', text: '删除', handler: function() {
                	var sm = repository.getSelectionModel();
					var node = sm.getSelectedNode();
					if(node) {
						Ext.Msg.show({
							   title:'系统提示',
							   msg: '您确定要删除该对象吗？',
							   buttons: Ext.Msg.YESNO,
							   icon: Ext.MessageBox.WARNING,
							   fn: function(bId) {
								   if(bId == 'yes') {
									   var type = -1;
									   if(node.attributes.iconCls == 'job')
										   type = 1;
									   else if(node.attributes.iconCls == 'trans')
										   type = 0;
									   
									   Ext.Ajax.request({
											url: GetUrl('repository/drop.do'),
											method: 'POST',
											params: {id: node.attributes.objectId, type: type},
											success: function(response) {
												decodeResponse(response, function(resObj) {
													node.remove();
												});
											},
											failure: failureResponse
									   });
								   }
							   }
						});
						
						
					}
                }
            }]
		});
	    
	    repository.on('contextmenu', function(node, e) {
	    	menu.showAt(e.getXY());
	    	repository.getSelectionModel().select(node);
	    });
	    
	    repository.on('dblclick', function(node) {
	    	if(node.isLeaf() == true) {
	    		var type = node.attributes.iconCls == 'job' ? 1 : 0;
	    		me.openFile(node.attributes.objectId, type);
	    	}
	    });
	    
	    repository.on('afterlayout', function() {
	    	if(repository.getEl().getHeight() <50) return;	//确保高度已经计算完毕
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
				} finally {
					Ext.getBody().unmask();
				}
			},
			failure: failureResponse
		});
	}
});