FileExplorerWindow = Ext.extend(Ext.Window, {
	width: 400,
	height: 500,
	layout: 'border',
	modal: true,
	title: '文件浏览器',
	initComponent: function() {
		var loader = new Ext.tree.TreeLoader({
			dataUrl: GetUrl('system/fileexplorer.do')
		});
		var tree = new Ext.tree.TreePanel({
			region: 'center',
			useArrows: true,
			root: new Ext.tree.AsyncTreeNode({text: 'root'}),
			loader: loader,
			autoScroll: true,
			animate: false,
			rootVisible: false
		});
		
		var textfield = new Ext.form.TextField({
			flex: 1
		});
		
		var ok = function() {
			if(!Ext.isEmpty(textfield.getValue()))
				this.fireEvent('ok', textfield.getValue());
		};
		
		this.items = [tree, {
			region: 'south',
			height: 30,
			layout: 'hbox',
			bodyStyle: 'padding: 3px',
			items: [textfield, {
				width: 5, border: false
			},{
				xtype: 'button', text: '确定', scope: this, handler: ok
			}]
		}];
		
		loader.on('beforeload', function(l, node) {
			if(node == tree.getRootNode())
				loader.baseParams.path = '';
			else
				loader.baseParams.path = node.id;
		});
		
		FileExplorerWindow.superclass.initComponent.call(this);
		this.addEvents('ok');
		
		tree.on('click', function(node) {
			if(node && node != tree.getRootNode())
				textfield.setValue(node.id);
		});
	}
});