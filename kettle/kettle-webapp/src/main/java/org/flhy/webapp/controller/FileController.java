package org.flhy.webapp.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.flhy.ext.App;
import org.flhy.ext.job.JobEncoder;
import org.flhy.ext.trans.TransEncoder;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.RepositoryObject;
import org.pentaho.di.repository.RepositoryObjectType;
import org.pentaho.di.repository.StringObjectId;
import org.pentaho.di.trans.TransMeta;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxUtils;
import com.mxgraph.view.mxGraph;

@Controller
@RequestMapping(value="/file")
public class FileController {

	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/open")
	protected void open(HttpServletRequest request, HttpServletResponse response, @RequestParam String objectId, @RequestParam int type) throws Exception {
		JSONObject jsonObject = new JSONObject();
		    
	    if(type == 0) {	//trans
	    	jsonObject.put("GraphType", "TransGraph");
	    	ObjectId id = new StringObjectId( objectId );
	    	
	    	RepositoryObject repositoryObject = App.getInstance().getRepository().getObjectInformation(id, RepositoryObjectType.TRANSFORMATION);
			TransMeta transMeta = App.getInstance().getRepository().loadTransformation(id, null);
			transMeta.setRepositoryDirectory(repositoryObject.getRepositoryDirectory());
	    	
			mxCodec codec = new mxCodec();
			mxGraph graph = TransEncoder.encode(transMeta);
			String graphXml = mxUtils.getPrettyXml(codec.encode(graph.getModel()));
			
			jsonObject.put("graphXml", StringEscapeHelper.encode(graphXml));
	    } else if(type == 1) { //job
	    	jsonObject.put("GraphType", "JobGraph");
	        
	    	ObjectId id = new StringObjectId( objectId );
	    	JobMeta jobMeta = App.getInstance().getRepository().loadJob(id, null);
	    	
	        mxCodec codec = new mxCodec();
			mxGraph graph = JobEncoder.encode(jobMeta);
			String graphXml = mxUtils.getPrettyXml(codec.encode(graph.getModel()));
			
			jsonObject.put("graphXml", StringEscapeHelper.encode(graphXml));
	    }
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonObject.toString());
	}
	
}
