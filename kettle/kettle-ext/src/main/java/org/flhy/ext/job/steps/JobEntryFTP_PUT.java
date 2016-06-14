package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entries.ftpput.JobEntryFTPPUT;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.di.trans.steps.textfileoutput.TextFileOutputMeta;
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
		org.pentaho.di.job.entries.ftpput.JobEntryFTPPUT jobEntryFTPPUT = (org.pentaho.di.job.entries.ftpput.JobEntryFTPPUT) jobEntry;
		jobEntryFTPPUT.setUserName(cell.getAttribute("username"));
		jobEntryFTPPUT.setServerPort(cell.getAttribute("serverport"));
		jobEntryFTPPUT.setPassword(cell.getAttribute("password"));
		jobEntryFTPPUT.setServerName(cell.getAttribute("servername"));
		
//		jobEntrySpecial.setRepeat("Y".equalsIgnoreCase(cell.getAttribute("repeat")));
//		jobEntrySpecial.setSchedulerType(Const.toInt( cell.getAttribute( "schedulerType" ), 
//				org.pentaho.di.job.entries.special.JobEntrySpecial.NOSCHEDULING ));
//		
//		jobEntrySpecial.setIntervalSeconds( Const.toInt( cell.getAttribute( "intervalSeconds" ), 0 ) );
//		jobEntrySpecial.setIntervalMinutes( Const.toInt( cell.getAttribute( "intervalMinutes" ), 0 ) );
//		jobEntrySpecial.setHour( Const.toInt( cell.getAttribute( "hour" ), 0 ) );
//		jobEntrySpecial.setMinutes( Const.toInt( cell.getAttribute( "minutes" ), 0 ) );
//		jobEntrySpecial.setWeekDay( Const.toInt( cell.getAttribute( "weekDay" ), 0 ) );
//		jobEntrySpecial.setDayOfMonth( Const.toInt( cell.getAttribute( "dayOfMonth" ), 0 ) );
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception {
		JobEntryFTPPUT jobEntryFTPPUT = (JobEntryFTPPUT) jobEntry;

		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		//一般
		e.setAttribute("timeout", jobEntryFTPPUT.getTimeout()+"");
		e.setAttribute("serverport", jobEntryFTPPUT.getServerPort());
		//控制编码的处理
		e.setAttribute("contrlEncode",jobEntryFTPPUT.getControlEncoding() );
		System.out.println("控制编码my"+jobEntryFTPPUT.getControlEncoding());
		
		//文件
		//Sockets处理
		e.setAttribute("proxy2serverport", jobEntryFTPPUT.getProxyPort());
		
		
//		e.setAttribute("repeat", jobEntrySpecial.isRepeat() ? "Y" : "N");
//		e.setAttribute("schedulerType", jobEntrySpecial.getSchedulerType() + "");
//		e.setAttribute("intervalSeconds", jobEntrySpecial.getIntervalSeconds() + "");
//		e.setAttribute("intervalMinutes", jobEntrySpecial.getIntervalMinutes() + "");
//		e.setAttribute("hour", jobEntrySpecial.getHour() + "");
//		e.setAttribute("minutes", jobEntrySpecial.getMinutes() + "");
//		e.setAttribute("weekDay", jobEntrySpecial.getWeekDay() + "");
//		e.setAttribute("DayOfMonth", jobEntrySpecial.getDayOfMonth() + "");
		
		return e;
	}

}
