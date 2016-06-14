ConstantDialog = Ext.extend(KettleDialog, {
	title: '增加常量',
	width: 700,
	height: 500,
	bodyStyle: 'padding: 5px;',
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'format', 'currency', 'decimal', 'group', 'nullif', 'length', 'precision', 'set_empty_string'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var grid = this.fitItems = new Ext.grid.EditorGridPanel({
			region: 'center',
			title: '字段',
			tbar: [{
				text: '新增字段', handler: function() {
					var RecordType = grid.getStore().recordType;
	                var p = new RecordType({ name: '', type: '', format: '' });
	                grid.stopEditing();
	                grid.getStore().insert(0, p);
	                grid.startEditing(0, 0);
				}
			},{
				text: '删除字段'
			},{
				text: '获取字段'
			},{
				text: '最小宽度'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '类型', dataIndex: 'type', width: 100, editor: new Ext.form.ComboBox({
			        store: Ext.StoreMgr.get('valueMetaStore'),
			        displayField: 'name',
			        valueField: 'name',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: '格式', dataIndex: 'format', width: 150, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value'],
			        	data: [{value: 'yyyy-MM-dd HH:mm:ss'},
			        	       {value: 'yyyy/MM/dd HH:mm:ss'},
			        	       {value: 'yyyy-MM-dd'},
			        	       {value: 'yyyy/MM/dd'},
			        	       {value: 'yyyyMMdd'},
			        	       {value: 'yyyyMMddHHmmss'}]
			        }),
			        displayField:'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: '长度', dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
			},{
				header: '精度', dataIndex: 'precision', width: 100, editor: new Ext.form.TextField()
			},{
				header: '当前的', dataIndex: 'currency', width: 100, editor: new Ext.form.TextField()
			},{
				header: '10进制的', dataIndex: 'decimal', width: 100, editor: new Ext.form.TextField()
			},{
				header: '组', dataIndex: 'group', width: 100, editor: new Ext.form.TextField()
			},{
				header: '值', dataIndex: 'nullif', width: 80, editor: new Ext.form.TextField()
			},{
				header: '设为空串', dataIndex: 'set_empty_string', width: 100, renderer: function(v)
				{
					if(v == 'Y') 
						return '是'; 
					else if(v == 'N') 
						return '否';
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
			store: store
		});
		
		this.getValues = function(){
			return {
				fields: Ext.encode(store.toJson())
			};
		};
		
		ConstantDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('Constant', ConstantDialog);