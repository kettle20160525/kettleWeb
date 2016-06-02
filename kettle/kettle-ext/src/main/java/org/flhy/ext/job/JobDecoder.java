package org.flhy.ext.job;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.flhy.ext.App;
import org.flhy.ext.PluginFactory;
import org.flhy.ext.cluster.SlaveServerCodec;
import org.flhy.ext.core.database.DatabaseCodec;
import org.flhy.ext.job.step.JobEntryDecoder;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.exception.KettleDatabaseException;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.job.JobHopMeta;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.job.entries.missing.MissingEntry;
import org.pentaho.di.job.entry.JobEntryCopy;
import org.pentaho.di.repository.ObjectId;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectory;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.filerep.KettleFileRepository;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.view.mxGraph;

public class JobDecoder {

	public static JobMeta decode(mxGraph graph) throws Exception {
		mxCell root = (mxCell) graph.getDefaultParent();
		
		Repository repository = App.getInstance().getRepository();
		JobMeta jobMeta = new JobMeta();
		
		if(repository == null) {
			jobMeta.setFilename(root.getAttribute("fileName"));
		} else {
			String directory = root.getAttribute("directory");
			RepositoryDirectoryInterface path = repository.findDirectory(directory);
			if(path == null)
				path = new RepositoryDirectory();
			jobMeta.setRepositoryDirectory(path);
			
			if(repository instanceof KettleFileRepository) {
				KettleFileRepository kfr = (KettleFileRepository) repository;
				ObjectId fileId = kfr.getJobId(root.getAttribute("name"), path);
				String realPath = kfr.calcFilename(fileId);
				jobMeta.setFilename(realPath);
			}
		}
		
		jobMeta.setName(root.getAttribute("name"));
		jobMeta.setDescription(root.getAttribute("description"));
		jobMeta.setExtendedDescription(root.getAttribute("extended_description"));
		jobMeta.setJobversion(root.getAttribute("job_version"));
		int jobStatus = Const.toInt(root.getAttribute("job_status"), -1);
		if(jobStatus >= 0)
			jobMeta.setJobstatus(jobStatus);
		
		jobMeta.setCreatedUser( root.getAttribute( "created_user" ));
		jobMeta.setCreatedDate(XMLHandler.stringToDate( root.getAttribute( "created_date" ) ));
		jobMeta.setModifiedUser(root.getAttribute( "modified_user" ));
		jobMeta.setModifiedDate(XMLHandler.stringToDate( root.getAttribute( "modified_date" ) ));
		
		JSONArray namedParameters = JSONArray.fromObject(root.getAttribute("parameters"));
		for (int i = 0; i < namedParameters.size(); i++) {
			JSONObject jsonObject = namedParameters.getJSONObject(i);

			String paramName = jsonObject.optString("name");
			String defaultValue = jsonObject.optString("default_value");
			String descr = jsonObject.optString("description");

			jobMeta.addParameterDefinition(paramName, defaultValue, descr);
		}
		
		decodeDatabases(root, jobMeta);
		decodeSlaveServers(root, jobMeta);
		
		int count = graph.getModel().getChildCount(root);
		for(int i=0; i<count; i++) {
			mxCell cell = (mxCell) graph.getModel().getChildAt(root, i);
			if(cell.isVertex()) {
				
				Element e = (Element) cell.getValue();
				if("Note".equals(e.getTagName())) {
//					String n = e.getAttribute("label");
//					n = StringEscapeHelper.decode(n);
//					int x = (int) cell.getGeometry().getX();
//					int y = (int) cell.getGeometry().getY();
//					int w = (int) cell.getGeometry().getWidth();
//					int h = (int) cell.getGeometry().getHeight();
//					
//					String fontName = cell.getAttribute("fontName");
//					fontName = StringUtils.isEmpty(fontName) ? null : fontName;
//					
//					String fontSizeStr = cell.getAttribute("fontSize");
//					int fontSize = fontSizeStr.matches("\\d+") ? Integer.parseInt(fontSizeStr) : -1;
//							
//					boolean fontBold = "Y".equalsIgnoreCase(cell.getAttribute("fontBold"));
//					boolean fontItalic = "Y".equalsIgnoreCase(cell.getAttribute("fontItalic"));
//					
//					int fR = Integer.parseInt(cell.getAttribute("fR"));
//					int fG = Integer.parseInt(cell.getAttribute("fG"));
//					int fB = Integer.parseInt(cell.getAttribute("fB"));
//					
//					int bgR = Integer.parseInt(cell.getAttribute("bgR"));
//					int bgG = Integer.parseInt(cell.getAttribute("bgG"));
//					int bgB = Integer.parseInt(cell.getAttribute("bgB"));
//					
//					int bR = Integer.parseInt(cell.getAttribute("bR"));
//					int bG = Integer.parseInt(cell.getAttribute("bG"));
//					int bB = Integer.parseInt(cell.getAttribute("bB"));
//					
//					boolean drawShadow = "Y".equalsIgnoreCase(cell.getAttribute("drawShadow"));
//					
//					NotePadMeta note = new NotePadMeta(n, x, y, w, h,
//							fontName, fontSize, fontBold, fontItalic, fR, fG, fB,
//							bgR, bgG, bgB, bR, bG, bB, drawShadow);
//					transMeta.getNotes().add(note);
				} else if("Step".equals(e.getTagName())) {
					JobEntryDecoder jobEntryDecoder = (JobEntryDecoder) PluginFactory.getBean(cell.getAttribute("ctype"));
					JobEntryCopy je = jobEntryDecoder.decodeStep(cell, jobMeta.getDatabases(), jobMeta.getMetaStore());
					if (je.isSpecial() && je.isMissing()) {
						jobMeta.addMissingEntry((MissingEntry) je.getEntry());
					}

					JobEntryCopy prev = jobMeta.findJobEntry(je.getName(), 0, true);
					if (prev != null) {
						// See if the #0 (root entry) already exists!
						//
						if (je.getNr() == 0) {

							// Replace previous version with this one: remove it
							// first
							//
							int idx = jobMeta.indexOfJobEntry(prev);
							jobMeta.removeJobEntry(idx);

						} else if (je.getNr() > 0) {

							// Use previously defined JobEntry info!
							//
							je.setEntry(prev.getEntry());

							// See if entry already exists...
							prev = jobMeta.findJobEntry(je.getName(),
									je.getNr(), true);
							if (prev != null) {
								// remove the old one!
								//
								int idx = jobMeta.indexOfJobEntry(prev);
								jobMeta.removeJobEntry(idx);
							}
						}
					}
					jobMeta.addJobEntry( je );
				}
			}
		}
		
		count = graph.getModel().getChildCount(root);
		for(int i=0; i<count; i++) {
			mxCell cell = (mxCell) graph.getModel().getChildAt(root, i);
			if (cell.isEdge()) {
				mxCell source = (mxCell) cell.getSource();
				mxCell target = (mxCell) cell.getTarget();

				JobHopMeta hopinf = new JobHopMeta();
				for (int j = 0; j < jobMeta.nrJobEntries(); j++) {
					JobEntryCopy jobEntry = jobMeta.getJobEntry(j);
					if (jobEntry.getName().equalsIgnoreCase(source.getAttribute("label")))
						hopinf.setFromEntry(jobEntry);
					if (jobEntry.getName().equalsIgnoreCase(target.getAttribute("label")))
						hopinf.setToEntry(jobEntry);
				}
				jobMeta.addJobHop(hopinf);
			}
		}
		
		return jobMeta;
	}
	
	public static void decodeDatabases(mxCell root, JobMeta jobMeta) throws KettleDatabaseException, JsonParseException, JsonMappingException, IOException {
		JSONArray jsonArray = JSONArray.fromObject(root.getAttribute("databases"));
		Set<String> privateTransformationDatabases = new HashSet<String>(jsonArray.size());
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			DatabaseMeta dbcon =  DatabaseCodec.decode(jsonObject);

			dbcon.shareVariablesWith(jobMeta);
			if (!dbcon.isShared()) {
				privateTransformationDatabases.add(dbcon.getName());
			}

			DatabaseMeta exist = jobMeta.findDatabase(dbcon.getName());
			if (exist == null) {
				jobMeta.addDatabase(dbcon);
			} else {
				if (!exist.isShared()) {
					int idx = jobMeta.indexOfDatabase(exist);
					jobMeta.removeDatabase(idx);
					jobMeta.addDatabase(idx, dbcon);
				}
			}
		}
		jobMeta.setPrivateDatabases(privateTransformationDatabases);
	}
	
	public static void decodeSlaveServers(mxCell root, JobMeta jobMeta) throws Exception {
		JSONArray jsonArray = JSONArray.fromObject(root.getAttribute("slaveServers"));
		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			SlaveServer slaveServer = SlaveServerCodec.decode(jsonObject);
			slaveServer.shareVariablesWith(jobMeta);

			SlaveServer check = jobMeta.findSlaveServer(slaveServer.getName());
			if (check != null) {
				if (!check.isShared()) {
					jobMeta.addOrReplaceSlaveServer(slaveServer);
				}
			} else {
				jobMeta.getSlaveServers().add(slaveServer);
			}
		}
	}
}
