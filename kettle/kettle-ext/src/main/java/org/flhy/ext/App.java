package org.flhy.ext;

import java.util.ArrayList;

import org.flhy.ext.core.PropsUI;
import org.pentaho.di.core.DBCache;
import org.pentaho.di.core.RowMetaAndData;
import org.pentaho.di.core.logging.DefaultLogLevel;
import org.pentaho.di.core.logging.KettleLogStore;
import org.pentaho.di.core.logging.LogChannel;
import org.pentaho.di.core.logging.LogChannelInterface;
import org.pentaho.di.core.logging.LogLevel;
import org.pentaho.di.core.row.RowMeta;
import org.pentaho.di.job.JobExecutionConfiguration;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.trans.TransExecutionConfiguration;
import org.pentaho.metastore.stores.delegate.DelegatingMetaStore;

public class App {

	private static App app;
	private LogChannelInterface log;
	
	private TransExecutionConfiguration transExecutionConfiguration;
	private TransExecutionConfiguration transPreviewExecutionConfiguration;
	private TransExecutionConfiguration transDebugExecutionConfiguration;
	private JobExecutionConfiguration jobExecutionConfiguration;
	
	public PropsUI props;

	private App() {
		props = PropsUI.getInstance();
		log = new LogChannel( PropsUI.getAppName());
		loadSettings();
		
		transExecutionConfiguration = new TransExecutionConfiguration();
	    transExecutionConfiguration.setGatheringMetrics( true );
	    transPreviewExecutionConfiguration = new TransExecutionConfiguration();
	    transPreviewExecutionConfiguration.setGatheringMetrics( true );
	    transDebugExecutionConfiguration = new TransExecutionConfiguration();
	    transDebugExecutionConfiguration.setGatheringMetrics( true );

	    jobExecutionConfiguration = new JobExecutionConfiguration();
	    
	    variables = new RowMetaAndData( new RowMeta() );
	}
	
	public void loadSettings() {
		LogLevel logLevel = LogLevel.getLogLevelForCode(props.getLogLevel());
		DefaultLogLevel.setLogLevel(logLevel);
		log.setLogLevel(logLevel);
		KettleLogStore.getAppender().setMaxNrLines(props.getMaxNrLinesInLog());

		// transMeta.setMaxUndo(props.getMaxUndo());
		DBCache.getInstance().setActive(props.useDBCache());
	}

	public static App getInstance() {
		if (app == null) {
			app = new App();
		}
		return app;
	}

	private Repository repository;

	public Repository getRepository() {
		return repository;
	}
	
	private Repository defaultRepository;
	
	public void initDefault(Repository defaultRepo) {
		if(this.defaultRepository == null)
			this.defaultRepository = defaultRepo;
		this.repository = defaultRepo;
	}
	
	public Repository getDefaultRepository() {
		return this.defaultRepository;
	}
	
	public void selectRepository(Repository repo) {
		if(repository != null) {
			repository.disconnect();
		}
		repository = repo;
	}

	private DelegatingMetaStore metaStore;

	public DelegatingMetaStore getMetaStore() {
		return metaStore;
	}
	
	public LogChannelInterface getLog() {
		return log;
	}
	
	private RowMetaAndData variables = null;
	private ArrayList<String> arguments = new ArrayList<String>();
	
	public String[] getArguments() {
		return arguments.toArray(new String[arguments.size()]);
	}
	
	public JobExecutionConfiguration getJobExecutionConfiguration() {
		return jobExecutionConfiguration;
	}

	public TransExecutionConfiguration getTransDebugExecutionConfiguration() {
		return transDebugExecutionConfiguration;
	}

	public TransExecutionConfiguration getTransPreviewExecutionConfiguration() {
		return transPreviewExecutionConfiguration;
	}

	public TransExecutionConfiguration getTransExecutionConfiguration() {
		return transExecutionConfiguration;
	}
	
	public RowMetaAndData getVariables() {
		return variables;
	}
	
//	public JSONArray encodeVariables() {
//		Object[] data = variables.getData();
//		String[] fields = variables.getRowMeta().getFieldNames();
//		JSONArray jsonArray = new JSONArray();
//		for (int i = 0; i < fields.length; i++) {
//			JSONObject jsonObject = new JSONObject();
//			jsonObject.put("name", fields[i]);
//			jsonObject.put("value", data[i].toString());
//			jsonArray.add(jsonObject);
//		}
//		return jsonArray;
//	}
	
}
