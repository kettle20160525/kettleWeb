SetVariableDialog = Ext.extend(KettleDialog, {
	title: '设置环境变量',
	width: 600,
	height: 400,
	bodyStyle: 'padding: 5px;',
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var store = new Ext.data.JsonStore({
			fields: ['field_name', 'variable_name', 'variable_type', 'default_value'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var grid = this.fitItems = new Ext.grid.EditorGridPanel({
			region: 'center',
			title: '字段',
			tbar: [{
				text: '新增字段', handler: function() {
	                var p = new store.recordType({ field_name: '', variable_name: '', variable_type: '' });
	                grid.stopEditing();
	                grid.getStore().insert(0, p);
	                grid.startEditing(0, 0);
				}
			},{
				text: '删除字段'
			},{
				text: '获取变量'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '字段名称', dataIndex: 'field_name', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputOutputFields(cell.getAttribute('label'), true)
				})
			},{
				header: '变量名', dataIndex: 'variable_name', width: 100, editor: new Ext.form.TextField()
			},{
				header: '变量活动类型', dataIndex: 'variable_type', width: 180, editor: new Ext.form.ComboBox({
			        store: Ext.StoreMgr.get('variableTypeStore'),
			        displayField: 'desc',
			        valueField: 'code',
			        typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    }), renderer: function(v)
				{
			    	var rec = Ext.StoreMgr.get('variableTypeStore').getById(v);
			    	if(rec) return rec.get('desc');
			    	return v;
				}
			},{
				header: '默认值', dataIndex: 'default_value', width: 100, editor: new Ext.form.TextField()
			}],
			store: store
		});
		
		this.getValues = function(){
			return {
				fields: Ext.encode(store.toJson())
			};
		};
		
		SetVariableDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SetVariable', SetVariableDialog);