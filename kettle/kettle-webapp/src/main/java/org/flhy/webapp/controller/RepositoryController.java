package org.flhy.webapp.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.flhy.ext.App;
import org.flhy.ext.PluginFactory;
import org.flhy.ext.base.GraphCodec;
import org.flhy.ext.repository.RepositoryCodec;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.flhy.ext.utils.SvgImageUrl;
import org.flhy.webapp.utils.JsonUtils;
import org.pentaho.di.core.Props;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.exception.KettlePluginException;
import org.pentaho.di.core.exception.KettleSecurityException;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.PluginTypeInterface;
import org.pentaho.di.core.plugins.RepositoryPluginType;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.laf.BasePropertyHandler;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.RepositoriesMeta;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.RepositoryElementMetaInterface;
import org.pentaho.di.repository.RepositoryMeta;
import org.pentaho.di.repository.RepositoryObject;
import org.pentaho.di.repository.RepositoryObjectType;
import org.pentaho.di.repository.StringObjectId;
import org.pentaho.di.repository.kdr.KettleDatabaseRepositoryMeta;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.ui.core.PropsUI;
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

	/**
	 * 该方法返回所有的资源库信息
	 * 
	 * @throws KettleException 
	 * @throws IOException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/list")
	protected void list() throws KettleException, IOException {
		RepositoriesMeta input = new RepositoriesMeta();
		JSONArray jsonArray = new JSONArray();
		if (input.readData()) {
			for (int i = 0; i < input.nrRepositories(); i++) {
				RepositoryMeta repositoryMeta = input.getRepository(i);
				jsonArray.add(RepositoryCodec.encode(repositoryMeta));
			}
		}

		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/createDir")
	protected void createDir(@RequestParam String dir, @RequestParam String name) throws KettleException, IOException {
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface path = repository.findDirectory(new StringObjectId(dir));
		RepositoryDirectoryInterface newdir = repository.createRepositoryDirectory(path, name);
		JsonUtils.success(newdir.getObjectId().getId());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/createTrans")
	protected void createTrans(@RequestParam String dir, @RequestParam String transName) throws KettleException, IOException {
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface path = repository.findDirectory(new StringObjectId(dir));
		
//		String name = null;
//		int i=1;
//		do {
//			name = BaseMessages.getString( Spoon.class, "Spoon.STRING_TRANSFORMATION" ) + i;
//			if(!repository.exists(name, path, RepositoryObjectType.TRANSFORMATION))
//				break;
//			i++;
//		} while(true);
		if(repository.exists(transName, path, RepositoryObjectType.TRANSFORMATION)) {
			JsonUtils.fail("该转换已经存在，请重新输入！");
			return;
		}
		
		TransMeta transMeta = new TransMeta();
		transMeta.setRepository(App.getInstance().getRepository());
		transMeta.setMetaStore(App.getInstance().getMetaStore());
		transMeta.setName(transName);
		transMeta.setRepositoryDirectory(path);
		
		repository.save(transMeta, "add: " + new Date(), null);
		
//		String xml = XMLHandler.getXMLHeader() + transMeta.getXML();
//		DataOutputStream dos = new DataOutputStream(KettleVFS.getOutputStream(transMeta.getFilename(), false));
//		dos.write(xml.getBytes(Const.XML_ENCODING));
//		dos.close();
		
		ObjectId id = repository.getTransformationID(transName, path);
		
		JsonUtils.success(id.getId());
//		RepositoryDirectoryInterface dir = repository.createRepositoryDirectory(path, name);
//		JsonUtils.success(dir.getObjectId().getId());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/createJob")
	protected void createJob(@RequestParam String dir, @RequestParam String jobName) throws KettleException, IOException {
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface path = repository.findDirectory(new StringObjectId(dir));
		
		if(repository.exists(jobName, path, RepositoryObjectType.JOB)) {
			JsonUtils.fail("该转换已经存在，请重新输入！");
			return;
		}
		
		JobMeta jobMeta = new JobMeta();
		jobMeta.setRepository(App.getInstance().getRepository());
		jobMeta.setMetaStore(App.getInstance().getMetaStore());
		jobMeta.setName(jobName);
		jobMeta.setRepositoryDirectory(path);
		
		repository.save(jobMeta, "add: " + new Date(), null);
		
		ObjectId id = repository.getJobId(jobName, path);
		JsonUtils.success(id.getId());
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/drop")
	protected void drop(@RequestParam String id, @RequestParam int type) throws KettleException, IOException {
		Repository repository = App.getInstance().getRepository();
		if(type == 0) {
			repository.deleteTransformation(new StringObjectId(id));
		} else if(type == 1) {
			repository.deleteJob(new StringObjectId(id));
		} else if(type == -1) {
			RepositoryDirectoryInterface dir = repository.findDirectory(new StringObjectId(id));
			if(repository.getJobAndTransformationObjects(dir.getObjectId(), true).size() > 0) {
				JsonUtils.fail("删除失败，该目录下存在子元素，请先移除他们！");
				return;
			}
			
			if(repository.getDirectoryNames(dir.getObjectId()).length > 0) {
				JsonUtils.fail("删除失败，该目录下存在子元素，请先移除他们！");
				return;
			}
			
			repository.deleteRepositoryDirectory(dir);
		}
		
		JsonUtils.success("操作成功");
	}
	
	/**
	 * 该方法打开资源库中的资源，可能转换或作业
	 * 
	 * @param objectId
	 * @param type
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/open")
	protected void open(@RequestParam String objectId, @RequestParam int type) throws Exception {
		JSONObject jsonObject = new JSONObject();
		
	    if(type == 0) {	//trans
	    	jsonObject.put("GraphType", "TransGraph");
	    	ObjectId id = new StringObjectId( objectId );
	    	
	    	RepositoryObject repositoryObject = App.getInstance().getRepository().getObjectInformation(id, RepositoryObjectType.TRANSFORMATION);
			TransMeta transMeta = App.getInstance().getRepository().loadTransformation(id, null);
			transMeta.setRepositoryDirectory(repositoryObject.getRepositoryDirectory());
	    	
			GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
			String graphXml = codec.encode(transMeta);
			
			jsonObject.put("graphXml", StringEscapeHelper.encode(graphXml));
	    } else if(type == 1) { //job
	    	jsonObject.put("GraphType", "JobGraph");
	        
	    	ObjectId id = new StringObjectId( objectId );
	    	RepositoryObject repositoryObject = App.getInstance().getRepository().getObjectInformation(id, RepositoryObjectType.JOB);
	    	JobMeta jobMeta = App.getInstance().getRepository().loadJob(id, null);
	    	jobMeta.setRepositoryDirectory(repositoryObject.getRepositoryDirectory());
	    	
	    	GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.JOB_CODEC);
			String graphXml = codec.encode(jobMeta);
			
			jsonObject.put("graphXml", StringEscapeHelper.encode(graphXml));
	    }
	    
	    JsonUtils.response(jsonObject);
	}
	
	/**
	 * 该方法获取所有的仓库类型，目前支持数据库和文件系统类型
	 * @throws IOException 
	 * 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/types")
	protected void types() throws IOException {
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

	    JsonUtils.response(jsonArray);
	}

	/**
	 * 加载制定的资源库信息
	 * 
	 * @param reposityId
	 * @throws IOException 
	 * @throws KettleException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.GET, value = "/{reposityId}")
	protected void reposity(@PathVariable String reposityId) throws KettleException, IOException {
		RepositoriesMeta input = new RepositoriesMeta();
		if (input.readData()) {
			RepositoryMeta repositoryMeta = input.searchRepository( reposityId );
			if(repositoryMeta != null) {
				JsonUtils.response(RepositoryCodec.encode(repositoryMeta));
			}
		}
	}
	
	/**
	 * 资源库浏览，生成树结构
	 * 
	 * @throws KettleException 
	 * @throws IOException 
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/explorer")
	protected void explorer(@RequestParam boolean includeElement, @RequestParam String type) throws KettleException, IOException {
		JSONArray nodes = new JSONArray();
		
		Repository repository = App.getInstance().getRepository();
		RepositoryDirectoryInterface repositoryDirectory = repository.loadRepositoryDirectoryTree();
		browser(repository, repositoryDirectory.findRoot(), nodes, includeElement, type);
		
		JsonUtils.response(nodes);
	}
	
	private void browser(Repository repository, RepositoryDirectoryInterface dir, ArrayList list, boolean includeElement, String type) throws KettleException {
		HashMap<String, Object> node = new HashMap<String, Object>();
		node.put("id", "directory_" + dir.getObjectId().getId());
		node.put("objectId", dir.getObjectId().getId());
		node.put("text", dir.getName());
		
		ArrayList children = new ArrayList();
		node.put("children", children);
		list.add(node);
		
		List<RepositoryDirectoryInterface> directorys = dir.getChildren();
		for(RepositoryDirectoryInterface child : directorys)
			browser(repository, child, children, includeElement, type);
		
		if(includeElement) {
			if(RepositoryObjectType.TRANSFORMATION.getTypeDescription().equals(type) || "all".equalsIgnoreCase(type)) {
				List<RepositoryElementMetaInterface> elements = repository.getTransformationObjects(dir.getObjectId(), false);
				if(elements != null) {
					for(RepositoryElementMetaInterface e : elements) {
						HashMap<String, Object> leaf = new HashMap<String, Object>();
						leaf.put("id", "transaction_" + e.getObjectId().getId());
						leaf.put("objectId", e.getObjectId().getId());
						leaf.put("text", e.getName());
						leaf.put("iconCls", "trans");
						leaf.put("leaf", true);
						children.add(leaf);
					}
				}
			}
			
			if(RepositoryObjectType.JOB.getTypeDescription().equals(type) || "all".equalsIgnoreCase(type)) {
				List<RepositoryElementMetaInterface> elements = repository.getJobObjects(dir.getObjectId(), false);
				if(elements != null) {
					for(RepositoryElementMetaInterface e : elements) {
						HashMap<String, Object> leaf = new HashMap<String, Object>();
						leaf.put("id", "job_" + e.getObjectId().getId());
						leaf.put("objectId", e.getObjectId().getId());
						leaf.put("text", e.getName());
						leaf.put("iconCls", "job");
						leaf.put("leaf", true);
						children.add(leaf);
					}
				}
			}
		}
		
	}
	
	/**
	 * 新增或修改资源库
	 * 
	 * @param reposityInfo
	 * @param add 操作类型,true - 新建
	 * @throws IOException 
	 * @throws KettleException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/add")
	protected void add(@RequestParam String reposityInfo, @RequestParam boolean add) throws IOException, KettleException {
		JSONObject jsonObject = JSONObject.fromObject(reposityInfo);
		
		RepositoryMeta repositoryMeta = RepositoryCodec.decode(jsonObject);
		Repository reposity = PluginRegistry.getInstance().loadClass( RepositoryPluginType.class,  repositoryMeta, Repository.class );
		reposity.init( repositoryMeta );
	        
		if ( repositoryMeta instanceof KettleDatabaseRepositoryMeta && !StringUtils.hasText(jsonObject.optJSONObject("extraOptions").optString("database")) ) {
			JsonUtils.fail(BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ), 
					BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorNoConnection.Message" ));
			return;
		} else if(!StringUtils.hasText(repositoryMeta.getName())) {
			JsonUtils.fail(BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ), 
					BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorNoId.Message" ));
			return;
		} else if(!StringUtils.hasText(repositoryMeta.getDescription())) {
			JsonUtils.fail(BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ), 
					BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorNoName.Message" ));
			return;
		} else {
			RepositoriesMeta input = new RepositoriesMeta();
			input.readData();
			
			if(add) {
				if(input.searchRepository(repositoryMeta.getName()) != null) {
					JsonUtils.fail(BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.Error.Title" ), 
							BaseMessages.getString( KettleDatabaseRepositoryDialog.class, "RepositoryDialog.Dialog.ErrorIdExist.Message", repositoryMeta.getName()));
					return;
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
		
		JsonUtils.success("操作成功！");
	}
	
	/**
	 * 删除资源库
	 * 
	 * @param repositoryName
	 * @throws KettleException 
	 * @throws IOException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/remove")
	protected void remove(@RequestParam String repositoryName) throws KettleException, IOException {
		RepositoriesMeta input = new RepositoriesMeta();
		input.readData();
		
		RepositoryMeta previous = input.searchRepository(repositoryName);
		input.removeRepository(input.indexOfRepository(previous));
		input.writeData();
		
		JsonUtils.success("操作成功！");
	}
	
	/**
	 * 登录资源库
	 * 
	 * @param loginInfo
	 * @throws IOException 
	 * @throws KettleException 
	 * @throws KettleSecurityException 
	 * @throws KettlePluginException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/login")
	protected void login(@RequestParam String loginInfo) throws IOException, KettlePluginException, KettleSecurityException, KettleException {
		JSONObject jsonObject = JSONObject.fromObject(loginInfo);
		
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
		
		JsonUtils.success("登录成功！");
	}
	
	
	/**
	 * 断开资源库
	 * 
	 * @param loginInfo
	 * @throws IOException 
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/logout")
	protected void logout() throws IOException {
		App.getInstance().selectRepository(App.getInstance().getDefaultRepository());
		JsonUtils.success("操作成功！");
	}
	
}
