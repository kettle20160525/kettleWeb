KettleForm = Ext.extend(Ext.form.FormPanel, {
	labeWidth: 100,
	labelAlign: 'right',
	defaultType: 'textfield',
	bodyStyle: 'padding: 10px 0px'
});
Ext.reg('KettleForm', KettleForm);

KettleDialog = Ext.extend(Ext.Window, {
	modal: true,
	layout: 'border',
	closeAction: 'close',
	defaults: {border: false},
	enterEnable: true,
	
	initComponent: function() {
		var wLabel = this.wLabel = new Ext.form.TextField({ fieldLabel: '步骤名称', anchor: '-20'});
		
		this.items = [{
			xtype: 'KettleForm',
			region: 'north',
			height: 35,
			labelWidth: 100,
			items: [wLabel]
		}, {
			region: 'center',
			bodyStyle: 'padding: 5px',
			layout: 'fit',
			items: this.fitItems
		}];
		
		this.bbar = new Ext.Toolbar(['->', {
			text: '取消', scope: this, handler: function() {
				this.close();
			}
		}, {
			text: '确定', scope: this,handler: function() {
				if(this.checkData()) {
		    		this.onSure();
			    	this.close();
		    	}
			}
		}]);
		this.initBottomBar(this.bbar);
		
		//if(this.showPreview)
		//	 this.bbar.push({text: '预览', scope: this, handler: this.preview});
		
		KettleDialog.superclass.initComponent.call(this);
		
		this.addEvents('beforesave', 'save');
	},
	
	afterRender: function() {
		KettleDialog.superclass.afterRender.call(this);
		
		if(this.enterEnable) {
			new Ext.KeyMap(this.el, {
			    key: 13,
			    fn: function() {
			    	if(this.checkData()) {
			    		this.onSure();
				    	this.close();
			    	}
			    },
			    scope: this
			});
		}
		
		this.initData();
	},
	
	initBottomBar: Ext.emptyFn,
	
	getInitData: function() {
		return this.value ? this.value : getActiveGraph().getGraph().getSelectionCell();
	},
	
	initData: function() {
		var cell = this.getInitData();
		if(cell) {
			this.wLabel.setValue(cell.getAttribute('label'));
		}
	},
	
	checkData: function() {
		if(Ext.isEmpty(this.wLabel.getValue())) {
			alert('步骤名称不能为空！');
			return false;
		}
		return true;
	},
	
	getData: function() {
		return Ext.apply({label: this.wLabel.getValue()}, this.saveData());
	},
	
	saveData: function() {
		return Ext.apply({}, this.getValues());
	},
	
	preview: function() {
		Ext.getBody().mask('正在生成预览数据，请稍后...');
		var graph = getActiveGraph().getGraph(), cell = graph.getSelectionCell(), me = this;
		Ext.Ajax.request({
			url: GetUrl('trans/previewData.do'),
			params: {graphXml: getActiveGraph().toXml(), stepName: cell.getAttribute('label'), rowLimit: 100},
			method: 'POST',
			success: function(response) {
				try {
					var records = Ext.decode(response.responseText);
					
					var previewGrid = new DynamicEditorGrid({
						rowNumberer: true
					});
					
					var win = new Ext.Window({
						title: '预览数据',
						width: records.width,
						height: 500,
						layout: 'fit',
						items: previewGrid
					});
					win.show();
					
					previewGrid.loadMetaAndValue(records);
				} finally {
					Ext.getBody().unmask();
				}
			},
			failure: failureResponse
		});
	},
	
	getStepname: function() {
		return this.wLabel.getValue();
	},
	
	onSure: function() {
		var data = this.getData();
		if(this.fireEvent('beforesave', this, data) !== false) {
			
			var graph = getActiveGraph().getGraph();
			graph.getModel().beginUpdate();
	        try
	        {
	        	
	        	for(var name in data) {
					var edit = new mxCellAttributeChange(cell, name, data[name]);
	            	graph.getModel().execute(edit);
				}
	        } finally
	        {
	            graph.getModel().endUpdate();
	        }
	        
	        this.fireEvent('save', this, data)
		}
	},
	
	/**
	 * 该方法已过时，使用saveData取代
	 * 
	 * */
	getValues: function() {
		return {};
	}
	
});

KettleTabDialog = Ext.extend(KettleDialog, {
	initComponent: function() {
		
		this.fitItems = new Ext.TabPanel({
			region: 'center',
			activeTab: 0,
			items: this.tabItems
		});
		
		KettleTabDialog.superclass.initComponent.call(this);
	}
});

KettleEditor = Ext.extend(Ext.Panel, {
	// private
	afterRender : function(){
		KettleEditor.superclass.afterRender.call(this);				
		var textArea = Ext.DomHelper.append(this.body, {tag: 'TEXTAREA'});
		var editor = this.editor = CodeMirror.fromTextArea(textArea, {
			mode: "javascript",
			lineNumbers: false,
			lineWrapping: true
		});
		
		if(!Ext.isEmpty(this.value))
			editor.setValue(this.value);
		
		new Ext.dd.DropTarget(this.body,
        {
       		ddGroup: 'JsWriteGroup',  
            notifyDrop: function(ddSource, e, data) {  
            	var text = data.node.text;
            	
            	editor.replaceSelection(text, null, "paste");
         		return true;
            }
        });
	},
	
	getValue: function() {
		return this.editor.getValue();
	},
	
	setValue: function(v) {
		this.editor.setValue(v);
	}
});

Ext.reg('KettleEditor', KettleEditor);

KettleEditorGrid = Ext.extend(Ext.grid.EditorGridPanel, {
	
	initComponent: function() {
		
		var menu = new Ext.menu.Menu({
			items: [{
				text: '插入', scope: this, handler: this.insert
			}, {
				text: '当前行前面插入', scope: this, handler: this.insertBefore
			}, {
				text: '当前行后面插入', scope: this, handler: this.insertAfter
			}, '-', {
				text: '上移', scope: this, handler: this.rowUp
			}, {
				text: '下移', scope: this, handler: this.rowDown
			}, '-', {
				text: '删除选中的行', scope: this, handler: this.deleteRow
			}, {
				text: '删除全部', scope: this, handler: this.deleteAll
			}]
		});
		this.menuAdd(menu);
		
		this.on('contextmenu', function(e) {
			menu.showAt(e.getXY());
			e.preventDefault();
		});
		
		this.on('cellmousedown', function(grid, row, col, e) {
			grid.getSelectionModel().select(row, col);
		});
		
		KettleEditorGrid.superclass.initComponent.call(this);
	},
	
	menuAdd: Ext.emptyFn,
	
	insert: function() {
		var store = this.getStore();
		
		this.stopEditing();
        store.insert(0, new store.recordType(this.getDefaultValue()));
        this.startEditing(0, 1);	// 0 is rowindex
	},
	
	insertBefore: function() {
		var sm = this.getSelectionModel();
		if(sm.hasSelection()) {
			var cell = sm.getSelectedCell();
			var store = this.getStore();
			
			this.stopEditing();
            store.insert(cell[0], new store.recordType(this.getDefaultValue()));
            this.startEditing(cell[0], 1);	// 0 is rowindex
		}
	},
	
	insertAfter: function() {
		var sm = this.getSelectionModel();
		if(sm.hasSelection()) {
			var cell = sm.getSelectedCell();
			var store = this.getStore();
			
			this.stopEditing();
            store.insert(cell[0] + 1, new store.recordType(this.getDefaultValue()));
            this.startEditing(cell[0] + 1, 1);	// 0 is rowindex
		}
	},
	
	deleteRow: function() {
		var sm = this.getSelectionModel();
		if(sm.hasSelection()) {
			var cell = sm.getSelectedCell();
			var store = this.getStore();
			store.removeAt(cell[0]);
			
			if(store.getCount() > cell[0])
				sm.select(cell[0], cell[1]);
		}
	},
	
	rowUp: function() {
		var sm = this.getSelectionModel();
		if(sm.hasSelection()) {
			var row = sm.getSelectedCell()[0];
			var store = this.getStore();
			
			if(row > 0) {
				var rec = store.getAt(row);
				store.removeAt(row);
				store.insert(row-1, rec);
			}
		}
	},
	
	rowDown: function() {
		var sm = this.getSelectionModel();
		if(sm.hasSelection()) {
			var row = sm.getSelectedCell()[0];
			var store = this.getStore();
			
			if((row + 1) < store.getCount()) {
				var rec = store.getAt(row);
				store.removeAt(row);
				store.insert(row+1, rec);
			}
		}
	},
	
	deleteAll: function() {
		var store = this.getStore();
		store.removeAll();
	},
	
	getDefaultValue: function() {
		return {};
	},
	
	// private
	afterRender : function(){
		KettleEditorGrid.superclass.afterRender.call(this);
		
		new Ext.KeyMap(this.el, {
		    key: 46,
		    fn: this.deleteRow,
		    scope: this
		});
	}
});

Ext.reg('KettleEditorGrid', KettleEditorGrid);


