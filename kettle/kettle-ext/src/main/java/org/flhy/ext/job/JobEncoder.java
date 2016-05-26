package org.flhy.ext.job;

import java.util.HashMap;

import org.flhy.ext.PluginFactory;
import org.flhy.ext.job.step.JobEntryEncoder;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.SvgImageUrl;
import org.pentaho.di.core.gui.Point;
import org.pentaho.di.job.JobHopMeta;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.job.entry.JobEntryCopy;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.di.repository.RepositoryDirectory;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;
import com.mxgraph.view.mxGraph;

public class JobEncoder {

	public static mxGraph encode(JobMeta jobMeta) throws Exception {
		mxGraph graph = new mxGraph();
		graph.getModel().beginUpdate();
		
		try {
			mxCell parent = (mxCell) graph.getDefaultParent();
			Document doc = mxUtils.createDocument();
			Element e = doc.createElement("Step");
			e.setAttribute("name", jobMeta.getName());
			e.setAttribute("fileName", jobMeta.getFilename());
			e.setAttribute("description", jobMeta.getDescription());
			e.setAttribute("extended_description", jobMeta.getExtendedDescription());
			e.setAttribute("job_version", jobMeta.getJobversion());
			e.setAttribute("job_status", String.valueOf(jobMeta.getJobstatus()));
			RepositoryDirectoryInterface directory = jobMeta.getRepositoryDirectory();
			e.setAttribute("directory", directory != null ? directory.getPath() : RepositoryDirectory.DIRECTORY_SEPARATOR);
			
			// named parameters
		    String[] parameters = jobMeta.listParameters();
		    JSONArray jsonArray = new JSONArray();
		    for ( int idx = 0; idx < parameters.length; idx++ ) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", parameters[idx]);
				jsonObject.put("value", "");
				jsonObject.put("default_value", jobMeta.getParameterDefault( parameters[idx] ));
				jsonObject.put("description", jobMeta.getParameterDescription( parameters[idx] ));
				jsonArray.add(jsonObject);
		    }
		    e.setAttribute("parameters", jsonArray.toString());
		    
		    // encode steps and hops
			HashMap<JobEntryCopy, Object> cells = new HashMap<JobEntryCopy, Object>();
			for(int i=0; i<jobMeta.nrJobEntries(); i++) {
				JobEntryCopy jge = jobMeta.getJobEntry( i );
				Point p = jge.getLocation();
				JobEntryInterface jobEntry = jge.getEntry();
				JobEntryEncoder stepEncoder = (JobEntryEncoder) PluginFactory.getBean(jobEntry.getPluginId());
				String pluginId = jobEntry.getPluginId();
				if(jge.isStart())
					pluginId = "SPECIAL0";
				else if(jge.isDummy())
					pluginId = "SPECIAL1";
				String image = SvgImageUrl.getUrl(pluginId, SvgImageUrl.Size_Middle);
				Object cell = graph.insertVertex(parent, null, stepEncoder.encodeStep(jge), p.x, p.y, 40, 40, "icon;image=" + image);
				cells.put(jge, cell);
			}
			
			for(int i=0; i<jobMeta.nrJobHops(); i++) {
				JobHopMeta jobHopMeta = jobMeta.getJobHop(i);
				
				Object v1 = cells.get(jobHopMeta.getFromEntry());
				Object v2 = cells.get(jobHopMeta.getToEntry());
				
				graph.insertEdge(parent, null, null, v1, v2);
			}
			
			parent.setValue(e);
		} finally {
			graph.getModel().endUpdate();
		}
		
		return graph;
	}
}
