KettleFileRepositoryDialog = Ext.extend(Ext.Window, {
	width: 400,
	height: 220,
	modal: true,
	title: '文件资源库设置',
	layout: 'fit',
	plain: true,
	
	initComponent: function() {
		this.addFlag = true;
		
		var basedir = this.basedir = new Ext.form.TextField({
			flex: 1
		});
		
		var readOnlyRadio = this.readOnlyRadio = new Ext.form.Checkbox({
			fieldLabel: '只读资源库？'
		});
		
		var hideRadio = this.hideRadio = new Ext.form.Checkbox({
			fieldLabel: '不显示隐藏文件'
		});
		
		var nameField = this.nameField = new Ext.form.TextField({
			fieldLabel: '名称',
			anchor: '-10'
		});
		
		var descField = this.descField = new Ext.form.TextField({
			fieldLabel: '描述',
			anchor: '-10'
		});
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 10px',
			labelWidth: 90,
			border: false,
			labelAlign: 'right',
			items: [{
				xtype: 'compositefield',
				fieldLabel: '根目录',
				anchor: '-10',
				items: [basedir, {
					xtype: 'button',
					text: '浏览...'
				}]
			}, readOnlyRadio, hideRadio, nameField, descField]
		});
		
		var me = this;
		this.items = form;
		this.bbar = ['->', {
			text: '确定', handler: function() {
				Ext.Ajax.request({
					url: GetUrl('repository/add.do'),
					method: 'POST',
					params: {reposityInfo: Ext.encode(me.getValue()), add: me.addFlag},
					success: function(response) {
						var reply = Ext.decode(response.responseText);
						if(reply.success) {
							me.fireEvent('create', me);
						} else {
							Ext.Msg.alert(reply.title, reply.message);
						}
					}
			   });
			}
		}, {
			text: '取消', handler: function() {
				me.close();
			}
		}]
		
		KettleFileRepositoryDialog.superclass.initComponent.call(this);
		this.addEvents('create');
	},
	
	initData: function(meta) {
		this.addFlag = false;
		
		this.nameField.setValue(meta.name);
		this.descField.setValue(meta.description);
		
		this.basedir.setValue(meta.extraOptions.basedir);
		this.readOnlyRadio.setValue(meta.extraOptions.readOnly);
		this.hideRadio.setValue(meta.extraOptions.hidingHidden);
	},
	
	getValue: function(meta) {
		return {
			name: this.nameField.getValue(),
			description: this.descField.getValue(),
			type: 'KettleFileRepository',
			extraOptions: {
				basedir: this.basedir.getValue(),
				readOnly: this.readOnlyRadio.getValue(),
				hidingHidden: this.hideRadio.getValue()
			}
		};
	}
});

Ext.reg('KettleFileRepository', KettleFileRepositoryDialog);