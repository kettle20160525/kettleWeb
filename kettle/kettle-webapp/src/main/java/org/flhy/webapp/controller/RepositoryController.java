package org.flhy.webapp.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.flhy.ext.App;
import org.flhy.ext.core.database.DatabaseCodec;
import org.flhy.ext.repository.RepositoryCodec;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.DBCache;
import org.pentaho.di.core.Props;
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
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.PluginTypeInterface;
import org.pentaho.di.core.plugins.RepositoryPluginType;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.repository.RepositoriesMeta;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.RepositoryElementMetaInterface;
import org.pentaho.di.repository.RepositoryMeta;
import org.pentaho.di.repository.kdr.KettleDatabaseRepository;
import org.pentaho.di.repository.kdr.KettleDatabaseRepositoryMeta;
import org.pentaho.di.ui.core.PropsUI;
import org.pentaho.di.ui.core.database.dialog.SQLEditor;
import org.pentaho.di.ui.repository.dialog.RepositoryDialogInterface;
import org.pentaho.di.ui.repository.kdr.KettleDatabaseRepositoryDialog;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/repository")
public class RepositoryController {

	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/load")
	protected void load(HttpServletRequest request, HttpServletResponse response) throws Exception {
		RepositoriesMeta input = new RepositoriesMeta();
		JSONArray jsonArray = new JSONArray();
		if (input.readData()) {
			for (int i = 0; i < input.nrRepositories(); i++) {
				RepositoryMeta reposity = input.getRepository(i);
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("type", reposity.getId());
				jsonObject.put("name", reposity.getName());
				jsonObject.put("description", reposity.getDescription());
				jsonArray.add(jsonObject);
			}
		}

		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/type")
	protected void type(HttpServletRequest request, HttpServletResponse response) throws Exception {
		JSONArray jsonArray = new JSONArray();
		
		PluginRegistry registry = PluginRegistry.getInstance();
	    Class<? extends PluginTypeInterface> pluginType = RepositoryPluginType.class;
	    List<PluginInterface> plugins = registry.getPlugins( pluginType );

	    for ( int i = 0; i < plugins.size(); i++ ) {
	      PluginInterface plugin = plugins.get( i );
	      
	      JSONObject jsonObject = new JSONObject();
	      jsonObject.put("type", plugin.getIds()[0]);
	      jsonObject.put("name", plugin.getName() + " : " + plugin.getDescription());
	      jsonArray.add(jsonObject);
	    }

		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/databases")
	protected void databases(HttpServletRequest request, HttpServletResponse response) throws Exception {
		RepositoriesMeta input = new RepositoriesMeta();
		JSONArray jsonArray = new JSONArray();
		if (input.readData()) {
			for (int i = 0; i < input.nrDatabases(); i++) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", input.getDatabase(i).getName());
				jsonArray.add(jsonObject);
			}
		}

		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/database")
	protected void database(HttpServletRequest request, HttpServletResponse response, @RequestParam String database) throws Exception {
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
			response.setContentType("text/html; charset=utf-8");
			response.getWriter().write(jsonObject.toString());
		}
	}

	@ResponseBody
	@RequestMapping(method = RequestMethod.GET, value = "/{reposityId}")
	protected void reposity(HttpServletRequest request, HttpServletResponse response, @PathVariable String reposityId) throws Exception {
		RepositoriesMeta input = new RepositoriesMeta();
		if (input.readData()) {
			RepositoryMeta repositoryMeta = input.searchRepository( reposityId );
			if(repositoryMeta != null) {
				JSONObject jsonObject = RepositoryCodec.encode(repositoryMeta);
				
				response.setContentType("text/html; charset=utf-8");
				response.getWriter().write(jsonObject.toString());
			}
		}
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/explorer")
	protected void explorer(HttpServletRequest request, HttpServletResponse response) throws Exception {
		ArrayList nodes = new ArrayList();
		
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface repositoryDirectory = repository.loadRepositoryDirectoryTree();
		browser(repository, repositoryDirectory.findRoot(), nodes);
		
		response.setContentType("text/javascript; charset=utf-8");
		response.getWriter().write(JSONArray.fromObject(nodes).toString());
	}
	
	private void browser(Repository repository, RepositoryDirectoryInterface dir, ArrayList list) throws KettleException {
		HashMap<String, Object> node = new HashMap<String, Object>();
		node.put("id", "directory_" + dir.getObjectId().getId());
		node.put("objectId", dir.getObjectId().getId());
		node.put("text", dir.getName());
		
		ArrayList children = new ArrayList();
		node.put("children", children);
		list.add(node);
		
		List<RepositoryDirectoryInterface> directorys = dir.getChildren();
		for(RepositoryDirectoryInterface child : directorys)
			browser(repository, child, children);
		
		List<RepositoryElementMetaInterface> elements = repository.getTransformationObjects(dir.getObjectId(), false);
		if(elements != null) {
			for(RepositoryElementMetaInterface e : elements) {
				HashMap<String, Object> leaf = new HashMap<String, Object>();
				leaf.put("id", "transaction_" + e.getObjectId().getId());
				leaf.put("objectId", e.getObjectId().getId());
				leaf.put("text", e.getName());
				leaf.put("iconCls", "trans_tree");
				leaf.put("leaf", true);
				children.add(leaf);
			}
		}
		
		elements = repository.getJobObjects(dir.getObjectId(), false);
		if(elements != null) {
			for(RepositoryElementMetaInterface e : elements) {
				HashMap<String, Object> leaf = new HashMap<String, Object>();
				leaf.put("id", "job_" + e.getObjectId().getId());
				leaf.put("objectId", e.getObjectId().getId());
				leaf.put("text", e.getName());
				leaf.put("iconCls", "job_tree");
				leaf.put("leaf", true);
				children.add(leaf);
			}
		}
	}

	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/createOrUpdate")
	protected void createOrUpdate(HttpServletRequest request, HttpServletResponse response, @RequestParam String reposityInfo) throws Exception {
		JSONObject jsonObject = JSONObject.fromObject(reposityInfo);
		JSONObject reply = new JSONObject();
		
		KettleDatabaseRepositoryMeta repositoryMeta = (KettleDatabaseRepositoryMeta) RepositoryCodec.decode(jsonObject);
		if ( repositoryMeta.getConnection() != null ) {
			KettleDatabaseRepository rep = (KettleDatabaseRepository) PluginRegistry.getInstance().loadClass( RepositoryPluginType.class,  repositoryMeta, Repository.class );
	        rep.init( repositoryMeta );
	        
	        if ( !rep.getDatabaseMeta().getDatabaseInterface().supportsRepository() ) {
	            // Show a warning box "This database type is not supported for the use as a database repository."
	            System.out.println( "Show database type is not supported warning..." );
	            	
	            reply.put("unSupportedDatabase", true);
	        }
	        
			System.out.println("Connecting to database for repository creation...");
			rep.connectionDelegate.connect(true, true);

			try {
				String userTableName = rep.getDatabaseMeta().quoteField(KettleDatabaseRepository.TABLE_R_USER);
				boolean upgrade = rep.getDatabase().checkTableExists( userTableName );
				if (upgrade) {
					reply.put("opertype", "update");
				} else {
					reply.put("opertype", "create");
				}
			} catch (KettleDatabaseException dbe) {
				rep.rollback();
			}
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(reply.toString());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/schema")
	protected void schema(HttpServletRequest request, HttpServletResponse response, @RequestParam String reposityInfo, @RequestParam boolean upgrade) throws Exception {
		JSONObject jsonObject = JSONObject.fromObject(reposityInfo);
		JSONObject reply = new JSONObject();
		
		KettleDatabaseRepositoryMeta repositoryMeta = (KettleDatabaseRepositoryMeta) RepositoryCodec.decode(jsonObject);
		if ( repositoryMeta.getConnection() != null ) {
			KettleDatabaseRepository rep = (KettleDatabaseRepository) PluginRegistry.getInstance().loadClass( RepositoryPluginType.class,  repositoryMeta, Repository.class );
	        rep.init( repositoryMeta );
	        
	        ArrayList<String> statements = new ArrayList<String>();
	        rep.createRepositorySchema(null, upgrade, statements, true);
	        
	        StringBuffer sql = new StringBuffer();
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
			reply.put("statements", StringEscapeHelper.encode(sql.toString()));
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(reply.toString());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/execute")
	protected void execute(HttpServletRequest request, HttpServletResponse response, @RequestParam String reposityInfo, @RequestParam String script) throws Exception {
		JSONObject reposityJson = JSONObject.fromObject(reposityInfo);
		JSONObject reply = new JSONObject();
		
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
	        
	        
	        
	        reply.put("message", StringEscapeHelper.encode(message.toString()));
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(reply.toString());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/drop")
	protected void drop(HttpServletRequest request, HttpServletResponse response, @RequestParam String reposityInfo, @RequestParam String password) throws Exception {
		JSONObject jsonObject = JSONObject.fromObject(reposityInfo);
		JSONObject reply = new JSONObject();
		
		KettleDatabaseRepositoryMeta repositoryMeta = (KettleDatabaseRepositoryMeta) RepositoryCodec.decode(jsonObject);
		if ( repositoryMeta.getConnection() != null ) {
			KettleDatabaseRepository reposity = (KettleDatabaseRepository) PluginRegistry.getInstance().loadClass( RepositoryPluginType.class,  repositoryMeta, Repository.class );
			reposity.init( repositoryMeta );
	        
	        try {
	        	reposity.connect( "admin", password );
	            try {
	            	reposity.dropRepositorySchema();
	            	
	            	reply.put("title", BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.RemovedRepositoryTables.Title" ));
	            	reply.put("msg", BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.RemovedRepositoryTables.Message" ));
	            } catch ( KettleDatabaseException dbe ) {
	            	reply.put("title", BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.UnableToRemoveRepository.Title" ));
	            	reply.put("msg", BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.UnableToRemoveRepository.Message" )
	  	                  + Const.CR + dbe.getMessage());
	            }
	          } catch ( KettleException e ) {
	        	  reply.put("title", BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.UnableToVerifyAdminUser.Title" ));
	        	  reply.put("msg", BaseMessages.getString( RepositoryDialogInterface.class, "RepositoryDialog.Dialog.UnableToVerifyAdminUser.Message" )
	  	                  + Const.CR + e.getMessage());
	          } finally {
	        	  reposity.disconnect();
	          }
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(reply.toString());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/add")
	protected void add(HttpServletRequest request, HttpServletResponse response, @RequestParam String reposityInfo, @RequestParam boolean add) throws Exception {
		JSONObject jsonObject = JSONObject.fromObject(reposityInfo);
		JSONObject reply = new JSONObject();
		reply.put("success", true);
		
		RepositoryMeta repositoryMeta = RepositoryCodec.decode(jsonObject);
		Repository reposity = PluginRegistry.getInstance().loadClass( RepositoryPluginType.class,  repositoryMeta, Repository.class );
		reposity.init( repositoryMeta );
	        
		if ( repositoryMeta instanceof KettleDatabaseRepositoryMeta && StringUtils.hasText(jsonObject.optJSONObject("extraOptions").optString("database")) ) {
			reply.put("success", false);
			reply.put("title", BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ));
			reply.put("message", BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorNoConnection.Message" ));
		} else if(!StringUtils.hasText(repositoryMeta.getName())) {
			reply.put("success", false);
	        reply.put("title", BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ));
			reply.put("message", BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorNoId.Message" ));
		} else if(!StringUtils.hasText(repositoryMeta.getDescription())) {
			reply.put("success", false);
	        reply.put("title", BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ));
			reply.put("message", BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorNoName.Message" ));
		} else {
			RepositoriesMeta input = new RepositoriesMeta();
			input.readData();
			
			if(add) {
				if(input.searchRepository(repositoryMeta.getName()) != null) {
					reply.put("success", false);
				    reply.put("title", BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ));
					reply.put("message", BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorIdExist.Message", repositoryMeta.getName() ));
				} else {
					input.addRepository(repositoryMeta);
					input.writeData();
				}
			} else {
				RepositoryMeta previous = input.searchRepository(repositoryMeta.getName());
				input.removeRepository(input.indexOfRepository(previous));
				input.addRepository(repositoryMeta);
				input.writeData();
			}
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(reply.toString());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/remove")
	protected void remove(HttpServletRequest request, HttpServletResponse response, @RequestParam String repositoryName) throws Exception {
		JSONObject reply = new JSONObject();
		RepositoriesMeta input = new RepositoriesMeta();
		input.readData();
		
		RepositoryMeta previous = input.searchRepository(repositoryName);
		input.removeRepository(input.indexOfRepository(previous));
		input.writeData();
		
		reply.put("success", true);
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(reply.toString());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/login")
	protected void login(HttpServletRequest request, HttpServletResponse response, @RequestParam String loginInfo) throws Exception {
		JSONObject jsonObject = JSONObject.fromObject(loginInfo);
		JSONObject reply = new JSONObject();
		reply.put("success", true);
		
		try {
			RepositoriesMeta input = new RepositoriesMeta();
			if (input.readData()) {
				RepositoryMeta repositoryMeta = input.searchRepository( jsonObject.optString("reposityId") );
				if(repositoryMeta != null) {
					Repository repository = PluginRegistry.getInstance().loadClass(RepositoryPluginType.class, repositoryMeta.getId(), Repository.class );
				    repository.init( repositoryMeta );
				    repository.connect( jsonObject.optString("username"), jsonObject.optString("password") );
				    
				    Props.getInstance().setLastRepository( repositoryMeta.getName() );
				    Props.getInstance().setLastRepositoryLogin( jsonObject.optString("username") );
				    Props.getInstance().setProperty( PropsUI.STRING_START_SHOW_REPOSITORIES, jsonObject.optBoolean("atStartupShown") ? "Y" : "N");
				    
				    Props.getInstance().saveProps();
				    
				    App.getInstance().selectRepository(repository);
				}
			}
		} catch(Exception e) {
			e.printStackTrace();
			reply.put("success", false);
			reply.put("msg", e.getMessage());
		} 
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(reply.toString());
	}
	
	public static final LoggingObjectInterface loggingObject = new SimpleLoggingObject("SQL Editor", LoggingObjectType.SPOON, null );
}
