package org.flhy.webapp.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.pentaho.di.core.Const;
import org.pentaho.di.core.KettleEnvironment;
import org.pentaho.di.core.Props;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.logging.KettleLogStore;

public class SystemLoadListener implements ServletContextListener {

	@Override
	public void contextDestroyed(ServletContextEvent context) {
		
	}

	@Override
	public void contextInitialized(ServletContextEvent context) {
//		System.setProperty(Const.KETTLE_CORE_STEPS_FILE, "org/flhy/ext/kettle-steps-file.xml");
		try {
			// 日志缓冲不超过5000行，缓冲时间不超过720秒
			KettleLogStore.init( 5000, 720 );
			KettleEnvironment.init();
			Props.init( Props.TYPE_PROPERTIES_SPOON );
		} catch (KettleException e) {
			e.printStackTrace();
		}
	}

}
