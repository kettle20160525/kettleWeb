<%@ page pageEncoding="utf-8" %>
<!DOCTYPE html>
<html>
	<head>
	  	<title>KettleConsole</title>
	  	<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ui/css/public.css" />
	  	<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/mxgraph2/css/common.css" />
	  	<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/mxgraph2/css/explorer.css" />
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
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/NormalPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/AdvancePanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/OptionsPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/PoolPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/ClusterPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/DatabaseDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/DatabaseExplorerDialog.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/repository/KettleDatabaseRepositoryDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/repository/KettleFileRepositoryDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/repository/RepositoriesDialog.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/DebugWin.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/TextFieldDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/TextAreaDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/AnswerDialog.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/StepFieldsDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/CheckResultDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/EnterTextDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/EnterSelectionDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/EnterValueDialog.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/graph/BaseGraph.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/graph/TransGraph.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/graph/JobGraph.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/GuidePanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/ResultPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/initStore.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/initMain.js"></script>
	    
	    <input type="hidden" id="context-path" value="${pageContext.request.contextPath}" />
	</body>
</html>