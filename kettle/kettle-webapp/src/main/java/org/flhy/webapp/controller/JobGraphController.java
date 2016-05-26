package org.flhy.webapp.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.flhy.ext.job.JobDecoder;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.job.JobMeta;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.w3c.dom.Document;

import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxUtils;
import com.mxgraph.view.mxGraph;

@Controller
@RequestMapping(value="/job")
public class JobGraphController {
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/engineXml")
	protected void engineXml(HttpServletRequest request, HttpServletResponse response, @RequestParam String graphXml) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		JobMeta jobMeta = JobDecoder.decode(graph);
		String xml = XMLHandler.getXMLHeader() + jobMeta.getXML();
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(xml);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/save")
	protected void save(HttpServletRequest request, HttpServletResponse response, @RequestParam String graphXml) throws Exception {
		mxGraph graph = new mxGraph();
		mxCodec codec = new mxCodec();
		Document doc = mxUtils.parseXml(graphXml);
		codec.decode(doc.getDocumentElement(), graph.getModel());
		
		JobMeta jobMeta = JobDecoder.decode(graph);
		System.out.println(jobMeta.getFilename());
		
		
//		response.setContentType("text/html; charset=utf-8");
//		response.getWriter().write(transMeta.getXML());
	}
}
