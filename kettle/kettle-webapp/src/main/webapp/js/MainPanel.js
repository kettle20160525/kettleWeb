var activeGraph = null;

function getActiveTransGraph() {
	return activeGraph;
}

MainPanel = Ext.extend(Ext.TabPanel, {
	plain: true,
	initComponent: function() {
		MainPanel.superclass.initComponent.call(this);
		this.on('tabchange', function(me, item) {
			activeGraph = item.findByType('TransGraph')[0];
		});
	},
	
	load: function(fname) {
		var cp = new ContentPanel(), me = this;
		this.add(cp);
		cp.load(fname, function() {
			me.setActiveTab(cp.getId());
		});
	}
	
});

ContentPanel = Ext.extend(Ext.Panel, {
	layout: 'border',
	defaults: {border: false},
	title: '正在加载...',
	initComponent: function() {
		var me = this;
		var resultPanel = new ResultPanel({
			region: 'south',
			hidden: true,
			height: 250
		});
		
		var transGraph = this.transGraph = new TransGraph({
			region: 'center'
		});
		
		transGraph.on('run', function(executionId) {
			if(resultPanel.isVisible() == false) {
				resultPanel.show();
				me.doLayout();
			}
			
			resultPanel.loadResult(executionId);
			
		});
		
		this.items = [transGraph, resultPanel];
		
		this.tbar = [{
			iconCls: 'run', scope: this, handler: transGraph.run
		},{
			iconCls: 'pause', handler: function() {
				
			}
		},{
			iconCls: 'stop'
		},{
			iconCls: 'preview'
		},{
			iconCls: 'debug'
		},{
			iconCls: 'replay'
		},'-',{
			iconCls: 'check', scope: this, handler: this.checkTrans
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
		}];
		
		ContentPanel.superclass.initComponent.call(this);
	},
	
	load: function(fname, cb) {
		var transGraph = this.transGraph;
		Ext.Ajax.request({
			url: GetUrl('graph/load.do'),
			params: {filename: fname},
			method: 'POST',
			success: function(response) {
				transGraph.openXml(response.responseText, cb);
			}
		});
	}
});


var cellLabelChanged = mxGraph.prototype.cellLabelChanged;
mxGraph.prototype.cellLabelChanged = function(cell, value, autoSize)
{
	var tmp = cell.value.cloneNode(true);
	tmp.setAttribute('label', value);
	value = tmp;
	
	cellLabelChanged.apply(this, arguments);
};
var convertValueToString = mxGraph.prototype.convertValueToString;
mxGraph.prototype.convertValueToString = function(cell)
{
	var label = cell.getAttribute('label');
	if(label)
		return decodeURIComponent(label);
	return label;
};
mxPopupMenu.prototype.zIndex = 100000;

function NoteShape()
{
	mxCylinder.call(this);
};
mxUtils.extend(NoteShape, mxCylinder);
NoteShape.prototype.size = 10;
NoteShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
	var s = Math.min(w, Math.min(h, mxUtils.getValue(this.style, 'size', this.size)));

	if (isForeground)
	{
		path.moveTo(w - s, 0);
		path.lineTo(w - s, s);
		path.lineTo(w, s);
		path.end();
	}
	else
	{
		path.moveTo(0, 0);
		path.lineTo(w - s, 0);
		path.lineTo(w, s);
		path.lineTo(w, h);
		path.lineTo(0, h);
		path.lineTo(0, 0);
		path.close();
		path.end();
	}
};

mxCellRenderer.prototype.defaultShapes['note'] = NoteShape;

NoteShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
                                   new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                                   new mxConnectionConstraint(new mxPoint(0.75, 0), true),
 	              		 new mxConnectionConstraint(new mxPoint(0, 0.25), true),
 	              		 new mxConnectionConstraint(new mxPoint(0, 0.5), true),
 	              		 new mxConnectionConstraint(new mxPoint(0, 0.75), true),
 	            		 new mxConnectionConstraint(new mxPoint(1, 0.25), true),
 	            		 new mxConnectionConstraint(new mxPoint(1, 0.5), true),
 	            		 new mxConnectionConstraint(new mxPoint(1, 0.75), true),
 	            		 new mxConnectionConstraint(new mxPoint(0.25, 1), true),
 	            		 new mxConnectionConstraint(new mxPoint(0.5, 1), true),
 	            		 new mxConnectionConstraint(new mxPoint(0.75, 1), true)];
