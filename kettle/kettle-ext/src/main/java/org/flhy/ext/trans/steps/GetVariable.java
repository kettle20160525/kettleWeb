package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.getvariable.GetVariableMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("GetVariable")
@Scope("prototype")
public class GetVariable extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		GetVariableMeta getVariableMeta = (GetVariableMeta) stepMetaInterface;
		
		String fields = cell.getAttribute("fields");
		JSONArray jsonArray = JSONArray.fromObject(fields);
		String[] fieldName = new String[jsonArray.size()];
		String[] variableString = new String[jsonArray.size()];
		int[] fieldType = new int[jsonArray.size()];
		String[] fieldFormat = new String[jsonArray.size()];
		String[] currency = new String[jsonArray.size()];
		String[] decimal = new String[jsonArray.size()];
		String[] group = new String[jsonArray.size()];
		int[] fieldLength = new int[jsonArray.size()];
		int[] fieldPrecision = new int[jsonArray.size()];
		int[] trimType = new int[jsonArray.size()];
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			fieldName[i] = jsonObject.optString("name");
			variableString[i] = jsonObject.optString("variable");
			fieldType[i] = jsonObject.optInt("type");
			fieldFormat[i] = jsonObject.optString("format");
			currency[i] = jsonObject.optString("currency");
			decimal[i] = jsonObject.optString("decimal");
			group[i] = jsonObject.optString("group");
			fieldLength[i] = jsonObject.optInt("length", -1);
			fieldPrecision[i] = jsonObject.optInt("precision", -1);
			trimType[i] = ValueMeta.getTrimTypeByCode( jsonObject.optString("trim_type") );
		}
		getVariableMeta.setFieldName(fieldName);
		getVariableMeta.setVariableString(variableString);
		getVariableMeta.setFieldType(fieldType);
		getVariableMeta.setFieldFormat(fieldFormat);
		getVariableMeta.setCurrency(currency);
		getVariableMeta.setDecimal(decimal);
		getVariableMeta.setGroup(group);
		getVariableMeta.setFieldLength(fieldLength);
		getVariableMeta.setFieldPrecision(fieldPrecision);
		getVariableMeta.setTrimType(trimType);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		GetVariableMeta getVariableMeta = (GetVariableMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
		JSONArray jsonArray = new JSONArray();
		String[] fieldName = getVariableMeta.getFieldName();
		if(fieldName != null) {
			for(int i=0; i<fieldName.length; i++) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", fieldName[i]);
				jsonObject.put("variable", getVariableMeta.getVariableString()[i]);
				jsonObject.put("type", getVariableMeta.getFieldType()[i]);
				jsonObject.put("format", getVariableMeta.getFieldFormat()[i]);
				jsonObject.put("currency", getVariableMeta.getCurrency()[i]);
				jsonObject.put("decimal", getVariableMeta.getDecimal()[i]);
				jsonObject.put("group", getVariableMeta.getGroup()[i]);
				jsonObject.put("length", getVariableMeta.getFieldLength()[i]);
				jsonObject.put("precision", getVariableMeta.getFieldPrecision()[i]);
				jsonObject.put("trim_type", ValueMeta.getTrimTypeCode(getVariableMeta.getTrimType()[i]));
				jsonArray.add(jsonObject);
			}
		}
		e.setAttribute("fields", jsonArray.toString());
		
		return e;
	}

}
