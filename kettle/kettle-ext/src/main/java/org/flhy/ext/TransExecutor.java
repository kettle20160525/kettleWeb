package org.flhy.ext;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.cluster.SlaveServer;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.exception.KettleStepException;
import org.pentaho.di.core.logging.KettleLogLayout;
import org.pentaho.di.core.logging.KettleLogStore;
import org.pentaho.di.core.logging.KettleLoggingEvent;
import org.pentaho.di.core.logging.LogMessage;
import org.pentaho.di.core.logging.LoggingRegistry;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.trans.Trans;
import org.pentaho.di.trans.TransAdapter;
import org.pentaho.di.trans.TransExecutionConfiguration;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.cluster.TransSplitter;
import org.pentaho.di.trans.step.RowAdapter;
import org.pentaho.di.trans.step.StepInterface;
import org.pentaho.di.trans.step.StepMeta;
import org.pentaho.di.trans.step.StepMetaDataCombi;
import org.pentaho.di.trans.step.StepStatus;
import org.pentaho.di.www.SlaveServerTransStatus;
import org.springframework.util.StringUtils;

public class TransExecutor implements Runnable {

	private String executionId;
	private TransExecutionConfiguration executionConfiguration;
	private TransMeta transMeta = null;
	private Trans trans = null;
	private Map<StepMeta, String> stepLogMap = new HashMap<StepMeta, String>();
	
	
	private TransSplitter transSplitter = null;
	
	private TransExecutor(TransExecutionConfiguration transExecutionConfiguration, TransMeta transMeta) {
		this.executionId = UUID.randomUUID().toString().replaceAll("-", "");
		this.executionConfiguration = transExecutionConfiguration;
		this.transMeta = transMeta;
	}
	
	private static Hashtable<String, TransExecutor> executors = new Hashtable<String, TransExecutor>();
	
	public static synchronized TransExecutor initExecutor(TransExecutionConfiguration transExecutionConfiguration, TransMeta transMeta) {
		TransExecutor transExecutor = new TransExecutor(transExecutionConfiguration, transMeta);
		executors.put(transExecutor.getExecutionId(), transExecutor);
		return transExecutor;
	}

	public String getExecutionId() {
		return executionId;
	}
	
	private boolean finished = false;


	@Override
	public void run() {
		try {
			if (executionConfiguration.isExecutingLocally()) {
				// Set the variables
				transMeta.injectVariables( executionConfiguration.getVariables() );
				// Set the named parameters
				Map<String, String> paramMap = executionConfiguration.getParams();
				Set<String> keys = paramMap.keySet();
				for (String key : keys) {
					transMeta.setParameterValue(key, Const.NVL(paramMap.get(key), ""));
				}
				transMeta.activateParameters();

				// Set the arguments
				Map<String, String> arguments = executionConfiguration.getArguments();
		        String[] argumentNames = arguments.keySet().toArray( new String[arguments.size()] );
		        Arrays.sort( argumentNames );

		        String[] args = new String[argumentNames.length];
		        for ( int i = 0; i < args.length; i++ ) {
		          String argumentName = argumentNames[i];
		          args[i] = arguments.get( argumentName );
		        }
		        boolean initialized = false;
		        trans = new Trans( transMeta );
		        try {
		            trans.prepareExecution( args );
					capturePreviewData(trans, transMeta.getSteps());
		            initialized = true;
		        } catch ( KettleException e ) {
		        	e.printStackTrace();
//		        	log.logError( trans.getName() + ": preparing transformation execution failed", e );
		            checkErrorVisuals();
		        }
		        
		        if ( trans.isReadyToStart() && initialized) {
					trans.addTransListener(new TransAdapter() {
						public void transFinished(Trans trans) {
							checkErrorVisuals();
						}
					});
		        	
					trans.startThreads();
					
					while(!trans.isFinished())
						Thread.sleep(500);
		        } else {
		        	checkErrorVisuals();
		        }
			} else if (executionConfiguration.isExecutingRemotely()) {
				carteObjectId = Trans.sendToSlaveServer( transMeta, executionConfiguration, App.getInstance().getRepository(), App.getInstance().getMetaStore() );
				SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
				
				boolean running = true;
				while(running) {
					SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
					running = transStatus.isRunning();
					
					Thread.sleep(500);
				}
			} else if(executionConfiguration.isExecutingClustered()) {
				transSplitter = new TransSplitter( transMeta );
				transSplitter.splitOriginalTransformation();
				
				for (String var : Const.INTERNAL_TRANS_VARIABLES) {
					executionConfiguration.getVariables().put(var, transMeta.getVariable(var));
				}
				for (String var : Const.INTERNAL_JOB_VARIABLES) {
					executionConfiguration.getVariables().put(var, transMeta.getVariable(var));
				}

				// Parameters override the variables.
				// For the time being we're passing the parameters over the wire
				// as variables...
				//
				TransMeta ot = transSplitter.getOriginalTransformation();
				for (String param : ot.listParameters()) {
					String value = Const.NVL(ot.getParameterValue(param), Const.NVL(ot.getParameterDefault(param), ot.getVariable(param)));
					if (!Const.isEmpty(value)) {
						executionConfiguration.getVariables().put(param, value);
					}
				}

				try {
					Trans.executeClustered(transSplitter, executionConfiguration);
				} catch (Exception e) {
					// Something happened posting the transformation to the
					// cluster.
					// We need to make sure to de-allocate ports and so on for
					// the next try...
					// We don't want to suppress original exception here.
					try {
						Trans.cleanupCluster(App.getInstance().getLog(), transSplitter);
					} catch (Exception ee) {
						throw new Exception("Error executing transformation and error to clenaup cluster", e);
					}
					// we still have execution error but cleanup ok here...
					throw e;
				}

//				if (executionConfiguration.isClusterPosting()) {
//					if (masterServer != null) {
//						// spoon.addSpoonSlave( masterServer );
//						for (int i = 0; i < slaves.length; i++) {
//							// spoon.addSpoonSlave( slaves[i] );
//						}
//					}
//				}
				
				Trans.monitorClusteredTransformation(App.getInstance().getLog(), transSplitter, null);
//				Result result = Trans.getClusteredTransformationResult(App.getInstance().getLog(), transSplitter, null);
				
			}
			
		} catch(Exception e) {
			e.printStackTrace();
			App.getInstance().getLog().logError("执行失败！", e);
		} finally {
			finished = true;
		}
	}
	
	public void capturePreviewData(Trans trans, List<StepMeta> stepMetas) {
		final StringBuffer loggingText = new StringBuffer();

		try {
			final TransMeta transMeta = trans.getTransMeta();

			for (final StepMeta stepMeta : stepMetas) {
				final RowMetaInterface rowMeta = transMeta.getStepFields( stepMeta ).clone();
				previewMetaMap.put(stepMeta, rowMeta);
				final List<Object[]> rowsData = new LinkedList<Object[]>();

				previewDataMap.put(stepMeta, rowsData);
				previewLogMap.put(stepMeta, loggingText);

				StepInterface step = trans.findRunThread(stepMeta.getName());

				if (step != null) {

					step.addRowListener(new RowAdapter() {
						@Override
						public void rowWrittenEvent(RowMetaInterface rowMeta, Object[] row) throws KettleStepException {
							try {
								rowsData.add(rowMeta.cloneRow(row));
								if (rowsData.size() > 100) {
									rowsData.remove(0);
								}
							} catch (Exception e) {
								throw new KettleStepException("Unable to clone row for metadata : " + rowMeta, e);
							}
						}
					});
				}

			}
		} catch (Exception e) {
			loggingText.append(Const.getStackTracker(e));
		}

		trans.addTransListener(new TransAdapter() {
			@Override
			public void transFinished(Trans trans) throws KettleException {
				if (trans.getErrors() != 0) {
					for (StepMetaDataCombi combi : trans.getSteps()) {
						if (combi.copy == 0) {
							StringBuffer logBuffer = KettleLogStore.getAppender().getBuffer(combi.step.getLogChannel().getLogChannelId(), false);
							previewLogMap.put(combi.stepMeta, logBuffer);
						}
					}
				}
			}
		});
	}
	
	protected Map<StepMeta, RowMetaInterface> previewMetaMap = new HashMap<StepMeta, RowMetaInterface>();
	protected Map<StepMeta, List<Object[]>> previewDataMap = new HashMap<StepMeta, List<Object[]>>();
	protected Map<StepMeta, StringBuffer> previewLogMap = new HashMap<StepMeta, StringBuffer>();
	
	private void checkErrorVisuals() {
		if (trans.getErrors() > 0) {
			stepLogMap.clear();
			
			for (StepMetaDataCombi combi : trans.getSteps()) {
				if (combi.step.getErrors() > 0) {
					String channelId = combi.step.getLogChannel().getLogChannelId();
					List<KettleLoggingEvent> eventList = KettleLogStore.getLogBufferFromTo(channelId, false, 0, KettleLogStore.getLastBufferLineNr());
					StringBuilder logText = new StringBuilder();
					for (KettleLoggingEvent event : eventList) {
						Object message = event.getMessage();
						if (message instanceof LogMessage) {
							LogMessage logMessage = (LogMessage) message;
							if (logMessage.isError()) {
								logText.append(logMessage.getMessage()).append(Const.CR);
							}
						}
					}
					stepLogMap.put(combi.stepMeta, logText.toString());
				}
			}

		} else {
			stepLogMap.clear();
		}
	}
	
	private String carteObjectId = null;

	public boolean isFinished() {
		return finished;
	}
	
	public JSONArray getStepMeasure() throws Exception {
    	JSONArray jsonArray = new JSONArray();
    	
    	if(executionConfiguration.isExecutingLocally()) {
    		for (int i = 0; i < trans.nrSteps(); i++) {
    			StepInterface baseStep = trans.getRunThread(i);
    			StepStatus stepStatus = new StepStatus(baseStep);

    			String[] fields = stepStatus.getTransLogFields();

    			JSONArray childArray = new JSONArray();
    			for (int f = 1; f < fields.length; f++) {
    				childArray.add(fields[f]);
    			}
    			jsonArray.add(childArray);
    		}
    	} else if(executionConfiguration.isExecutingRemotely()) {
    		SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
			SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
			List<StepStatus> stepStatusList = transStatus.getStepStatusList();
        	for (int i = 0; i < stepStatusList.size(); i++) {
				StepStatus stepStatus = stepStatusList.get(i);
				String[] fields = stepStatus.getTransLogFields();
	
				JSONArray childArray = new JSONArray();
				for (int f = 1; f < fields.length; f++) {
					childArray.add(fields[f]);
				}
				jsonArray.add(childArray);
			}
    	} else if(executionConfiguration.isExecutingClustered()) {
    		SlaveServer masterServer = transSplitter.getMasterServer();
			SlaveServer[] slaves = transSplitter.getSlaveTargets();
			Map<TransMeta, String> carteMap = transSplitter.getCarteObjectMap();
			
			SlaveServerTransStatus transStatus = masterServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getMaster()), 0);
			List<StepStatus> stepStatusList = transStatus.getStepStatusList();
			for (int i = 0; i < stepStatusList.size(); i++) {
				StepStatus stepStatus = stepStatusList.get(i);
				String[] fields = stepStatus.getTransLogFields();
	
				JSONArray childArray = new JSONArray();
				for (int f = 1; f < fields.length; f++) {
					childArray.add(fields[f]);
				}
				jsonArray.add(childArray);
			}
			
			for (SlaveServer slaveServer : slaves) {
				transStatus = slaveServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getSlaveTransMap().get(slaveServer)), 0);
				stepStatusList = transStatus.getStepStatusList();
				for (int i = 0; i < stepStatusList.size(); i++) {
					StepStatus stepStatus = stepStatusList.get(i);
					String[] fields = stepStatus.getTransLogFields();

					JSONArray childArray = new JSONArray();
					for (int f = 1; f < fields.length; f++) {
						childArray.add(fields[f]);
					}
					jsonArray.add(childArray);
				}
			}
    	}
    	
    	return jsonArray;
	}
	
	public String getExecutionLog() throws Exception {
		
		if(executionConfiguration.isExecutingLocally()) {
			StringBuffer sb = new StringBuffer();
			KettleLogLayout logLayout = new KettleLogLayout( true );
			List<String> childIds = LoggingRegistry.getInstance().getLogChannelChildren( trans.getLogChannelId() );
			List<KettleLoggingEvent> logLines = KettleLogStore.getLogBufferFromTo( childIds, true, -1, KettleLogStore.getLastBufferLineNr() );
			 for ( int i = 0; i < logLines.size(); i++ ) {
	             KettleLoggingEvent event = logLines.get( i );
	             String line = logLayout.format( event ).trim();
	             sb.append(line).append("\n");
			 }
			 return sb.toString();
    	} else if(executionConfiguration.isExecutingRemotely()) {
    		SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
			SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
			return transStatus.getLoggingString();
    	} else if(executionConfiguration.isExecutingClustered()) {
    		SlaveServer masterServer = transSplitter.getMasterServer();
			SlaveServer[] slaves = transSplitter.getSlaveTargets();
			Map<TransMeta, String> carteMap = transSplitter.getCarteObjectMap();
			
			SlaveServerTransStatus transStatus = masterServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getMaster()), 0);
			String log = transStatus.getLoggingString();
			for(SlaveServer slaveServer : slaves) {
				 transStatus = slaveServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getSlaveTransMap().get(slaveServer)), 0);
				 if(StringUtils.hasText(transStatus.getLoggingString())) {
					 log += transStatus.getLoggingString();
				 }
			}
			
			return log;
    	}
		
		return "";
	}
	
	public JSONArray getStepStatus() throws Exception {
		JSONArray jsonArray = new JSONArray();
		
		HashMap<String, Integer> stepIndex = new HashMap<String, Integer>();
		if(executionConfiguration.isExecutingLocally()) {
			for (StepMetaDataCombi combi : trans.getSteps()) {
				Integer index = stepIndex.get(combi.stepMeta.getName());
				if(index == null) {
					JSONObject jsonObject = new JSONObject();
					jsonObject.put("stepName", combi.stepMeta.getName());
					int errCount = (int) combi.step.getErrors();
					jsonObject.put("stepStatus", errCount);
					
					if(errCount > 0) {
						StringBuilder logText = new StringBuilder();
						String channelId = combi.step.getLogChannel().getLogChannelId();
						List<KettleLoggingEvent> eventList = KettleLogStore.getLogBufferFromTo(channelId, false, -1, KettleLogStore.getLastBufferLineNr());
						for (KettleLoggingEvent event : eventList) {
							Object message = event.getMessage();
							if (message instanceof LogMessage) {
								LogMessage logMessage = (LogMessage) message;
								if (logMessage.isError()) {
									logText.append(logMessage.getMessage()).append(Const.CR);
								}
							}
						}
						jsonObject.put("logText", logText.toString());
					}
					
					stepIndex.put(combi.stepMeta.getName(), jsonArray.size());
					jsonArray.add(jsonObject);
				} else {
					JSONObject jsonObject = jsonArray.getJSONObject(index);
					int errCount = (int) (combi.step.getErrors() + jsonObject.optInt("stepStatus"));
					jsonObject.put("stepStatus", errCount);
				}
			}
    	} else if(executionConfiguration.isExecutingRemotely()) {
    		SlaveServer remoteSlaveServer = executionConfiguration.getRemoteServer();
			SlaveServerTransStatus transStatus = remoteSlaveServer.getTransStatus(transMeta.getName(), carteObjectId, 0);
			List<StepStatus> stepStatusList = transStatus.getStepStatusList();
        	for (int i = 0; i < stepStatusList.size(); i++) {
				StepStatus stepStatus = stepStatusList.get(i);
				Integer index = stepIndex.get(stepStatus.getStepname());
				if(index == null) {
					JSONObject jsonObject = new JSONObject();
					jsonObject.put("stepName", stepStatus.getStepname());
					jsonObject.put("stepStatus", stepStatus.getErrors());
					
					stepIndex.put(stepStatus.getStepname(), jsonArray.size());
					jsonArray.add(jsonObject);
				} else {
					JSONObject jsonObject = jsonArray.getJSONObject(index);
					int errCount = (int) (stepStatus.getErrors() + jsonObject.optInt("stepStatus"));
					jsonObject.put("stepStatus", errCount);
				}
	
			}
    	} else if(executionConfiguration.isExecutingClustered()) {
    		SlaveServer masterServer = transSplitter.getMasterServer();
			SlaveServer[] slaves = transSplitter.getSlaveTargets();
			Map<TransMeta, String> carteMap = transSplitter.getCarteObjectMap();
			
			SlaveServerTransStatus transStatus = masterServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getMaster()), 0);
			List<StepStatus> stepStatusList = transStatus.getStepStatusList();
			for (int i = 0; i < stepStatusList.size(); i++) {
				StepStatus stepStatus = stepStatusList.get(i);
				Integer index = stepIndex.get(stepStatus.getStepname());
				if(index == null) {
					JSONObject jsonObject = new JSONObject();
					jsonObject.put("stepName", stepStatus.getStepname());
					jsonObject.put("stepStatus", stepStatus.getErrors());
					
					stepIndex.put(stepStatus.getStepname(), jsonArray.size());
					jsonArray.add(jsonObject);
				} else {
					JSONObject jsonObject = jsonArray.getJSONObject(index);
					int errCount = (int) (stepStatus.getErrors() + jsonObject.optInt("stepStatus"));
					jsonObject.put("stepStatus", errCount);
				}
			}
			
			for (SlaveServer slaveServer : slaves) {
				transStatus = slaveServer.getTransStatus(transMeta.getName(), carteMap.get(transSplitter.getSlaveTransMap().get(slaveServer)), 0);
				stepStatusList = transStatus.getStepStatusList();
				for (int i = 0; i < stepStatusList.size(); i++) {
					StepStatus stepStatus = stepStatusList.get(i);
					Integer index = stepIndex.get(stepStatus.getStepname());
					if(index == null) {
						JSONObject jsonObject = new JSONObject();
						jsonObject.put("stepName", stepStatus.getStepname());
						jsonObject.put("stepStatus", stepStatus.getErrors());
						
						stepIndex.put(stepStatus.getStepname(), jsonArray.size());
						jsonArray.add(jsonObject);
					} else {
						JSONObject jsonObject = jsonArray.getJSONObject(index);
						int errCount = (int) (stepStatus.getErrors() + jsonObject.optInt("stepStatus"));
						jsonObject.put("stepStatus", errCount);
					}
				}
			}
    	}
		
		return jsonArray;
	}
	
	public JSONObject getPreviewData() {
		JSONObject jsonObject = new JSONObject();
		for (StepMetaDataCombi combi : trans.getSteps()) {
			RowMetaInterface rowMeta = previewMetaMap.get(combi.stepMeta);
			
			if (rowMeta != null) {
				JSONObject stepJson = new JSONObject();
				List<ValueMetaInterface> valueMetas = rowMeta.getValueMetaList();
				
				JSONArray columns = new JSONArray();
				JSONObject metaData = new JSONObject();
				JSONArray fields = new JSONArray();
				for (int i = 0; i < valueMetas.size(); i++) {
					ValueMetaInterface valueMeta = rowMeta.getValueMeta(i);
					fields.add(valueMeta.getName());
					
					JSONObject column = new JSONObject();
					column.put("dataIndex", valueMeta.getName());
					column.put("width", 100);
					column.put("header", valueMeta.getComments() == null ? valueMeta.getName() : valueMeta.getComments());
					column.put("width", valueMeta.getLength() > 0 ? valueMeta.getLength() : 150);
					columns.add(column);
				}
				metaData.put("fields", fields);
				metaData.put("root", "firstRecords");
				stepJson.put("metaData", metaData);
				stepJson.put("columns", columns);
				
				List<Object[]> rowsData = previewDataMap.get(combi.stepMeta);
				JSONArray firstRecords = new JSONArray();
				JSONArray lastRecords = new JSONArray();
				for (int rowNr = 0; rowNr < rowsData.size(); rowNr++) {
					Object[] rowData = rowsData.get(rowNr);
					JSONObject row = new JSONObject();
					for (int colNr = 0; colNr < rowMeta.size(); colNr++) {
						String string;
						ValueMetaInterface valueMetaInterface;
						try {
							valueMetaInterface = rowMeta.getValueMeta(colNr);
							if (valueMetaInterface.isStorageBinaryString()) {
								Object nativeType = valueMetaInterface.convertBinaryStringToNativeType((byte[]) rowData[colNr]);
								string = valueMetaInterface.getStorageMetadata().getString(nativeType);
							} else {
								string = rowMeta.getString(rowData, colNr);
							}
						} catch (Exception e) {
							string = "Conversion error: " + e.getMessage();
						}
						
						ValueMetaInterface valueMeta = rowMeta.getValueMeta( colNr );
						row.put(valueMeta.getName(), string);
						
					}
					if(firstRecords.size() <= 50) {
						firstRecords.add(row);
					}
					lastRecords.add(row);
					if(lastRecords.size() > 50)
						lastRecords.remove(0);
				}
				stepJson.put("firstRecords", firstRecords);
				jsonObject.put(combi.stepname, stepJson);
			}
		}
		
		return jsonObject;
	}
}
