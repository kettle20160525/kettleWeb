SynchronizeAfterMergeDialog = Ext.extend(KettleTabDialog, {
	title: 'Synchronize After Merge',
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
			height: 200,
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
				fieldLabel: '表名在字段里定义',
				xtype: 'checkbox',
				value: cell.getAttribute('tablename_in_field') == 'Y'
			}, {
				fieldLabel: '表名字段',
				xtype: 'textfield',
				anchor: '-10',
				value: cell.getAttribute('tablename_field')
			}]
		});
		
		var grid = new Ext.grid.EditorGridPanel({
			title: '用来查询的关键字',
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
			}, {
				text: '编辑映射'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '流字段', dataIndex: 'rename', width: 100, editor: new Ext.form.TextField()
			},{
				header: '更新', dataIndex: 'update', width: 100, xtype: 'checkcolumn'
			}],
			store: new Ext.data.JsonStore({
				fields: ['name', 'rename', 'update'],
				data: Ext.decode(cell.getAttribute('updateFields')) || []
			})
		});
		
		var normal = new Ext.Panel({
			title: '一般',
			layout: 'border',
			defaults: {border: false},
			items: [form, grid, grid2]
		});
		
		
		
		var advance = new KettleForm({
			title: '高级',
			bodyStyle: 'padding: 10px',
			items: [{
				xtype: 'fieldset',
				title: '操作',
				items: [{
					fieldLabel: '操作字段名',
					xtype: 'textfield',
					anchor: '-20',
					value: cell.getAttribute('operation_order_field')
				}, {
					fieldLabel: '当值相等时插入',
					xtype: 'textfield',
					anchor: '-20',
					value: cell.getAttribute('order_insert')
				}, {
					fieldLabel: '当值相等时更新',
					xtype: 'textfield',
					anchor: '-20',
					value: cell.getAttribute('order_update')
				}, {
					fieldLabel: '当值相等时删除',
					xtype: 'textfield',
					anchor: '-20',
					value: cell.getAttribute('order_delete')
				}, {
					fieldLabel: '执行查询',
					xtype: 'checkbox',
					value: cell.getAttribute('perform_lookup') == 'Y'
				}]
			}]
		})
		
		this.tabItems = [normal, advance];
		
		SynchronizeAfterMergeDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SynchronizeAfterMerge', SynchronizeAfterMergeDialog);