package org.flhy.ext.job.step;

import java.util.List;

import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entry.JobEntryCopy;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;

public abstract class AbstractJobEntry implements JobEntryEncoder, JobEntryDecoder {

	@Override
	public JobEntryCopy decodeStep(mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		return null;
	}

	@Override
	public Element encodeStep(JobEntryCopy jobEntryCopy) throws Exception {
		Element e = encode(jobEntryCopy.getEntry());
		
		e.setAttribute("label", jobEntryCopy.getName());
		e.setAttribute("ctype", jobEntryCopy.getEntry().getPluginId());
		e.setAttribute("draw", jobEntryCopy.isDrawn() ? "Y" : "N");
		e.setAttribute("start", jobEntryCopy.isStart() ? "Y" : "N");
		e.setAttribute("dummy", jobEntryCopy.isDummy() ? "Y" : "N");
		
		return e;
	}
	
	public abstract void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception;
	public abstract Element encode(JobEntryInterface jobEntry) throws Exception;

}
