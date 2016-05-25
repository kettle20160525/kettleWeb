package org.flhy.webapp.controller;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.flhy.ext.trans.TransDecoder;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.webapp.utils.SearchFieldsProgress;
import org.pentaho.di.core.Condition;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.step.StepMeta;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.w3c.dom.Document;

import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxUtils;
import com.mxgraph.view.mxGraph;

@Controller
@RequestMapping(value="/step")
public class StepController {

	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/inputOutputFields")
	protected void inputOutputFields(HttpServletRequest request, HttpServletResponse response, @RequestParam String stepName, @RequestParam String graphXml, @RequestParam boolean before) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		TransMeta transMeta = TransDecoder.decode(graph);
		
		StepMeta stepMeta = getStep(transMeta, stepName);
		SearchFieldsProgress op = new SearchFieldsProgress( transMeta, stepMeta, before );
		op.run();
		RowMetaInterface rowMetaInterface = op.getFields();
		
		JSONArray jsonArray = new JSONArray();
		for (int i = 0; i < rowMetaInterface.size(); i++) {
			ValueMetaInterface v = rowMetaInterface.getValueMeta(i);
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", v.getName());
			jsonObject.put("type", v.getTypeDesc());
			jsonObject.put("length", v.getLength() < 0 ? "-" : "" + v.getLength());
			jsonObject.put("precision", v.getPrecision() < 0 ? "-" : "" + v.getPrecision());
			jsonObject.put("origin", Const.NVL(v.getOrigin(), ""));
			jsonObject.put("storageType", ValueMeta.getStorageTypeCode(v.getStorageType()));
			jsonObject.put("conversionMask", Const.NVL(v.getConversionMask(), ""));
			jsonObject.put("currencySymbol", Const.NVL(v.getCurrencySymbol(), ""));
			jsonObject.put("decimalSymbol", Const.NVL(v.getDecimalSymbol(), ""));
			jsonObject.put("groupingSymbol", Const.NVL(v.getGroupingSymbol(), ""));
			jsonObject.put("trimType", ValueMeta.getTrimTypeDesc(v.getTrimType()));
			jsonObject.put("comments", Const.NVL(v.getComments(), ""));
			jsonArray.add(jsonObject);
		}
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	public StepMeta getStep(TransMeta transMeta, String label) {
		List<StepMeta> list = transMeta.getSteps();
		for(int i=0; i<list.size(); i++) {
			StepMeta step = list.get(i);
			if(label.equals(step.getName()))
				return step;
		}
		return null;
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/getFields")
	protected void inputOutputFields(HttpServletRequest request, HttpServletResponse response, @RequestParam String stepName, @RequestParam String graphXml) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		TransMeta transMeta = TransDecoder.decode(graph);
		RowMetaInterface rows = transMeta.getPrevStepFields( stepName );
		
		JSONArray jsonArray = new JSONArray();
		for(int i=0; i<rows.size(); i++) {
			ValueMetaInterface v = rows.getValueMeta( i );
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", Const.NVL( v.getName(), "" ));
			jsonObject.put("type", v.getTypeDesc());
			jsonObject.put("length", Integer.toString( v.getLength() ));
			jsonObject.put("precision", Integer.toString( v.getPrecision() ));
			jsonArray.add(jsonObject);
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/func")
	protected void func(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		JSONArray jsonArray = new JSONArray();
		for(int i=0; i<Condition.functions.length; i++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", Condition.functions[i]);
			jsonArray.add(jsonObject);
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
}
