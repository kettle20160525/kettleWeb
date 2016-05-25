EnterValueDialog = Ext.extend(Ext.Window, {
	width: 350,
	height: 250,
	layout: 'fit',
	modal: true,
	title: 'E输入一个值',
	initComponent: function() {
		var me = this;
		
		var combo = new Ext.form.ComboBox({
			fieldLabel: '类型',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('valueMetaStore'),
			hiddenName: 'type'
		});
		combo.on('change', function(cb, v) {
			var store = Ext.StoreMgr.get('valueFormatStore');
			store.baseParams.valueType = v;
			store.load();
		});
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			defaultType: 'textfield',
			labelWidth: 70,
			items: [combo,{
				fieldLabel: '值',
				anchor: '-10',
				name: 'text'
			},new Ext.form.ComboBox({
				fieldLabel: '转换格式',
				anchor: '-10',
				displayField: 'name',
				valueField: 'name',
				typeAhead: true,
		        mode: 'local',
		        forceSelection: true,
		        triggerAction: 'all',
		        selectOnFocus:true,
				store: Ext.StoreMgr.get('valueFormatStore'),
			    hiddenName: 'mask'
			}),{
				fieldLabel: '长度',
				anchor: '-10',
				name: 'length'
			},{
				fieldLabel: '精度',
				anchor: '-10',
				name: 'precision'
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
				var values = form.getForm().getValues();
				var vmad = ValueMetaAndData(values);
				me.fireEvent('sure', vmad);
				me.close();
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		EnterValueDialog.superclass.initComponent.call(this);
		this.addEvents('sure');
	}
});