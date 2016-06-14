package org.flhy.webapp.servlet;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.flhy.ext.utils.SvgImageUrl;
import org.pentaho.di.laf.BasePropertyHandler;

public class CssServlet extends HttpServlet {
	
	static HashMap<String, String> images = new HashMap<String, String>();
	
	static {
		images.put("imageShowHistory", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ShowHistory_image" )));
		images.put("imageShowLog", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ShowLog_image" )));
		images.put("imageShowGrid", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ShowGrid_image" )));
		images.put("imageShowPerf", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ShowPerf_image" )));
		images.put("imageGantt", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Gantt_image" )));
		images.put("imagePreview", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Preview_image" )));
		
		images.put("transGraphIcon", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "SpoonIcon_image" )));
		images.put("jobGraphIcon", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ChefIcon_image" )));
		
		images.put("imageSlave", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Slave_image" )));
	}

	protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		StringBuffer sb = new StringBuffer();
		for(Map.Entry<String, String> entry : images.entrySet()) {
			String url = request.getContextPath()+ "/" + entry.getValue();
			sb.append("." + entry.getKey() + " { background-image: url(" + url + ") !important;}\n\n");
		}
		
		response.setContentType("text/css");
		response.getWriter().write(sb.toString());
	}
	
}
