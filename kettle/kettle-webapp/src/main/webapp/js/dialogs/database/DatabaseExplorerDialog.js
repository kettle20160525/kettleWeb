DatabaseExplorerDialog = Ext.extend(Ext.Window, {
	title: '数据库浏览',
	width: 400,
	height: 550,
	closeAction: 'close',
	modal: true,
	layout: 'fit',
	initComponent: function() {
		var me = this;
		
		var tree = new Ext.tree.TreePanel({
			useArrows: true,
			border: false,
			root: new Ext.tree.TreeNode({text: 'root'}),
			autoScroll: true,
			animate: false,
			rootVisible: false
		});
		
		this.initDatabase = function(databaseInfo, objType) {
			objType = objType ? objType :  "all";
			var root = new Ext.tree.AsyncTreeNode({
	    		id:'root', 
	    		text: 'root',
				loader: new Ext.tree.TreeLoader({
					dataUrl: GetUrl('database/explorer.do'),
					baseParams: {databaseInfo: Ext.encode(databaseInfo), objType: objType},
					timeout: 60000,
					listeners: {
						beforeload: function(l) {
							var el = tree.getEl();
							el.mask('正在加载中...', 'x-mask-loading');
						},
						load: function(l, n) {
							n.firstChild.expand();
							tree.getEl().unmask();
						}
					}
				})
	    	});
			tree.setRootNode(root);
		};
		
		var bCancel = new Ext.Button({
			text: '取消', scope: this, handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', scope: this, handler: function() {
				var node = tree.getSelectionModel().getSelectedNode();
				if(!node) {
					alert('请选择节点！');
					return;
				}
				if(!node.isLeaf()) {
					alert('请选择有效节点！');
					return;
				}
				
				me.fireEvent('select', node);
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		this.items = tree;
		
		DatabaseExplorerDialog.superclass.initComponent.call(this);
		this.addEvents('select');
	}
});