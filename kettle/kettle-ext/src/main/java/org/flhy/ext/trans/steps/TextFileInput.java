package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.fileinput.text.TextFileInputMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;


@Component("TextFileInput")
@Scope("prototype")
public class TextFileInput  extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		TextFileInputMeta textFileInputMeta = (TextFileInputMeta) stepMetaInterface;
		
		JSONArray jsonArray = JSONArray.fromObject(cell.getAttribute("fileName"));
		String[] fileName = new String[jsonArray.size()];
		String[] filemask = new String[jsonArray.size()];
		String[] excludeFileMask = new String[jsonArray.size()];
		String[] fileRequired = new String[jsonArray.size()];

		for (int i = 0; i < jsonArray.size(); i++) {
			JSONObject jsonObject = jsonArray.getJSONObject(i);
			fileName[i] = jsonObject.optString("fileName");
			filemask[i] = jsonObject.optString("filemask");
			excludeFileMask[i] = jsonObject.optString("excludeFileMask");
			fileRequired[i] = jsonObject.optString("fileRequired");
		}
		textFileInputMeta.setFileName(fileName);
//		textFileInputMeta.setFileMask(filemask);
//		textFileInputMeta.setExcludeFileMask(excludeFileMask);
//		textFileInputMeta.setFileRequired(fileRequired);
//		textFileInputMeta.setFileType(cell.getAttribute("fileType"));
//		textFileInputMeta.setSeparator(cell.getAttribute("separator"));
//		textFileInputMeta.setEnclosure(cell.getAttribute("enclosure;"));
//		textFileInputMeta.setEscapeCharacter(cell.getAttribute("escapeCharacter"));
//		textFileInputMeta.setBreakInEnclosureAllowed("Y".equalsIgnoreCase(cell.getAttribute("breakInEnclosureAllowed")));
//		textFileInputMeta.setHeader("Y".equalsIgnoreCase(cell.getAttribute("header")));
//		textFileInputMeta.setNrHeaderLines(Integer.parseInt(cell.getAttribute("nrHeaderLines")));
//		textFileInputMeta.setFooter("Y".equalsIgnoreCase(cell.getAttribute("footer")));
//		textFileInputMeta.setNrFooterLines(Integer.parseInt(cell.getAttribute("nrFooterLines")));
//		textFileInputMeta.setLineWrapped("Y".equalsIgnoreCase(cell.getAttribute("lineWrapped")));
//		textFileInputMeta.setNrWraps(Integer.parseInt(cell.getAttribute("nrWraps")));
//		textFileInputMeta.setNrLinesDocHeader(Integer.parseInt(cell.getAttribute("nrLinesDocHeader")));
//		textFileInputMeta.setNrLinesPerPage(Integer.parseInt(cell.getAttribute("nrLinesPerPage")));
//		textFileInputMeta.setFileCompression(cell.getAttribute("fileCompression"));
//		textFileInputMeta.setNoEmptyLines("Y".equalsIgnoreCase(cell.getAttribute("noEmptyLines")));
//		textFileInputMeta.setIncludeFilename("Y".equalsIgnoreCase(cell.getAttribute("includeFilename")));
//		textFileInputMeta.setFilenameField(cell.getAttribute("filenameField"));
//		textFileInputMeta.setIncludeRowNumber("Y".equalsIgnoreCase(cell.getAttribute("includeRowNumber;")));
//		textFileInputMeta.setRowNumberField(cell.getAttribute("rowNumberByFile"));
//		textFileInputMeta.setRowNumberField(cell.getAttribute("rowNumberField"));
//		textFileInputMeta.setFileFormat(cell.getAttribute("fileFormat"));
//		textFileInputMeta.setInputFields(Integer.parseInt(cell.getAttribute("inputFields")));
//		textFileInputMeta.setIncludeSubFolder(Integer.parseInt(cell.getAttribute("includeSubFolders")));
//	
//		textFileInputMeta.setFilter("Y".equalsIgnoreCase(cell.getAttribute("filter")));
//		textFileInputMeta.setEncoding(cell.getAttribute("encoding"));
//		textFileInputMeta.setErrorIgnored("Y".equalsIgnoreCase(cell.getAttribute("errorIgnored"));
//		textFileInputMeta.setErrorCountField(cell.getAttribute("errorCountField"));
//		textFileInputMeta.setErrorFieldsField(cell.getAttribute("errorFieldsField"));
//		textFileInputMeta.setErrorTextField(cell.getAttribute("errorTextField;"));
//		textFileInputMeta.setWarningFilesDestinationDirectory(cell.getAttribute("warningFilesDestinationDirectory"));
//		textFileInputMeta.setWarningFilesExtension(cell.getAttribute("warningFilesExtension"));
//		textFileInputMeta.setErrorFilesDestinationDirectory(cell.getAttribute("errorFilesDestinationDirectory"));
//		textFileInputMeta.setErrorLineFilesExtension(cell.getAttribute("errorFilesExtension"));
//		textFileInputMeta.setLineNumberFilesExtension(cell.getAttribute("lineNumberFilesExtension;"));
//		textFileInputMeta.setDateFormatLenient("Y".equalsIgnoreCase(cell.getAttribute("dateFormatLenient")));
//		textFileInputMeta.setDateFormatLocale("Y".equalsIgnoreCase(cell.getAttribute("dateFormatLocale")));
//		textFileInputMeta.setErrorLineSkipped("Y".equalsIgnoreCase(cell.getAttribute("errorLineSkipped")));
//		textFileInputMeta.setAcceptingFilenames("Y".equalsIgnoreCase(cell.getAttribute("acceptingFilenames")));
//		textFileInputMeta.setPassingThruFields("Y".equalsIgnoreCase(cell.getAttribute("passingThruFields;")));
//		textFileInputMeta.setAcceptingField(cell.getAttribute("acceptingField"));
//		textFileInputMeta.setAcceptingStepName(cell.getAttribute("acceptingStepName"));
//		textFileInputMeta.setAcceptingStep("Y".equalsIgnoreCase(cell.getAttribute("acceptingStep")));
//		textFileInputMeta.setAddResultFile("Y".equalsIgnoreCase(cell.getAttribute("isaddresult")));
//		textFileInputMeta.setShortFileNameField(cell.getAttribute("shortFileFieldName;"));
//		textFileInputMeta.setPathField(cell.getAttribute("pathFieldName"));
//		textFileInputMeta.setisHiddenField("Y".equalsIgnoreCase(cell.getAttribute("hiddenFieldName")));
//		textFileInputMeta.setLastModificationDateField(cell.getAttribute("lastModificationTimeFieldName"));
//		textFileInputMeta.setUriField(cell.getAttribute("uriNameFieldName"));
//		textFileInputMeta.setRootUriField(cell.getAttribute("rootUriNameFieldName"));
//		textFileInputMeta.setExtensionField((cell.getAttribute("extensionFieldName")));
//		textFileInputMeta.setSizeField(cell.getAttribute("sizeFieldName"));
//		textFileInputMeta.setSkipBadFiles("Y".equalsIgnoreCase(cell.getAttribute("skipBadFiles")));
//		textFileInputMeta.setFileErrorField(cell.getAttribute("fileErrorField"));
//		textFileInputMeta.setFileErrorMessageField(cell.getAttribute("fileErrorMessageField"));
//		String fields = cell.getAttribute("fields");
//		TextFileField[] outputFields = new TextFileField[jsonArray.size()];
//		for(int i=0; i<jsonArray.size(); i++) {
//			JSONObject jsonObject = jsonArray.getJSONObject(i);
//			TextFileField field = new TextFileField();
//	        field.setName( jsonObject.optString("name" ) );
//	        field.setType( jsonObject.optString("type" ) );
//	        field.setFormat( jsonObject.optString("format" ) );
//	        field.setCurrencySymbol( jsonObject.optString("currency" ) );
//	        field.setDecimalSymbol( jsonObject.optString("decimal" ) );
//	        field.setGroupingSymbol( jsonObject.optString("group" ) );
//	        field.setTrimType( ValueMeta.getTrimTypeByCode( jsonObject.optString("trim_type" ) ) );
//	        field.setNullString( jsonObject.optString("nullif" ) );
//	        field.setLength( Const.toInt( jsonObject.optString("length" ), -1 ) );
//	        field.setPrecision( Const.toInt( jsonObject.optString("precision" ), -1 ) );
//	        
//	        outputFields[i] = field;
//		}
//		textFileInputMeta.setOutputFields(outputFields);
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		TextFileInputMeta textFileInputMeta = (TextFileInputMeta) stepMetaInterface;
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		
//		e.setAttribute("fileName", textFileInputMeta.getFileName());
//		e.setAttribute("filemask", textFileInputMeta.getFileMask() ? "Y" : "N");
//		e.setAttribute("excludeFileMask", textFileInputMeta.getExludeFileMask() ? "Y" : "N");
//		e.setAttribute("fileRequired", textFileInputMeta.getFileRequired() ? "Y" : "N");
//		e.setAttribute("fileType", textFileInputMeta.getFileType() ? "Y" : "N");
//		e.setAttribute("separator", textFileInputMeta.getSeparator() ? "Y" : "N");
//		e.setAttribute("enclosure", textFileInputMeta.getEnclosure());
//		e.setAttribute("escapeCharacter", textFileInputMeta.getEscapeCharacter());
//		e.setAttribute("breakInEnclosureAllowed", textFileInputMeta.isBreakInEnclosureAllowed() ? "Y" : "N");
//		e.setAttribute("header", textFileInputMeta.hasHeader() ? "Y" : "N");
//		e.setAttribute("nrHeaderLines", textFileInputMeta.getNrHeaderLines() ? "Y" : "N");
//		e.setAttribute("footer", textFileInputMeta.hasFooter() ? "Y" : "N");
//		e.setAttribute("nrFooterLines", textFileInputMeta.getNrFooterLines() ? "Y" : "N");
//		e.setAttribute("lineWrapped", textFileInputMeta.isLineWrapped());
//		e.setAttribute("nrWraps", textFileInputMeta.getNrWraps() ? "Y" : "N");
//		
//		e.setAttribute("layoutPaged", textFileInputMeta.isLayoutPaged() ? "Y" : "N");
//		e.setAttribute("nrLinesDocHeader", textFileInputMeta.getNrLinesDocHeader());
//		e.setAttribute("nrLinesPerPage", textFileInputMeta.getNrLinesPerPage());
//		e.setAttribute("fileCompression", textFileInputMeta.getFileCompression() ? "Y" : "N");
//		e.setAttribute("noEmptyLines", textFileInputMeta.noEmptyLines() ? "Y" : "N");
//		e.setAttribute("includeFilename;", textFileInputMeta.includeFilename() ? "Y" : "N");
//		e.setAttribute("filenameField", textFileInputMeta.getFilenameField() ? "Y" : "N");
//		e.setAttribute("includeRowNumber", textFileInputMeta.includeRowNumber());
//		e.setAttribute("rowNumberByFile", textFileInputMeta.isRowNumberByFile());
//		e.setAttribute("rowNumberField", textFileInputMeta.getRowNumberField());
//		e.setAttribute("fileFormat", textFileInputMeta.getFileFormat() ? "Y" : "N");
//		e.setAttribute("rowLimit", textFileInputMeta.getRowLimit() ? "Y" : "N");
////		e.setAttribute("TextFileInputField", textFileInputMeta.gette() + "");
//		e.setAttribute("includeSubFolders", textFileInputMeta.getIncludeSubFolders());
//		
////		e.setAttribute("filter", textFileInputMeta.getFilter() ? "Y" : "N");
//		e.setAttribute("encoding", textFileInputMeta.getEncoding());
//		e.setAttribute("errorIgnored", textFileInputMeta.isErrorIgnored());
//		e.setAttribute("errorCountField", textFileInputMeta.getErrorCountField() ? "Y" : "N");
//		e.setAttribute("errorTextField", textFileInputMeta.getErrorTextField() ? "Y" : "N");
//		e.setAttribute("warningFilesDestinationDirectory;", textFileInputMeta.getWarningFilesDestinationDirectory() ? "Y" : "N");
//		e.setAttribute("warningFilesExtension", textFileInputMeta.getWarningFilesExtension()() ? "Y" : "N");
//		e.setAttribute("errorFilesDestinationDirectory", textFileInputMeta.getErrorFilesDestinationDirectory());
//		e.setAttribute("errorFilesExtension", textFileInputMeta.setErrorLineFilesExtension());
//		e.setAttribute("lineNumberFilesDestinationDirectory", textFileInputMeta.getLineNumberFilesDestinationDirectory());
//		e.setAttribute("lineNumberFilesExtension", textFileInputMeta.getLineNumberFilesExtension() ? "Y" : "N");
//		e.setAttribute("dateFormatLenient", textFileInputMeta.isDateFormatLenient() ? "Y" : "N");
//		e.setAttribute("dateFormatLocale", textFileInputMeta.getDateFormatLocale() + "");
//		e.setAttribute("errorLineSkipped", textFileInputMeta.isErrorLineSkipped());
//		
//		
//		e.setAttribute("acceptingFilenames;", textFileInputMeta.isAcceptingFilenames()() ? "Y" : "N");
//		e.setAttribute("passingThruFields", textFileInputMeta.isPassingThruFields());
//		e.setAttribute("acceptingField", textFileInputMeta.getAcceptingField());
//		e.setAttribute("acceptingStepName", textFileInputMeta.getAcceptingStepName());
//		e.setAttribute("acceptingStep", textFileInputMeta.getAcceptingStep() ? "Y" : "N");
//		e.setAttribute("isaddresult", textFileInputMeta.isAddResultFile()) ? "Y" : "N");
//		e.setAttribute("shortFileFieldName", textFileInputMeta.getShortFileNameField() + "");
//		e.setAttribute("pathFieldName", textFileInputMeta.getPathField());
//		
//		e.setAttribute("hiddenFieldName", textFileInputMeta.isHiddenField());
//		e.setAttribute("lastModificationTimeFieldName", textFileInputMeta.getLastModificationDateField() ? "Y" : "N");
//		e.setAttribute("uriNameFieldName", textFileInputMeta.getUriField() ? "Y" : "N");
//		e.setAttribute("rootUriNameFieldName", textFileInputMeta.getRootUriField() + "");
//		e.setAttribute("extensionFieldName", textFileInputMeta.getExtensionField());
//		
//		
//		
//		TextFileField[] outputFields = textFileInputMeta.getOutputFields();
//		if(outputFields != null) {
//			JSONArray jsonArray = new JSONArray();
//			for(TextFileField field : outputFields) {
//				JSONObject jsonObject = new JSONObject();
//				jsonObject.put("name", field.getName());
//				jsonObject.put("type", field.getTypeDesc());
//				jsonObject.put("format", field.getFormat());
//				jsonObject.put("currencyType", field.getCurrencySymbol());
//				jsonObject.put("decimal", field.getDecimalSymbol());
//				jsonObject.put("group", field.getGroupingSymbol());
//				jsonObject.put("nullif", field.getNullString());
//				jsonObject.put("trim_type", field.getTrimTypeDesc());
//				if(field.getLength() != -1)
//					jsonObject.put("length", field.getLength());
//				if(field.getPrecision() != -1)
//					jsonObject.put("precision", field.getPrecision());
//				
//				jsonArray.add(jsonObject);
//			}
//			e.setAttribute("fields", jsonArray.toString());
//		}
		
		return e;
	}

}
