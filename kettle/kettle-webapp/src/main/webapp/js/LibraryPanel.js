LibraryPanel = Ext.extend(Ext.TabPanel, {
	activeTab: 0,
	plain: true,
	initComponent: function() {
		var tree = new Ext.tree.TreePanel({
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
	    
	    var reposity = new Ext.tree.TreePanel({
			title: '仓库',
			root: new Ext.tree.AsyncTreeNode({id:'root', text: 'root'}),
			loader: new Ext.tree.TreeLoader({
				dataUrl: GetUrl('system/resposity.do')
			}),
			enableDD: true,
			useArrows: true,
			autoScroll: true,
			ddGroup:'TreePanelDDGroup',
			animate: false,
			rootVisible: false
		});
	    
	    reposity.on('dblclick', function(node) {
	    	if(node.isLeaf() == true) {
	    		var path = node.getPath();
	    		app.getMainPanel().load(path.substring('/root/'.length));
	    	}
	    });
	    
	    tree.on("nodedragover", function(e){
	    	return false;
	    }); 
		
	    this.items = [reposity, tree];
		
		LibraryPanel.superclass.initComponent.call(this);
	}
});