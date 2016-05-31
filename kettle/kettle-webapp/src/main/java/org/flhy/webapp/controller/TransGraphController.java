package org.flhy.webapp.controller;

import java.io.File;
import java.io.StringReader;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.flhy.ext.App;
import org.flhy.ext.TransExecutor;
import org.flhy.ext.trans.TransDecoder;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.flhy.webapp.utils.JsonUtils;
import org.flhy.webapp.utils.SearchFieldsProgress;
import org.pentaho.di.core.CheckResultInterface;
import org.pentaho.di.core.CheckResultSourceInterface;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.Database;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.logging.LogLevel;
import org.pentaho.di.core.logging.LoggingObjectInterface;
import org.pentaho.di.core.logging.LoggingObjectType;
import org.pentaho.di.core.logging.SimpleLoggingObject;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.row.ValueMetaInterface;
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
@RequestMapping(value="/trans")
public class TransGraphController {

	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/engineXml")
	protected void engineXml(HttpServletRequest request, HttpServletResponse response, @RequestParam String graphXml) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		TransMeta transMeta = TransDecoder.decode(graph);
		String xml = XMLHandler.getXMLHeader() + transMeta.getXML();
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(xml);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/save")
	protected void save(HttpServletRequest request, HttpServletResponse response, @RequestParam String graphXml) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		TransMeta transMeta = TransDecoder.decode(graph);
		File file = new File(transMeta.getFilename());
		if(file.exists()) {
			List<String> fileRows = FileUtils.readLines(file);
			
			String xml = XMLHandler.getXMLHeader() + transMeta.getXML();
			List<String> engineRows = IOUtils.readLines(new StringReader(xml));
			
			int number = fileRows.size() > engineRows.size() ? engineRows.size() : fileRows.size();
			for(int i=0; i<number; i++) {
				String fileRow = fileRows.get(i);
				String engineRow = engineRows.get(i);
				
				if(!fileRow.equals(engineRow)) {
					System.out.println("[" + i + "]file: " + fileRow);
					System.out.println("[" + i + "]engine: " + engineRow);
					System.out.println("================================================================================");
				}
			}
			System.out.println("=====finished=====");
		}
	}
	
	/**
	 * 校验这个转换
	 * 
	 * @param graphXml
	 * @param show_successful_results
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/check")
	protected void check(@RequestParam String graphXml, @RequestParam boolean show_successful_results) throws Exception {
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
		
		JsonUtils.response(jsonArray);
	}
	
	/**
	 * 执行转换
	 * 
	 * @param graphXml
	 * @param executionConfig
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/run")
	protected void run(@RequestParam String graphXml, @RequestParam String executionConfig) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		TransMeta transMeta = TransDecoder.decode(graph);
		
//		String xml = XMLHandler.getXMLHeader() + transMeta.getXML();
//		DataOutputStream dos = new DataOutputStream(KettleVFS.getOutputStream(transMeta.getFilename(), false));
//		dos.write(xml.getBytes(Const.XML_ENCODING));
//		dos.close();
		
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
		if(parameters != null) {
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
		}
		
		map = new HashMap<String, String>();
		JSONArray variables = jsonObject.optJSONArray("variables");
		if(variables != null) {
			for ( int i = 0; i < variables.size(); i++ ) {
		    	JSONObject var = variables.getJSONObject(i);
		    	String varname = var.optString("var_name");
		    	String value = var.optString("var_value");
		      

		    	if ( !Const.isEmpty( varname ) ) {
		    		map.put( varname, value );
		    	}
		    }
		}
	    
	    executionConfiguration.setVariables( map );
	    
	    
	    TransExecutor transExecutor = TransExecutor.initExecutor(executionConfiguration, transMeta);
	    new Thread(transExecutor).start();
        executions.put(transExecutor.getExecutionId(), transExecutor);
		
        JsonUtils.success(transExecutor.getExecutionId());
	}
	
	private static HashMap<String, TransExecutor> executions = new HashMap<String, TransExecutor>();
	
	/**
	 * 获取执行结果
	 * 
	 * @param executionId
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/result")
	protected void result(@RequestParam String executionId) throws Exception {
		JSONObject jsonObject = new JSONObject();
		
		TransExecutor transExecutor = executions.get(executionId);
		
		jsonObject.put("finished", transExecutor.isFinished());
		if(transExecutor.isFinished()) {
			executions.remove(executionId);
			
			jsonObject.put("stepMeasure", transExecutor.getStepMeasure());
			jsonObject.put("log", transExecutor.getExecutionLog());
			jsonObject.put("stepStatus", transExecutor.getStepStatus());
			jsonObject.put("previewData", transExecutor.getPreviewData());
		} else {
			jsonObject.put("stepMeasure", transExecutor.getStepMeasure());
			jsonObject.put("log", transExecutor.getExecutionLog());
			jsonObject.put("stepStatus", transExecutor.getStepStatus());
			jsonObject.put("previewData", transExecutor.getPreviewData());
		}
		
		JsonUtils.response(jsonObject);
	}
	
	/**
	 * 获取输入输出字段
	 * 
	 * @param stepName
	 * @param graphXml
	 * @param before false回去输出字段，true获取输入字段
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/inputOutputFields")
	protected void inputOutputFields(@RequestParam String graphXml, @RequestParam String stepName, @RequestParam boolean before) throws Exception {
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
		JsonUtils.response(jsonArray);
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
	
	/**
	 * 获取输入字段信息
	 * 
	 * @param graphXml
	 * @param stepName
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/getFields")
	protected void getFields(@RequestParam String graphXml, @RequestParam String stepName) throws Exception {
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
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/fieldNames")
	protected void fieldNames(@RequestParam String graphXml, @RequestParam String databaseName, @RequestParam String sql) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		TransMeta transMeta = TransDecoder.decode(graph);
		DatabaseMeta inf = transMeta.findDatabase(databaseName);
		
		Database db = new Database( loggingObject, inf );
		db.connect();
		
		sql = StringEscapeHelper.decode(sql);
		String subfix = sql.substring(sql.indexOf("from"));
		RowMetaInterface fields = db.getQueryFields(sql, false);
		if (fields != null) {
			sql = "SELECT" + Const.CR;
			for (int i = 0; i < fields.size(); i++) {
				ValueMetaInterface field = fields.getValueMeta(i);
				if (i == 0) {
					sql += "  ";
				} else {
					sql += ", ";
				}
				sql += inf.quoteField(field.getName()) + Const.CR;
			}
			sql += ' ' + subfix;
		}
		
		JsonUtils.success(StringEscapeHelper.encode(sql));
	}
	
	public static final LoggingObjectInterface loggingObject = new SimpleLoggingObject("TransGraphController", LoggingObjectType.TRANSMETA, null );
}
