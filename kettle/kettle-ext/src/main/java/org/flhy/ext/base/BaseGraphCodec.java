package org.flhy.ext.base;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.flhy.ext.App;
import org.flhy.ext.cluster.SlaveServerCodec;
import org.flhy.ext.core.database.DatabaseCodec;
import org.flhy.ext.utils.ColorUtils;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.base.AbstractMeta;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.NotePadMeta;
import org.pentaho.di.core.Props;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.exception.KettleDatabaseException;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.gui.Point;
import org.pentaho.di.core.logging.ChannelLogTable;
import org.pentaho.di.core.logging.LogTableField;
import org.pentaho.di.core.parameters.UnknownParamException;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectory;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.filerep.KettleFileRepository;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.view.mxGraph;

public abstract class BaseGraphCodec implements GraphCodec {
	
	public Element encodeCommRootAttr(AbstractMeta meta, Document doc) throws UnknownParamException {
		Element e = doc.createElement("Step");
		e.setAttribute("name", meta.getName());
		e.setAttribute("fileName", meta.getFilename());
		e.setAttribute("description", meta.getDescription());
		e.setAttribute("extended_description", meta.getExtendedDescription());
		
		RepositoryDirectoryInterface directory = meta.getRepositoryDirectory();
		e.setAttribute("directory", directory != null ? directory.getPath() : RepositoryDirectory.DIRECTORY_SEPARATOR);
		
		e.setAttribute("shared_objects_file", meta.getSharedObjectsFile());
		
		e.setAttribute("created_user", meta.getCreatedUser());
	    e.setAttribute("created_date", XMLHandler.date2string( meta.getCreatedDate() ));
	    e.setAttribute("modified_user", meta.getModifiedUser());
	    e.setAttribute("modified_date", XMLHandler.date2string( meta.getModifiedDate() ));
	    
	    String[] parameters = meta.listParameters();
	    JSONArray jsonArray = new JSONArray();
	    for ( int idx = 0; idx < parameters.length; idx++ ) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", parameters[idx]);
			jsonObject.put("default_value", meta.getParameterDefault( parameters[idx] ));
			jsonObject.put("description", meta.getParameterDescription( parameters[idx] ));
			jsonArray.add(jsonObject);
	    }
	    e.setAttribute("parameters", jsonArray.toString());
	    
	    ChannelLogTable channelLogTable = meta.getChannelLogTable();
	    JSONObject jsonObject = new JSONObject();
	    jsonObject.put( "connection", channelLogTable.getConnectionName() );
	    jsonObject.put( "schema", channelLogTable.getSchemaName() );
	    jsonObject.put( "table", channelLogTable.getTableName() );
	    jsonObject.put( "timeout_days", channelLogTable.getTimeoutInDays() );
	    JSONArray fields = new JSONArray();
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
		
		return e;
	}
	
	public void encodeDatabases(Element e, AbstractMeta meta) {
		Props props = null;
		if (Props.isInitialized()) {
			props = Props.getInstance();
		}
		
		JSONArray jsonArray = new JSONArray();
		for (int i = 0; i < meta.nrDatabases(); i++) {
			DatabaseMeta dbMeta = meta.getDatabase(i);
			if (props != null && props.areOnlyUsedConnectionsSavedToXML()) {
				if (isDatabaseConnectionUsed(meta, dbMeta)) {
					jsonArray.add(DatabaseCodec.encode(dbMeta));
				}
			} else {
				jsonArray.add(DatabaseCodec.encode(dbMeta));
			}
		}
		
		e.setAttribute("databases", jsonArray.toString());
	}
	
	public void encodeSlaveServers(Element e, AbstractMeta meta) {
		JSONArray jsonArray = new JSONArray();
		for (int i = 0; i < meta.getSlaveServers().size(); i++) {
			SlaveServer slaveServer = meta.getSlaveServers().get(i);
			jsonArray.add(SlaveServerCodec.encode(slaveServer));
		}
		e.setAttribute("slaveServers", jsonArray.toString());
	}
	
	public void encodeNote(Document doc, mxGraph graph, AbstractMeta meta) {
		if (meta.getNotes() != null) {
			for (NotePadMeta ni : meta.getNotes()) {
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
				
				graph.insertVertex(graph.getDefaultParent(), null, note, location.x, location.y, ni.width, ni.height, style);
			}
		}
	}
	
	public void decodeCommRootAttr(mxCell root, AbstractMeta meta) throws KettleException, JsonParseException, JsonMappingException, IOException {
		Repository repository = App.getInstance().getRepository();
		meta.setRepository(repository);
		meta.setMetaStore(App.getInstance().getMetaStore());
		
		meta.setName(root.getAttribute("name"));
		if(repository == null) {
			meta.setFilename(root.getAttribute("fileName"));
		} else {
			String directory = root.getAttribute("directory");
			RepositoryDirectoryInterface path = repository.findDirectory(directory);
			if(path == null)
				path = new RepositoryDirectory();
			meta.setRepositoryDirectory(path);
			
			if(repository instanceof KettleFileRepository) {
				KettleFileRepository ktr = (KettleFileRepository) repository;
				ObjectId fileId = ktr.getTransformationID(root.getAttribute("name"), path);
				String realPath = ktr.calcFilename(fileId);
				meta.setFilename(realPath);
			}
		}
		meta.setDescription(root.getAttribute("description"));
		meta.setExtendedDescription(root.getAttribute("extended_description"));
		meta.setSharedObjectsFile(root.getAttribute("shared_objects_file"));
		
		// Read the named parameters.
		JSONArray namedParameters = JSONArray.fromObject(root.getAttribute("parameters"));
		for (int i = 0; i < namedParameters.size(); i++) {
			JSONObject jsonObject = namedParameters.getJSONObject(i);

			String paramName = jsonObject.optString("name");
			String defaultValue = jsonObject.optString("default_value");
			String descr = jsonObject.optString("description");

			meta.addParameterDefinition(paramName, defaultValue, descr);
		}
		
		meta.setCreatedUser( root.getAttribute( "created_user" ));
		meta.setCreatedDate(XMLHandler.stringToDate( root.getAttribute( "created_date" ) ));
		meta.setModifiedUser(root.getAttribute( "modified_user" ));
		meta.setModifiedDate(XMLHandler.stringToDate( root.getAttribute( "modified_date" ) ));
		
		JSONObject jsonObject = JSONObject.fromObject(root.getAttribute("channelLogTable"));
		ChannelLogTable channelLogTable = meta.getChannelLogTable();
		channelLogTable.setConnectionName(jsonObject.optString("connection"));
		channelLogTable.setSchemaName(jsonObject.optString("schema"));
		channelLogTable.setTableName(jsonObject.optString("table"));
		channelLogTable.setTimeoutInDays(jsonObject.optString("timeout_days"));
		JSONArray jsonArray = jsonObject.optJSONArray("fields");
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
	}
	
	public void decodeNote(mxGraph graph, AbstractMeta meta) {
		int count = graph.getModel().getChildCount(graph.getDefaultParent());
		for(int i=0; i<count; i++) {
			mxCell cell = (mxCell) graph.getModel().getChildAt(graph.getDefaultParent(), i);
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
					
					NotePadMeta note = new NotePadMeta(n, x, y, w, h, fontName, fontSize, fontBold, fontItalic, fR, fG, fB, bgR, bgG, bgB, bR, bG, bB, drawShadow);
					meta.getNotes().add(note);
				}
			}
		}
	}
	
	public void decodeDatabases(mxCell root, AbstractMeta meta) throws KettleDatabaseException, JsonParseException, JsonMappingException, IOException {
		JSONArray jsonArray = JSONArray.fromObject(root.getAttribute("databases"));
		Set<String> privateTransformationDatabases = new HashSet<String>(jsonArray.size());
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			DatabaseMeta dbcon =  DatabaseCodec.decode(jsonObject);

			dbcon.shareVariablesWith(meta);
			if (!dbcon.isShared()) {
				privateTransformationDatabases.add(dbcon.getName());
			}

			DatabaseMeta exist = meta.findDatabase(dbcon.getName());
			if (exist == null) {
				meta.addDatabase(dbcon);
			} else {
				if (!exist.isShared()) {
					int idx = meta.indexOfDatabase(exist);
					meta.removeDatabase(idx);
					meta.addDatabase(idx, dbcon);
				}
			}
		}
		meta.setPrivateDatabases(privateTransformationDatabases);
	}
	
	public void decodeSlaveServers(mxCell root, AbstractMeta meta) throws Exception {
		JSONArray jsonArray = JSONArray.fromObject(root.getAttribute("slaveServers"));
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			SlaveServer slaveServer = SlaveServerCodec.decode(jsonObject);
			slaveServer.shareVariablesWith(meta);

			SlaveServer check = meta.findSlaveServer(slaveServer.getName());
			if (check != null) {
				if (!check.isShared()) {
					meta.addOrReplaceSlaveServer(slaveServer);
				}
			} else {
				meta.getSlaveServers().add(slaveServer);
			}
		}
	}
	
	public abstract boolean isDatabaseConnectionUsed(AbstractMeta meta, DatabaseMeta databaseMeta);
	
}
