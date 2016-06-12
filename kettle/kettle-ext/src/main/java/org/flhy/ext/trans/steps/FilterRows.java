package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Condition;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.exception.KettleValueException;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.row.ValueMetaAndData;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.core.row.value.ValueMetaBase;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.step.errorhandling.StreamInterface;
import org.pentaho.di.trans.steps.filterrows.FilterRowsMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("FilterRows")
@Scope("prototype")
public class FilterRows extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		FilterRowsMeta filterRowsMeta = (FilterRowsMeta) stepMetaInterface;
		
		List<StreamInterface> targetStreams = filterRowsMeta.getStepIOMeta().getTargetStreams();

		targetStreams.get(0).setSubject(cell.getAttribute("send_true_to"));
		targetStreams.get(1).setSubject(cell.getAttribute("send_false_to"));
		
		String conditionString = cell.getAttribute("condition");
		JSONObject jsonObject = JSONObject.fromObject(conditionString);
		filterRowsMeta.setCondition(decodeCondition(jsonObject));
	}
	
	private Condition decodeCondition(JSONObject jsonObject) throws KettleException {
		Condition condition = new Condition();
		condition.setNegated(jsonObject.optBoolean("negated"));
		condition.setOperator(jsonObject.optInt("operator"));

		JSONArray conditions = jsonObject.optJSONArray("conditions");
		if (conditions == null || conditions.size() == 0) {
			condition.setLeftValuename(jsonObject.optString("left_valuename"));
			condition.setFunction(jsonObject.optInt("func"));
			condition.setRightValuename(jsonObject.optString("right_valuename"));
			JSONObject right_exact = jsonObject.optJSONObject("right_exact");
			if (right_exact != null) {
				ValueMetaAndData exact = decodeValueMetaAndData(right_exact);
				condition.setRightExact(exact);
			}
		} else {
			for (int i = 0; i < conditions.size(); i++) {
				JSONObject jsonObject2 = conditions.getJSONObject(i);
				condition.addCondition(decodeCondition(jsonObject2));
			}
		}
		
		return condition;
	}
	
	public ValueMetaAndData decodeValueMetaAndData(JSONObject jsonObject) throws KettleValueException {
		ValueMetaAndData valueMetaAndData = new ValueMetaAndData();

		String valname = jsonObject.optString("name");
		int valtype = ValueMetaBase.getType(jsonObject.optString("type"));
		String text = jsonObject.optString("text");
		boolean isnull = jsonObject.optBoolean("isnull");
		int len = jsonObject.optInt("length", -1);
		int prec = jsonObject.optInt("precision", -1);
		
		String mask = jsonObject.optString("mask");

		ValueMeta valueMeta = new ValueMeta(valname, valtype);
		valueMeta.setLength(len);
		valueMeta.setPrecision(prec);
		if (mask != null) {
			valueMeta.setConversionMask(mask);
		}

		valueMetaAndData.setValueData(text);

		if (valtype != ValueMetaInterface.TYPE_STRING) {
			ValueMetaInterface originMeta = new ValueMeta(valname, ValueMetaInterface.TYPE_STRING);
			if (valueMeta.isNumeric()) {
				originMeta.setDecimalSymbol(".");
				originMeta.setGroupingSymbol(null);
				originMeta.setCurrencySymbol(null);
			}
			valueMetaAndData.setValueData(valueMeta.convertData(originMeta, Const.trim(text)));
		}

		if (isnull) {
			valueMetaAndData.setValueData(null);
		}
		
		valueMetaAndData.setValueMeta(valueMeta);
		
		return valueMetaAndData;
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		FilterRowsMeta filterRowsMeta = (FilterRowsMeta) stepMetaInterface;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		List<StreamInterface> targetStreams = stepMetaInterface.getStepIOMeta().getTargetStreams();
		e.setAttribute("send_true_to", targetStreams.get( 0 ).getStepname() );
		e.setAttribute("send_false_to", targetStreams.get( 1 ).getStepname() );
		
		Condition condition = filterRowsMeta.getCondition();
		if(condition != null) {
			e.setAttribute("condition", encodeCondition(condition).toString());
		}
		
		return e;
	}
	
	private JSONObject encodeCondition(Condition condition) throws KettleValueException {
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("negated", condition.isNegated());
		jsonObject.put("operator", condition.getOperator());


	    if ( condition.isAtomic() ) {
	    	jsonObject.put("left_valuename", condition.getLeftValuename());
	    	jsonObject.put("func", condition.getFunction());
	    	jsonObject.put("right_valuename", condition.getRightValuename());
	    	
	      if ( condition.getRightExact() != null ) {
	    	  ValueMetaAndData rightExact = condition.getRightExact();
	    	  jsonObject.put("right_exact", encodeValueMetaAndData(rightExact));
	      }
	    } else {
	    	
	    	JSONArray conditions = new JSONArray();
			for (int i = 0; i < condition.nrConditions(); i++) {
				Condition c = condition.getCondition(i);
				conditions.add(encodeCondition(c));
			}
			
			jsonObject.put("conditions", conditions);
	    }
	    
	    return jsonObject;
	}
	
	private JSONObject encodeValueMetaAndData(ValueMetaAndData valueMetaAndData) throws KettleValueException {
		JSONObject jsonObject = new JSONObject();
		ValueMetaInterface meta = valueMetaAndData.getValueMeta().clone();
	    meta.setDecimalSymbol( "." );
	    meta.setGroupingSymbol( null );
	    meta.setCurrencySymbol( null );

	    jsonObject.put("name", meta.getName());
	    jsonObject.put("type", meta.getTypeDesc());
	    jsonObject.put("text", meta.getCompatibleString( valueMetaAndData.getValueData() ));
	    jsonObject.put("length", meta.getLength());
	    jsonObject.put("precision", meta.getPrecision());
	    
	    jsonObject.put("isnull", meta.isNull( valueMetaAndData.getValueData() ));
	    jsonObject.put("mask", meta.getConversionMask());
	    
	    return jsonObject;
	}

}
