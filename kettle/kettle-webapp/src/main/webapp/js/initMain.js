var activeGraph = null;
Ext.onReady(function() {
	var tabPanel = new Ext.TabPanel({
		id: 'TabPanel',
		region: 'center',
		margins: '5 5 5 0',
		plain: true
	});
	
	var guidePanel = new GuidePanel({
		id: 'GuidePanel',
		split: true,
		region: 'west',
		width: 300,
		margins: '5 0 5 5'
	});
	
	tabPanel.on('tabchange', function(me, item) {
		activeGraph = item;
		guidePanel.activeCom(item.iconCls);
	});
	

    new Ext.Viewport({
		layout: 'border',
		items: [guidePanel, tabPanel]
	});
    
//    guidePanel.openFile('variables.ktr');
//    guidePanel.openFile('insert or update.ktr');
//    guidePanel.openFile('Table Output - Tablename in field.ktr');
//    guidePanel.openFile('transformations/JSON - read nested fields.ktr');
//    guidePanel.openFile('transformations/SQL File Output - Basic example.ktr');
//    guidePanel.openFile('transformations/Table Output - Tablename in field.ktr');
//    guidePanel.openFile('transformations/Switch-Case - basic sample.ktr');
//    guidePanel.openFile('transformations/JsonInput - read a file.ktr');
//    guidePanel.openFile('transformations/Add a checksum - Basic CRC32 example.ktr');
//    guidePanel.openFile('transformations/Add a sequence - Basic example.ktr');
    
//    guidePanel.openFile('jobs/arguments/Set arguments on a transformation.kjb');
    
    setTimeout(function(){
        Ext.get('loading').remove();
        Ext.get('loading-mask').fadeOut({remove:true});
    }, 250);
    
//   var FtpPut = new JobEntryFTP_PUT();
//	FtpPut.show();
});

function syncCall(cfg) {
	var conn = null;
	try {
		conn = new XMLHttpRequest();
    } catch(e) {
        for (var i = Ext.isIE6 ? 1 : 0; i < activeX.length; ++i) {
            try {
            	conn = new ActiveXObject(activeX[i]);
                break;
            } catch(e) {
            	
            }
        }
    }
    var jsonData = cfg.params || {};
    var p = Ext.isObject(jsonData) ? Ext.urlEncode(jsonData) : jsonData;
    
    var url = cfg.url;
    url = Ext.urlAppend(url, p);
    
    conn.open(cfg.method || 'POST', url, false);
    conn.send(null);
    if (conn.status == "200") {  
    	return conn.responseText;  
    }  
    return null;
}

var loadCache = new Ext.util.MixedCollection();
function loadPluginScript(pluginId) {
	if(!pluginId) return;
	
	if(!loadCache.containsKey(pluginId)) {
		var oHead = document.getElementsByTagName('HEAD').item(0);
	    var oScript= document.createElement("script");
	    oScript.type = "text/javascript";
	    oScript.src = GetUrl(pluginId + '.js2');
	    oHead.appendChild( oScript ); 
		
		loadCache.add(pluginId, 1);
	}
}

function findItems(c, name, v) {
	var arrays = [];
	if(c.items) {
		c.items.each(function(t) {
			if(t[name] == v)
				arrays.push(t);
			Ext.each(findItems(t, name, v), function(e) {
				arrays.push(e);
			});
		});
	}
	return arrays;
}

function GetUrl(url) {
	var contextPath = Ext.fly('context-path').getValue();
	var newurl = contextPath + '/' + url;
	return newurl;
}

function getActiveGraph() {
	return activeGraph;
}

function decodeResponse(response, cb, opts) {
	try {
		var resinfo = Ext.decode(response.responseText);
		if(resinfo.success) {
			cb(resinfo);
		} else {
			Ext.Msg.show({
			   title: resinfo.title,
			   msg: resinfo.message,
			   buttons: Ext.Msg.OK,
			   icon: Ext.MessageBox.ERROR
			});
		}
		Ext.getBody().unmask();
	} catch(e) {
		Ext.getBody().unmask();
		alert('处理响应信息发生异常！');
	}
}

function failureResponse(response) {
	Ext.getBody().unmask();
	if(response.status == 0 && !response.responseText) {
		Ext.Msg.show({
		   title: '系统提示',
		   msg: '服务器繁忙或宕机，请确认服务器状态！',
		   buttons: Ext.Msg.OK,
		   icon: Ext.MessageBox.WARNING
		});
	} else if(response.status == 500) {
		Ext.Msg.show({
		   title: '系统提示',
		   msg: '系统发生错误！错误信息：' + response.statusText,
		   buttons: Ext.Msg.OK,
		   icon: Ext.MessageBox.ERROR
		});
	}
}

var cellLabelChanged = mxGraph.prototype.cellLabelChanged;
mxGraph.prototype.cellLabelChanged = function(cell, value, autoSize)
{
	var tmp = cell.value.cloneNode(true);
	tmp.setAttribute('label', value);
	value = tmp;
	
	cellLabelChanged.apply(this, arguments);
};
var convertValueToString = mxGraph.prototype.convertValueToString;
mxGraph.prototype.convertValueToString = function(cell)
{
	var label = cell.getAttribute('label');
	if(label)
		return decodeURIComponent(label);
	return label;
};
mxPopupMenu.prototype.zIndex = 100000;

mxGraph.prototype.isHtmlLabel = function(	cell	) {
	return true;
}

function NoteShape()
{
	mxCylinder.call(this);
};
mxUtils.extend(NoteShape, mxCylinder);
NoteShape.prototype.size = 10;
NoteShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
	var s = Math.min(w, Math.min(h, mxUtils.getValue(this.style, 'size', this.size)));

	if (isForeground)
	{
		path.moveTo(w - s, 0);
		path.lineTo(w - s, s);
		path.lineTo(w, s);
		path.end();
	}
	else
	{
		path.moveTo(0, 0);
		path.lineTo(w - s, 0);
		path.lineTo(w, s);
		path.lineTo(w, h);
		path.lineTo(0, h);
		path.lineTo(0, 0);
		path.close();
		path.end();
	}
};

mxCellRenderer.prototype.defaultShapes['note'] = NoteShape;

NoteShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
                                   new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                                   new mxConnectionConstraint(new mxPoint(0.75, 0), true),
 	              		 new mxConnectionConstraint(new mxPoint(0, 0.25), true),
 	              		 new mxConnectionConstraint(new mxPoint(0, 0.5), true),
 	              		 new mxConnectionConstraint(new mxPoint(0, 0.75), true),
 	            		 new mxConnectionConstraint(new mxPoint(1, 0.25), true),
 	            		 new mxConnectionConstraint(new mxPoint(1, 0.5), true),
 	            		 new mxConnectionConstraint(new mxPoint(1, 0.75), true),
 	            		 new mxConnectionConstraint(new mxPoint(0.25, 1), true),
 	            		 new mxConnectionConstraint(new mxPoint(0.5, 1), true),
 	            		 new mxConnectionConstraint(new mxPoint(0.75, 1), true)];

KettleForm = Ext.extend(Ext.form.FormPanel, {
	labeWidth: 100,
	labelAlign: 'right',
	defaultType: 'textfield'
});
Ext.reg('KettleForm', KettleForm);

KettleDialog = Ext.extend(Ext.Window, {
	modal: true,
	layout: 'border',
	closeAction: 'close',
	defaults: {border: false},
	
	initComponent: function() {
		var graph = getActiveGraph().getGraph(), cell = graph.getSelectionCell(), me = this;
		
		var form = new KettleForm({
			bodyStyle: 'padding: 10px',
			region: 'north',
			height: 35,
			labelWidth: 100,
			items: [{
				fieldLabel: '步骤名称',
				anchor: '-40',
				name: 'label',
				value: cell.getAttribute('label')
			}]
		});
		
		this.items = [form, {
			region: 'center',
			bodyStyle: 'padding: 5px',
			layout: 'fit',
			items: this.fitItems
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
                	var values = me.getValues();
                	for(var name in values) {
						var edit = new mxCellAttributeChange(cell, name, values[name]);
                    	graph.getModel().execute(edit);
					}
                	
                } finally
                {
                    graph.getModel().endUpdate();
                }
                
				me.close();
			}
		});
		
		this.bbar = ['->', bCancel, bOk];
		
		KettleDialog.superclass.initComponent.call(this);
		
	},
	
	getValues: function() {
		return {};
	}
	
});

KettleTabDialog = Ext.extend(KettleDialog, {
	initComponent: function() {
		
		this.fitItems = new Ext.TabPanel({
			region: 'center',
			activeTab: 0,
			items: this.tabItems
		});
		
		KettleTabDialog.superclass.initComponent.call(this);
		
	}
	
});




JobEntryFTP_PUT = Ext.extend(Ext.Window, {
	title: 'FTP上传',
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
		ext.
		var transset = new Ext.form.FormPanel({
			title: '一般',
			bodyStyle: 'padding: 5px',
			labelWidth: 1,
			items: [{
				xtype: 'fieldset',
				items: [{
					xtype: 'compositefield',
					items: [{
						xtype: 'textfield',
						fieldLabel: '日志文件后缀名',
						anchor: '-10',
						name: 'logext',
						value: cell.getAttribute('logext')
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
			title: '文件',
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
			title: 'Socks代理',
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
		
		var tab = new Ext.TabPanel({
			activeTab: 0,
			items: [transset, advance, setlog]
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

Ext.reg('FTP_PUT', JobEntryFTP_PUT);

