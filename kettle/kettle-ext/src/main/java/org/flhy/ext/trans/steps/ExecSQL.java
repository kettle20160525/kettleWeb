package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.sql.ExecSQLMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("ExecSQL")
@Scope("prototype")
public class ExecSQL extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		ExecSQLMeta execSQLMeta = (ExecSQLMeta) stepMetaInterface;
		
		String con = cell.getAttribute( "connection" );
		execSQLMeta.setDatabaseMeta(DatabaseMeta.findDatabase( databases, con ));
		execSQLMeta.setSql(StringEscapeHelper.decode(cell.getAttribute( "sql" )));
		
		execSQLMeta.setExecutedEachInputRow("true".equalsIgnoreCase(cell.getAttribute( "executedEachInputRow" )));
		execSQLMeta.setSingleStatement("true".equalsIgnoreCase(cell.getAttribute( "singleStatement" )));
		execSQLMeta.setVariableReplacementActive("true".equalsIgnoreCase(cell.getAttribute( "replaceVariables" )));
		execSQLMeta.setParams("true".equalsIgnoreCase(cell.getAttribute( "setParams" )));
		execSQLMeta.setQuoteString("true".equalsIgnoreCase(cell.getAttribute( "quoteString" )));

//	      insertField = cell.getAttribute( "insert_field" );
//	      updateField = cell.getAttribute( "update_field" );
//	      deleteField = cell.getAttribute( "delete_field" );
//	      readField = cell.getAttribute( "read_field" );
		
		JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute( "arguments" ));
		execSQLMeta.allocate( jsonArray.size() );
		for(int i=0; i<jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			execSQLMeta.getArguments()[i] = jsonObject.optString("name");
		}
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		ExecSQLMeta execSQLMeta = (ExecSQLMeta) stepMetaInterface;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement("Step");
		
		e.setAttribute("connection", execSQLMeta.getDatabaseMeta() == null ? "" : execSQLMeta.getDatabaseMeta().getName());
		e.setAttribute("sql", StringEscapeHelper.encode(execSQLMeta.getSql()));
		e.setAttribute("executedEachInputRow", Boolean.toString(execSQLMeta.isExecutedEachInputRow()));
		e.setAttribute("singleStatement", Boolean.toString(execSQLMeta.isSingleStatement()));
		e.setAttribute("replaceVariables", Boolean.toString(execSQLMeta.isReplaceVariables()));
		e.setAttribute("setParams", Boolean.toString(execSQLMeta.isParams()));
		e.setAttribute("quoteString", Boolean.toString(execSQLMeta.isQuoteString()));
		
		JSONArray arguments = new JSONArray();
		for ( int i = 0; i < execSQLMeta.getArguments().length; i++ ) {
			String name = execSQLMeta.getArguments()[i];
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", name);
			arguments.add(jsonObject);
		}
		e.setAttribute("arguments", arguments.toString());
		
		return e;
	}

}
