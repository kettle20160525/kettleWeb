package org.flhy.webapp.utils;

import java.io.IOException;
import javax.servlet.http.HttpServletResponse;

import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;

public class JsonUtils {

	public static void success(String message) throws IOException {
		success("系统提示", message);
	}
	
	public static void success(String title, String message) throws IOException {
		response(true, title, message);
	}
	
	public static void fail(String message) throws IOException {
		fail("系统提示", message);
	}
	
	public static void fail(String title, String message) throws IOException {
		response(false, title, message);
	}
	
	public static void response(boolean success, String title, String message) throws IOException {
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("success", success);
		jsonObject.put("title", title);
		jsonObject.put("message", message);
		
		response(jsonObject);
	}
	
	public static void response(JSONObject jsonObject) throws IOException {
		HttpServletResponse response = tl.get();
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonObject.toString());
	}
	
	public static void response(JSONArray jsonArray) throws IOException {
		HttpServletResponse response = tl.get();
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	public static void responseXml(String xml) throws IOException {
		HttpServletResponse response = tl.get();
		response.setContentType("text/xml; charset=utf-8");
		response.getWriter().write(xml);
	}
	
	private static ThreadLocal<HttpServletResponse> tl = new ThreadLocal<HttpServletResponse>();
	
	public static void putResponse(HttpServletResponse response) {
		tl.set(response);
	}
	
}
