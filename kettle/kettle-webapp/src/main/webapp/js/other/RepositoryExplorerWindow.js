RepositoryExplorerWindow = Ext.extend(Ext.Window, {
	width: 400,
	height: 500,
	layout: 'border',
	modal: true,
	title: '资源库浏览',
	includeElement: true,
	type: 'transformation',	//job
	
	initComponent: function() {
		var loader = new Ext.tree.TreeLoader({
			dataUrl: GetUrl('repository/explorer.do'),
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
			if(!Ext.isEmpty(textfield.getValue())) {
				var path = textfield.getValue();
				var directory = path.substring(0, path.lastIndexOf('/') + 1);
				var name = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
				this.fireEvent('ok', directory, name);
			}
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
			l.baseParams.includeElement = this.includeElement;
			l.baseParams.type = this.type;
		}, this);
		
		RepositoryExplorerWindow.superclass.initComponent.call(this);
		this.addEvents('ok');
		
		tree.on('click', function(node) {
			if(node && node != tree.getRootNode())
				textfield.setValue(node.attributes.objectId);
		});
	}
});