package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.encryption.Encr;
import org.pentaho.di.job.entries.ftpput.JobEntryFTPPUT;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("FTP_PUT")
@Scope("prototype")
public class JobEntryFTP_PUT extends AbstractJobEntry{
	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
	  JobEntryFTPPUT jobEntryFTPPUT = (JobEntryFTPPUT) jobEntry;
	  jobEntryFTPPUT.setServerName(cell.getAttribute("serverName"));
		jobEntryFTPPUT.setServerPort(cell.getAttribute("serverPort"));
		jobEntryFTPPUT.setUserName(cell.getAttribute("userName"));
		jobEntryFTPPUT.setPassword(cell.getAttribute("password"));
		jobEntryFTPPUT.setBinaryMode("Y".equalsIgnoreCase(cell.getAttribute("binaryMode")));
		jobEntryFTPPUT.setTimeout(Const.toInt(cell.getAttribute("timeout"),0));
		jobEntryFTPPUT.setActiveConnection("Y".equalsIgnoreCase(cell.getAttribute("activeConnection")));
		jobEntryFTPPUT.setControlEncoding(cell.getAttribute("control_encoding"));
		jobEntryFTPPUT.setProxyHost(cell.getAttribute("proxy_host"));
		jobEntryFTPPUT.setProxyPort(cell.getAttribute("proxy_port"));
		jobEntryFTPPUT.setProxyUsername(cell.getAttribute("proxy_username"));
		jobEntryFTPPUT.setProxyPassword(Encr.decryptPasswordOptionallyEncrypted(cell.getAttribute("proxy_password")));
		jobEntryFTPPUT.setLocalDirectory(cell.getAttribute("localDirectory"));
		jobEntryFTPPUT.setWildcard(cell.getAttribute("wildcard"));
		jobEntryFTPPUT.setRemove("Y".equalsIgnoreCase(cell.getAttribute("remove")));
		jobEntryFTPPUT.setOnlyPuttingNewFiles("Y".equalsIgnoreCase(cell.getAttribute("only_new")));
		jobEntryFTPPUT.setRemoteDirectory(cell.getAttribute("remoteDirectory"));
		jobEntryFTPPUT.setSocksProxyHost(cell.getAttribute("socksproxy_host"));
		jobEntryFTPPUT.setSocksProxyPort(cell.getAttribute("socksproxy_port"));
		jobEntryFTPPUT.setSocksProxyUsername(cell.getAttribute("socksproxy_username"));
		jobEntryFTPPUT.setSocksProxyPassword(cell.getAttribute("socksproxy_password"));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		JobEntryFTPPUT jobEntryFTPPUT = (JobEntryFTPPUT) jobEntry;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		
		e.setAttribute("serverName", jobEntryFTPPUT.getServerName());
		e.setAttribute("serverPort", jobEntryFTPPUT.getServerPort());
		e.setAttribute("userName", jobEntryFTPPUT.getUserName());
		e.setAttribute("password", jobEntryFTPPUT.getPassword() );
		e.setAttribute("binaryMode", jobEntryFTPPUT.isBinaryMode()? "Y" : "N" );
		e.setAttribute("timeout", jobEntryFTPPUT.getTimeout()+ "");
		e.setAttribute("activeConnection", jobEntryFTPPUT.isActiveConnection()? "Y" : "N");
		e.setAttribute("control_encoding", jobEntryFTPPUT.getControlEncoding());
		e.setAttribute("proxy_host", jobEntryFTPPUT.getProxyHost());
		e.setAttribute("proxy_port", jobEntryFTPPUT.getProxyPort());
		e.setAttribute("proxy_username", jobEntryFTPPUT.getProxyUsername());
		e.setAttribute("proxy_password", jobEntryFTPPUT.getProxyPassword());
		e.setAttribute("localDirectory", jobEntryFTPPUT.getLocalDirectory());
		e.setAttribute("wildcard", jobEntryFTPPUT.getWildcard());
		e.setAttribute("remove", jobEntryFTPPUT.getRemove() ? "Y" : "N");
		e.setAttribute("only_new", jobEntryFTPPUT.isOnlyPuttingNewFiles()? "Y" : "N");
		e.setAttribute("wildcard", jobEntryFTPPUT.getWildcard());
		e.setAttribute("remove", jobEntryFTPPUT.getRemove() ? "Y" : "N");
		e.setAttribute("remoteDirectory", jobEntryFTPPUT.getRemoteDirectory());
		e.setAttribute("socksproxy_host", jobEntryFTPPUT.getSocksProxyHost());
		e.setAttribute("socksproxy_port", jobEntryFTPPUT.getSocksProxyPort());
		e.setAttribute("socksproxy_username", jobEntryFTPPUT.getSocksProxyUsername());
		e.setAttribute("socksproxy_password", jobEntryFTPPUT.getSocksProxyPassword());
		return e;
	}

}
