package org.flhy.webapp.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.flhy.ext.core.database.DatabaseCodec;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.core.database.DatabaseInterface;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.exception.KettleDatabaseException;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.logging.LogChannel;
import org.pentaho.di.core.plugins.DatabasePluginType;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.PluginTypeListener;
import org.pentaho.di.repository.RepositoriesMeta;
import org.pentaho.ui.database.Messages;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value="/database")
public class DatabaseController {
	
	public static final SortedMap<String, DatabaseInterface> connectionMap = new TreeMap<String, DatabaseInterface>();
	public static final Map<String, String> connectionNametoID = new HashMap<String, String>();

	static {
		PluginRegistry registry = PluginRegistry.getInstance();

		List<PluginInterface> plugins = registry.getPlugins(DatabasePluginType.class);

		PluginTypeListener databaseTypeListener = new DatabaseTypeListener(registry) {
			public void databaseTypeAdded(String pluginName, DatabaseInterface databaseInterface) {
				connectionMap.put(pluginName, databaseInterface);
				connectionNametoID.put(pluginName, databaseInterface.getPluginId());
			}

			public void databaseTypeRemoved(String pluginName) {
				connectionMap.remove(pluginName);
				connectionNametoID.remove(pluginName);
			}
		};

		registry.addPluginListener(DatabasePluginType.class, databaseTypeListener);
		for (PluginInterface plugin : plugins) {
			databaseTypeListener.pluginAdded(plugin);
		}

	}

	private static abstract class DatabaseTypeListener implements PluginTypeListener {
		private final PluginRegistry registry;

		public DatabaseTypeListener(PluginRegistry registry) {
			this.registry = registry;
		}

		@Override
		public void pluginAdded(Object serviceObject) {
			PluginInterface plugin = (PluginInterface) serviceObject;
			String pluginName = plugin.getName();
			try {
				DatabaseInterface databaseInterface = (DatabaseInterface) registry.loadClass(plugin);
				databaseInterface.setPluginId(plugin.getIds()[0]);
				databaseInterface.setName(pluginName);
				databaseTypeAdded(pluginName, databaseInterface);
			} catch (KettleException e) {
				System.out.println("Could not create connection entry for "
						+ pluginName + ".  "
						+ e.getCause().getClass().getName());
				LogChannel.GENERAL
						.logError("Could not create connection entry for "
								+ pluginName + ".  "
								+ e.getCause().getClass().getName());
			}
		}

		public abstract void databaseTypeAdded(String pluginName, DatabaseInterface databaseInterface);

		@Override
		public void pluginRemoved(Object serviceObject) {
			PluginInterface plugin = (PluginInterface) serviceObject;
			String pluginName = plugin.getName();
			databaseTypeRemoved(pluginName);
		}

		public abstract void databaseTypeRemoved(String pluginName);

		@Override
		public void pluginChanged(Object serviceObject) {
			pluginRemoved(serviceObject);
			pluginAdded(serviceObject);
		}

	}

	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/accessData")
	public void loadAccessData(HttpServletRequest request, HttpServletResponse response) throws IOException {

		JSONArray jsonArray = new JSONArray();
	    for ( String value : connectionMap.keySet() ) {
	    	JSONObject jsonObject = new JSONObject();
	    	jsonObject.put("value", connectionNametoID.get(value));
	    	jsonObject.put("text", value);
	    	jsonArray.add(jsonObject);
	    }
	    
	    response.setContentType("text/javascript; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	    
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/accessMethod")
	public void loadAccessMethod(HttpServletRequest request, HttpServletResponse response, @RequestParam String accessData) throws IOException {
		Iterator<Map.Entry<String, String>> iter = connectionNametoID.entrySet().iterator();
		while(iter.hasNext()) {
			Map.Entry<String, String> entry = iter.next();
			if(accessData.equals(entry.getValue())) {
				accessData = entry.getKey();
				break;
			}
		}
		
		DatabaseInterface database = connectionMap.get( accessData );
		int[] acc = database.getAccessTypeList();

		JSONArray jsonArray = new JSONArray();
	    for ( int value : acc ) {
	    	JSONObject jsonObject = new JSONObject();
	    	jsonObject.put("value", value);
	    	jsonObject.put("text", DatabaseMeta.getAccessTypeDescLong( value ));
	    	jsonArray.add(jsonObject);
	    }
	    
	    response.setContentType("text/javascript; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	    
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/accessSettings")
	public void loadAccessSettings(HttpServletRequest request, HttpServletResponse response, @RequestParam String accessData, @RequestParam int accessMethod) throws IOException {
	    String databaseName = null;
	    try {
	      databaseName = PluginRegistry.getInstance().getPlugin( DatabasePluginType.class, accessData).getIds()[0];
	    } catch ( Exception e ) {
	      e.printStackTrace();
	    }
//	    DatabaseInterface database = connectionMap.get( accessData );
		
	    String fragment = "";
	    switch ( accessMethod ) {
	    case DatabaseMeta.TYPE_ACCESS_JNDI:
	    	ClassPathResource cpr = new ClassPathResource(databaseName + "_jndi.json", getClass());
	    	if(!cpr.exists())
	    		cpr = new ClassPathResource("common_jndi.json", getClass());
	    	fragment = FileUtils.readFileToString(cpr.getFile(), "utf-8");
	    	break;
	    case DatabaseMeta.TYPE_ACCESS_NATIVE:
	    	cpr = new ClassPathResource(databaseName + "_native.json", getClass());
	    	if(!cpr.exists())
	    		cpr = new ClassPathResource("common_native.json", getClass());
	    	fragment = FileUtils.readFileToString(cpr.getFile(), "utf-8");
	    	break;
	    case DatabaseMeta.TYPE_ACCESS_ODBC:
	    	cpr = new ClassPathResource(databaseName + "_odbc.json", getClass());
	    	if(!cpr.exists())
	    		cpr = new ClassPathResource("common_odbc.json", getClass());
	    	fragment = FileUtils.readFileToString(cpr.getFile(), "utf-8");
	    	break;
	    case DatabaseMeta.TYPE_ACCESS_OCI:
	    	cpr = new ClassPathResource(databaseName + "_oci.json", getClass());
	    	if(!cpr.exists())
	    		cpr = new ClassPathResource("common_oci.json", getClass());
	    	fragment = FileUtils.readFileToString(cpr.getFile(), "utf-8");
	    	break;
	      case DatabaseMeta.TYPE_ACCESS_PLUGIN:
			cpr = new ClassPathResource(databaseName + "_plugin.json", getClass());
			if (!cpr.exists())
				cpr = new ClassPathResource("common_plugin.json", getClass());
			fragment = FileUtils.readFileToString(cpr.getFile(), "utf-8");
			break;
	    }
	    
	    response.setContentType("text/javascript; charset=utf-8");
		response.getWriter().write(fragment);
	    
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/test")
	public void test(HttpServletRequest request, HttpServletResponse response, @RequestParam String databaseInfo) throws IOException, KettleDatabaseException {
	    JSONObject jsonObject = JSONObject.fromObject(databaseInfo);
	    DatabaseMeta dbinfo = DatabaseCodec.decode(jsonObject);
	    String[] remarks = dbinfo.checkParameters();
	    if ( remarks.length == 0 ) {
	    	String reportMessage = dbinfo.testConnection();
	    	
		    response.setContentType("text/javascript; charset=utf-8");
			response.getWriter().write(StringEscapeHelper.encode(reportMessage));
	    } else {
	    	System.out.println("====");
	    }
	}
	
	public DatabaseMeta checkDatabase(String databaseInfo, JSONObject result) throws KettleDatabaseException, IOException {
	    JSONObject jsonObject = JSONObject.fromObject(databaseInfo);
	    DatabaseMeta database = DatabaseCodec.decode(jsonObject);
	    
	    if(database.isUsingConnectionPool()) {
	    	String parameters = "";
	    	JSONArray pool_params = jsonObject.optJSONArray("pool_params");
			for(int i=0; i<pool_params.size(); i++) {
				JSONObject jsonObject2 = pool_params.getJSONObject(i);
				Boolean enabled = jsonObject2.optBoolean("enabled");
				String parameter = jsonObject2.optString("name");
				String value = jsonObject2.optString("defValue");

				if (!enabled) {
					continue;
				}
				
				if(!StringUtils.hasText(value) ) {
					parameters = parameters.concat( parameter ).concat( System.getProperty( "line.separator" ) );
				}
			}
			
			if(parameters.length() > 0) {
				String message = Messages.getString( "DataHandler.USER_INVALID_PARAMETERS" ).concat( parameters );
				result.put("message", message);
				return database;
			}
	    }
	    
	    String[] remarks = database.checkParameters();
	    String message = "";

	    if ( remarks.length != 0 ) {
			for (int i = 0; i < remarks.length; i++) {
				message = message.concat("* ").concat(remarks[i]).concat(System.getProperty("line.separator"));
			}
			result.put("message", message);
			
			return database;
	    } 
	    
	    return database;
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/check")
	public void check(HttpServletRequest request, HttpServletResponse response, @RequestParam String databaseInfo) throws IOException, KettleException {
		JSONObject result = new JSONObject();
		
		checkDatabase(databaseInfo, result);
	    if(result.size() > 0) {
	    	result.put("success", false);
	    	response.setContentType("text/javascript; charset=utf-8");
			response.getWriter().write(result.toString());
			return;
	    }
	    
	    result.put("success", true);
    	response.setContentType("text/javascript; charset=utf-8");
 		response.getWriter().write(result.toString());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/create")
	public void create(HttpServletRequest request, HttpServletResponse response, @RequestParam String databaseInfo) throws IOException, KettleException {
		JSONObject result = new JSONObject();
		
		DatabaseMeta database = checkDatabase(databaseInfo, result);
	    if(result.size() > 0) {
	    	result.put("success", false);
	    	response.setContentType("text/javascript; charset=utf-8");
			response.getWriter().write(result.toString());
			return;
	    }
	    
	    RepositoriesMeta repositories = new RepositoriesMeta();
	    if(repositories.readData()) {
	    	DatabaseMeta previousMeta = repositories.searchDatabase(database.getName());
	    	if(previousMeta != null) {
	    		repositories.removeDatabase(repositories.indexOfDatabase(previousMeta));
	    	}
	    	repositories.addDatabase( database );
	    	repositories.writeData();
	    	
	    	result.put("success", true);
	    	result.put("message", database.getName());
	    	response.setContentType("text/javascript; charset=utf-8");
	 		response.getWriter().write(result.toString());
	    }
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/remove")
	public void remove(HttpServletRequest request, HttpServletResponse response, @RequestParam String databaseName) throws IOException, KettleException {
		JSONObject result = new JSONObject();
		
	    
	    RepositoriesMeta repositories = new RepositoriesMeta();
	    if(repositories.readData()) {
	    	DatabaseMeta previousMeta = repositories.searchDatabase(databaseName);
	    	if(previousMeta != null) {
	    		repositories.removeDatabase(repositories.indexOfDatabase(previousMeta));
	    	}
	    	repositories.writeData();
	    	
	    	result.put("success", true);
	    	response.setContentType("text/javascript; charset=utf-8");
	 		response.getWriter().write(result.toString());
	    }
	}
}
