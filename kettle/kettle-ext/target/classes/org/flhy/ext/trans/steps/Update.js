UpdateDialog = Ext.extend(KettleDialog, {
	title: '更新',
	width: 800,
	height: 600,
	initComponent: function() {
		var me = this, 
			transGraph = getActiveGraph(),
			graph = transGraph.getGraph(), 
			cell = graph.getSelectionCell(), 
			store = transGraph.getDatabaseStore();
		
		var combo = new Ext.form.ComboBox({
			flex: 1,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: store,
			name: 'connection',
			value: cell.getAttribute('connection')
		});
		
		var form = new KettleForm({
			region: 'north',
			height: 230,
			labelWidth: 150,
			bodyStyle: 'padding: 15px 0px',
			items: [{
				fieldLabel: '数据库连接',
				xtype: 'compositefield',
				anchor: '-10',
				items: [combo, {
					xtype: 'button', text: '编辑...', handler: function() {
						store.each(function(item) {
							if(item.get('name') == combo.getValue()) {
								var databaseDialog = new DatabaseDialog();
    							databaseDialog.show(null, function() {
    								databaseDialog.initDatabase(item.json);
    							});
							}
						});
					}
				}, {
					xtype: 'button', text: '新建...', handler: function() {
						var databaseDialog = new DatabaseDialog();
						databaseDialog.show();
					}
				}, {
					xtype: 'button',
					text: '向导...'
				}]
			}, {
				fieldLabel: '目的模式',
				xtype: 'compositefield',
				anchor: '-10',
				items: [{
					xtype: 'textfield',
					flex: 1,
					value: cell.getAttribute('schema')
				}, {
					xtype: 'button', text: '浏览...'
				}]
			}, {
				fieldLabel: '目标表',
				xtype: 'compositefield',
				anchor: '-10',
				items: [{
					xtype: 'textfield',
					flex: 1,
					value: cell.getAttribute('table')
				}, {
					xtype: 'button', text: '浏览...'
				}]
			}, {
				fieldLabel: '提交的记录数量',
				xtype: 'textfield',
				anchor: '-10',
				value: cell.getAttribute('commit')
			}, {
				fieldLabel: '批量更新',
				xtype: 'checkbox',
				value: cell.getAttribute('use_batch') == 'Y'
			}, {
				fieldLabel: '跳过查询',
				xtype: 'checkbox',
				value: cell.getAttribute('skip_lookup') == 'Y'
			}, {
				fieldLabel: '忽略查询失败',
				xtype: 'checkbox',
				value: cell.getAttribute('error_ignored') == 'Y'
			}, {
				fieldLabel: '标志字段(key found)',
				xtype: 'textfield',
				anchor: '-10',
				value: cell.getAttribute('ignore_flag_field')
			}]
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			title: '用来查询值的关键字',
			region: 'center',
			tbar: [{
				text: '新增字段'
			},{
				text: '删除字段'
			}, {
				text: '获取字段'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'field', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '比较符', dataIndex: 'condition', width: 100, editor: new Ext.form.TextField()
			},{
				header: '流里的字段1', dataIndex: 'name', width: 100, editor: new Ext.form.TextField()
			},{
				header: '流里的字段2', dataIndex: 'name2', width: 100, editor: new Ext.form.TextField()
			}],
			store: new Ext.data.JsonStore({
				fields: ['field', 'condition', 'name', 'name2'],
				data: Ext.decode(cell.getAttribute('searchFields')) || []
			})
		});
		
		var grid2 = new Ext.grid.EditorGridPanel({
			title: '更新字段',
			region: 'south',
			height: 150,
			collapsible: true,
			tbar: [{
				text: '新增字段'
			},{
				text: '删除字段'
			}, {
				text: '获取更新字段'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '流里的字段', dataIndex: 'rename', width: 100, editor: new Ext.form.TextField()
			}],
			store: new Ext.data.JsonStore({
				fields: ['name', 'rename'],
				data: Ext.decode(cell.getAttribute('updateFields')) || []
			})
		});
		
		this.fitItem = new Ext.Panel({
			layout: 'border',
			defaults: {border: false},
			items: [form, grid, grid2]
		});
		
		UpdateDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('Update', UpdateDialog);