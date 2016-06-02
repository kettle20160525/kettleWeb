JobEntryTrans = Ext.extend(Ext.Window, {
	title: '使用JavaScript脚本验证',
	width: 600,
	height: 430,
	closeAction: 'close',
	modal: true,
	layout: 'border',
	initComponent: function() {
		var me = this,
		graph = getActiveGraph().getGraph(), 
		cell = graph.getSelectionCell();
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			defaultType: 'textfield',
			border: false,
			labelWidth: 100,
			region: 'north',
			height: 50,
			labelAlign: 'right',
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-10',
				name: 'label',
				value: cell.getAttribute('label')
			}]
		});
		
		var transset = new Ext.form.FormPanel({
			title: '转换设置',
			bodyStyle: 'padding: 5px',
			labelWidth: 1,
			items: [{
				xtype: 'fieldset',
				items: [{
					xtype: 'compositefield',
					items: [{
						xtype: 'radio',
						boxLabel: '转换文件名',
						name: 'specification_method',
						inputValue: 'filename'
					}, {
						xtype: 'textfield',
						flex: 1,
						name: 'filename',
						value: cell.getAttribute('filename')
					}, {
						xtype: 'button',
						text: '选择...'
					}]
				}]
			},{
				xtype: 'fieldset',
				items: [{
					xtype: 'radio',
					boxLabel: '通过目录与名称指定转换',
					name: 'specification_method',
					inputValue: 'rep_name'
				}, {
					xtype: 'textfield',
					anchor: '-1'
				}, {
					xtype: 'compositefield',
					items: [{
						xtype: 'textfield',
						flex: 1
					}, {
						xtype: 'button',
						text: '选择...'
					}]
				}]
			},{
				xtype: 'fieldset',
				items: [{
					xtype: 'compositefield',
					items: [{
						xtype: 'radio',
						boxLabel: '通过引用指定转换',
						name: 'specification_method',
						inputValue: 'rep_ref'
					}, {
						xtype: 'textfield',
						flex: 1
					}, {
						xtype: 'button',
						text: '选择...'
					}]
				}]
			}, {
				xtype: 'button',
				text: '新建转换'
			}]
		});
		
		transset.on('afterrender', function() {
			var arrays = findItems(transset, 'name', 'specification_method');
			var rbChecked = function(rb) {
				var v = rb.inputValue;
				
				Ext.each(arrays, function(arrItem) {
					if(arrItem.getId() == rb.getId()) {
						arrItem.ownerCt.items.each(function(item) {
							if(item.getId() != arrItem.getId())
								item.enable();
						});
					} else {
						arrItem.ownerCt.items.each(function(item) {
							if(item.getId() != arrItem.getId())
								item.disable();
						});
					}
				});
			};
			
			var firstChecked = null;
			Ext.each(arrays, function(radio) {
				radio.on('check', function(rb, checked) {
					if(checked == true) rbChecked(rb);
				});
				if(radio.inputValue == cell.getAttribute('specification_method'))
					firstChecked = radio;
			});
			if(firstChecked != null)
				firstChecked.setValue(true);
		});
		
		var advance = new Ext.form.FormPanel({
			title: '高级',
			bodyStyle: 'padding: 15px',
			defaultType: 'textfield',
			labelWidth: 200,
			labelAlign: 'right',
			items: [{
				xtype: 'checkbox',
				fieldLabel: '复制上一步结果到位置参数',
				name: 'arg_from_previous',
				value: cell.getAttribute('arg_from_previous') == 'Y'
			},{
				xtype: 'checkbox',
				fieldLabel: '复制上一步结果到命名参数',
				name: 'params_from_previous',
				value: cell.getAttribute('params_from_previous') == 'Y'
			},{
				xtype: 'checkbox',
				fieldLabel: '执行每一个输入行',
				name: 'exec_per_row',
				value: cell.getAttribute('exec_per_row') == 'Y'
			},{
				xtype: 'checkbox',
				fieldLabel: '在执行前清除结果行列表',
				name: 'clear_rows',
				value: cell.getAttribute('clear_rows') == 'Y'
			},{
				xtype: 'checkbox',
				fieldLabel: '在执行前清除结果文件列表',
				name: 'clear_files',
				value: cell.getAttribute('clear_files') == 'Y'
			},{
				xtype: 'checkbox',
				fieldLabel: '在集群模式下运行这个转换',
				name: 'cluster',
				value: cell.getAttribute('cluster') == 'Y'
			},{
				xtype: 'checkbox',
				fieldLabel: 'Log remote execution locally',
				name: 'logging_remote_work',
				value: cell.getAttribute('logging_remote_work') == 'Y'
			},{
				xtype: 'textfield',
				fieldLabel: '远程从服务器',
				name: 'slave_server_name',
				value: cell.getAttribute('slave_server_name'),
				anchor: '-10'
			},{
				xtype: 'checkbox',
				fieldLabel: '等待远程转换执行结束',
				name: 'wait_until_finished',
				value: cell.getAttribute('wait_until_finished') == 'Y'
			},{
				xtype: 'checkbox',
				fieldLabel: '本地转换终止时远程转换也通知终止',
				name: 'follow_abort_remote',
				value: cell.getAttribute('follow_abort_remote') == 'Y'
			}]
		});
		
		var setlog = new Ext.form.FormPanel({
			title: '设置日志',
			bodyStyle: 'padding: 15px',
			defaultType: 'textfield',
			labelWidth: 100,
			labelAlign: 'right',
			items: [{
				xtype: 'checkbox',
				fieldLabel: '指定日志文件',
				name: 'set_logfile',
				value: cell.getAttribute('set_logfile') == 'Y'
			},{
				xtype: 'checkbox',
				fieldLabel: '添加到日志文件尾',
				name: 'set_append_logfile',
				value: cell.getAttribute('set_append_logfile') == 'Y'
			},{
				xtype: 'compositefield',
				anchor: '-10',
				fieldLabel: '日志文件名',
				items: [{
					xtype: 'textfield',
					flex: 1,
					name: 'logfile',
					value: cell.getAttribute('logfile')
				}, {
					xtype: 'button',
					text: '浏览...'
				}]
			},{
				xtype: 'checkbox',
				fieldLabel: '创建父文件夹',
				name: 'create_parent_folder',
				value: cell.getAttribute('create_parent_folder') == 'Y'
			},{
				xtype: 'textfield',
				fieldLabel: '日志文件后缀名',
				anchor: '-10',
				name: 'logext',
				value: cell.getAttribute('logext')
			},{
				xtype: 'checkbox',
				fieldLabel: '日志文件包含日期',
				name: 'add_date',
				value: cell.getAttribute('add_date') == 'Y'
			},{
				xtype: 'checkbox',
				fieldLabel: '日志文件包含时间',
				name: 'add_time',
				value: cell.getAttribute('add_time') == 'Y'
			},{
				xtype: 'textfield',
				fieldLabel: '日志级别',
				name: 'loglevel',
				value: cell.getAttribute('loglevel'),
				anchor: '-10'
			}]
		});
		
		var posparam = new Ext.grid.EditorGridPanel({
			title: '位置参数',
			tbar: [{
				iconCls: 'add', scope: this, handler: function() {
					var RecordType = this.getStore().recordType;
		            var p = new RecordType({
		                name: ''
		            });
		            this.stopEditing();
		            this.getStore().insert(0, p);
		            this.startEditing(0, 0);
				}
			},{
				iconCls: 'delete'
			}],
			
			columns: [new Ext.grid.RowNumberer(), {
				header: '位置参数', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
		            allowBlank: false
		        })
			}],
			
			store: new Ext.data.JsonStore({
				fields: ['name'],
				data: Ext.decode(cell.getAttribute('arguments') || Ext.encode([]))
			})
		});
		
		var namedparam = new Ext.grid.EditorGridPanel({
			title: '命名参数',
			tbar: [{
				text: '增加参数', scope: this, handler: function() {
					var RecordType = this.getStore().recordType;
		            var p = new RecordType({
		                name: ''
		            });
		            this.stopEditing();
		            this.getStore().insert(0, p);
		            this.startEditing(0, 0);
				}
			},{
				text: '删除参数'
			},{
				text: '获取参数'
			}, '-', {
				xtype: 'checkbox', boxLabel: '将所有参数值都传递到子转换'
			}],
			
			columns: [new Ext.grid.RowNumberer(), {
				header: '命名参数', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
		            allowBlank: false
		        })
			}, {
				header: '流列名', dataIndex: 'stream_name', width: 100, editor: new Ext.form.TextField({
		            allowBlank: false
		        })
			}, {
				header: '值', dataIndex: 'value', width: 100, editor: new Ext.form.TextField({
		            allowBlank: false
		        })
			}],
			
			store: new Ext.data.JsonStore({
				fields: ['name', 'stream_name', 'value'],
				data: Ext.decode(cell.getAttribute('parameters') || Ext.encode([]))
			})
		});
		
		var tab = new Ext.TabPanel({
			activeTab: 0,
			items: [transset, advance, setlog, posparam, namedparam]
		})
		
		this.items = [form, {
			region: 'center',
			border: false,
			bodyStyle: 'padding: 0 10px 10px 10px',
			layout: 'fit',
			items: tab
		}];
		
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
                	
                }
                finally
                {
                    graph.getModel().endUpdate();
                }
                
				me.close();
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		JobEntryTrans.superclass.initComponent.call(this);
	}
});

Ext.reg('TRANS', JobEntryTrans);
