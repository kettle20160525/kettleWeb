SynchronizeAfterMergeDialog = Ext.extend(KettleTabDialog, {
	title: 'Synchronize After Merge',
	width: 800,
	height: 600,
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		
		var onDatabaseCreate = function(dialog) {
			var root = graph.getDefaultParent();
			var databases = root.getAttribute('databases');
			var jsonArray = Ext.decode(databases);
			jsonArray.push(dialog.getValue());
			graph.getModel().beginUpdate();
            try
            {
				var edit = new mxCellAttributeChange(root, 'databases', Ext.encode(jsonArray));
            	graph.getModel().execute(edit);
            } finally
            {
                graph.getModel().endUpdate();
            }
			
            wConnection.setValue(dialog.getValue().name);
            dialog.close();
		};
		
		var wConnection = new Ext.form.ComboBox({
			flex: 1,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().getDatabaseStore(),
			value: cell.getAttribute('connection')
		});
		var wSchema = new Ext.form.TextField({ flex: 1, value: cell.getAttribute('schema')});
		var wTable = new Ext.form.TextField({ flex: 1, value: cell.getAttribute('table')});
		var wCommit = new Ext.form.TextField({ fieldLabel: '提交的记录数量', anchor: '-10', value: cell.getAttribute('commit')});
		var wBatch = new Ext.form.Checkbox({ fieldLabel: '批量更新', checked: cell.getAttribute('use_batch') == 'Y' });
		var wTablenameInField = new Ext.form.Checkbox({ fieldLabel: '表名在字段里定义', checked: cell.getAttribute('tablename_in_field') == 'Y' });
		var wTableField = new Ext.form.TextField({ fieldLabel: '表名字段', anchor: '-10', value: cell.getAttribute('tablename_field')});
		
		///-----------------------------------------advance---------------------------------------------------
		var wOperationField = new Ext.form.ComboBox({
			fieldLabel: '操作字段名',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputOutputFields(cell.getAttribute('label'), true),
			value: cell.getAttribute('operation_order_field')
		});
		var wOrderInsert = new Ext.form.TextField({ fieldLabel: '当值相等时插入', anchor: '-10', value: cell.getAttribute('order_insert')});
		var wOrderUpdate = new Ext.form.TextField({ fieldLabel: '当值相等时更新', anchor: '-10', value: cell.getAttribute('order_update')});
		var wOrderDelete = new Ext.form.TextField({ fieldLabel: '当值相等时删除', anchor: '-10', value: cell.getAttribute('order_delete')});
		var wPerformLookup = new Ext.form.Checkbox({ fieldLabel: '执行查询', checked: cell.getAttribute('perform_lookup') == 'Y' });
		
		var searchStore = new Ext.data.JsonStore({
			idProperty: 'field',
			fields: ['field', 'condition', 'name', 'name2'],
			data: Ext.decode(cell.getAttribute('searchFields')) || []
		});
		var updateStore = new Ext.data.JsonStore({
			fields: ['name', 'rename', 'update'],
			data: Ext.decode(cell.getAttribute('updateFields')) || []
		});
		
		this.getValues = function(){
			var args = [], args2 = [];
			searchStore.each(function(rec) {
				args.push({
					field: rec.get('field'),
					condition: rec.get('condition'),
					name: rec.get('name'),
					name2: rec.get('name2')
				});
			});
			updateStore.each(function(rec) {
				args2.push({
					name: rec.get('name'),
					rename: rec.get('rename'),
					update: rec.get('update')
				});
			});
			return {
				connection: wConnection.getValue(),
				schema: wSchema.getValue(),
				table: wTable.getValue(),
				commit: wCommit.getValue(),
				use_batch: wBatch.getValue() ? "Y" : "N",
				tablename_in_field: wTablenameInField.getValue() ? "Y" : "N",
				tablename_field: wTableField.getValue(),		
				operation_order_field: wOperationField.getValue(),
				order_insert: wOrderInsert.getValue(),
				order_update: wOrderUpdate.getValue(),
				order_delete: wOrderDelete.getValue(),
				perform_lookup: wPerformLookup.getValue() ? "Y" : "N",
				searchFields: Ext.encode(args),
				updateFields: Ext.encode(args2)
			};
		};
		
		this.tabItems = [{
			title: '一般',
			layout: 'border',
			defaults: {border: false},
			items: [{
				region: 'north',
				height: 200,
				bodyStyle: 'padding: 15px 0px',
				xtype: 'KettleForm',
				items: [{
					fieldLabel: '数据库连接',
					xtype: 'compositefield',
					anchor: '-10',
					items: [wConnection, {
						xtype: 'button', text: '编辑...', handler: function() {
							getActiveGraph().getDatabaseStore().each(function(item) {
								if(item.get('name') == wConnection.getValue()) {
									var databaseDialog = new DatabaseDialog();
									databaseDialog.on('create', onDatabaseCreate);
	    							databaseDialog.show(null, function() {
	    								databaseDialog.initDatabase(item.json);
	    							});
								}
							});
						}
					}, {
						xtype: 'button', text: '新建...', handler: function() {
							var databaseDialog = new DatabaseDialog();
							databaseDialog.on('create', onDatabaseCreate);
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
					items: [wSchema, {
						xtype: 'button', text: '浏览...', handler: function() {
							var store = getActiveGraph().getDatabaseStore();
							store.each(function(item) {
								if(item.get('name') == wConnection.getValue()) {
									me.getSQL(item.json, 'schema', wSchema);
									
								}
							});
						}
					}]
				}, {
					fieldLabel: '目标表',
					xtype: 'compositefield',
					anchor: '-10',
					items: [wTable, {
						xtype: 'button', text: '浏览...', handler: function() {
							var store = getActiveGraph().getDatabaseStore();
							store.each(function(item) {
								if(item.get('name') == wConnection.getValue()) {
									me.getSQL(item.json, 'all', wSchema, wTable);
								}
							});
						}
					}]
				}, wCommit, wBatch, wTablenameInField, wTableField]
			}, {
				title: '用来查询的关键字',
				xtype: 'editorgrid',
				region: 'center',
				tbar: [{
					text: '新增字段', handler: function(btn) {
						var grid = btn.findParentByType('editorgrid');
						var RecordType = grid.getStore().recordType;
		                var rec = new RecordType({  field: '', condition: '',  name: ''  });
		                grid.stopEditing();
		                grid.getStore().insert(0, rec);
		                grid.startEditing(0, 0);
					}
				},{
					text: '删除字段', handler: function(btn) {
						var sm = btn.findParentByType('editorgrid').getSelectionModel();
						if(sm.hasSelection()) {
							var row = sm.getSelectedCell()[0];
							searchStore.removeAt(row);
						}
					}
				}, {
					text: '获取字段', handler: function() {
						getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
							searchStore.merge(store, ['name', {name: 'condition', value: '='}, {name:'field', field: 'name'}]);
						});
					}
				}],
				columns: [new Ext.grid.RowNumberer(), {
					header: '表字段', dataIndex: 'field', width: 100, editor: new Ext.form.ComboBox({
						displayField: 'name',
						valueField: 'name',
						typeAhead: true,
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true,
						store: getActiveGraph().tableFields(wConnection.getValue(), wSchema.getValue(), wTable.getValue()),
						listeners : {
						     beforequery: function(qe){
						    	 delete qe.combo.lastQuery;
						     }
						} 
					})
				},{
					header: '比较符', dataIndex: 'condition', width: 100, editor: new Ext.form.ComboBox({
				        store: new Ext.data.JsonStore({
				        	fields: ['value', 'text'],
				        	data: [{value: '=', text: '='},
				        	       {value: '<>', text: '<>'},
				        	       {value: '<', text: '<'},
				        	       {value: '<=', text: '<='},
				        	       {value: '>', text: '>'},
				        	       {value: '>=', text: '>='},
				        	       {value: 'LIKE', text: 'LIKE'},
				        	       {value: 'BETWEEN', text: 'BETWEEN'},
				        	       {value: 'IS NULL', text: 'IS NULL'},
				        	       {value: 'IS NOT NULL', text: 'IS NOT NULL'}]
				        }),
				        displayField: 'text',
				        valueField: 'value',
				        typeAhead: true,
				        mode: 'local',
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true
				    })
				},{
					header: '流里的字段1', dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
						displayField: 'name',
						valueField: 'name',
						typeAhead: true,
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true,
						store: getActiveGraph().inputOutputFields(cell.getAttribute('label'), true)
					})
				},{
					header: '流里的字段2', dataIndex: 'name2', width: 100, editor: new Ext.form.ComboBox({
						displayField: 'name',
						valueField: 'name',
						typeAhead: true,
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true,
						store: getActiveGraph().inputOutputFields(cell.getAttribute('label'), true)
					})
				}],
				store: searchStore
			}, {
				title: '更新字段',
				region: 'south',
				xtype: 'editorgrid',
				height: 150,
				collapsible: true,
				tbar: [{
					text: '新增字段', handler: function(btn) {
						var grid = btn.findParentByType('editorgrid');
						var RecordType = grid.getStore().recordType;
		                var rec = new RecordType({  name: '', rename: '',  update: 'N'  });
		                grid.stopEditing();
		                grid.getStore().insert(0, rec);
		                grid.startEditing(0, 0);
					}
				},{
					text: '删除字段', handler: function(btn) {
						var sm = btn.findParentByType('editorgrid').getSelectionModel();
						if(sm.hasSelection()) {
							var row = sm.getSelectedCell()[0];
							searchStore.removeAt(row);
						}
					}
				}, {
					text: '获取更新字段', handler: function() {
						getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
							updateStore.merge(store, ['name', {name:'rename', field: 'name'}, {name: 'update', value: 'Y'}]);
						});
					}
				}, {
					text: '编辑映射'
				}],
				columns: [new Ext.grid.RowNumberer(), {
					header: '表字段', dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
						displayField: 'name',
						valueField: 'name',
						typeAhead: true,
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true,
						store: getActiveGraph().tableFields(wConnection.getValue(), wSchema.getValue(), wTable.getValue()),
						listeners : {
						     beforequery: function(qe){
						    	 delete qe.combo.lastQuery;
						     }
						} 
					})
				},{
					header: '流字段', dataIndex: 'rename', width: 100, editor: new Ext.form.ComboBox({
						displayField: 'name',
						valueField: 'name',
						typeAhead: true,
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true,
						store: getActiveGraph().inputOutputFields(cell.getAttribute('label'), true)
					})
				},{
					header: '更新', dataIndex: 'update', width: 100, renderer: function(v)
					{
						if(v == 'N') 
							return '否'; 
						else if(v == 'Y') 
							return '是';
						return v;
					}, editor: new Ext.form.ComboBox({
				        store: new Ext.data.JsonStore({
				        	fields: ['value', 'text'],
				        	data: [{value: 'Y', text: '是'},
				        	       {value: 'N', text: '否'}]
				        }),
				        displayField: 'text',
				        valueField: 'value',
				        typeAhead: true,
				        mode: 'local',
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true
				    })
				}],
				store: updateStore
			}]
		}, {
			title: '高级',
			bodyStyle: 'padding: 10px',
			xtype: 'KettleForm',
			items: [{
				xtype: 'fieldset',
				title: '操作',
				items: [wOperationField, wOrderInsert, wOrderUpdate, wOrderDelete, wPerformLookup]
			}]
		}];
		
		SynchronizeAfterMergeDialog.superclass.initComponent.call(this);
	},
	
	getSQL: function(dbInfo, objType, wSchema, wTable) {
		var dialog = new DatabaseExplorerDialog();
		dialog.on('select', function(node) {
			wSchema.setValue(node.attributes.schema || node.text);
			if(wTable) wTable.setValue(node.text);
			dialog.close();
		});
		dialog.show(null, function() {
			dialog.initDatabase(dbInfo, objType);
		});
	}
});

Ext.reg('SynchronizeAfterMerge', SynchronizeAfterMergeDialog);