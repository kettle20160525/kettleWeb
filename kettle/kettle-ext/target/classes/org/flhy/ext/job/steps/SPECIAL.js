JobEntrySpecial = Ext.extend(Ext.Window, {
	title: '作业定时调度',
	width: 400,
	height: 270,
	closeAction: 'close',
	modal: true,
	layout: 'fit',
	initComponent: function() {
		var me = this,
		graph = getActiveGraph().getGraph(), 
		cell = graph.getSelectionCell();
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			defaultType: 'textfield',
			labelWidth: 100,
			labelAlign: 'right',
			items: [{
				fieldLabel: '重复',
				xtype: 'checkbox',
				anchor: '-10',
				name: 'repeat',
				checked: cell.getAttribute('repeat') == 'Y'
			}, new Ext.form.ComboBox({
				fieldLabel: '类型',
				anchor: '-10',
				displayField: 'text',
				valueField: 'value',
				typeAhead: true,
		        mode: 'local',
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: new Ext.data.JsonStore({
		        	fields: ['value', 'text'],
		        	data: [{value: '0', text: '不需要定时'},
		        	       {value: '1', text: '时间间隔'},
		        	       {value: '2', text: '天'},
		        	       {value: '3', text: '周'},
		        	       {value: '4', text: '月'}]
			    }),
			    hiddenName: 'schedulerType',
				value: cell.getAttribute('schedulerType') || '0'
			}),{
				fieldLabel: '以秒计算的间隔',
				anchor: '-10',
				name: 'intervalSeconds',
				value: cell.getAttribute('intervalSeconds')
			}, {
				fieldLabel: '以分钟计算的间隔',
				anchor: '-10',
				name: 'intervalMinutes',
				value: cell.getAttribute('intervalMinutes')
			},{
				fieldLabel: '每天',
				xtype: 'compositefield',
				anchor: '-10',
				items: [{
					xtype: 'textfield',
					flex: 1,
					name: 'hour',
					value: cell.getAttribute('hour')
				},{
					xtype: 'textfield',
					flex: 1,
					name: 'minutes',
					value: cell.getAttribute('minutes')
				}]
			},{
				fieldLabel: '每周',
				anchor: '-10',
				name: 'weekDay',
				value: cell.getAttribute('weekDay')
			},{
				fieldLabel: '每月',
				anchor: '-10',
				name: 'dayOfMonth',
				value: cell.getAttribute('dayOfMonth')
			}]
		});
		
		this.items = form;
		
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
		
		JobEntrySpecial.superclass.initComponent.call(this);
	}
});

Ext.reg('SPECIAL', JobEntrySpecial);
