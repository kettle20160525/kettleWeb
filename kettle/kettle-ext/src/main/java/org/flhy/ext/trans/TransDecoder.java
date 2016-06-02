package org.flhy.ext.trans;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.flhy.ext.App;
import org.flhy.ext.PluginFactory;
import org.flhy.ext.cluster.SlaveServerCodec;
import org.flhy.ext.core.database.DatabaseCodec;
import org.flhy.ext.trans.step.StepDecoder;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.cluster.ClusterSchema;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.NotePadMeta;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.exception.KettleDatabaseException;
import org.pentaho.di.core.logging.ChannelLogTable;
import org.pentaho.di.core.logging.LogTableField;
import org.pentaho.di.core.logging.MetricsLogTable;
import org.pentaho.di.core.logging.PerformanceLogTable;
import org.pentaho.di.core.logging.StepLogTable;
import org.pentaho.di.core.logging.TransLogTable;
import org.pentaho.di.core.parameters.DuplicateParamException;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.partition.PartitionSchema;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectory;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.filerep.KettleFileRepository;
import org.pentaho.di.trans.TransHopMeta;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.step.StepMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.missing.MissingTrans;
import org.pentaho.di.www.SslConfiguration;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

import com.mxgraph.model.mxCell;
import com.mxgraph.view.mxGraph;

public class TransDecoder {
	
	public static TransMeta decode(mxGraph graph) throws Exception {
		mxCell root = (mxCell) graph.getDefaultParent();
		
		Repository repository = App.getInstance().getRepository();
		TransMeta transMeta = new TransMeta();
		
		if(repository == null) {
			transMeta.setFilename(root.getAttribute("fileName"));
		} else {
			String directory = root.getAttribute("directory");
			RepositoryDirectoryInterface path = repository.findDirectory(directory);
			if(path == null)
				path = new RepositoryDirectory();
			transMeta.setRepositoryDirectory(path);
			
			if(repository instanceof KettleFileRepository) {
				KettleFileRepository ktr = (KettleFileRepository) repository;
				ObjectId fileId = ktr.getTransformationID(root.getAttribute("name"), path);
				String realPath = ktr.calcFilename(fileId);
				transMeta.setFilename(realPath);
			}
		}
		
		transMeta.setSharedObjectsFile(root.getAttribute("shared_objects_file"));
		if(transMeta.getRepository() != null)
			transMeta.setSharedObjects(transMeta.getRepository().readTransSharedObjects( transMeta ));
		else
			transMeta.setSharedObjects(transMeta.readSharedObjects());
		
		transMeta.importFromMetaStore();
		
		
		// Handle connections
		decodeDatabases(root, transMeta);
		
		int count = graph.getModel().getChildCount(root);
		for(int i=0; i<count; i++) {
			mxCell cell = (mxCell) graph.getModel().getChildAt(root, i);
			if(cell.isVertex()) {
				
				Element e = (Element) cell.getValue();
				if("Note".equals(e.getTagName())) {
					String n = e.getAttribute("label");
					n = StringEscapeHelper.decode(n);
					int x = (int) cell.getGeometry().getX();
					int y = (int) cell.getGeometry().getY();
					int w = (int) cell.getGeometry().getWidth();
					int h = (int) cell.getGeometry().getHeight();
					
					String fontName = cell.getAttribute("fontName");
					fontName = StringUtils.isEmpty(fontName) ? null : fontName;
					
					String fontSizeStr = cell.getAttribute("fontSize");
					int fontSize = fontSizeStr.matches("\\d+") ? Integer.parseInt(fontSizeStr) : -1;
							
					boolean fontBold = "Y".equalsIgnoreCase(cell.getAttribute("fontBold"));
					boolean fontItalic = "Y".equalsIgnoreCase(cell.getAttribute("fontItalic"));
					
					int fR = Integer.parseInt(cell.getAttribute("fR"));
					int fG = Integer.parseInt(cell.getAttribute("fG"));
					int fB = Integer.parseInt(cell.getAttribute("fB"));
					
					int bgR = Integer.parseInt(cell.getAttribute("bgR"));
					int bgG = Integer.parseInt(cell.getAttribute("bgG"));
					int bgB = Integer.parseInt(cell.getAttribute("bgB"));
					
					int bR = Integer.parseInt(cell.getAttribute("bR"));
					int bG = Integer.parseInt(cell.getAttribute("bG"));
					int bB = Integer.parseInt(cell.getAttribute("bB"));
					
					boolean drawShadow = "Y".equalsIgnoreCase(cell.getAttribute("drawShadow"));
					
					NotePadMeta note = new NotePadMeta(n, x, y, w, h,
							fontName, fontSize, fontBold, fontItalic, fR, fG, fB,
							bgR, bgG, bgB, bR, bG, bB, drawShadow);
					transMeta.getNotes().add(note);
				} else if("Step".equals(e.getTagName())) {
					StepDecoder stepDecoder = (StepDecoder) PluginFactory.getBean(cell.getAttribute("ctype"));
					StepMeta stepMeta = stepDecoder.decodeStep(cell, transMeta.getDatabases(), transMeta.getMetaStore());
					stepMeta.setParentTransMeta( transMeta );
					if (stepMeta.isMissing()) {
						transMeta.addMissingTrans((MissingTrans) stepMeta.getStepMetaInterface());
					}
					
					StepMeta check = transMeta.findStep(stepMeta.getName());
					if (check != null) {
						if (!check.isShared()) {
							// Don't overwrite shared objects
							transMeta.addOrReplaceStep(stepMeta);
						} else {
							check.setDraw(stepMeta.isDrawn()); // Just keep the  drawn flag  and location
							check.setLocation(stepMeta.getLocation());
						}
					} else {
						transMeta.addStep(stepMeta); // simply add it.
					}
				}
			}
		}
		
		// Have all StreamValueLookups, etc. reference the correct source steps...
        //
		for (int i = 0; i < transMeta.nrSteps(); i++) {
			StepMeta stepMeta = transMeta.getStep(i);
			StepMetaInterface sii = stepMeta.getStepMetaInterface();
			if (sii != null) {
				sii.searchInfoAndTargetSteps(transMeta.getSteps());
			}
		}
		
		count = graph.getModel().getChildCount(root);
		for(int i=0; i<count; i++) {
			mxCell cell = (mxCell) graph.getModel().getChildAt(root, i);
			if (cell.isEdge()) {
				mxCell source = (mxCell) cell.getSource();
				mxCell target = (mxCell) cell.getTarget();

				TransHopMeta hopinf = new TransHopMeta(null, null, true);
				String[] stepNames = transMeta.getStepNames();
				for (int j = 0; j < stepNames.length; j++) {
					if (stepNames[j].equalsIgnoreCase(source.getAttribute("label")))
						hopinf.setFromStep(transMeta.getStep(j));
					if (stepNames[j].equalsIgnoreCase(target.getAttribute("label")))
						hopinf.setToStep(transMeta.getStep(j));
				}
				transMeta.addTransHop(hopinf);
			}
		}
		
		
		transMeta.setName(root.getAttribute("name"));
		transMeta.setDescription(root.getAttribute("description"));
		transMeta.setExtendedDescription(root.getAttribute("extended_description"));
		transMeta.setTransstatus(Integer.parseInt(root.getAttribute("trans_status")));
		transMeta.setTransversion(root.getAttribute("trans_version"));
		
		// Read the named parameters.
		JSONArray namedParameters = JSONArray.fromObject(root.getAttribute("parameters"));
		for (int i = 0; i < namedParameters.size(); i++) {
			JSONObject jsonObject = namedParameters.getJSONObject(i);

			String paramName = jsonObject.optString("name");
			String defaultValue = jsonObject.optString("default_value");
			String descr = jsonObject.optString("description");

			try {
				transMeta.addParameterDefinition(paramName, defaultValue, descr);
			} catch (DuplicateParamException e) {
				e.printStackTrace();
			}
		}
		
		JSONObject jsonObject = JSONObject.fromObject(root.getAttribute("transLogTable"));
		TransLogTable transLogTable = transMeta.getTransLogTable();
		transLogTable.setConnectionName(jsonObject.optString("connection"));
		transLogTable.setSchemaName(jsonObject.optString("schema"));
		transLogTable.setTableName(jsonObject.optString("table"));
		transLogTable.setLogSizeLimit(jsonObject.optString("size_limit_lines"));
		transLogTable.setLogInterval(jsonObject.optString("interval"));
		transLogTable.setTimeoutInDays(jsonObject.optString("timeout_days"));
		JSONArray jsonArray = jsonObject.optJSONArray("fields");
		if(jsonArray != null) {
			for ( int i = 0; i < jsonArray.size(); i++ ) {
		    	JSONObject fieldJson = jsonArray.getJSONObject(i);
		    	String id = fieldJson.optString("id");
		    	LogTableField field = transLogTable.findField( id );
		    	if ( field == null ) {
		    		field = transLogTable.getFields().get(i);
		    	}
				if (field != null) {
					field.setFieldName(fieldJson.optString("name"));
					field.setEnabled(fieldJson.optBoolean("enabled"));
					field.setSubject(StepMeta.findStep(transMeta.getSteps(), fieldJson.optString("subject")));
				}
			}
		}
	    
	    jsonObject = JSONObject.fromObject(root.getAttribute("stepLogTable"));
		StepLogTable stepLogTable = transMeta.getStepLogTable();
		stepLogTable.setConnectionName(jsonObject.optString("connection"));
		stepLogTable.setSchemaName(jsonObject.optString("schema"));
		stepLogTable.setTableName(jsonObject.optString("table"));
		stepLogTable.setTimeoutInDays(jsonObject.optString("timeout_days"));
		jsonArray = jsonObject.optJSONArray("fields");
		if(jsonArray != null) {
			for ( int i = 0; i < jsonArray.size(); i++ ) {
		    	JSONObject fieldJson = jsonArray.getJSONObject(i);
		    	String id = fieldJson.optString("id");
		    	LogTableField field = stepLogTable.findField( id );
		    	if ( field == null && i<stepLogTable.getFields().size()) {
		    		field = stepLogTable.getFields().get(i);
		    	}
				if (field != null) {
					field.setFieldName(fieldJson.optString("name"));
					field.setEnabled(fieldJson.optBoolean("enabled"));
				}
			}
		}
	    
	    jsonObject = JSONObject.fromObject(root.getAttribute("performanceLogTable"));
		PerformanceLogTable performanceLogTable = transMeta.getPerformanceLogTable();
		performanceLogTable.setConnectionName(jsonObject.optString("connection"));
		performanceLogTable.setSchemaName(jsonObject.optString("schema"));
		performanceLogTable.setTableName(jsonObject.optString("table"));
		performanceLogTable.setLogInterval(jsonObject.optString("interval"));
		performanceLogTable.setTimeoutInDays(jsonObject.optString("timeout_days"));
		jsonArray = jsonObject.optJSONArray("fields");
		if(jsonArray != null) {
			for ( int i = 0; i < jsonArray.size(); i++ ) {
		    	JSONObject fieldJson = jsonArray.getJSONObject(i);
		    	String id = fieldJson.optString("id");
		    	LogTableField field = performanceLogTable.findField( id );
		    	if ( field == null && i<performanceLogTable.getFields().size()) {
		    		field = performanceLogTable.getFields().get(i);
		    	}
				if (field != null) {
					field.setFieldName(fieldJson.optString("name"));
					field.setEnabled(fieldJson.optBoolean("enabled"));
				}
			}
		}
	    
	    jsonObject = JSONObject.fromObject(root.getAttribute("channelLogTable"));
		ChannelLogTable channelLogTable = transMeta.getChannelLogTable();
		channelLogTable.setConnectionName(jsonObject.optString("connection"));
		channelLogTable.setSchemaName(jsonObject.optString("schema"));
		channelLogTable.setTableName(jsonObject.optString("table"));
		channelLogTable.setTimeoutInDays(jsonObject.optString("timeout_days"));
		jsonArray = jsonObject.optJSONArray("fields");
		if(jsonArray != null) {
			for ( int i = 0; i < jsonArray.size(); i++ ) {
		    	JSONObject fieldJson = jsonArray.getJSONObject(i);
		    	String id = fieldJson.optString("id");
		    	LogTableField field = channelLogTable.findField( id );
		    	if ( field == null && i<channelLogTable.getFields().size()) {
		    		field = channelLogTable.getFields().get(i);
		    	}
				if (field != null) {
					field.setFieldName(fieldJson.optString("name"));
					field.setEnabled(fieldJson.optBoolean("enabled"));
				}
			}
		}
	    
	    jsonObject = JSONObject.fromObject(root.getAttribute("metricsLogTable"));
	    MetricsLogTable metricsLogTable = transMeta.getMetricsLogTable();
	    metricsLogTable.setConnectionName(jsonObject.optString("connection"));
	    metricsLogTable.setSchemaName(jsonObject.optString("schema"));
	    metricsLogTable.setTableName(jsonObject.optString("table"));
	    metricsLogTable.setTimeoutInDays(jsonObject.optString("timeout_days"));
		jsonArray = jsonObject.optJSONArray("fields");
		if(jsonArray != null) {
			for ( int i = 0; i < jsonArray.size(); i++ ) {
		    	JSONObject fieldJson = jsonArray.getJSONObject(i);
		    	String id = fieldJson.optString("id");
		    	LogTableField field = metricsLogTable.findField( id );
		    	if ( field == null && i<metricsLogTable.getFields().size()) {
		    		field = metricsLogTable.getFields().get(i);
		    	}
				if (field != null) {
					field.setFieldName(fieldJson.optString("name"));
					field.setEnabled(fieldJson.optBoolean("enabled"));
				}
			}
		}
	    
		jsonArray = JSONArray.fromObject(root.getAttribute("partitionschemas"));
		for (int i = 0; i < jsonArray.size(); i++) {
			jsonObject = jsonArray.getJSONObject(i);
			PartitionSchema partitionSchema = decodePartitionSchema(jsonObject);
			PartitionSchema check = transMeta.findPartitionSchema(partitionSchema.getName());
			if (check != null) {
				if (!check.isShared()) {
					transMeta.addOrReplacePartitionSchema(partitionSchema);
				}
			} else {
				transMeta.getPartitionSchemas().add(partitionSchema);
			}
		}
	    
		decodeSlaveServers(root, transMeta);
		
		jsonArray = JSONArray.fromObject(root.getAttribute("clusterSchemas"));
		for (int i = 0; i < jsonArray.size(); i++) {
			jsonObject = jsonArray.getJSONObject(i);
			ClusterSchema clusterSchema = decodeClusterSchema(jsonObject, transMeta.getSlaveServers());
			clusterSchema.shareVariablesWith(transMeta);

			ClusterSchema check = transMeta.findClusterSchema(clusterSchema.getName());
			if (check != null) {
				if (!check.isShared()) {
					transMeta.addOrReplaceClusterSchema(clusterSchema);
				}
			} else {
				transMeta.getClusterSchemas().add(clusterSchema);
			}
		}
	    
		for (int i = 0; i < transMeta.nrSteps(); i++) {
			transMeta.getStep(i).setClusterSchemaAfterLoading(transMeta.getClusterSchemas());
		}
	    
		transMeta.setSizeRowset(Const.toInt( root.getAttribute( "size_rowset" ), Const.ROWS_IN_ROWSET ));
		transMeta.setSleepTimeEmpty( Const.toInt( root.getAttribute( "sleep_time_empty" ), Const.TIMEOUT_GET_MILLIS ));
		transMeta.setSleepTimeFull( Const.toInt( root.getAttribute( "sleep_time_full" ), Const.TIMEOUT_PUT_MILLIS ));
        transMeta.setUsingUniqueConnections("Y".equalsIgnoreCase( root.getAttribute( "unique_connections" ) ));

        transMeta.setFeedbackShown(!"N".equalsIgnoreCase( root.getAttribute( "feedback_shown" ) ));
        transMeta.setFeedbackSize(Const.toInt( root.getAttribute( "feedback_size" ), Const.ROWS_UPDATE ));
        transMeta.setUsingThreadPriorityManagment(!"N".equalsIgnoreCase( root.getAttribute( "using_thread_priorities" ) ));
        
        transMeta.setCapturingStepPerformanceSnapShots("Y".equalsIgnoreCase( root.getAttribute( "capture_step_performance" ) ));
        transMeta.setStepPerformanceCapturingDelay(Const.toLong( root.getAttribute( "step_performance_capturing_delay" ), 1000 ));
        transMeta.setStepPerformanceCapturingSizeLimit(root.getAttribute( "step_performance_capturing_size_limit" ));

        transMeta.setCreatedUser( root.getAttribute( "created_user" ));
        transMeta.setCreatedDate(XMLHandler.stringToDate( root.getAttribute( "created_date" ) ));
        transMeta.setModifiedUser(root.getAttribute( "modified_user" ));
        transMeta.setModifiedDate(XMLHandler.stringToDate( root.getAttribute( "modified_date" ) ));

	    transMeta.setKey(XMLHandler.stringToBinary( root.getAttribute( "key_for_session_key" ) ));
	    transMeta.setPrivateKey("Y".equals( root.getAttribute( "is_key_private" ) ));
	    
	    return transMeta;
	}
	
	public static void decodeDatabases(mxCell root, TransMeta transMeta) throws KettleDatabaseException, JsonParseException, JsonMappingException, IOException {
		JSONArray jsonArray = JSONArray.fromObject(root.getAttribute("databases"));
		Set<String> privateTransformationDatabases = new HashSet<String>(jsonArray.size());
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			DatabaseMeta dbcon =  DatabaseCodec.decode(jsonObject);

			dbcon.shareVariablesWith(transMeta);
			if (!dbcon.isShared()) {
				privateTransformationDatabases.add(dbcon.getName());
			}

			DatabaseMeta exist = transMeta.findDatabase(dbcon.getName());
			if (exist == null) {
				transMeta.addDatabase(dbcon);
			} else {
				if (!exist.isShared()) {
					int idx = transMeta.indexOfDatabase(exist);
					transMeta.removeDatabase(idx);
					transMeta.addDatabase(idx, dbcon);
				}
			}
		}
		transMeta.setPrivateDatabases(privateTransformationDatabases);
	}
	
	public static void decodeSlaveServers(mxCell root, TransMeta transMeta) throws Exception {
		JSONArray jsonArray = JSONArray.fromObject(root.getAttribute("slaveServers"));
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			SlaveServer slaveServer = SlaveServerCodec.decode(jsonObject);
			slaveServer.shareVariablesWith(transMeta);

			SlaveServer check = transMeta.findSlaveServer(slaveServer.getName());
			if (check != null) {
				if (!check.isShared()) {
					transMeta.addOrReplaceSlaveServer(slaveServer);
				}
			} else {
				transMeta.getSlaveServers().add(slaveServer);
			}
		}
	}
	
	public static ClusterSchema decodeClusterSchema(JSONObject jsonObject, List<SlaveServer> referenceSlaveServers) {
		ClusterSchema clusterSchema = new ClusterSchema();
		clusterSchema.setName(jsonObject.optString( "name" ));
		clusterSchema.setBasePort(jsonObject.optString( "base_port" ));
		clusterSchema.setSocketsBufferSize(jsonObject.optString( "sockets_buffer_size" ));
		clusterSchema.setSocketsFlushInterval(jsonObject.optString( "sockets_flush_interval" ));
		clusterSchema.setSocketsCompressed("Y".equalsIgnoreCase( jsonObject.optString( "sockets_compressed" ) ));
		clusterSchema.setDynamic("Y".equalsIgnoreCase( jsonObject.optString( "dynamic" ) ));
		
		ArrayList<SlaveServer> slaveServers = new ArrayList<SlaveServer>();
		JSONArray slavesNode = jsonObject.optJSONArray("slaveservers");
		if(slavesNode != null) {
			for (int i = 0; i < slavesNode.size(); i++) {
				String serverName = slavesNode.getString(i);
				SlaveServer slaveServer = SlaveServer.findSlaveServer(referenceSlaveServers, serverName);
				if (slaveServer != null) {
					slaveServers.add(slaveServer);
				}
			}
			clusterSchema.setSlaveServers(slaveServers);
		}
		
		return clusterSchema;
	}
	
	public static PartitionSchema decodePartitionSchema(JSONObject jsonObject) {
		PartitionSchema partitionSchema = new PartitionSchema();
		partitionSchema.setName(jsonObject.optString("name"));
		partitionSchema.setDynamicallyDefined(jsonObject.optBoolean("dynamic"));
		partitionSchema.setNumberOfPartitionsPerSlave(jsonObject.optString("partitions_per_slave"));

	    JSONArray jsonArray = jsonObject.optJSONArray("partition");
	    if(jsonArray != null) {
	    	for ( int i = 0; i < jsonArray.size(); i++ ) {
		    	partitionSchema.getPartitionIDs().add(jsonArray.getString(i));
		    }
	    }
	    
	    return partitionSchema;
	}
	
}
