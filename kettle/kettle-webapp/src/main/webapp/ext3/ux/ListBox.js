ListBox = Ext.extend(Ext.BoxComponent, {
	autoEl: {
		tag: 'select',
		multiple: 'multiple',
        size: 10
	},
	
	valueField: 'value',
	displayField: 'text',
	
	initComponent: function() {
		ListBox.superclass.initComponent.call(this);
		this.addEvents('valueChange');
	},
	afterRender: function() {
		var me = this;
		ListBox.superclass.afterRender.call(this);
		
		this.store.on('datachanged', function(s) {
			me.initStore();
		});
		me.initStore();
		
		this.el.on('change', function() {
			var dom = this.dom, v = dom.value, c=0;
			
			for (var i=0;i<dom.length;i++)
				if (dom.options[i].selected) c++;
			
			if(c > 1) {
				setTimeout(function() {
					dom.value = me.value;
				}, 5);
			} else {
				me.value = v;
				
				me.fireEvent('valueChange', v);
			}
			
			
		});
	},
	
	initStore: function() {
		var el = this.el, v = this.vaule || this.initialConfig.value, me = this;
		
		while(el.first())
			el.first().remove();
		
		this.store.each(function(rec) {
			var op = document.createElement('option');
			op.setAttribute('value', rec.get(me.valueField));
			op.appendChild(document.createTextNode(rec.get(me.displayField)));
			
			if(rec.get(me.valueField) == v){
				op.setAttribute('selected', 'selected');
				me.fireEvent('valueChange', v);
			}
			
			el.dom.appendChild(op);
		});
		
	},
	
	getValue: function() {
		return this.value;
	}
});