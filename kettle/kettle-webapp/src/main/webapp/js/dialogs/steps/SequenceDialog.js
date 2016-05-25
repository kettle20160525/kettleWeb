SequenceDialog = Ext.extend(Ext.Window, {
	title: '增加序列',
	width: 600,
	height: 460,
	closeAction: 'close',
	modal: true,
	layout: 'fit',
	initComponent: function() {
		var me = this, 
			transGraph = getActiveTransGraph(),
			graph = transGraph.getGraph(), 
			cell = graph.getSelectionCell(), 
			store = transGraph.getDatabaseStore();
		
		var dbCheck = new Ext.form.Checkbox({
			fieldLabel: '使用DB来获取sequence?',
			name: 'use_database'
		});
		
		var check = new Ext.form.Checkbox({
			fieldLabel: '使用计数器来计算Sequence?',
			xtype: 'checkbox',
			name: 'use_counter'
		});
		
		this.on('afterrender', function() {
			dbCheck.setValue(cell.getAttribute('use_database') == 'Y');
			check.setValue(cell.getAttribute('use_counter') == 'Y');
		});
		
		var dbFieldset = new Ext.form.FieldSet({
			title: '使用数据库来生成序列',
			items: [dbCheck,{
				xtype: 'compositefield',
				fieldLabel: '数据库连接',
				items: [new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					flex: 1,
					typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: store,
					name: 'connection',
					value: cell.getAttribute('connection')
				}), {
					xtype: 'button', text: '编辑...', handler: function() {
						var databaseDialog = new DatabaseDialog({database: cell.getAttribute('connection')});
						databaseDialog.show();
					}
				}, {
					xtype: 'button', text: '新建...', handler: function() {
						var databaseDialog = new DatabaseDialog();
						databaseDialog.show();
					}
				}, {
					xtype: 'button',
					text: '向导...'
				}]
			}, {
            	xtype: 'compositefield',
            	fieldLabel: '模式名称',
            	items: [{
            		xtype: 'textfield',
            		flex: 1,
            		name: 'schema',
					value: cell.getAttribute('schema')
            	}, {
					xtype: 'button',
					text: '浏览'
				}]
            }, {
            	xtype: 'compositefield',
            	fieldLabel: 'Sequence名称',
            	items: [{
            		xtype: 'textfield',
            		flex: 1,
            		name: 'seqname',
					value: cell.getAttribute('seqname')
            	}, {
					xtype: 'button',
					text: '浏览'
				}]
            }]
		});
		
		var fieldset = new Ext.form.FieldSet({
			title: '使用转换计数器来生成序列',
			defaultType: 'textfield',
			defaults: {anchor: '-10'},
			items: [check, {
				fieldLabel: '计数器名称(可选)',
				name: 'counter_name',
				value: cell.getAttribute('counter_name')
			},{
				fieldLabel: '起始值',
				name: 'start_at',
				value: cell.getAttribute('start_at')
			},{
				fieldLabel: '增长值',
				name: 'increment_by',
				value: cell.getAttribute('increment_by')
			},{
				fieldLabel: '最大值',
				name: 'max_value',
				value: cell.getAttribute('max_value')
			}]
		});
		
		dbCheck.on('check', function(cb, checked) {
			if(checked) {
				check.setValue(false);
				
				fieldset.items.each(function(c) {
					if(c.getId() != check.getId())
						c.disable();
				});
				dbFieldset.items.each(function(c) {
					c.enable();
				});
			}
		});
		
		check.on('check', function(cb, checked) {
			if(checked) {
				dbCheck.setValue(false);
				
				dbFieldset.items.each(function(c) {
					if(c.getId() != dbCheck.getId())
						c.disable();
				});
				fieldset.items.each(function(c) {
					c.enable();
				});
			}
		});
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px 5px 15px 15px',
			defaultType: 'textfield',
			labelWidth: 170,
			labelAlign: 'right',
			defaults: {anchor: '-10'},
			items: [{
				fieldLabel: '步骤名称',
				name: 'label',
				value: cell.getAttribute('label')
			},{
				fieldLabel: '值的名称',
				name: 'valuename',
				value: cell.getAttribute('valuename')
			}, dbFieldset, fieldset]
		});
		
		this.items = [form];
		
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
                	formValues.use_database = formValues.use_database ? "Y" : "N";
                	formValues.use_counter = formValues.use_counter ? "Y" : "N";
                	
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
		
		SequenceDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('Sequence', SequenceDialog);
