SelectValuesDialog = Ext.extend(Ext.Window, {
	title: '选择/改名值',
	width: 600,
	height: 400,
	closeAction: 'close',
	modal: true,
	layout: 'border',
	initComponent: function() {
		var me = this, graph = getActiveTransGraph().getGraph(), cell = graph.getSelectionCell();
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			border: false,
			region: 'north',
			height: 50,
			defaultType: 'textfield',
			labelWidth: 150,
			labelAlign: 'right',
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-10',
				name: 'label',
				value: cell.getAttribute('label')
			}]
		});
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'rename', 'length', 'precision'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var selectAndUpdate = new Ext.grid.EditorGridPanel({
			title: '选择和修改',
			tbar: [{
				text: '获取选择的字段', handler: function() {
					var stepName = cell.getAttribute('label');
					
					var enc = new mxCodec(mxUtils.createXmlDocument());
					var node = enc.encode(graph.getModel());
					var graphXml = mxUtils.getPrettyXml(node);
					
					Ext.Ajax.request({
						url: GetUrl('step/getFields.do'),
						params: {stepName: stepName, graphXml: graphXml},
						success: function(response, opts) {
							var fields = Ext.decode(response.responseText);
							if(fields.length == 0) return;
							
							if(store.getCount() > 0) {
								var answerDialog = new AnswerDialog({has: store.getCount(), found: fields.length});
								answerDialog.on('addNew', function() {
									Ext.each(fields, function(field) {
										if(store.query('name', field.name).getCount() < 1) {
											var RecordType = store.recordType;
							                var record = new RecordType({
							                    name: field.name,
							                    length: field.length,
							                    precision: field.precision
							                });
							                store.insert(0, record);
										}
									});
								});
								answerDialog.on('addAll', function() {
									Ext.each(fields, function(field) {
										var RecordType = store.recordType;
						                var record = new RecordType({
						                    name: field.name,
						                    length: field.length,
						                    precision: field.precision
						                });
						                store.insert(0, record);
									});
								});
								answerDialog.on('clearAddAll', function() {
									store.removeAll();
									
									Ext.each(fields, function(field) {
										var RecordType = store.recordType;
						                var record = new RecordType({
						                    name: field.name,
						                    length: field.length,
						                    precision: field.precision
						                });
						                store.insert(0, record);
									});
								});
								answerDialog.show();
							} else {
								Ext.each(fields, function(field) {
									var RecordType = store.recordType;
					                var record = new RecordType({
					                    name: field.name,
					                    length: field.length,
					                    precision: field.precision
					                });
					                store.insert(0, record);
								});
							}
						},
						failure: function() {
							alert('与服务器交互失败！');
						}
					});
				}
			},{
				text: '列映射'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '字段名称', dataIndex: 'name', width: 150, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}, {
				header: '改名成', dataIndex: 'rename', width: 150, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}, {
				header: '长度', dataIndex: 'length', width: 70, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}, {
				header: '精度', dataIndex: 'precision', width: 70, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}],
			store: store
		});
		
		var deleteStore = new Ext.data.JsonStore({
			fields: ['name'],
			data: Ext.decode(cell.getAttribute('remove') || Ext.encode([]))
		});
		
		var deleteGrid = new Ext.grid.EditorGridPanel({
			title: '移除',
			tbar: [{
				text: '获取移除的字段', handler: function() {
					var stepName = cell.getAttribute('label');
					
					var enc = new mxCodec(mxUtils.createXmlDocument());
					var node = enc.encode(graph.getModel());
					var graphXml = mxUtils.getPrettyXml(node);
					
					Ext.Ajax.request({
						url: GetUrl('step/getFields.do'),
						params: {stepName: stepName, graphXml: graphXml},
						success: function(response, opts) {
							var fields = Ext.decode(response.responseText);
							if(fields.length == 0) return;
							
							if(deleteStore.getCount() > 0) {
								var answerDialog = new AnswerDialog({has: deleteStore.getCount(), found: fields.length});
								answerDialog.on('addNew', function() {
									Ext.each(fields, function(field) {
										if(deleteStore.query('name', field.name).getCount() < 1) {
											var RecordType = deleteStore.recordType;
							                var record = new RecordType({
							                    name: field.name
							                });
							                deleteStore.insert(0, record);
										}
									});
								});
								answerDialog.on('addAll', function() {
									Ext.each(fields, function(field) {
										var RecordType = deleteStore.recordType;
						                var record = new RecordType({
						                    name: field.name
						                });
						                deleteStore.insert(0, record);
									});
								});
								answerDialog.on('clearAddAll', function() {
									deleteStore.removeAll();
									
									Ext.each(fields, function(field) {
										var RecordType = deleteStore.recordType;
						                var record = new RecordType({
						                    name: field.name
						                });
						                deleteStore.insert(0, record);
									});
								});
								answerDialog.show();
							} else {
								Ext.each(fields, function(field) {
									var RecordType = deleteStore.recordType;
					                var record = new RecordType({
					                    name: field.name
					                });
					                deleteStore.insert(0, record);
								});
							}
						},
						failure: function() {
							alert('与服务器交互失败！');
						}
					});
				}
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '字段名称', dataIndex: 'name', width: 150, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}],
			store: deleteStore
		});
		
		var metaStore = new Ext.data.JsonStore({
			fields: ['name', 'rename', 'type', 'length', 'precision', 'storage_type', 'conversion_mask', 'date_format_lenient', 
			         'date_format_locale', 'date_format_timezone', 'lenient_string_to_number', 'encoding', 'decimal_symbol', 'grouping_symbol', 'currency_symbol'],
			data: Ext.decode(cell.getAttribute('meta') || Ext.encode([]))
		});
		
		var metaGrid = new Ext.grid.EditorGridPanel({
			title: '元数据',
			tbar: [{
				text: '获取改变的字段', handler: function() {
					var stepName = cell.getAttribute('label');
					
					var enc = new mxCodec(mxUtils.createXmlDocument());
					var node = enc.encode(graph.getModel());
					var graphXml = mxUtils.getPrettyXml(node);
					
					Ext.Ajax.request({
						url: GetUrl('step/getFields.do'),
						params: {stepName: stepName, graphXml: graphXml},
						success: function(response, opts) {
							var fields = Ext.decode(response.responseText);
							if(fields.length == 0) return;
							
							if(metaStore.getCount() > 0) {
								var answerDialog = new AnswerDialog({has: metaStore.getCount(), found: fields.length});
								answerDialog.on('addNew', function() {
									Ext.each(fields, function(field) {
										if(metaStore.query('name', field.name).getCount() < 1) {
											var RecordType = metaStore.recordType;
							                var record = new RecordType({
							                    name: field.name,
							                    type: field.type,
							                    length: field.length,
							                    precision: field.precision
							                });
							                metaStore.insert(0, record);
										}
									});
								});
								answerDialog.on('addAll', function() {
									Ext.each(fields, function(field) {
										var RecordType = metaStore.recordType;
						                var record = new RecordType({
						                    name: field.name,
						                    type: field.type,
						                    length: field.length,
						                    precision: field.precision
						                });
						                metaStore.insert(0, record);
									});
								});
								answerDialog.on('clearAddAll', function() {
									metaStore.removeAll();
									
									Ext.each(fields, function(field) {
										var RecordType = metaStore.recordType;
						                var record = new RecordType({
						                    name: field.name,
						                    type: field.type,
						                    length: field.length,
						                    precision: field.precision
						                });
						                metaStore.insert(0, record);
									});
								});
								answerDialog.show();
							} else {
								Ext.each(fields, function(field) {
									var RecordType = metaStore.recordType;
					                var record = new RecordType({
					                    name: field.name,
					                    type: field.type,
					                    length: field.length,
					                    precision: field.precision
					                });
					                metaStore.insert(0, record);
								});
							}
						},
						failure: function() {
							alert('与服务器交互失败！');
						}
					});
				}
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}, {
				header: '改名成', dataIndex: 'rename', width: 100, editor: new Ext.form.TextField({
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
		});
		
		var tab = new Ext.TabPanel({
			region: 'center',
			activeTab: 0,
			items: [selectAndUpdate, deleteGrid, metaGrid]
		});
		
		this.items = [form, tab];
		
		var bCancel = new Ext.Button({
			text: '取消', handler: function() {
				me.close();
			}
		});
		var bOk = new Ext.Button({
			text: '确定', handler: function() {
				graph.getModel().beginUpdate();
                try
                {
                	var formValues = form.getForm().getValues();
                	formValues.compatibilityMode = formValues.compatibilityMode ? true : false;
                	for(var fieldName in formValues) {
						var edit = new mxCellAttributeChange(cell, fieldName, formValues[fieldName]);
                    	graph.getModel().execute(edit);
					}
                }
                finally
                {
                    graph.getModel().endUpdate();
                }
                
				me.close();
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		SelectValuesDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SelectValues', SelectValuesDialog);
