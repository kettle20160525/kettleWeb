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
	
	public String[] getArguments() {
		return new String[0];
	}
}
