SelectValuesDialog = Ext.extend(KettleTabDialog, {
	title: '选择/改名值',
	width: 600,
	height: 400,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var selectStore = new Ext.data.JsonStore({
			fields: ['name', 'rename', 'length', 'precision'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var deleteStore = new Ext.data.JsonStore({
			fields: ['name'],
			data: Ext.decode(cell.getAttribute('remove') || Ext.encode([]))
		});
		
		var metaStore = new Ext.data.JsonStore({
			fields: ['name', 'rename', 'type', 'length', 'precision', 'storage_type', 'conversion_mask', 'date_format_lenient', 
			         'date_format_locale', 'date_format_timezone', 'lenient_string_to_number', 'encoding', 'decimal_symbol', 'grouping_symbol', 'currency_symbol'],
			data: Ext.decode(cell.getAttribute('meta') || Ext.encode([]))
		});
		
		this.getValues = function(){
			return {
				fields: Ext.encode(selectStore.toJson()),
				remove: Ext.encode(deleteStore.toJson()),
				meta: Ext.encode(metaStore.toJson())
			};
		};
		
		this.tabItems = [{
			title: '选择和修改',
			xtype: 'editorgrid',
			tbar: [{
				text: '新增字段', handler: function() {
					
				}
			},{
				text: '删除字段', handler: function(btn) {
					var sm = btn.findParentByType('editorgrid').getSelectionModel();
					if(sm.hasSelection()) {
						var row = sm.getSelectedCell()[0];
						var col = sm.getSelectedCell()[1];
						selectStore.removeAt(row);
						
						if(selectStore.getCount() > row)
							sm.select(row, col);
					}
				}
			},{
				text: '获取选择的字段', handler: function() {
					getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
						selectStore.merge(store, 'name');
					});
				}
			},{
				text: '列映射'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '字段名称', dataIndex: 'name', width: 150, editor: new Ext.form.TextField()
			}, {
				header: '改名成', dataIndex: 'rename', width: 150, editor: new Ext.form.TextField()
			}, {
				header: '长度', dataIndex: 'length', width: 70, editor: new Ext.form.TextField()
			}, {
				header: '精度', dataIndex: 'precision', width: 70, editor: new Ext.form.TextField()
			}],
			store: selectStore
		},{
			xtype: 'editorgrid',
			title: '移除',
			tbar: [{
				text: '获取移除的字段', handler: function() {
					getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
						deleteStore.merge(store, 'name');
					});
				}
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '字段名称', dataIndex: 'name', width: 150, editor: new Ext.form.TextField()
			}],
			store: deleteStore
		},{
			title: '元数据',
			xtype: 'editorgrid',
			tbar: [{
				text: '获取改变的字段', handler: function() {
					getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
						metaStore.merge(store, ['name', 'type', 'length', 'precision']);
					});
				}
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField()
			}, {
				header: '改名成', dataIndex: 'rename', width: 100, editor: new Ext.form.TextField()
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
				header: '长度', dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
			},{
				header: '精度', dataIndex: 'precision', width: 100, editor: new Ext.form.TextField()
			},{
				header: 'Binary to Normal?', dataIndex: 'storage_type', width: 80, renderer: function(v)
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
			},{
				header: '格式', dataIndex: 'conversion_mask', width: 150, editor: new Ext.form.ComboBox({
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
				header: 'Date Format Lenient?', dataIndex: 'date_format_lenient', width: 80, renderer: function(v)
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
			},{
				header: 'Date Locale', dataIndex: 'date_format_locale', width: 100, renderer: function(v)
				{
					if(v == 'none') 
						return '不去除字符串首位空字符'; 
					else if(v == 'left') 
						return '去除字符串首部空字符';
					else if(v == 'right') 
						return '去除字符串尾部空字符';
					else if(v == 'both') 
						return '去除字符串首尾空字符';
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'none', text: '不去除字符串首位空字符'},
			        	       {value: 'left', text: '去除字符串首部空字符'},
			        	       {value: 'right', text: '去除字符串尾部空字符'},
			        	       {value: 'both', text: '去除字符串首尾空字符'}]
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
				header: 'Date Time Zone', dataIndex: 'date_format_timezone', width: 100, renderer: function(v)
				{
					if(v == 'none') 
						return '不去除字符串首位空字符'; 
					else if(v == 'left') 
						return '去除字符串首部空字符';
					else if(v == 'right') 
						return '去除字符串尾部空字符';
					else if(v == 'both') 
						return '去除字符串首尾空字符';
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'none', text: '不去除字符串首位空字符'},
			        	       {value: 'left', text: '去除字符串首部空字符'},
			        	       {value: 'right', text: '去除字符串尾部空字符'},
			        	       {value: 'both', text: '去除字符串首尾空字符'}]
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
				header: 'Lenient number conversion?', dataIndex: 'lenient_string_to_number', width: 80, renderer: function(v)
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
			},{
				header: 'Encoding', dataIndex: 'encoding', width: 100, renderer: function(v)
				{
					if(v == 'none') 
						return '不去除字符串首位空字符'; 
					else if(v == 'left') 
						return '去除字符串首部空字符';
					else if(v == 'right') 
						return '去除字符串尾部空字符';
					else if(v == 'both') 
						return '去除字符串首尾空字符';
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'none', text: '不去除字符串首位空字符'},
			        	       {value: 'left', text: '去除字符串首部空字符'},
			        	       {value: 'right', text: '去除字符串尾部空字符'},
			        	       {value: 'both', text: '去除字符串首尾空字符'}]
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
				header: '十进制', dataIndex: 'decimal_symbol', width: 100, editor: new Ext.form.TextField()
			},{
				header: '分组', dataIndex: 'grouping_symbol', width: 100, editor: new Ext.form.TextField()
			},{
				header: '货币', dataIndex: 'currency_symbol', width: 100, editor: new Ext.form.TextField()
			}],
			store: metaStore
		}];
		
		SelectValuesDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SelectValues', SelectValuesDialog);