SQLFileOutputDialog = Ext.extend(KettleTabDialog, {
	title: 'SQL 文件输出',
	width: 600,
	height: 650,
	initComponent: function() {
		var me = this, graph = getActiveGraph().getGraph(), cell = graph.getSelectionCell();
		
		var wConnection = new Ext.form.ComboBox({
			flex: 1,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
	        store: getActiveGraph().getDatabaseStore(),
			name: 'connection',
			value: cell.getAttribute('connection')
		});
		
		var onDatabaseCreate = function(dialog) {
			var root = graph.getDefaultParent();
			var databases = root.getAttribute('databases');
			var jsonArray = Ext.decode(databases);
			jsonArray.push(dialog.getValue());
			graph.getModel().beginUpdate();
            try
            {
				var edit = new mxCellAttributeChange(root, 'databases', Ext.encode(jsonArray));
            	graph.getModel().execute(edit);
            } finally
            {
                graph.getModel().endUpdate();
            }
			
            wConnection.setValue(dialog.getValue().name);
            dialog.close();
		};
		
		var wSchema = new Ext.form.TextField({ flex: 1, value: cell.getAttribute('schema')});
		var wTable = new Ext.form.TextField({ flex: 1, value: cell.getAttribute('table')});
		
		var wAddCreate = new Ext.form.Checkbox({ fieldLabel: '增加 创建表 语句', checked: cell.getAttribute('create') == 'Y' });
		var wTruncate = new Ext.form.Checkbox({ fieldLabel: '增加 清空表 语句', checked: cell.getAttribute('truncate') == 'Y' });
		var wStartNewLine = new Ext.form.Checkbox({ fieldLabel: '每个语句另起一行', checked: cell.getAttribute('startnewline') == 'Y' });
		var wFilename = new Ext.form.TextField({ fieldLabel: '文件名', flex: 1, value: cell.getAttribute('name')});
		var wCreateParentFolder = new Ext.form.Checkbox({ fieldLabel: '创建父目录', checked: cell.getAttribute('create_parent_folder') == 'Y' });
		var wDoNotOpenNewFileInit = new Ext.form.Checkbox({ fieldLabel: '启动时不创建文件', checked: cell.getAttribute('DoNotOpenNewFileInit') == 'Y' });
		
		var wExtension = new Ext.form.TextField({ fieldLabel: '扩展名', anchor: '-10', value: cell.getAttribute('extention')});
		var wAddStepnr = new Ext.form.Checkbox({ fieldLabel: '文件名中包含步骤号', checked: cell.getAttribute('split') == 'Y' });
		var wAddDate = new Ext.form.Checkbox({ fieldLabel: '文件名中包含日期', checked: cell.getAttribute('add_date') == 'Y' });
		var wAddTime = new Ext.form.Checkbox({ fieldLabel: '文件名中包含时间', checked: cell.getAttribute('add_time') == 'Y' });
		var wAppend = new Ext.form.Checkbox({ fieldLabel: '追加方式', checked: cell.getAttribute('append') == 'Y' });
		var wSplitEvery = new Ext.form.TextField({ fieldLabel: '每...行拆分', anchor: '-10', value: cell.getAttribute('splitevery')});
		var wAddToResult = new Ext.form.Checkbox({ fieldLabel: '将文件加入到结果文件中', checked: cell.getAttribute('addtoresult') == 'Y' });
		var wFormat = new Ext.form.ComboBox({
			fieldLabel: '日期格式',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('datetimeFormatStore'),
			value: cell.getAttribute('dateformat')
		});
		var wEncoding = new Ext.form.ComboBox({
			fieldLabel: '编码',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('availableCharsetsStore'),
			value: cell.getAttribute('encoding')
		});
		
		this.getValues = function(){
			return {
				connection: wConnection.getValue(),
				schema: wSchema.getValue(),
				table: wTable.getValue(),
				
				create: wAddCreate.getValue() ? "Y" : "N",
				truncate: wTruncate.getValue() ? "Y" : "N",
				startnewline: wStartNewLine.getValue() ? "Y" : "N",
				name: wFilename.getValue(),
				create_parent_folder: wCreateParentFolder.getValue() ? "Y" : "N",
				DoNotOpenNewFileInit: wDoNotOpenNewFileInit.getValue() ? "Y" : "N",
				extention: wExtension.getValue(),
				split: wAddStepnr.getValue() ? "Y" : "N",
				add_date: wAddDate.getValue() ? "Y" : "N",
				add_time: wAddTime.getValue() ? "Y" : "N",
				append: wAppend.getValue() ? "Y" : "N",
				splitevery: wSplitEvery.getValue(),
				addtoresult: wAddToResult.getValue() ? "Y" : "N",
								
				dateformat: wFormat.getValue(),
				encoding: wEncoding.getValue()
			};
		};
		
		this.tabItems = [{
			title: '一般',
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px 10px',
			labelWidth: 140,
			items: [{
				xtype: 'fieldset',
				title: '连接',
				items: [{
					xtype: 'compositefield',
					fieldLabel: '数据库连接',
					anchor: '-10',
					items: [wConnection, {
						xtype: 'button', text: '编辑...', handler: function() {
							var store = getActiveGraph().getDatabaseStore();
							store.each(function(item) {
								if(item.get('name') == wConnection.getValue()) {
									var databaseDialog = new DatabaseDialog();
									databaseDialog.on('create', onDatabaseCreate);
									databaseDialog.show(null, function() {
										databaseDialog.initDatabase(item.json);
									});
								}
							});
						}
					}, {
						xtype: 'button', text: '新建...', handler: function() {
							var databaseDialog = new DatabaseDialog();
							databaseDialog.on('create', onDatabaseCreate);
							databaseDialog.show();
						}
					}, {
						xtype: 'button', text: '向导...'
					}]
				},{
					fieldLabel: '目的模式',
					xtype: 'compositefield',
					anchor: '-10',
					items: [wSchema, {
						xtype: 'button', text: '浏览...', handler: function() {
							var store = getActiveGraph().getDatabaseStore();
							store.each(function(item) {
								if(item.get('name') == wConnection.getValue()) {
									me.getSQL(item.json, 'schema', wSchema);
									
								}
							});
						}
					}]
				},{
					fieldLabel: '目标表',
					xtype: 'compositefield',
					anchor: '-10',
					items: [wTable, {
						xtype: 'button', text: '浏览...', handler: function() {
							var store = getActiveGraph().getDatabaseStore();
							store.each(function(item) {
								if(item.get('name') == wConnection.getValue()) {
									me.getSQL(item.json, 'all', wSchema, wTable);
								}
							});
						}
					}]
				}]
			}, {
				xtype: 'fieldset',
				title: '输出文件',
				items: [wAddCreate, wTruncate, wStartNewLine, {
					xtype: 'compositefield',
					fieldLabel: '文件名',
					anchor: '-10',
					items: [wFilename,{
    					xtype: 'button',
    					text: '浏览...'
    				},{
    					xtype: 'button',
    					text: '显示文件夹'
    				}]
				}, wCreateParentFolder, wDoNotOpenNewFileInit, wExtension, wAddStepnr, wAddDate, wAddTime, wAppend, wSplitEvery, wAddToResult]
			}]
		},{
			title: '内容',
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px 10px',
			items: [wFormat, wEncoding]
		}];
		
		SQLFileOutputDialog.superclass.initComponent.call(this);
	},
	
	getSQL: function(dbInfo, objType, wSchema, wTable) {
		var dialog = new DatabaseExplorerDialog();
		dialog.on('select', function(node) {
			wSchema.setValue(node.attributes.schema || node.text);
			if(wTable) wTable.setValue(node.text);
			dialog.close();
		});
		dialog.show(null, function() {
			dialog.initDatabase(dbInfo, objType);
		});
	}
});

Ext.reg('SQLFileOutput', SQLFileOutputDialog);