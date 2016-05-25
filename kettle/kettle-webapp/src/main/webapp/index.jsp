<%@ page pageEncoding="utf-8" %>
<!DOCTYPE html>
<html>
	<head>
	  	<title>TransformationsManager</title>
	  	<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ui/css/public.css" />
	</head>
	<body>
		<div id="loading-mask"></div>
		<div id="loading">
		    <div class="loading-indicator">
		        <img src="ui/resources/extanim32.gif" width="32" height="32" style="margin-right:8px;" align="absmiddle" />
		        	系统加载中,请稍后...&hellip;
		    </div>
		</div>
		
		<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ext3/resources/css/ext-all.css" />
	    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ext3/ux/ext-patch.css" />
	    <script type="text/javascript">
			mxBasePath = '${pageContext.request.contextPath}/mxgraph2';
			mxLanguages = ['de'];
		</script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/mxgraph2/js/mxClient.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/adapter/ext/ext-base.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ext-all-debug.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/CheckColumn.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/ListBox.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/ConditionEditor.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/DynamicEditorGrid.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogTransPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogStepPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogRunningPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogChannelPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogMetricsPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransParamTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransDateTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransDependenciesTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransMiscTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransMonitoringTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransExecutionConfigurationDialog.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/RowGeneratorDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/CheckSumDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/ExecSQLDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/TableInputDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/TableOutputDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/FilterRowsDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/SequenceDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/DummyDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/SwitchCaseDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/InsertUpdateDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/JsonInputDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/SelectValuesDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/SystemInfoDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/steps/SQLFileOutputDialog.js"></script>
	    
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/NormalPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/AdvancePanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/OptionsPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/PoolPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/DatabaseDialog.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/DebugWin.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/TextFieldDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/TextAreaDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/AnswerDialog.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/StepFieldsDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/CheckResultDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/EnterSelectionDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/EnterValueDialog.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/LibraryPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/MainPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/ResultPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/TransGraph.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/SystemStore.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/App.js"></script>
	    
	    <input  type ="hidden"  id="context-path" value ="${pageContext.request.contextPath}"/>
	</body>
</html>