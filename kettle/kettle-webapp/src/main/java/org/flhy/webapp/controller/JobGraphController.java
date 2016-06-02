package org.flhy.webapp.controller;

import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.flhy.ext.App;
import org.flhy.ext.PluginFactory;
import org.flhy.ext.job.JobDecoder;
import org.flhy.ext.job.step.JobEntryEncoder;
import org.flhy.webapp.utils.JsonUtils;
import org.pentaho.di.core.plugins.JobEntryPluginType;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.job.entries.special.JobEntrySpecial;
import org.pentaho.di.job.entry.JobEntryCopy;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositorySecurityProvider;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxUtils;
import com.mxgraph.view.mxGraph;

@Controller
@RequestMapping(value="/job")
public class JobGraphController {
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/engineXml")
	protected void engineXml(HttpServletRequest request, HttpServletResponse response, @RequestParam String graphXml) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		JobMeta jobMeta = JobDecoder.decode(graph);
		String xml = XMLHandler.getXMLHeader() + jobMeta.getXML();
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(xml);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/save")
	protected void save(@RequestParam String graphXml) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		JobMeta jobMeta = JobDecoder.decode(graph);
		Repository repository = App.getInstance().getRepository();
		ObjectId existingId = repository.getTransformationID( jobMeta.getName(), jobMeta.getRepositoryDirectory() );
		if(jobMeta.getCreatedDate() == null)
			jobMeta.setCreatedDate(new Date());
		if(jobMeta.getObjectId() == null)
			jobMeta.setObjectId(existingId);
		jobMeta.setModifiedDate(new Date());
		
		 boolean versioningEnabled = true;
         boolean versionCommentsEnabled = true;
         String fullPath = jobMeta.getRepositoryDirectory() + "/" + jobMeta.getName() + jobMeta.getRepositoryElementType().getExtension(); 
         RepositorySecurityProvider repositorySecurityProvider = repository.getSecurityProvider() != null ? repository.getSecurityProvider() : null;
         if ( repositorySecurityProvider != null ) {
        	 versioningEnabled = repositorySecurityProvider.isVersioningEnabled( fullPath );
        	 versionCommentsEnabled = repositorySecurityProvider.allowsVersionComments( fullPath );
         }
		String versionComment = null;
		if (!versioningEnabled || !versionCommentsEnabled) {
			versionComment = "";
		} else {
			versionComment = "no comment";
		}
		
		repository.save( jobMeta, versionComment, null);
	}
	
	/**
	 * 新建环节
	 * 
	 * @param graphXml
	 * @param stepId
	 * @param stepName
	 * @throws Exception
	 */
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/newJobEntry")
	protected void newJobEntry(@RequestParam String graphXml, @RequestParam String entryId, @RequestParam String entryName) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		JobMeta jobMeta = JobDecoder.decode(graph);
		
		PluginRegistry registry = PluginRegistry.getInstance();
		PluginInterface jobPlugin = registry.findPluginWithId(JobEntryPluginType.class, entryId);
//		if (jobPlugin == null && entryId.startsWith(JobMeta.STRING_SPECIAL)) {
//			jobPlugin = registry.findPluginWithId(JobEntryPluginType.class, JobMeta.STRING_SPECIAL);
//		}

		if (jobPlugin != null) {
			// Determine name & number for this entry.
	        String basename = entryName;

	        // See if the name is already used...
	        //
	        String entry_name = basename;
	        int nr = 2;
	        JobEntryCopy check = jobMeta.findJobEntry( entry_name, 0, true );
			while (check != null) {
				entry_name = basename + " " + nr++;
				check = jobMeta.findJobEntry(entry_name, 0, true);
			}

	        // Generate the appropriate class...
			JobEntryInterface jei = (JobEntryInterface) registry.loadClass(jobPlugin);
			jei.setPluginId(jobPlugin.getIds()[0]);
			jei.setName(entry_name);

			if (jei.isSpecial()) {
				if (JobMeta.STRING_SPECIAL_START.equals(jei.getName())) {
					// Check if start is already on the canvas...
					if (jobMeta.findStart() != null) {
						return;
					}
					((JobEntrySpecial) jei).setStart(true);
					jei.setName(JobMeta.STRING_SPECIAL_START);
				}
				if (JobMeta.STRING_SPECIAL_DUMMY.equals(jei.getName())) {
					((JobEntrySpecial) jei).setDummy(true);
					// jei.setName(JobMeta.STRING_SPECIAL_DUMMY); // Don't
					// overwrite the name
				}
			}
			
			JobEntryCopy jge = new JobEntryCopy();
			jge.setEntry(jei);
			jge.setNr(0);
			jge.setDrawn();
			
			JobEntryEncoder encoder = (JobEntryEncoder) PluginFactory.getBean(jei.getPluginId());
			Element e = encoder.encodeStep(jge);
			JsonUtils.responseXml(XMLHandler.getXMLHeader() + mxUtils.getXml(e));
		}
	}
}
