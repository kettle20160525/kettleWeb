package org.flhy.webapp.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.flhy.ext.core.database.DatabaseCodec;
import org.flhy.ext.core.database.DatabaseType;
import org.flhy.ext.repository.RepositoryCodec;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.flhy.webapp.utils.JsonUtils;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.DBCache;
import org.pentaho.di.core.database.Database;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.database.PartitionDatabaseMeta;
import org.pentaho.di.core.database.SqlScriptStatement;
import org.pentaho.di.core.exception.KettleDatabaseException;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.logging.KettleLogStore;
import org.pentaho.di.core.logging.LoggingObjectInterface;
import org.pentaho.di.core.logging.LoggingObjectType;
import org.pentaho.di.core.logging.SimpleLoggingObject;
import org.pentaho.di.core.plugins.DatabasePluginType;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.RepositoryPluginType;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.repository.RepositoriesMeta;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.kdr.KettleDatabaseRepository;
import org.pentaho.di.repository.kdr.KettleDatabaseRepositoryMeta;
import org.pentaho.di.ui.core.database.dialog.SQLEditor;
import org.pentaho.di.ui.repository.dialog.RepositoryDialogInterface;
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
	
	/**
	 * 该方法获取所有的全局数据库配置名称
	 * @throws KettleException 
	 * @throws IOException 
	 */
	@ResponseBody
	@RequestMapping(method = {RequestMethod.POST, RequestMethod.GET}, value = "/listNames")
	protected void listNames() throws KettleException, IOException {
		RepositoriesMeta input = new RepositoriesMeta();
		JSONArray jsonArray = new JSONArray();
		if (input.readData()) {
			for (int i = 0; i < input.nrDatabases(); i++) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", input.getDatabase(i).getName());
				jsonArray.add(jsonObject);
			}
		}
		JsonUtils.response(jsonArray);
	}

	/**
	 * 获取支持的数据库类型，如Oracle,MySQL等
	 * @throws IOException
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/accessData")
	public void loadAccessData() throws IOException {
		JSONArray jsonArray = JSONArray.fromObject(DatabaseType.instance().loadSupportedDatabaseTypes());
		JsonUtils.response(jsonArray);
	}
	
	/**
	 * 通过数据库类型获取访问方式：如JNDI、JDBC还是ODBC
	 * 
	 * @param accessData - 数据库类型
	 * @throws IOException
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/accessMethod")
	public void loadAccessMethod(@RequestParam String accessData) throws IOException {
		JSONArray jsonArray = JSONArray.fromObject(DatabaseType.instance().loadSupportedDatabaseMethodsByTypeId(accessData));
		JsonUtils.response(jsonArray);
	}
	
	/**
	 * 获取数据库配置面板，需要数据库类型及访问方式确定，主要包含了URL、username、password、端口等信息
	 * 
	 * @param accessData
	 * @param accessMethod
	 * @throws IOException
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/accessSettings")
	public void loadAccessSettings(@RequestParam String accessData, @RequestParam int accessMethod) throws IOException {
	    String databaseName = null;
	    try {
	      databaseName = PluginRegistry.getInstance().getPlugin( DatabasePluginType.class, accessData).getIds()[0];
	    } catch ( Exception e ) {
	      e.printStackTrace();
	    }
		
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
	    
	    JsonUtils.success(fragment);
	}
	
	/**
	 * 测试数据库
	 * 
	 * @param databaseInfo
	 * @throws IOException
	 * @throws KettleDatabaseException
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/test")
	public void test(@RequestParam String databaseInfo) throws IOException, KettleDatabaseException {
	    JSONObject jsonObject = JSONObject.fromObject(databaseInfo);
	    DatabaseMeta dbinfo = DatabaseCodec.decode(jsonObject);
	    String[] remarks = dbinfo.checkParameters();
	    if ( remarks.length == 0 ) {
	    	String reportMessage = dbinfo.testConnection();
			JsonUtils.success(StringEscapeHelper.encode(reportMessage));
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
	
	/**
	 * 保存之前的后台校验，对一些非空选项进行检查
	 * 
	 * @param databaseInfo
	 * @throws IOException
	 * @throws KettleException
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/check")
	public void check(@RequestParam String databaseInfo) throws IOException, KettleException {
		JSONObject result = new JSONObject();
		
		checkDatabase(databaseInfo, result);
	    if(result.size() > 0) {
	    	JsonUtils.fail(result.toString());
			return;
	    }
	    
	    JsonUtils.success(result.toString());
	}
	

	/**
	 * 根据databaseName加载该数据库的所有配置信息
	 * 
	 * @param database
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/load")
	protected void database(@RequestParam String database) throws Exception {
		RepositoriesMeta input = new RepositoriesMeta();
		DatabaseMeta databaseMeta = null;
		if (input.readData()) {
			for (int i = 0; i < input.nrDatabases(); i++) {
				if(input.getDatabase(i).getName().equals(database)) {
					databaseMeta = input.getDatabase(i);
					break;
				}
			}
		}
		if(databaseMeta != null) {
			JSONObject jsonObject = DatabaseCodec.encode(databaseMeta);
			JsonUtils.response(jsonObject);
		}
	}
	
	/**
	 * 持久化数据库信息
	 * 
	 * @param databaseInfo
	 * @throws IOException
	 * @throws KettleException
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/create")
	public void create(@RequestParam String databaseInfo) throws IOException, KettleException {
		JSONObject result = new JSONObject();
		
		DatabaseMeta database = checkDatabase(databaseInfo, result);
	    if(result.size() > 0) {
			JsonUtils.fail(result.toString());
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
	    	
	    	JsonUtils.success(database.getName());
	    }
	}
	
	/**
	 * 移除数据库
	 * 
	 * @param databaseName
	 * @throws IOException
	 * @throws KettleException
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/remove")
	public void remove(@RequestParam String databaseName) throws IOException, KettleException {
		JSONObject result = new JSONObject();
		
	    
	    RepositoriesMeta repositories = new RepositoriesMeta();
	    if(repositories.readData()) {
	    	DatabaseMeta previousMeta = repositories.searchDatabase(databaseName);
	    	if(previousMeta != null) {
	    		repositories.removeDatabase(repositories.indexOfDatabase(previousMeta));
	    	}
	    	repositories.writeData();
	    	
	    	JsonUtils.success(result.toString());
	    }
	}
	
	/**
	 * 校验数据库环境，确定该数据库是否已经被初始化
	 * 
	 * @param reposityInfo
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/checkInit")
	protected void checkInit(@RequestParam String connection) throws Exception {
		JSONObject jsonObject = new JSONObject();
		
		RepositoriesMeta input = new RepositoriesMeta();
		if (input.readData()) {
			DatabaseMeta database = input.searchDatabase(connection);
			if (database != null) {
				if (!database.getDatabaseInterface().supportsRepository()) {
					System.out.println("Show database type is not supported warning...");
					jsonObject.put("unSupportedDatabase", true);
				}
				
				System.out.println("Connecting to database for repository creation...");
				Database db = new Database( loggingObject, database );
				db.connect(null);
				
				String userTableName = database.quoteField(KettleDatabaseRepository.TABLE_R_USER);
				boolean upgrade = db.checkTableExists( userTableName );
				if (upgrade) {
					jsonObject.put("opertype", "update");
				} else {
					jsonObject.put("opertype", "create");
				}
			}
		}
		
		JsonUtils.response(jsonObject);
		
//		KettleDatabaseRepositoryMeta repositoryMeta = (KettleDatabaseRepositoryMeta) RepositoryCodec.decode(jsonObject);
//		if ( repositoryMeta.getConnection() != null ) {
//			KettleDatabaseRepository rep = (KettleDatabaseRepository) PluginRegistry.getInstance().loadClass( RepositoryPluginType.class,  repositoryMeta, Repository.class );
//	        rep.init( repositoryMeta );
//	        
//	        if ( !rep.getDatabaseMeta().getDatabaseInterface().supportsRepository() ) {
//	            System.out.println( "Show database type is not supported warning..." );
//	            	
//	            reply.put("unSupportedDatabase", true);
//	        }
//	        
//			System.out.println("Connecting to database for repository creation...");
//			rep.connectionDelegate.connect(true, true);
//
//			try {
//				String userTableName = rep.getDatabaseMeta().quoteField(KettleDatabaseRepository.TABLE_R_USER);
//				boolean upgrade = rep.getDatabase().checkTableExists( userTableName );
//				if (upgrade) {
//					reply.put("opertype", "update");
//				} else {
//					reply.put("opertype", "create");
//				}
//			} catch (KettleDatabaseException dbe) {
//				rep.rollback();
//			}
//		}
		
	}
	
	/**
	 * 生成数据库初始化数据库脚本
	 * 
	 * @param reposityInfo
	 * @param upgrade
	 * @throws IOException 
	 * @throws KettleException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/schema")
	protected void schema(@RequestParam String reposityInfo, @RequestParam boolean upgrade) throws IOException, KettleException {
		JSONObject jsonObject = JSONObject.fromObject(reposityInfo);
//		JSONObject reply = new JSONObject();
		
		StringBuffer sql = new StringBuffer();
		KettleDatabaseRepositoryMeta repositoryMeta = (KettleDatabaseRepositoryMeta) RepositoryCodec.decode(jsonObject);
		if ( repositoryMeta.getConnection() != null ) {
			KettleDatabaseRepository rep = (KettleDatabaseRepository) PluginRegistry.getInstance().loadClass( RepositoryPluginType.class,  repositoryMeta, Repository.class );
	        rep.init( repositoryMeta );
	        
	        ArrayList<String> statements = new ArrayList<String>();
	        rep.createRepositorySchema(null, upgrade, statements, true);
	        
	        
            sql.append( "-- Repository creation/upgrade DDL: " ).append( Const.CR );
            sql.append( "--" ).append( Const.CR );
            sql.append( "-- Nothing was created nor modified in the target repository database." ).append( Const.CR );
            sql.append( "-- Hit the OK button to execute the generated SQL or Close to reject the changes." ).append( Const.CR );
            sql.append( "-- Please note that it is possible to change/edit the generated SQL before execution." ).append( Const.CR );
            sql.append( "--" ).append( Const.CR );
			for (String statement : statements) {
				if (statement.endsWith(";")) {
					sql.append(statement).append(Const.CR);
				} else {
					sql.append(statement).append(";").append(Const.CR).append(Const.CR);
				}
			}
//			reply.put("statements", StringEscapeHelper.encode(sql.toString()));
		}
		
		JsonUtils.success(StringEscapeHelper.encode(sql.toString()));
	}
	
	/**
	 * 删除数据库中的数据表
	 * 
	 * @param reposityInfo
	 * @param password
	 * @throws IOException 
	 * @throws KettleException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/drop")
	protected void drop(@RequestParam String reposityInfo, @RequestParam String password) throws IOException, KettleException {
		JSONObject jsonObject = JSONObject.fromObject(reposityInfo);
		
		KettleDatabaseRepositoryMeta repositoryMeta = (KettleDatabaseRepositoryMeta) RepositoryCodec.decode(jsonObject);
		if ( repositoryMeta.getConnection() != null ) {
			KettleDatabaseRepository reposity = (KettleDatabaseRepository) PluginRegistry.getInstance().loadClass( RepositoryPluginType.class,  repositoryMeta, Repository.class );
			reposity.init( repositoryMeta );
	        
	        try {
	        	reposity.connect( "admin", password );
	            try {
	            	reposity.dropRepositorySchema();
	            	
	            	JsonUtils.success(BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.RemovedRepositoryTables.Title" ),
	            			BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.RemovedRepositoryTables.Message" ));
	            } catch ( KettleDatabaseException dbe ) {
	            	JsonUtils.fail( BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.UnableToRemoveRepository.Title" ),
	            			BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.UnableToRemoveRepository.Message" )  + Const.CR + dbe.getMessage());
	            	return;
	            }
	          } catch ( KettleException e ) {
	        	  JsonUtils.fail( BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.UnableToVerifyAdminUser.Title" ),
	        			  BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.UnableToVerifyAdminUser.Message" )  + Const.CR + e.getMessage());
	        	  return;
	          } finally {
	        	  reposity.disconnect();
	          }
		}
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/execute")
	protected void execute(@RequestParam String reposityInfo, @RequestParam String script) throws Exception {
		JSONObject reposityJson = JSONObject.fromObject(reposityInfo);
//		JSONObject reply = new JSONObject();
		
		KettleDatabaseRepositoryMeta repositoryMeta = (KettleDatabaseRepositoryMeta) RepositoryCodec.decode(reposityJson);
		if ( repositoryMeta.getConnection() != null ) {
			KettleDatabaseRepository rep = (KettleDatabaseRepository) PluginRegistry.getInstance().loadClass( RepositoryPluginType.class,  repositoryMeta, Repository.class );
	        rep.init( repositoryMeta );
	        
	        DatabaseMeta connection = repositoryMeta.getConnection();
	        StringBuffer message = new StringBuffer();
	        
	        Database db = new Database( loggingObject, connection );
	        boolean first = true;
	        PartitionDatabaseMeta[] partitioningInformation = connection.getPartitioningInformation();

	        for ( int partitionNr = 0; first
	          || ( partitioningInformation != null && partitionNr < partitioningInformation.length ); partitionNr++ ) {
	          first = false;
	          String partitionId = null;
	          if ( partitioningInformation != null && partitioningInformation.length > 0 ) {
	        	  partitionId = partitioningInformation[partitionNr].getPartitionId();
	          }
	          try {
	        	  db.connect( partitionId );
	        	  List<SqlScriptStatement> statements = connection.getDatabaseInterface().getSqlScriptStatements( StringEscapeHelper.decode(script) + Const.CR );
	        	  
	        	  int nrstats = 0;
	              for ( SqlScriptStatement sql : statements ) {
	                if ( sql.isQuery() ) {
	                  // A Query

	                  nrstats++;
	                    List<Object[]> rows = db.getRows( sql.getStatement(), 1000 );
	                    RowMetaInterface rowMeta = db.getReturnRowMeta();
	                    if ( rows.size() > 0 ) {
//	                      PreviewRowsDialog prd =
//	                        new PreviewRowsDialog( shell, ci, SWT.NONE, BaseMessages.getString(
//	                          PKG, "SQLEditor.ResultRows.Title", Integer.toString( nrstats ) ), rowMeta, rows );
//	                      prd.open();
	                    } else {
//	                      MessageBox mb = new MessageBox( shell, SWT.ICON_INFORMATION | SWT.OK );
//	                      mb.setMessage( BaseMessages.getString( PKG, "SQLEditor.NoRows.Message", sql ) );
//	                      mb.setText( BaseMessages.getString( PKG, "SQLEditor.NoRows.Title" ) );
//	                      mb.open();
	                    }
	                } else {

	                  // A DDL statement
	                  nrstats++;
	                  int startLogLine = KettleLogStore.getLastBufferLineNr();
	                  try {

	                    db.execStatement( sql.getStatement() );

	                    message.append( BaseMessages.getString( SQLEditor.class, "SQLEditor.Log.SQLExecuted", sql ) );
	                    message.append( Const.CR );

	                    // Clear the database cache, in case we're using one...
	                    if ( DBCache.getInstance() != null ) {
	                    	DBCache.getInstance().clear( connection.getName() );
	                    }

	                    // mark the statement in green in the dialog...
	                    //
	                    sql.setOk( true );
	                  } catch ( Exception dbe ) {
	                    sql.setOk( false );
	                    String error = BaseMessages.getString( SQLEditor.class, "SQLEditor.Log.SQLExecError", sql, dbe.toString() );
	                    message.append( error ).append( Const.CR );
	                  } finally {
	                    int endLogLine = KettleLogStore.getLastBufferLineNr();
	                    sql.setLoggingText( KettleLogStore.getAppender().getLogBufferFromTo(
	                      db.getLogChannelId(), true, startLogLine, endLogLine ).toString() );
	                    sql.setComplete( true );
	                  }
	                }
	              }
	              
	              message.append( BaseMessages.getString( SQLEditor.class, "SQLEditor.Log.StatsExecuted", Integer.toString( nrstats ) ) );
	  	        if ( partitionId != null ) {
	  	        	message.append( BaseMessages.getString( SQLEditor.class, "SQLEditor.Log.OnPartition", partitionId ) );
	  	        }
	  	        message.append( Const.CR );
	          } catch(Exception e) {
	        	  e.printStackTrace();
	          }
	        }
	        
	        JsonUtils.success(StringEscapeHelper.encode(message.toString()));
	        
		}
		
	}
	
	public static final LoggingObjectInterface loggingObject = new SimpleLoggingObject("DatabaseController", LoggingObjectType.DATABASE, null );
}
