package org.flhy.ext.job;

import org.pentaho.di.job.JobMeta;

import com.mxgraph.model.mxCell;
import com.mxgraph.view.mxGraph;

public class JobDecoder {

	public static JobMeta decode(mxGraph graph) throws Exception {
		JobMeta jobMeta = new JobMeta();
		mxCell root = (mxCell) graph.getDefaultParent();
		
		return jobMeta;
	}
}
