package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.job.step.AbstractJobEntry;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.ObjectLocationSpecificationMethod;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryObject;
import org.pentaho.di.repository.RepositoryObjectType;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("TRANS")
@Scope("prototype")
public class JobEntryTrans extends AbstractJobEntry {

	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.trans.JobEntryTrans jobEntryTrans = (org.pentaho.di.job.entries.trans.JobEntryTrans) jobEntry;
		
		
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement("Step");
		org.pentaho.di.job.entries.trans.JobEntryTrans jobEntryTrans = (org.pentaho.di.job.entries.trans.JobEntryTrans) jobEntry;
		
		ObjectLocationSpecificationMethod specificationMethod = jobEntryTrans.getSpecificationMethod();
		Repository rep = jobEntryTrans.getRepository();
		ObjectId transObjectId = jobEntryTrans.getTransObjectId();
		
		boolean supportsReferences = rep != null && rep.getRepositoryMeta().getRepositoryCapabilities().supportsReferences();
		
		e.setAttribute("radioByName", rep != null ? "Y" : "N");
		e.setAttribute("radioByReference", rep != null && supportsReferences ? "Y" : "N");
		
		if(specificationMethod != null) {
			e.setAttribute("specification_method", specificationMethod.getCode());
			
			if(ObjectLocationSpecificationMethod.FILENAME.equals(specificationMethod)) {
				e.setAttribute("filename", jobEntryTrans.getFilename());
			} else if(ObjectLocationSpecificationMethod.REPOSITORY_BY_NAME.equals(specificationMethod)) {
				if(jobEntryTrans.getDirectory() != null) {
					e.setAttribute("directory", jobEntryTrans.getDirectory());
				} else if(jobEntryTrans.getDirectoryPath() != null) {
					e.setAttribute("directory", jobEntryTrans.getDirectoryPath());
				}
				
				if (rep != null && transObjectId != null) {
					RepositoryObject objectInformation = rep.getObjectInformation( transObjectId, RepositoryObjectType.TRANSFORMATION );
					if (objectInformation != null) {
						e.setAttribute("transname", objectInformation.getRepositoryDirectory().getPath());
					}
				}
			} else if(ObjectLocationSpecificationMethod.REPOSITORY_BY_REFERENCE.equals(specificationMethod)) {
				e.setAttribute("trans_object_id", transObjectId == null ? null : transObjectId.toString() );
			}
		}
		
		e.setAttribute("arg_from_previous", jobEntryTrans.argFromPrevious ? "Y" : "N");
		e.setAttribute("params_from_previous", jobEntryTrans.paramsFromPrevious ? "Y" : "N");
		e.setAttribute("exec_per_row", jobEntryTrans.execPerRow ? "Y" : "N");
		e.setAttribute("clear_rows", jobEntryTrans.clearResultRows ? "Y" : "N");
		e.setAttribute("clear_files", jobEntryTrans.clearResultFiles ? "Y" : "N");
		e.setAttribute("set_logfile", jobEntryTrans.setLogfile ? "Y" : "N");
		e.setAttribute("logfile", jobEntryTrans.logfile);
		
		e.setAttribute("logext", jobEntryTrans.logext);
		e.setAttribute("add_date", jobEntryTrans.addDate ? "Y" : "N");
		e.setAttribute("add_time", jobEntryTrans.addTime ? "Y" : "N");
		e.setAttribute("loglevel", jobEntryTrans.logFileLevel != null ? jobEntryTrans.logFileLevel.getCode() : null);
		
		e.setAttribute("cluster", jobEntryTrans.isClustering() ? "Y" : "N");
		e.setAttribute("slave_server_name", jobEntryTrans.getRemoteSlaveServerName());
		e.setAttribute("set_append_logfile", jobEntryTrans.setAppendLogfile ? "Y" : "N");
		e.setAttribute("wait_until_finished", jobEntryTrans.waitingToFinish ? "Y" : "N");
		e.setAttribute("follow_abort_remote", jobEntryTrans.followingAbortRemotely ? "Y" : "N");
		e.setAttribute("create_parent_folder", jobEntryTrans.createParentFolder ? "Y" : "N");
		e.setAttribute("logging_remote_work", jobEntryTrans.isLoggingRemoteWork() ? "Y" : "N");
		
		
		
		if (jobEntryTrans.arguments != null) {
			JSONArray jsonArray = new JSONArray();
			for (int i = 0; i < jobEntryTrans.arguments.length; i++) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", jobEntryTrans.arguments[i]);
				jsonArray.add(jsonObject);
			}
			e.setAttribute("arguments", jsonArray.toString());
		}
		
		if ( jobEntryTrans.parameters != null ) {
			e.setAttribute("pass_all_parameters", jobEntryTrans.isPassingAllParameters() ? "Y" : "N");
			
			JSONArray jsonArray = new JSONArray();
			for (int i = 0; i < jobEntryTrans.parameters.length; i++) {
				
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", jobEntryTrans.parameters[i]);
				jsonObject.put("stream_name", jobEntryTrans.parameterFieldNames[i]);
				jsonObject.put("value", jobEntryTrans.parameterValues[i]);
				jsonArray.add(jsonObject);
			}
			e.setAttribute("parameters", jsonArray.toString());
		}
		
		return e;
	}


}
