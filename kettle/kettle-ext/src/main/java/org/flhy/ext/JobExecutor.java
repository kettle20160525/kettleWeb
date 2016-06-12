package org.flhy.ext;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.Result;
import org.pentaho.di.core.gui.JobTracker;
import org.pentaho.di.core.logging.KettleLogLayout;
import org.pentaho.di.core.logging.KettleLogStore;
import org.pentaho.di.core.logging.KettleLoggingEvent;
import org.pentaho.di.core.logging.LoggingObjectType;
import org.pentaho.di.core.logging.LoggingRegistry;
import org.pentaho.di.core.logging.SimpleLoggingObject;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.job.Job;
import org.pentaho.di.job.JobEntryResult;
import org.pentaho.di.job.JobExecutionConfiguration;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.job.entry.JobEntryCopy;
import org.pentaho.di.ui.spoon.job.JobEntryCopyResult;
import org.pentaho.di.www.SlaveServerTransStatus;

public class JobExecutor implements Runnable {

	private String executionId;
	private JobExecutionConfiguration executionConfiguration;
	private JobMeta jobMeta = null;
	private Job job = null;
	private static final Class PKG = JobEntryCopyResult.class;
//	private Map<StepMeta, String> stepLogMap = new HashMap<StepMeta, String>();
	
	private JobExecutor(JobExecutionConfiguration executionConfiguration, JobMeta jobMeta) {
		this.executionId = UUID.randomUUID().toString().replaceAll("-", "");
		this.executionConfiguration = executionConfiguration;
		this.jobMeta = jobMeta;
	}
	
	private static Hashtable<String, JobExecutor> executors = new Hashtable<String, JobExecutor>();
	
	public static synchronized JobExecutor initExecutor(JobExecutionConfiguration executionConfiguration, JobMeta jobMeta) {
		JobExecutor jobExecutor = new JobExecutor(executionConfiguration, jobMeta);
		executors.put(jobExecutor.getExecutionId(), jobExecutor);
		return jobExecutor;
	}

	public String getExecutionId() {
		return executionId;
	}
	
	private boolean finished = false;

	@Override
	public void run() {
		try {
			for (String varName : executionConfiguration.getVariables().keySet()) {
				String varValue = executionConfiguration.getVariables().get(varName);
				jobMeta.setVariable(varName, varValue);
			}
			
			for (String paramName : executionConfiguration.getParams().keySet()) {
				String paramValue = executionConfiguration.getParams().get(paramName);
				jobMeta.setParameterValue(paramName, paramValue);
			}
			
			if (executionConfiguration.isExecutingLocally()) {
				 SimpleLoggingObject spoonLoggingObject = new SimpleLoggingObject( "SPOON", LoggingObjectType.SPOON, null );
			     spoonLoggingObject.setContainerObjectId( executionId );
			     spoonLoggingObject.setLogLevel( executionConfiguration.getLogLevel() );
			     job = new Job( App.getInstance().getRepository(), jobMeta, spoonLoggingObject );
				
				job.setLogLevel(executionConfiguration.getLogLevel());
				job.shareVariablesWith(jobMeta);
				job.setInteractive(true);
				job.setGatheringMetrics(executionConfiguration.isGatheringMetrics());
				job.setArguments(executionConfiguration.getArgumentStrings());

				job.getExtensionDataMap().putAll(executionConfiguration.getExtensionOptions());

				// If there is an alternative start job entry, pass it to the job
	            //
	            if ( !Const.isEmpty( executionConfiguration.getStartCopyName() ) ) {
	            	JobEntryCopy startJobEntryCopy = jobMeta.findJobEntry( executionConfiguration.getStartCopyName(), executionConfiguration.getStartCopyNr(), false );
	            	job.setStartJobEntryCopy( startJobEntryCopy );
	            }

	            // Set the named parameters
	            Map<String, String> paramMap = executionConfiguration.getParams();
	            Set<String> keys = paramMap.keySet();
				for (String key : keys) {
					job.getJobMeta().setParameterValue(key, Const.NVL(paramMap.get(key), ""));
				}
	            job.getJobMeta().activateParameters();

	            job.start();
				
				while(!job.isFinished())
					Thread.sleep(500);
			} else if (executionConfiguration.isExecutingRemotely()) {
//				carteObjectId = Trans.sendToSlaveServer( transMeta, executionConfiguration, App.getInstance().getRepository(), App.getInstance().getMetaStore() );
//				SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
//				
//				boolean running = true;
//				while(running) {
//					SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
//					running = transStatus.isRunning();
//					
//					Thread.sleep(500);
//				}
			}
			
		} catch(Exception e) {
			e.printStackTrace();
			App.getInstance().getLog().logError("执行失败！", e);
		} finally {
			finished = true;
		}
	}
	
	public boolean isFinished() {
		return finished;
	}
	
//	public void capturePreviewData(Job job, List<StepMeta> stepMetas) {
//		final StringBuffer loggingText = new StringBuffer();
//
//		try {
//			job.getJobMeta();
//			
//			final TransMeta transMeta = trans.getTransMeta();
//
//			for (final StepMeta stepMeta : stepMetas) {
//				final RowMetaInterface rowMeta = transMeta.getStepFields( stepMeta ).clone();
//				previewMetaMap.put(stepMeta, rowMeta);
//				final List<Object[]> rowsData = new LinkedList<Object[]>();
//
//				previewDataMap.put(stepMeta, rowsData);
//				previewLogMap.put(stepMeta, loggingText);
//
//				StepInterface step = trans.findRunThread(stepMeta.getName());
//
//				if (step != null) {
//
//					step.addRowListener(new RowAdapter() {
//						@Override
//						public void rowWrittenEvent(RowMetaInterface rowMeta, Object[] row) throws KettleStepException {
//							try {
//								rowsData.add(rowMeta.cloneRow(row));
//								if (rowsData.size() > 100) {
//									rowsData.remove(0);
//								}
//							} catch (Exception e) {
//								throw new KettleStepException("Unable to clone row for metadata : " + rowMeta, e);
//							}
//						}
//					});
//				}
//
//			}
//		} catch (Exception e) {
//			loggingText.append(Const.getStackTracker(e));
//		}
//
//		trans.addTransListener(new TransAdapter() {
//			@Override
//			public void transFinished(Trans trans) throws KettleException {
//				if (trans.getErrors() != 0) {
//					for (StepMetaDataCombi combi : trans.getSteps()) {
//						if (combi.copy == 0) {
//							StringBuffer logBuffer = KettleLogStore.getAppender().getBuffer(combi.step.getLogChannel().getLogChannelId(), false);
//							previewLogMap.put(combi.stepMeta, logBuffer);
//						}
//					}
//				}
//			}
//		});
//	}
//	
//	protected Map<StepMeta, RowMetaInterface> previewMetaMap = new HashMap<StepMeta, RowMetaInterface>();
//	protected Map<StepMeta, List<Object[]>> previewDataMap = new HashMap<StepMeta, List<Object[]>>();
//	protected Map<StepMeta, StringBuffer> previewLogMap = new HashMap<StepMeta, StringBuffer>();
//	
//	private void checkErrorVisuals() {
//		if (trans.getErrors() > 0) {
//			stepLogMap.clear();
//			
//			for (StepMetaDataCombi combi : trans.getSteps()) {
//				if (combi.step.getErrors() > 0) {
//					String channelId = combi.step.getLogChannel().getLogChannelId();
//					List<KettleLoggingEvent> eventList = KettleLogStore.getLogBufferFromTo(channelId, false, 0, KettleLogStore.getLastBufferLineNr());
//					StringBuilder logText = new StringBuilder();
//					for (KettleLoggingEvent event : eventList) {
//						Object message = event.getMessage();
//						if (message instanceof LogMessage) {
//							LogMessage logMessage = (LogMessage) message;
//							if (logMessage.isError()) {
//								logText.append(logMessage.getMessage()).append(Const.CR);
//							}
//						}
//					}
//					stepLogMap.put(combi.stepMeta, logText.toString());
//				}
//			}
//
//		} else {
//			stepLogMap.clear();
//		}
//	}
	
	private String carteObjectId = null;
	
	public int previousNrItems;
	public JSONArray getJobMeasure() throws Exception {
    	JSONArray jsonArray = new JSONArray();
    	JobTracker jobTracker = job.getJobTracker();
    	int nrItems = jobTracker.getTotalNumberOfItems();
    	if ( nrItems != previousNrItems ) {
            // Re-populate this...
            String jobName = jobTracker.getJobName();

			if (Const.isEmpty(jobName)) {
				if (!Const.isEmpty(jobTracker.getJobFilename())) {
					jobName = jobTracker.getJobFilename();
				} else {
					jobName = BaseMessages.getString(PKG, "JobLog.Tree.StringToDisplayWhenJobHasNoName");
				}
			}
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", jobName);
			jsonObject.put("expanded", true);

			JSONArray children = new JSONArray();
            for ( int i = 0; i < jobTracker.nrJobTrackers(); i++ ) {
            	JSONObject jsonObject2 = addTrackerToTree(jobTracker.getJobTracker(i));
            	if(jsonObject2 != null)
            		children.add(jsonObject2);
            }
            jsonObject.put("children", children);
            jsonArray.add(jsonObject);
            
            previousNrItems = nrItems;
    	}
    	
    	return jsonArray;
	}
	
	private JSONObject addTrackerToTree( JobTracker jobTracker ) {
		JSONObject jsonObject = new JSONObject();
		if ( jobTracker != null ) {
			if ( jobTracker.nrJobTrackers() > 0 ) {
	    		  // This is a sub-job: display the name at the top of the list...
	    		  jsonObject.put("name", BaseMessages.getString( PKG, "JobLog.Tree.JobPrefix" ) + jobTracker.getJobName() );
	    		  jsonObject.put("expanded", true);
	    		  JSONArray children = new JSONArray();
	    		  // then populate the sub-job entries ...
	    		  for ( int i = 0; i < jobTracker.nrJobTrackers(); i++ ) {
	    			  JSONObject jsonObject2 = addTrackerToTree( jobTracker.getJobTracker( i ) );
	    			  if(jsonObject2 != null)
	    				  children.add(jsonObject2);
	    		  }
	    		  jsonObject.put("children", children);
			} else {
	        	JobEntryResult result = jobTracker.getJobEntryResult();
	        	if ( result != null ) {
	        		String jobEntryName = result.getJobEntryName();
					if (!Const.isEmpty(jobEntryName)) {
						jsonObject.put("name", jobEntryName);
						jsonObject.put("fileName", Const.NVL(result.getJobEntryFilename(), ""));
					} else {
						jsonObject.put("name", BaseMessages.getString(PKG, "JobLog.Tree.JobPrefix2") + jobTracker.getJobName());
					}
					String comment = result.getComment();
					if (comment != null) {
						jsonObject.put("comment", comment);
					}
					Result res = result.getResult();
					if ( res != null ) {
						jsonObject.put("result",  res.getResult() ? BaseMessages.getString( PKG, "JobLog.Tree.Success" ) : BaseMessages.getString(PKG, "JobLog.Tree.Failure" ));
	              		jsonObject.put("number", Long.toString( res.getEntryNr()));
					}
					String reason = result.getReason();
					if (reason != null) {
						jsonObject.put("reason", reason);
					}
					Date logDate = result.getLogDate();
					if (logDate != null) {
						jsonObject.put("logDate", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(logDate));
					}
					jsonObject.put("leaf", true);
	          } else 
	        	  return null;
	        }
	      } else 
	    	  return null;
		return jsonObject;
	}
	
	
	public String getExecutionLog() throws Exception {
		
		if(executionConfiguration.isExecutingLocally()) {
			StringBuffer sb = new StringBuffer();
			KettleLogLayout logLayout = new KettleLogLayout( true );
			List<String> childIds = LoggingRegistry.getInstance().getLogChannelChildren( job.getLogChannelId() );
			List<KettleLoggingEvent> logLines = KettleLogStore.getLogBufferFromTo( childIds, true, -1, KettleLogStore.getLastBufferLineNr() );
			 for ( int i = 0; i < logLines.size(); i++ ) {
	             KettleLoggingEvent event = logLines.get( i );
	             String line = logLayout.format( event ).trim();
	             sb.append(line).append("\n");
			 }
			 return sb.toString();
    	} else {
    		SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
			SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(job.getName(), carteObjectId, 0);
			return transStatus.getLoggingString();
    	}
		
	}
	
//	public JSONArray getStepStatus() throws Exception {
//		JSONArray jsonArray = new JSONArray();
//		
//		HashMap<String, Integer> stepIndex = new HashMap<String, Integer>();
//		if(executionConfiguration.isExecutingLocally()) {
//			for (StepMetaDataCombi combi : trans.getSteps()) {
//				Integer index = stepIndex.get(combi.stepMeta.getName());
//				if(index == null) {
//					JSONObject jsonObject = new JSONObject();
//					jsonObject.put("stepName", combi.stepMeta.getName());
//					int errCount = (int) combi.step.getErrors();
//					jsonObject.put("stepStatus", errCount);
//					
//					if(errCount > 0) {
//						StringBuilder logText = new StringBuilder();
//						String channelId = combi.step.getLogChannel().getLogChannelId();
//						List<KettleLoggingEvent> eventList = KettleLogStore.getLogBufferFromTo(channelId, false, -1, KettleLogStore.getLastBufferLineNr());
//						for (KettleLoggingEvent event : eventList) {
//							Object message = event.getMessage();
//							if (message instanceof LogMessage) {
//								LogMessage logMessage = (LogMessage) message;
//								if (logMessage.isError()) {
//									logText.append(logMessage.getMessage()).append(Const.CR);
//								}
//							}
//						}
//						jsonObject.put("logText", logText.toString());
//					}
//					
//					stepIndex.put(combi.stepMeta.getName(), jsonArray.size());
//					jsonArray.add(jsonObject);
//				} else {
//					JSONObject jsonObject = jsonArray.getJSONObject(index);
//					int errCount = (int) (combi.step.getErrors() + jsonObject.optInt("stepStatus"));
//					jsonObject.put("stepStatus", errCount);
//				}
//			}
//    	} else {
//    		SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
//			SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
//			List<StepStatus> stepStatusList = transStatus.getStepStatusList();
//        	for (int i = 0; i < stepStatusList.size(); i++) {
//				StepStatus stepStatus = stepStatusList.get(i);
//				Integer index = stepIndex.get(stepStatus.getStepname());
//				if(index == null) {
//					JSONObject jsonObject = new JSONObject();
//					jsonObject.put("stepName", stepStatus.getStepname());
//					jsonObject.put("stepStatus", stepStatus.getErrors());
//					
//					stepIndex.put(stepStatus.getStepname(), jsonArray.size());
//					jsonArray.add(jsonObject);
//				} else {
//					JSONObject jsonObject = jsonArray.getJSONObject(index);
//					int errCount = (int) (stepStatus.getErrors() + jsonObject.optInt("stepStatus"));
//					jsonObject.put("stepStatus", errCount);
//				}
//	
//			}
//    	}
//		
//		return jsonArray;
//	}
//	
//	public JSONObject getPreviewData() {
//		JSONObject jsonObject = new JSONObject();
//		for (StepMetaDataCombi combi : trans.getSteps()) {
//			RowMetaInterface rowMeta = previewMetaMap.get(combi.stepMeta);
//			
//			if (rowMeta != null) {
//				JSONObject stepJson = new JSONObject();
//				List<ValueMetaInterface> valueMetas = rowMeta.getValueMetaList();
//				
//				JSONArray columns = new JSONArray();
//				JSONObject metaData = new JSONObject();
//				JSONArray fields = new JSONArray();
//				for (int i = 0; i < valueMetas.size(); i++) {
//					ValueMetaInterface valueMeta = rowMeta.getValueMeta(i);
//					fields.add(valueMeta.getName());
//					
//					JSONObject column = new JSONObject();
//					column.put("dataIndex", valueMeta.getName());
//					column.put("width", 100);
//					column.put("header", valueMeta.getComments() == null ? valueMeta.getName() : valueMeta.getComments());
//					column.put("width", valueMeta.getLength() > 0 ? valueMeta.getLength() : 150);
//					columns.add(column);
//				}
//				metaData.put("fields", fields);
//				metaData.put("root", "firstRecords");
//				stepJson.put("metaData", metaData);
//				stepJson.put("columns", columns);
//				
//				List<Object[]> rowsData = previewDataMap.get(combi.stepMeta);
//				JSONArray firstRecords = new JSONArray();
//				JSONArray lastRecords = new JSONArray();
//				for (int rowNr = 0; rowNr < rowsData.size(); rowNr++) {
//					Object[] rowData = rowsData.get(rowNr);
//					JSONObject row = new JSONObject();
//					for (int colNr = 0; colNr < rowMeta.size(); colNr++) {
//						String string;
//						ValueMetaInterface valueMetaInterface;
//						try {
//							valueMetaInterface = rowMeta.getValueMeta(colNr);
//							if (valueMetaInterface.isStorageBinaryString()) {
//								Object nativeType = valueMetaInterface.convertBinaryStringToNativeType((byte[]) rowData[colNr]);
//								string = valueMetaInterface.getStorageMetadata().getString(nativeType);
//							} else {
//								string = rowMeta.getString(rowData, colNr);
//							}
//						} catch (Exception e) {
//							string = "Conversion error: " + e.getMessage();
//						}
//						
//						ValueMetaInterface valueMeta = rowMeta.getValueMeta( colNr );
//						row.put(valueMeta.getName(), string);
//						
//					}
//					if(firstRecords.size() <= 50) {
//						firstRecords.add(row);
//					}
//					lastRecords.add(row);
//					if(lastRecords.size() > 50)
//						lastRecords.remove(0);
//				}
//				stepJson.put("firstRecords", firstRecords);
//				jsonObject.put(combi.stepname, stepJson);
//			}
//		}
//		
//		return jsonObject;
//	}
}
