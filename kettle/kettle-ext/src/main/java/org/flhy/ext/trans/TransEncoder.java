package org.flhy.ext.trans;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import org.flhy.ext.PluginFactory;
import org.flhy.ext.trans.step.StepEncoder;
import org.flhy.ext.utils.ColorUtils;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.flhy.ext.utils.SvgImageUrl;
import org.pentaho.di.cluster.ClusterSchema;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.NotePadMeta;
import org.pentaho.di.core.database.BaseDatabaseMeta;
import org.pentaho.di.core.database.DatabaseConnectionPoolParameter;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.encryption.Encr;
import org.pentaho.di.core.gui.Point;
import org.pentaho.di.core.logging.ChannelLogTable;
import org.pentaho.di.core.logging.LogTableField;
import org.pentaho.di.core.logging.MetricsLogTable;
import org.pentaho.di.core.logging.PerformanceLogTable;
import org.pentaho.di.core.logging.StepLogTable;
import org.pentaho.di.core.logging.TransLogTable;
import org.pentaho.di.core.variables.Variables;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.partition.PartitionSchema;
import org.pentaho.di.repository.RepositoryDirectory;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.trans.TransHopMeta;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.step.StepMeta;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;
import com.mxgraph.view.mxGraph;

public class TransEncoder {
	
	public static mxGraph encode(TransMeta transMeta) throws Exception {
		mxGraph graph = new mxGraph();
		graph.getModel().beginUpdate();
		try {
			mxCell parent = (mxCell) graph.getDefaultParent();
			Document doc = mxUtils.createDocument();
			Element e = doc.createElement("Step");
			e.setAttribute("name", transMeta.getName());
			e.setAttribute("fileName", transMeta.getFilename());
			e.setAttribute("description", transMeta.getDescription());
			e.setAttribute("extended_description", transMeta.getExtendedDescription());
			e.setAttribute("trans_version", transMeta.getTransversion());
			e.setAttribute("trans_type", transMeta.getTransformationType().getCode() );
			e.setAttribute("trans_status", String.valueOf(transMeta.getTransstatus()));
			RepositoryDirectoryInterface directory = transMeta.getRepositoryDirectory();
			e.setAttribute("directory", directory != null ? directory.getPath() : RepositoryDirectory.DIRECTORY_SEPARATOR);
			
			
			// named parameters
		    String[] parameters = transMeta.listParameters();
		    JSONArray jsonArray = new JSONArray();
		    for ( int idx = 0; idx < parameters.length; idx++ ) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", parameters[idx]);
				jsonObject.put("value", "");
				jsonObject.put("default_value", transMeta.getParameterDefault( parameters[idx] ));
				jsonObject.put("description", transMeta.getParameterDescription( parameters[idx] ));
				jsonArray.add(jsonObject);
		    }
		    e.setAttribute("parameters", jsonArray.toString());
		    
		    //variables
		    Properties sp = new Properties();
		    jsonArray = new JSONArray();

		    String[] keys = Variables.getADefaultVariableSpace().listVariables();
		    for ( int i = 0; i < keys.length; i++ ) {
		    	sp.put( keys[i], Variables.getADefaultVariableSpace().getVariable( keys[i] ) );
		    }

		    List<String> vars = transMeta.getUsedVariables();
		    if ( vars != null && vars.size() > 0 ) {
		    	for ( int i = 0; i < vars.size(); i++ ) {
		    		String varname = vars.get( i );
		    		if ( !varname.startsWith( Const.INTERNAL_VARIABLE_PREFIX ) 
		    				&& Const.indexOfString( varname, transMeta.listParameters() ) < 0 ) {
		    			JSONObject param = new JSONObject();
		    			param.put("var_name", varname);
		    			param.put("var_value", sp.getProperty(varname, ""));
		    			jsonArray.add(param);
		    		}
		    	}
		    }

		    for ( String varname : Const.INTERNAL_JOB_VARIABLES ) {
		    	String value = transMeta.getVariable( varname );
		    	if ( !Const.isEmpty( value ) ) {
		    		
		    		JSONObject param = new JSONObject();
	    			param.put("var_name", varname);
	    			param.put("var_value", value);
	    			jsonArray.add(param);
		    	}
		    }
		    e.setAttribute("variables", jsonArray.toString());
			
		    TransLogTable transLogTable = transMeta.getTransLogTable();
		    JSONObject jsonObject = new JSONObject();
		    jsonObject.put( "connection", transLogTable.getConnectionName() );
		    jsonObject.put( "schema", transLogTable.getSchemaName() );
		    jsonObject.put( "table", transLogTable.getTableName() );
		    jsonObject.put( "size_limit_lines", transLogTable.getLogSizeLimit() );
		    jsonObject.put( "interval", transLogTable.getLogInterval() );
		    jsonObject.put( "timeout_days", transLogTable.getTimeoutInDays() );
		    JSONArray fields = new JSONArray();
		    for ( LogTableField field : transLogTable.getFields() ) {
		    	JSONObject jsonField = new JSONObject();
		    	jsonField.put("id", field.getId());
		    	jsonField.put("enabled", field.isEnabled());
		    	jsonField.put("name", field.getFieldName());
		    	jsonField.put("subjectAllowed", field.isSubjectAllowed());
				if (field.isSubjectAllowed()) {
					jsonField.put("subject", field.getSubject() == null ? "" : field.getSubject().toString());
				} else {
					jsonField.put("subject", "-");
				}
		    	jsonField.put("description", StringEscapeHelper.encode(field.getDescription()));
		    	fields.add(jsonField);
		    }
		    jsonObject.put("fields", fields);
		    e.setAttribute("transLogTable", jsonObject.toString());
		    
		    StepLogTable stepLogTable = transMeta.getStepLogTable();
		    jsonObject = new JSONObject();
		    jsonObject.put( "connection", stepLogTable.getConnectionName() );
		    jsonObject.put( "schema", stepLogTable.getSchemaName() );
		    jsonObject.put( "table", stepLogTable.getTableName() );
		    jsonObject.put( "timeout_days", stepLogTable.getTimeoutInDays() );
		    fields = new JSONArray();
		    for ( LogTableField field : stepLogTable.getFields() ) {
		    	JSONObject jsonField = new JSONObject();
		    	jsonField.put("id", field.getId());
		    	jsonField.put("enabled", field.isEnabled());
		    	jsonField.put("name", field.getFieldName());
		    	jsonField.put("description", StringEscapeHelper.encode(field.getDescription()));
		    	fields.add(jsonField);
		    }
		    jsonObject.put("fields", fields);
		    e.setAttribute("stepLogTable", jsonObject.toString());
		    
		    PerformanceLogTable performanceLogTable = transMeta.getPerformanceLogTable();
		    jsonObject = new JSONObject();
		    jsonObject.put( "connection", performanceLogTable.getConnectionName() );
		    jsonObject.put( "schema", performanceLogTable.getSchemaName() );
		    jsonObject.put( "table", performanceLogTable.getTableName() );
		    jsonObject.put( "interval", performanceLogTable.getLogInterval() );
		    jsonObject.put( "timeout_days", performanceLogTable.getTimeoutInDays() );
		    fields = new JSONArray();
		    for ( LogTableField field : performanceLogTable.getFields() ) {
		    	JSONObject jsonField = new JSONObject();
		    	jsonField.put("id", field.getId());
		    	jsonField.put("enabled", field.isEnabled());
		    	jsonField.put("name", field.getFieldName());
		    	jsonField.put("description", StringEscapeHelper.encode(field.getDescription()));
		    	fields.add(jsonField);
		    }
		    jsonObject.put("fields", fields);
		    e.setAttribute("performanceLogTable", jsonObject.toString());
		    
		    ChannelLogTable channelLogTable = transMeta.getChannelLogTable();
		    jsonObject = new JSONObject();
		    jsonObject.put( "connection", channelLogTable.getConnectionName() );
		    jsonObject.put( "schema", channelLogTable.getSchemaName() );
		    jsonObject.put( "table", channelLogTable.getTableName() );
		    jsonObject.put( "timeout_days", channelLogTable.getTimeoutInDays() );
		    fields = new JSONArray();
		    for ( LogTableField field : channelLogTable.getFields() ) {
		    	JSONObject jsonField = new JSONObject();
		    	jsonField.put("id", field.getId());
		    	jsonField.put("enabled", field.isEnabled());
		    	jsonField.put("name", field.getFieldName());
		    	jsonField.put("description", StringEscapeHelper.encode(field.getDescription()));
		    	fields.add(jsonField);
		    }
		    jsonObject.put("fields", fields);
		    e.setAttribute("channelLogTable", jsonObject.toString());
		    
		    MetricsLogTable metricsLogTable = transMeta.getMetricsLogTable();
		    jsonObject = new JSONObject();
		    jsonObject.put( "connection", metricsLogTable.getConnectionName() );
		    jsonObject.put( "schema", metricsLogTable.getSchemaName() );
		    jsonObject.put( "table", metricsLogTable.getTableName() );
		    jsonObject.put( "timeout_days", metricsLogTable.getTimeoutInDays() );
		    fields = new JSONArray();
		    for ( LogTableField field : metricsLogTable.getFields() ) {
		    	JSONObject jsonField = new JSONObject();
		    	jsonField.put("id", field.getId());
		    	jsonField.put("enabled", field.isEnabled());
		    	jsonField.put("name", field.getFieldName());
		    	jsonField.put("description", StringEscapeHelper.encode(field.getDescription()));
		    	fields.add(jsonField);
		    }
		    jsonObject.put("fields", fields);
		    e.setAttribute("metricsLogTable", jsonObject.toString());
		    
		    jsonObject = new JSONObject();
		    jsonObject.put("connection", transMeta.getMaxDateConnection() == null ? "" : transMeta.getMaxDateConnection().getName());
		    jsonObject.put("table", transMeta.getMaxDateTable());
		    jsonObject.put("field", transMeta.getMaxDateField());
		    jsonObject.put("offset", transMeta.getMaxDateOffset());
		    jsonObject.put("maxdiff", transMeta.getMaxDateDifference());
		    e.setAttribute("maxdate", jsonObject.toString());
			
		    e.setAttribute("size_rowset", String.valueOf(transMeta.getSizeRowset()));
		    e.setAttribute("sleep_time_empty", String.valueOf(transMeta.getSleepTimeEmpty()));
		    e.setAttribute("sleep_time_full", String.valueOf(transMeta.getSleepTimeFull()));
		    e.setAttribute("unique_connections", transMeta.isUsingUniqueConnections() ? "Y" : "N");
		    e.setAttribute("feedback_shown", transMeta.isFeedbackShown() ? "Y" : "N");
		    e.setAttribute("feedback_size", String.valueOf(transMeta.getFeedbackSize()));
		    e.setAttribute("using_thread_priorities", transMeta.isUsingThreadPriorityManagment() ? "Y" : "N");
		    e.setAttribute("shared_objects_file", transMeta.getSharedObjectsFile());
		    e.setAttribute("capture_step_performance", transMeta.isCapturingStepPerformanceSnapShots() ? "Y" : "N");
		    e.setAttribute("step_performance_capturing_delay", String.valueOf(transMeta.getStepPerformanceCapturingDelay()));
		    e.setAttribute("step_performance_capturing_size_limit", transMeta.getStepPerformanceCapturingSizeLimit());
		    
		    encodePartitionSchemas(transMeta, e);
		    encodeSlaveServers(transMeta, e);
		    encodeClusterSchemas(transMeta, e);
		    
			e.setAttribute("created_user", transMeta.getCreatedUser());
		    e.setAttribute("created_date", XMLHandler.date2string( transMeta.getCreatedDate() ));
		    e.setAttribute("modified_user", transMeta.getModifiedUser());
		    e.setAttribute("modified_date", XMLHandler.date2string( transMeta.getModifiedDate() ));
		    try {
		    	if(transMeta.getKey() == null) {
		    		e.setAttribute("key_for_session_key", XMLHandler.encodeBinaryData(transMeta.getKey()));
		    	} else {
		    		e.setAttribute("key_for_session_key", "");
		    	}
			} catch (Exception e1) {
				e1.printStackTrace();
				e.setAttribute("key_for_session_key", "");
			}
			e.setAttribute("is_key_private", transMeta.isPrivateKey() ? "Y" : "N");
	
			if (transMeta.getNotes() != null) {
				for (NotePadMeta ni : transMeta.getNotes()) {
					Point location = ni.getLocation();
					
					Element note = doc.createElement("Note");
					note.setAttribute("label", StringEscapeHelper.encode(ni.getNote()));
					String style = "shape=note";
					
					int r = ni.getBackGroundColorRed();
					int g = ni.getBackGroundColorGreen();
					int b = ni.getBackGroundColorBlue();
					style += ";fillColor=" + ColorUtils.toHex(r, g, b);
					note.setAttribute("bgR", String.valueOf(r));
					note.setAttribute("bgG", String.valueOf(g));
					note.setAttribute("bgB", String.valueOf(b));
					
					r = ni.getFontColorRed();
					g = ni.getFontColorGreen();
					b = ni.getFontColorBlue();
					style += ";fontColor=" + ColorUtils.toHex(r, g, b);
					note.setAttribute("fR", String.valueOf(r));
					note.setAttribute("fG", String.valueOf(g));
					note.setAttribute("fB", String.valueOf(b));
					
					r = ni.getBorderColorRed();
					g = ni.getBorderColorGreen();
					b = ni.getBorderColorBlue();
					style += ";strokeColor=" + ColorUtils.toHex(r, g, b);
					note.setAttribute("bR", String.valueOf(r));
					note.setAttribute("bG", String.valueOf(g));
					note.setAttribute("bB", String.valueOf(b));
					
					if(!StringUtils.isEmpty(ni.getFontName())) {
						style += ";fontFamily=" + ni.getFontName();
						note.setAttribute("fontName", ni.getFontName());
					}
					if( ni.getFontSize() > 0 ) {
						note.setAttribute("fontSize", String.valueOf(ni.getFontSize()));
					}
					
					note.setAttribute("fontBold", ni.isFontBold() ? "Y" : "N");
					note.setAttribute("fontItalic", ni.isFontItalic() ? "Y" : "N");
					note.setAttribute("drawShadow", ni.isDrawShadow() ? "Y" : "N");
					
					graph.insertVertex(parent, null, note, location.x, location.y, ni.width, ni.height, style);
				}
			}
			
			encodeDatabases(transMeta, e);
		    parent.setValue(e);
		    
		    // encode steps and hops
			HashMap<StepMeta, Object> cells = new HashMap<StepMeta, Object>();
			List<StepMeta> list = transMeta.getSteps();
			for(int i=0; i<list.size(); i++) {
				StepMeta step = (StepMeta) list.get(i);
				Point p = step.getLocation();
				StepEncoder stepEncoder = (StepEncoder) PluginFactory.getBean(step.getStepID());
//				PluginInterface plugin = PluginRegistry.getInstance().findPluginWithId(StepPluginType.class, step.getTypeId());
				Object cell = graph.insertVertex(parent, null, stepEncoder.encodeStep(step), p.x, p.y, 40, 40, "icon;image=" + SvgImageUrl.getUrl(step.getStepID(), SvgImageUrl.Size_Middle));
				cells.put(step, cell);
			}
			
//			PluginRegistry registry = PluginRegistry.getInstance();
//			try {
//				PluginInterface plugin = registry.getPlugin( StepPluginType.class, "Dummy");
//				ClassLoader classLoader = registry.getClassLoader(plugin);
//				BufferedImage image = SvgImageUtil.getUniversalImage(classLoader, plugin.getImageFile());
//				ImageIO.write(image, "PNG", new File("Dummy.png"));
//			} catch (Exception ex) {
//				ex.printStackTrace();
//			}
			
			for(int i=0; i<transMeta.nrTransHops(); i++) {
				TransHopMeta transHopMeta = transMeta.getTransHop(i);
				
				Object v1 = cells.get(transHopMeta.getFromStep());
				Object v2 = cells.get(transHopMeta.getToStep());
				
				graph.insertEdge(parent, null, null, v1, v2);
			}
		} finally {
			graph.getModel().endUpdate();
		}
		
		return graph;
	}
	
	public static void encodeDatabases(TransMeta transMeta, Element e) {
		JSONArray jsonArray = new JSONArray();
		for(int i=0; i<transMeta.nrDatabases(); i++) {
			DatabaseMeta databaseMeta = transMeta.getDatabase(i);
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", databaseMeta.getName());
			jsonObject.put("server", databaseMeta.getHostname());
			jsonObject.put("type", databaseMeta.getPluginId());
			jsonObject.put("access", databaseMeta.getAccessType());
			jsonObject.put("database", databaseMeta.getDatabaseName());
			jsonObject.put("port", databaseMeta.getDatabasePortNumberString());
			jsonObject.put("username", databaseMeta.getUsername());
			jsonObject.put("password", Encr.decryptPasswordOptionallyEncrypted(databaseMeta.getPassword()));
			jsonObject.put("servername", databaseMeta.getServername());
			jsonObject.put("data_tablespace", databaseMeta.getDataTablespace());
			jsonObject.put("index_tablespace", databaseMeta.getIndexTablespace());
			jsonObject.put("read_only", databaseMeta.isReadOnly());
			
			JSONObject attributes = new JSONObject();
			JSONArray options = new JSONArray();
			List<String> list = new ArrayList<String>();
		    Set<Object> keySet = databaseMeta.getAttributes().keySet();
		    for ( Object object : keySet ) {
		      list.add( (String) object );
		    }
		    Collections.sort( list );
		    HashSet<String> poolParamsChecked = new HashSet<String>();
			for (Iterator<String> iter = list.iterator(); iter.hasNext();) {
				String code = iter.next();
				String attribute = databaseMeta.getAttributes().getProperty(code);
				if (!Const.isEmpty(attribute)) {
					if("SQL_CONNECT".equalsIgnoreCase(code))
						attribute = StringEscapeHelper.encode(attribute);
					if(code.indexOf(".") > 0) {
						int index = code.indexOf(".");
						JSONObject jsonObject2 = new JSONObject();
						jsonObject2.put("prefix", code.substring(0, index));
						jsonObject2.put("name", code.substring(index + 1));
						jsonObject2.put("value", attribute);
						options.add(jsonObject2);
					} else if(code.startsWith("POOLING_")) {
						poolParamsChecked.add(code.substring(8));
					} else {
						attributes.put(code, attribute);
					}
				}
			}
			
			JSONArray jsonArray2 = new JSONArray();
			for (DatabaseConnectionPoolParameter parameter : BaseDatabaseMeta.poolingParameters) {
				JSONObject jsonObject2 = new JSONObject();
				jsonObject2.put("enabled", poolParamsChecked.contains(parameter.getParameter()));
				jsonObject2.put("name", parameter.getParameter());
				jsonObject2.put("defValue", parameter.getDefaultValue());
				jsonObject2.put("description", StringEscapeHelper.encode(parameter.getDescription()));
				jsonArray2.add(jsonObject2);
			}
			jsonObject.put("options", options);
			jsonObject.put("attributes", attributes);
			jsonObject.put("pool_params", jsonArray2);
			
			jsonArray.add(jsonObject);
		}
		e.setAttribute("databases", jsonArray.toString());
	}
	
	public static void encodeClusterSchemas(TransMeta transMeta, Element e) {
		JSONArray jsonArray = new JSONArray();
		for (int i = 0; i < transMeta.getClusterSchemas().size(); i++) {
			ClusterSchema clusterSchema = transMeta.getClusterSchemas().get(i);
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", clusterSchema.getName());
			jsonObject.put("base_port", clusterSchema.getBasePort());
			jsonObject.put("sockets_buffer_size", clusterSchema.getSocketsBufferSize());
			
			jsonObject.put("sockets_flush_interval", clusterSchema.getSocketsFlushInterval());
			jsonObject.put("sockets_compressed", clusterSchema.isSocketsCompressed() ? "Y" : "N");
			jsonObject.put("dynamic", clusterSchema.isDynamic() ? "Y" : "N");
			
			JSONArray slaveservers = new JSONArray();
			for (int j = 0; j < clusterSchema.getSlaveServers().size(); j++) {
				SlaveServer slaveServer = clusterSchema.getSlaveServers().get(j);
				slaveservers.add(slaveServer.getName());
			}
			jsonObject.put("slaveservers", slaveservers);
			
			
			jsonArray.add(jsonObject);
		}
		e.setAttribute("clusterSchemas", jsonArray.toString());
	}

	public static void encodePartitionSchemas(TransMeta transMeta, Element e) {
		JSONArray jsonArray = new JSONArray();
	    List<PartitionSchema> partitionSchemas = transMeta.getPartitionSchemas();
		for (int i = 0; i < partitionSchemas.size(); i++) {
			PartitionSchema partitionSchema = partitionSchemas.get(i);
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", partitionSchema.getName());
			jsonObject.put("dynamic", partitionSchema.isDynamicallyDefined());
			jsonObject.put("partitions_per_slave", partitionSchema.getNumberOfPartitionsPerSlave());
			
			JSONArray partition = new JSONArray();
			List<String> partitionIDs = partitionSchema.getPartitionIDs();
			for (int j = 0; j < partitionIDs.size(); j++) {
				jsonArray.add(partitionIDs.get(j));
			}
			jsonObject.put("partition", partition);
			
			jsonArray.add(jsonObject);
		}
		e.setAttribute("partitionschemas", jsonArray.toString());
	}

	public static void encodeSlaveServers(TransMeta transMeta, Element e) {
		JSONArray jsonArray = new JSONArray();
		for (int i = 0; i < transMeta.getSlaveServers().size(); i++) {
			SlaveServer slaveServer = transMeta.getSlaveServers().get(i);
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", slaveServer.getName());
			jsonObject.put("hostname", slaveServer.getHostname());
			jsonObject.put("port", slaveServer.getPort());
			jsonObject.put("webAppName", slaveServer.getWebAppName());
			jsonObject.put("username", slaveServer.getUsername());
			jsonObject.put("password", Encr.decryptPasswordOptionallyEncrypted( slaveServer.getPassword() ));
			jsonObject.put("proxy_hostname", slaveServer.getProxyHostname());
			jsonObject.put("proxy_port", slaveServer.getProxyPort());
			jsonObject.put("non_proxy_hosts", slaveServer.getNonProxyHosts());
			jsonObject.put("master", slaveServer.isMaster());
			jsonObject.put("sslMode", slaveServer.isSslMode());
			if(slaveServer.getSslConfig() != null) {
				
			}
			
			jsonArray.add(jsonObject);
		}
		e.setAttribute("slaveServers", jsonArray.toString());
	}
	
}
