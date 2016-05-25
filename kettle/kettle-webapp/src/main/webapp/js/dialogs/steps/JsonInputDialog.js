JsonInputDialog = Ext.extend(Ext.Window, {
	title: 'Json输入',
	width: 700,
	height: 600,
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
			labelWidth: 200,
			labelAlign: 'right',
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-40',
				name: 'label',
				value: cell.getAttribute('label')
			}]
		});
		
		var fieldset = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			labelWidth: 200,
			labelAlign: 'right',
			region: 'north',
			height: 150,
			items: [{
				xtype: 'fieldset',
				title: '从字段获取源',
				items: [{
					xtype: 'checkbox',
					fieldLabel: '源定义在一个字段里',
					checked: cell.getAttribute('IsInFields') == 'Y'
				},{
					xtype: 'checkbox',
					fieldLabel: '源是一个文件名',
					checked: cell.getAttribute('IsAFile') == 'Y'
				},{
					xtype: 'checkbox',
					fieldLabel: '以URL获取源',
					checked: cell.getAttribute('readurl') == 'Y'
				},{
					xtype: 'textfield',
					fieldLabel: '从字段获取源',
					anchor: '-30',
					value: cell.getAttribute('valueField')
				}]
			}]
		});
		
		var ext = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			labelAlign: 'right',
			region: 'north',
			labelWidth: 210,
			height: 95,
			border: false,
			items: [{
            	xtype: 'compositefield',
            	anchor: '-40',
            	fieldLabel: '文件或路径',
            	items: [{
    				xtype: 'compositefield',
    				flex: 1,
    				items: [{
    					xtype: 'textfield',
    					flex: 1
    				}, {
    					xtype: 'button', text: '新建', handler: function() {
    						var databaseDialog = new DatabaseDialog({database: cell.getAttribute('connection')});
    						databaseDialog.show();
    					}
    				}, {
    					xtype: 'button', text: '浏览', handler: function() {
    						var databaseDialog = new DatabaseDialog();
    						databaseDialog.show();
    					}
    				}]
    			}]
	        }, {
	        	xtype: 'textfield',
            	anchor: '-40',
            	fieldLabel: '正则表达式'
	        }, {
	        	xtype: 'textfield',
            	anchor: '-40',
            	fieldLabel: '正则表达式(排除)'
	        }]
		});
		
		var selectedFiles = new Ext.grid.EditorGridPanel({
			title: '选中的文件',
			region :'center',
			tbar: [{
				iconCls: 'add', handler: function() {
					var RecordType = grid.getStore().recordType;
	                var p = new RecordType({
	                    name: '',
	                    type: '',
	                    format: '',
	                    length: 100
	                });
	                grid.stopEditing();
	                grid.getStore().insert(0, p);
	                grid.startEditing(0, 0);
				}
			},{
				iconCls: 'delete'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '文件/路径', dataIndex: 'name', width: 300, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}, {
				header: '通配符', dataIndex: 'filemask', width: 70, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}, {
				header: '通配符(排除)', dataIndex: 'exclude_filemask', width: 70, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '要求', dataIndex: 'file_required', width: 60, renderer: function(v)
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
				header: '包含子目录', dataIndex: 'include_subfolders', width: 80, renderer: function(v)
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
			store: new Ext.data.JsonStore({
				fields: ['name', 'filemask', 'exclude_filemask', 'file_required', 'include_subfolders'],
				data: Ext.decode(cell.getAttribute('file') || Ext.encode([]))
			})
		});
		
		var file = new Ext.Panel({
			layout: 'border',
			title: '文件',
			defaults: {border: false},
			items: [fieldset, {
				region: 'center',
				layout: 'border',
				items: [ext, {
					region: 'center',
					border: false,
					bodyStyle: 'padding: 0px 50px 5px 120px',
					layout: 'fit',
					items: selectedFiles
				}]
			}]
		});
		
		var content = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			labelWidth: 200,
			labelAlign: 'right',
			title: '内容',
			items: [{
				xtype: 'fieldset',
				title: '设置',
				items: [{
					xtype: 'checkbox',
					fieldLabel: '忽略空文件',
					checked: cell.getAttribute('IsIgnoreEmptyFile') == 'Y'
				},{
					xtype: 'checkbox',
					fieldLabel: '如果没有文件不进行报错',
					checked: cell.getAttribute('doNotFailIfNoFile') == 'Y'
				},{
					xtype: 'checkbox',
					fieldLabel: '忽略不完整的路径',
					checked: cell.getAttribute('ignoreMissingPath') == 'Y'
				},{
					xtype: 'textfield',
					fieldLabel: '限制',
					anchor: '-30',
					value: cell.getAttribute('limit')
				}]
			},{
				xtype: 'fieldset',
				title: '附加字段',
				items: [{
					xtype: 'checkbox',
					fieldLabel: '在输出中包含文件名',
					checked: cell.getAttribute('include') == 'Y'
				},{
					xtype: 'textfield',
					fieldLabel: '包含文件名的字段名',
					anchor: '-30',
					value: cell.getAttribute('include_field')
				},{
					xtype: 'checkbox',
					fieldLabel: '在输出中包含行数',
					checked: cell.getAttribute('rownum') == 'Y'
				},{
					xtype: 'textfield',
					fieldLabel: '包含行数的字段名',
					anchor: '-30',
					value: cell.getAttribute('rownum_field')
				}]
			},{
				xtype: 'fieldset',
				title: '增加到结果文件名',
				items: [{
					xtype: 'checkbox',
					fieldLabel: '添加文件名',
					checked: cell.getAttribute('addresultfile') == 'Y'
				}]
			}]
		});
		
		var column = new Ext.grid.EditorGridPanel({
			title: '字段',
			tbar: [{
				iconCls: 'add', handler: function() {
					var RecordType = grid.getStore().recordType;
	                var p = new RecordType({
	                    name: '',
	                    type: '',
	                    format: '',
	                    length: 100
	                });
	                grid.stopEditing();
	                grid.getStore().insert(0, p);
	                grid.startEditing(0, 0);
				}
			},{
				iconCls: 'delete'
			}],
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}, {
				header: '路径', dataIndex: 'path', width: 100, editor: new Ext.form.TextField({
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
				header: '货币', dataIndex: 'currency', width: 100, editor: new Ext.form.TextField()
			},{
				header: '十进制', dataIndex: 'decimal', width: 100, editor: new Ext.form.TextField()
			},{
				header: '组', dataIndex: 'group', width: 100, editor: new Ext.form.TextField()
			},{
				header: '去除空字符的方式', dataIndex: 'trim_type', width: 100, renderer: function(v)
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
				header: '重复', dataIndex: 'repeat', width: 80, renderer: function(v)
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
			store: new Ext.data.JsonStore({
				fields: ['name', 'path', 'type', 'format', 'length', 'precision', 'currency', 'decimal', 'group', 'trim_type', 'repeat'],
				data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
			})
		});
		
		var otherOutputColumn = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			labelWidth: 200,
			labelAlign: 'right',
			title: '其他输出字段',
			items: [{
				xtype: 'textfield',
				fieldLabel: '文件名字段',
				anchor: '-30',
				value: cell.getAttribute('shortFileFieldName')
			},{
				xtype: 'textfield',
				fieldLabel: '扩展名字段',
				anchor: '-30',
				value: cell.getAttribute('extensionFieldName')
			},{
				xtype: 'textfield',
				fieldLabel: '路径字段',
				anchor: '-30',
				value: cell.getAttribute('pathFieldName')
			},{
				xtype: 'textfield',
				fieldLabel: '文件大小字段',
				anchor: '-30',
				value: cell.getAttribute('sizeFieldName')
			},{
				xtype: 'textfield',
				fieldLabel: '是否为隐藏文件字段',
				anchor: '-30',
				value: cell.getAttribute('hiddenFieldName')
			},{
				xtype: 'textfield',
				fieldLabel: '最后修改时间字段',
				anchor: '-30',
				value: cell.getAttribute('lastModificationTimeFieldName')
			},{
				xtype: 'textfield',
				fieldLabel: 'Uri字段',
				anchor: '-30',
				value: cell.getAttribute('uriNameFieldName')
			},{
				xtype: 'textfield',
				fieldLabel: 'Root Uri字段',
				anchor: '-30',
				value: cell.getAttribute('rootUriNameFieldName')
			}]
		});
		
		var tab = new Ext.TabPanel({
			region: 'center',
			activeTab: 0,
			items: [file, content, column, otherOutputColumn]
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
		
		JsonInputDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('JsonInput', JsonInputDialog);
