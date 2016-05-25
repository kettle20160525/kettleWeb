package org.flhy.webapp.controller;

import java.io.DataOutputStream;
import java.io.File;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.flhy.ext.App;
import org.flhy.ext.TransExecutor;
import org.flhy.ext.trans.TransDecoder;
import org.flhy.ext.trans.TransEncoder;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.webapp.utils.SearchFieldsProgress;
import org.pentaho.di.core.CheckResultInterface;
import org.pentaho.di.core.CheckResultSourceInterface;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.logging.LogLevel;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.core.vfs.KettleVFS;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.trans.TransExecutionConfiguration;
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
@RequestMapping(value="/graph")
public class TransGraphController {

	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/engineXml")
	protected void engineXml(HttpServletRequest request, HttpServletResponse response, @RequestParam String graphXml) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		TransMeta transMeta = TransDecoder.decode(graph);
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(transMeta.getXML());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/load")
	protected void load(HttpServletRequest request, HttpServletResponse response, @RequestParam String filename) throws Exception {
		String path = request.getSession().getServletContext().getRealPath("/");  
		File file = new File(path, filename);
		
		TransMeta transMeta = new TransMeta(file.getAbsolutePath());
		
		mxCodec codec = new mxCodec();
		mxGraph graph = TransEncoder.encode(transMeta);
		String graphXml = mxUtils.getPrettyXml(codec.encode(graph.getModel()));
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(graphXml);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/checkTrans")
	protected void checkTrans(HttpServletRequest request, HttpServletResponse response, @RequestParam String graphXml, @RequestParam boolean show_successful_results) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		TransMeta transMeta = TransDecoder.decode(graph);
		
		ArrayList<CheckResultInterface> remarks = new ArrayList<CheckResultInterface>();
		transMeta.checkSteps(remarks, false, null, transMeta, App.getInstance().getRepository(), App.getInstance().getMetaStore() );
		
		JSONArray jsonArray = new JSONArray();
		for (int i = 0; i < remarks.size(); i++) {
			CheckResultInterface cr = remarks.get(i);
			if (show_successful_results || cr.getType() != CheckResultInterface.TYPE_RESULT_OK) {
				JSONObject jsonObject = new JSONObject();

				CheckResultSourceInterface sourceMeta = cr.getSourceInfo();
				if (sourceMeta != null) {
					jsonObject.put("name", sourceMeta.getName());
				} else {
					jsonObject.put("name", "&lt;global&gt;");
				}

				jsonObject.put("type", cr.getType());
				jsonObject.put("typeDesc", cr.getTypeDesc());
				jsonObject.put("text", cr.getText());

				jsonArray.add(jsonObject);
			}
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/run")
	protected void run(HttpServletRequest request, HttpServletResponse response, @RequestParam String graphXml, @RequestParam String executionConfig) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		TransMeta transMeta = TransDecoder.decode(graph);
		
		String xml = XMLHandler.getXMLHeader() + transMeta.getXML();
		DataOutputStream dos = new DataOutputStream(KettleVFS.getOutputStream(transMeta.getFilename(), false));
		dos.write(xml.getBytes(Const.XML_ENCODING));
		dos.close();
		
		JSONObject jsonObject = JSONObject.fromObject(executionConfig);
		TransExecutionConfiguration executionConfiguration = new TransExecutionConfiguration();
		
		JSONObject executeMethod = jsonObject.optJSONObject("executeMethod");
		if(executeMethod.optInt("execMethod") == 1) {
			executionConfiguration.setExecutingLocally( true );
			executionConfiguration.setExecutingRemotely( false );
			executionConfiguration.setExecutingClustered( false );
		} else if(executeMethod.optInt("execMethod") == 2) {
			executionConfiguration.setExecutingLocally( false );
			executionConfiguration.setExecutingRemotely( true );
			executionConfiguration.setExecutingClustered( false );
			
			
			executionConfiguration.setRemoteServer( transMeta.findSlaveServer( executeMethod.optString("remoteServer")) );
			executionConfiguration.setPassingExport( executeMethod.containsKey("passingExport") );
		} else if(executeMethod.optInt("execMethod") == 3) {
			executionConfiguration.setExecutingLocally( true );
			executionConfiguration.setExecutingRemotely( false );
			executionConfiguration.setExecutingClustered( false );
		}
		
		JSONObject details = jsonObject.optJSONObject("details");
		executionConfiguration.setSafeModeEnabled( details.containsKey("safeModeEnabled") );
		executionConfiguration.setGatheringMetrics( details.containsKey("gatheringMetrics") );
		executionConfiguration.setClearingLog( details.containsKey("clearingLog") );
		executionConfiguration.setLogLevel( LogLevel.values()[details.optInt("logLevel")] );
		if (!Const.isEmpty(details.optString("replayDate"))) {
			SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
			try {
				executionConfiguration.setReplayDate(simpleDateFormat.parse(details.optString("replayDate")));
			} catch (ParseException e) {
				e.printStackTrace();
			}
		} else {
			executionConfiguration.setReplayDate(null);
		}
		
		executionConfiguration.getUsedVariables( transMeta );
		executionConfiguration.getUsedArguments( transMeta, App.getInstance().getArguments() );
		
		Map<String, String> map = new HashMap<String, String>();
		JSONArray parameters = jsonObject.optJSONArray("parameters");
		for(int i=0; i<parameters.size(); i++) {
			JSONObject param = parameters.getJSONObject(i);
			String paramName = param.optString("name");
			String paramValue = param.optString("value");
			String defaultValue = param.optString("default_value");
			if (Const.isEmpty(paramValue)) {
				paramValue = Const.NVL(defaultValue, "");
			}
			map.put( paramName, paramValue );
		}
		executionConfiguration.setParams(map);
		
		map = new HashMap<String, String>();
		JSONArray variables = jsonObject.optJSONArray("variables");
	    for ( int i = 0; i < variables.size(); i++ ) {
	    	JSONObject var = variables.getJSONObject(i);
	    	String varname = var.optString("var_name");
	    	String value = var.optString("var_value");
	      

	    	if ( !Const.isEmpty( varname ) ) {
	    		map.put( varname, value );
	    	}
	    }
	    executionConfiguration.setVariables( map );
	    
	    
	    TransExecutor transExecutor = TransExecutor.initExecutor(executionConfiguration, transMeta);
	    new Thread(transExecutor).start();
		HttpSession session = request.getSession();
        session.setAttribute(transExecutor.getExecutionId(), transExecutor);
		
	    jsonObject = new JSONObject();
        jsonObject.put("success", true);
        jsonObject.put("executionId", transExecutor.getExecutionId());
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonObject.toString());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/result")
	protected void result(HttpServletRequest request, HttpServletResponse response, @RequestParam String executionId) throws Exception {
		JSONObject jsonReply = new JSONObject();
		
		HttpSession session = request.getSession();
		TransExecutor transExecutor = (TransExecutor) session.getAttribute(executionId);
		
		jsonReply.put("finished", transExecutor.isFinished());
		if(transExecutor.isFinished()) {
			session.removeAttribute(executionId);
			
			jsonReply.put("stepMeasure", transExecutor.getStepMeasure());
			jsonReply.put("log", transExecutor.getExecutionLog());
			jsonReply.put("stepStatus", transExecutor.getStepStatus());
			jsonReply.put("previewData", transExecutor.getPreviewData());
		} else {
			jsonReply.put("stepMeasure", transExecutor.getStepMeasure());
			jsonReply.put("log", transExecutor.getExecutionLog());
			jsonReply.put("stepStatus", transExecutor.getStepStatus());
			jsonReply.put("previewData", transExecutor.getPreviewData());
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonReply.toString());
	}
	
}
