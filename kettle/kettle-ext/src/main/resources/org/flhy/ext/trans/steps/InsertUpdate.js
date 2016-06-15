InsertUpdateDialog = Ext.extend(KettleTabDialog, {
	title: '插入/更新',
	width: 600,
	height: 450,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
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
			name: 'connection',
			value: cell.getAttribute('connection')
		});
		
		var onDatabaseCreate = function(dialog) {
			getActiveGraph().onDatabaseMerge(dialog.getValue());
            wConnection.setValue(dialog.getValue().name);
            dialog.close();
		};
		
		var wSchema = new Ext.form.TextField({ flex: 1, value: cell.getAttribute('schema')});
		var wTable = new Ext.form.TextField({ flex: 1, value: cell.getAttribute('table')});
		var wCommit = new Ext.form.TextField({ fieldLabel: '提交记录数量', anchor: '-10', value: cell.getAttribute('commit')});
		var wUpdateBypassed = new Ext.form.Checkbox({ fieldLabel: '不执行任何更新', checked: cell.getAttribute('update_bypassed') == 'Y' });
		
		var searchStore = new Ext.data.JsonStore({
			fields: ['keyLookup', 'keyCondition', 'keyStream1', 'keyStream2'],
			data: Ext.decode(cell.getAttribute('searchFields')) || []
		});
		var updateStore = new Ext.data.JsonStore({
			fields: ['updateLookup', 'updateStream', 'update'],
			data: Ext.decode(cell.getAttribute('updateFields')) || []
		});
		
		this.getValues = function(){
			return {
				connection: wConnection.getValue(),
				schema: wSchema.getValue(),
				table: wTable.getValue(),
				commit: wCommit.getValue(),
				update_bypassed: wUpdateBypassed.getValue() ? "Y" : "N",
				searchFields: Ext.encode(searchStore.toJson()),
				updateFields: Ext.encode(updateStore.toJson())
			};
		};
		
		this.tabItems = [{
			title: '基本配置',
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 150,
			items: [{
				xtype: 'compositefield',
				fieldLabel: '数据库连接',
				anchor: '-10',
				items: [wConnection, {
					xtype: 'button', text: '编辑...', handler: function() {
						var store = getActiveGraph().getDatabaseStore();
						store.each(function(item) {
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
					xtype: 'button', text: '向导...'
				}]
			},{
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
			},{
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
			}, wCommit, wUpdateBypassed]
		}, {
			title: '查询字段',
			xtype: 'editorgrid',
			region: 'center',
			tbar: [{
				text: '新增字段', handler: function(btn) {
					var grid = btn.findParentByType('editorgrid');
					var RecordType = grid.getStore().recordType;
	                var rec = new RecordType({ keyLookup: '', keyCondition: '=',  keyStream1: '', keyStream2: '' });
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
						searchStore.merge(store, [{name: 'keyLookup', field: 'name'}, {name: 'keyCondition', value: '='}, {name:'keyStream1', field: 'name'}, {name: 'keyStream2', value: ''}]);
					});
				}
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'keyLookup', width: 100, editor: new Ext.form.ComboBox({
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
				header: '比较符', dataIndex: 'keyCondition', width: 100, editor: new Ext.form.ComboBox({
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
				header: '流里的字段1', dataIndex: 'keyStream1', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputOutputFields(cell.getAttribute('label'), true)
				})
			},{
				header: '流里的字段2', dataIndex: 'keyStream2', width: 100, editor: new Ext.form.ComboBox({
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
			xtype: 'editorgrid',
			tbar: [{
				text: '新增字段', handler: function(btn) {
					var grid = btn.findParentByType('editorgrid');
					var RecordType = grid.getStore().recordType;
	                var rec = new RecordType({  updateLookup: '', updateStream: '',  update: 'N'  });
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
						updateStore.merge(store, [{name:'updateLookup', field: 'name'}, {name:'updateStream', field: 'name'}, {name: 'update', value: 'Y'}]);
					});
				}
			}, {
				text: '编辑映射'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'updateLookup', width: 100, editor: new Ext.form.ComboBox({
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
				header: '流字段', dataIndex: 'updateStream', width: 100, editor: new Ext.form.ComboBox({
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
		}];
		
		InsertUpdateDialog.superclass.initComponent.call(this);
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

Ext.reg('InsertUpdate', InsertUpdateDialog);