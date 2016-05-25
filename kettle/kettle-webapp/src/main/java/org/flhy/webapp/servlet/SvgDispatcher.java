package org.flhy.webapp.servlet;

import java.awt.image.BufferedImage;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.flhy.ext.utils.SvgImageUrl;
import org.flhy.webapp.utils.StepImageManager;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.StepPluginType;

public class SvgDispatcher extends HttpServlet {

	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String url = request.getServletPath();
		String stepId = SvgImageUrl.getStepId(url);
		
		try {
			PluginRegistry registry = PluginRegistry.getInstance();
			PluginInterface plugin = registry.getPlugin( StepPluginType.class, stepId);
			ClassLoader classLoader = registry.getClassLoader(plugin);
			BufferedImage image = StepImageManager.getUniversalImage(classLoader, plugin.getImageFile(), SvgImageUrl.getSize(url));
			ImageIO.write(image, "PNG", response.getOutputStream());
		} catch(Exception e) {
			e.printStackTrace();
		}
	}

}
