	
function GetUrl(url) {
		var comtextPath = Ext.fly('context-path').getValue();
		 var newurl =comtextPath + '/' +url;
		 return newurl;
 }

App = Ext.extend(Ext.util.Observable, {
	
	constructor: function(cfg) {
		Ext.apply(this, cfg);
	    this.addEvents({
	        'ready' : true,
	        'beforeunload' : true
	    });
	    Ext.onReady(this.initApp, this);
	},
	

	initApp: function() {
		this.createUI();
	},
	
	syncCall: function(cfg) {
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
	},
	
	createUI: function() {
		var main = this.mainPanel = new MainPanel({
			region: 'center',
			margins: '5 5 5 0'
		});
	    
		var libraryPanel = new LibraryPanel({
			split: true,
			region: 'west',
			width: 300,
			margins: '5 0 5 5'
		});

	    new Ext.Viewport({
			layout: 'border',
			items: [libraryPanel, main]
		});
	    
//	    main.load('reposity/variables.ktr');
//	    main.load('reposity/insert or update.ktr');
//	    main.load('reposity/transformations/JSON - read nested fields.ktr');
//	    main.load('reposity/transformations/SQL File Output - Basic example.ktr');
//	    main.load('reposity/transformations/Table Output - Tablename in field.ktr');
//	    main.load('reposity/transformations/Switch-Case - basic sample.ktr');
//	    main.load('reposity/transformations/JsonInput - read a file.ktr');
	    main.load('reposity/transformations/Add a checksum - Basic CRC32 example.ktr');
//	    main.load('reposity/transformations/Add a sequence - Basic example.ktr');
	    
	    setTimeout(function(){
	        Ext.get('loading').remove();
	        Ext.get('loading-mask').fadeOut({remove:true});
	    }, 250);
	},
	
	getMainPanel: function () {
		return this.mainPanel;
	}
	
});

var app = new App();



