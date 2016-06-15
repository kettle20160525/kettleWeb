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
	
	initComponent: function() {
		var graph = getActiveGraph().getGraph(), cell = graph.getSelectionCell(), me = this;
		
		var wLabel = this.wLabel = new Ext.form.TextField({
			fieldLabel: '步骤名称',
			anchor: '-20',
			value: cell.getAttribute('label')
		});
		
		var form = new KettleForm({
			bodyStyle: 'padding: 10px',
			region: 'north',
			height: 35,
			labelWidth: 100,
			items: [wLabel]
		});
		
		this.items = [form, {
			region: 'center',
			bodyStyle: 'padding: 5px',
			layout: 'fit',
			items: this.fitItems
		}];
		
		var bCancel = new Ext.Button({
			text: '取消', handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', handler: function() {
				me.onSure(true);
			}
		});
		
		this.bbar = ['->', bCancel];
		if(this.showPreview)
			this.bbar.push({text: '预览', scope: this, handler: this.preview});
		this.bbar.push(bOk);
		
		KettleDialog.superclass.initComponent.call(this);
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
	
	onSure: function(closed) {
		var graph = getActiveGraph().getGraph();
		
		graph.getModel().beginUpdate();
        try
        {
        	var values = this.getValues();
        	for(var name in values) {
				var edit = new mxCellAttributeChange(cell, name, values[name]);
            	graph.getModel().execute(edit);
			}
        	var edit = new mxCellAttributeChange(cell, 'label', this.wLabel.getValue());
        	graph.getModel().execute(edit);
        } finally
        {
            graph.getModel().endUpdate();
        }
        
        if(closed === true)
        	this.close();
	},
	
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

ClusterSchemaDialog = Ext.extend(Ext.Window, {
	title: '集群Schema对话框',
	width: 700,
	height: 500,
	modal: true,
	layout: 'border',
	iconCls: 'imageCluster',
	defaults: {border: false},
	initComponent: function() {
		var me = this;
		
		var listBox = new ListBox({
			region: 'west',
			displayField: 'name',
			valueField: 'name',
			width: 150,
			store: getActiveGraph().getClusterSchemaStore()
		});
		
		var wName = new Ext.form.TextField({fieldLabel: 'Schema名称', anchor: '-10'});
		var wPort = new Ext.form.TextField({fieldLabel: '端口', anchor: '-10'});
		var wBufferSize = new Ext.form.TextField({fieldLabel: 'Sockets缓存大小', anchor: '-10'});
		var wFlushInterval = new Ext.form.TextField({fieldLabel: 'Sockets刷新间隔(rows)', anchor: '-10'});
		var wCompressed = new Ext.form.Checkbox({fieldLabel: 'Sockets数据是否压缩'});
		var wDynamic = new Ext.form.Checkbox({fieldLabel: '动态集群'});
		
		var store = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['name', '', 'hostname', 'port', 'webAppName', 'username', 'password', 'master']
		});
		
		var grid = new Ext.grid.GridPanel({
			title: '子服务器',
			region: 'center',
			tbar: [{
				text: '获取服务器', handler: function() {
					store.removeAll(true);
					store.loadData(getActiveGraph().getSlaveServerData());
				}
			},{
				text: '移除服务器', handler: function() {
					var sm = grid.getSelectionModel();
					if(sm.hasSelection() === true) {
						store.remove(sm.getSelected());
					}
				}
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 150
			},{
				header: '服务URL', dataIndex: 'hostname', width: 120
			},{
				header: '是否主服务器', dataIndex: 'master', width: 100, renderer: function(v)
				{
					if(v == 'Y') 
						return '是'; 
					else if(v == 'N') 
						return '否';
					return v;
				}
			}],
			store: store
		});
		
		listBox.on('valueChange', function(v) {
			var rec = listBox.getStore().getById(v);
			if(rec) {
				wName.setValue(rec.get('name'));
				wPort.setValue(rec.get('base_port'));
				wBufferSize.setValue(rec.get('sockets_buffer_size'));
				wFlushInterval.setValue(rec.get('sockets_flush_interval'));
				wCompressed.setValue('Y' == rec.get('sockets_compressed'));
				wDynamic.setValue('Y' == rec.get('dynamic'));
				
				store.loadData(rec.get('slaveservers'));
			} else {
				wName.setValue('');
				wPort.setValue(40000);
				wBufferSize.setValue(2000);
				wFlushInterval.setValue(5000);
				wCompressed.setValue(true);
				wDynamic.setValue(false);
				
				store.loadData([]);
			}
		});
		
		this.on('afterrender', function() {
			listBox.getEl().on('contextmenu', function(e) {
				var menu = new Ext.menu.Menu({
					items: [{
						text: '新增', handler: function() {
							wName.setValue('');
							wPort.setValue(40000);
							wBufferSize.setValue(2000);
							wFlushInterval.setValue(5000);
							wCompressed.setValue(true);
							wDynamic.setValue(false);
							
							store.loadData([]);
						}
					}, {
						text: '移除', disabled: Ext.isEmpty(listBox.getValue()), handler: function() {
							getActiveGraph().onClusterSchemaDel(listBox.getValue());
						}
					}, '-', {
						text: 'Share', disabled: Ext.isEmpty(listBox.getValue())
					}]
				});
				
				menu.showAt(e.getXY());
				e.preventDefault();
			});
		});
		
		this.items = [listBox, {
			region: 'center',
			layout: 'border',
			defaults: {border: false},
			items: [{
				xtype: 'KettleForm',
				region: 'north',
				height: 200,
				labelWidth: 150,
				tbar: [{
					text: '保存', scope: this, handler: function() {
						if(Ext.isEmpty(wName.getValue())) {
							alert('名称不能为空');
							return;
						}
						
						getActiveGraph().onClusterSchemaMerge({
							name: wName.getValue(),
							base_port: wPort.getValue(),
							sockets_buffer_size: wBufferSize.getValue(),
							sockets_flush_interval: wFlushInterval.getValue(),
							sockets_compressed: wCompressed.getValue() ? "Y" : "N",
							dynamic: wDynamic.getValue() ? "Y" : "N",
							slaveservers: store.toJson()
						});
					}
				}, {
					text: '关闭', scope: this, handler: function() {
						me.close();
					}
				}],
				items: [wName,wPort, wBufferSize, wFlushInterval, wCompressed, wDynamic]
			}, grid]
		}];
		
		ClusterSchemaDialog.superclass.initComponent.call(this);
	}
});