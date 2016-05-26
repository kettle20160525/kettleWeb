package org.flhy.webapp.servlet;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.flhy.ext.PluginFactory;
import org.springframework.core.io.ClassPathResource;

public class JavaScriptServlet extends HttpServlet {

	protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String url = request.getServletPath();
		String pluginId = url.substring(1, url.indexOf("."));
		
		try {
			if(PluginFactory.containBean(pluginId)) {
				Object plugin = PluginFactory.getBean(pluginId);
				ClassPathResource cpr = new ClassPathResource(pluginId + ".js", plugin.getClass());
				InputStream input = null;
				try {
					input = cpr.getInputStream();
					response.setContentType("text/javascript;charset=utf-8");
					IOUtils.copy(input, response.getOutputStream());
				} finally {
					IOUtils.closeQuietly(input);
				}
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
}
