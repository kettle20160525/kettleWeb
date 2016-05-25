package org.flhy.ext;

import org.pentaho.di.core.logging.LogChannel;
import org.pentaho.di.core.logging.LogChannelInterface;
import org.pentaho.di.repository.Repository;
import org.pentaho.metastore.stores.delegate.DelegatingMetaStore;

public class App {

	private static App app;
	private LogChannelInterface log;

	private App() {
		log = new LogChannel( "KettleConsole" );
	}

	public static App getInstance() {
		if (app == null) {
			app = new App();
		}
		return app;
	}

	private Repository rep;

	public Repository getRepository() {
		return rep;
	}

	private DelegatingMetaStore metaStore;

	public DelegatingMetaStore getMetaStore() {
		return metaStore;
	}
	
	public LogChannelInterface getLog() {
		return log;
	}
	
	public String[] getArguments() {
		return new String[0];
	}
}
