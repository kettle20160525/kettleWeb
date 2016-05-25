TextFieldDialog = Ext.extend(Ext.Window, {
	width: 300,
	height: 120,
	modal: true,
	layout: {
        type:  'hbox',
        align: 'middle'
    },
    closeAction: 'close',
	fieldLabel: '属性：',
	bodyStyle: 'padding: 15px;',
	
	initComponent: function() {
		var me = this;
		
		var tf = new Ext.form.TextField({
			flex: 1,
			value: this.value
		});
		
		this.items = [{
			xtype: 'label',
			text: this.fieldLabel
		}, tf];
		
		this.bbar = ['->',
		{
			text : '取消',
			handler : function() {
				me.close();
			}
		},
		{
			text : '确定',
			handler : function() {
				me.fireEvent('sure', tf.getValue());
				me.close();
			}
		}];
		
		TextFieldDialog.superclass.initComponent.call(this);
		this.addEvents('sure');
	}
});