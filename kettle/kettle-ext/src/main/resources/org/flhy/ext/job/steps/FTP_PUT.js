JobEntryFTP_PUT = Ext.extend(Ext.Window, {
	title: 'FTP上传',
	width: 700,
	height: 550,
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
			title: '一般',
			bodyStyle: 'padding: 20px 10px',
			labelWidth: 150,
			labelAlign: 'right',
			defaultType: 'textfield',
			items: [{
				fieldLabel: 'FTP服务器名称/IP地址',
				anchor: '-10',
				name: 'ftpnameandipaddress',
				value: cell.getAttribute('partitioning_field')
			}, 
			{
				fieldLabel: '端口',
				anchor: '-10',
				name: 'partitioning_field',
				value: cell.getAttribute('partitioning_field')
			},
			{
				fieldLabel: '用户名',
				anchor: '-10',
				name: 'partitioning_field',
				value: cell.getAttribute('partitioning_field')
			},
			{
				fieldLabel: '密码',
				anchor: '-10',
				name: 'partitioning_field',
				value: cell.getAttribute('partitioning_field')
			},
			{
				fieldLabel: '代理主机',
				anchor: '-10',
				name: 'partitioning_field',
				value: cell.getAttribute('partitioning_field')
			},
			{
				fieldLabel: '代理端口',
				anchor: '-10',
				name: 'partitioning_field',
				value: cell.getAttribute('partitioning_field')
			},
			{
				fieldLabel: '代理用户名',
				anchor: '-10',
				name: 'partitioning_field',
				value: cell.getAttribute('partitioning_field')
			},
			{
				fieldLabel: '代理密码',
				anchor: '-10',
				name: 'partitioning_field',
				value: cell.getAttribute('partitioning_field')
			},
			{
				xtype: 'checkbox',
				fieldLabel: '二进制模式？',
				name: 'use_batch',
				checked: cell.getAttribute('use_batch') == 'Y'
			},
			{
				fieldLabel: '超时',
				anchor: '-10',
				name: 'partitioning_field',
				value: cell.getAttribute('partitioning_field')
			},
			{
				xtype: 'checkbox',
				fieldLabel: '使用活动的FTP连接？',
				name: 'use_batch',
				checked: cell.getAttribute('use_batch') == 'Y'
			},
			{
				xtype: 'textfield',
				fieldLabel: '控制编码',
				anchor: '-30',
				value: cell.getAttribute('shortFileFieldName')
			}
			]
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
			title: '文件',
			bodyStyle: 'padding: 15px',
			defaultType: 'textfield',
			labelWidth: 200,
			labelAlign: 'right',
			items: [
					{
						fieldLabel: '本地目录',
						anchor: '-10',
						name: 'partitioning_field',
						value: cell.getAttribute('partitioning_field')
					},
					{
						fieldLabel: '通配符(正则表达式)',
						anchor: '-10',
						name: 'partitioning_field',
						value: cell.getAttribute('partitioning_field')
					},
					{
						xtype: 'checkbox',
						fieldLabel: '上传文件后删除本地文件？',
						name: 'use_batch',
						checked: cell.getAttribute('use_batch') == 'Y'
					},
					{
						xtype: 'checkbox',
						fieldLabel: '不覆盖本地文件？',
						name: 'use_batch',
						checked: cell.getAttribute('use_batch') == 'Y'
					},
					{
						fieldLabel: '远程目录',
						anchor: '-10',
						name: 'partitioning_field',
						value: cell.getAttribute('partitioning_field')
					}
			]
		});
		
		var setlog = new Ext.form.FormPanel({
			title: 'Socks代理',
			bodyStyle: 'padding: 15px',
			defaultType: 'textfield',
			labelWidth: 100,
			labelAlign: 'right',
			items: [{
				xtype: 'textfield',
				fieldLabel: '主机',
				name: 'set_logfile',
				value: cell.getAttribute('set_logfile') 
			},{
				xtype: 'textfield',
				fieldLabel: '端口',
				name: 'set_append_logfile',
				value: cell.getAttribute('set_append_logfile') 
			},{
				xtype: 'textfield',
				fieldLabel: '用户名',
				name: 'set_append_logfile',
				value: cell.getAttribute('set_append_logfile') 
			},
			{
				xtype: 'textfield',
				fieldLabel: '密码',
				name: 'set_append_logfile',
				value: cell.getAttribute('set_append_logfile') 
			}
			 ]
		});
		
		var tab = new Ext.TabPanel({
			activeTab: 0,
			items: [transset, advance, setlog]
		});
		
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
		
		JobEntryFTP_PUT.superclass.initComponent.call(this);
	}
});

Ext.reg('FTP_PUT', JobEntryFTP_PUT);
