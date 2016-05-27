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
import org.pentaho.di.core.plugins.JobEntryPluginType;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.StepPluginType;
import org.pentaho.di.laf.BasePropertyHandler;

public class SvgDispatcher extends HttpServlet {

	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String url = request.getServletPath();
		String pluginId = SvgImageUrl.getPluginId(url);
		
		try {
			PluginRegistry registry = PluginRegistry.getInstance();
			PluginInterface plugin = registry.getPlugin( StepPluginType.class, pluginId);
			if(plugin != null) {
				ClassLoader classLoader = registry.getClassLoader(plugin);
				BufferedImage image = StepImageManager.getUniversalImage(classLoader, plugin.getImageFile(), SvgImageUrl.getSize(url));
				ImageIO.write(image, "PNG", response.getOutputStream());
			} else {
				plugin = registry.getPlugin(JobEntryPluginType.class, pluginId);
				if(plugin != null) {
					ClassLoader classLoader = registry.getClassLoader(plugin);
//					if(PluginFactory.containBean(pluginId)) {
						BufferedImage image = StepImageManager.getUniversalImage(classLoader, plugin.getImageFile(), 
								SvgImageUrl.getSize(url));
						ImageIO.write(image, "PNG", response.getOutputStream());
						
//					} else {
//						System.out.println("cannot found plugin: " + pluginId);
//					}
				} else {
					if(pluginId.startsWith("SPECIAL")) {
						plugin = registry.getPlugin(JobEntryPluginType.class, "SPECIAL");
						ClassLoader classLoader = registry.getClassLoader(plugin);
						if(pluginId.endsWith("0")) {
							BufferedImage image = StepImageManager.getUniversalImage(classLoader, BasePropertyHandler.getProperty( "STR_image" ), 
									SvgImageUrl.getSize(url));
							ImageIO.write(image, "PNG", response.getOutputStream());
						} else if(pluginId.endsWith("1")) {
							BufferedImage image = StepImageManager.getUniversalImage(classLoader, BasePropertyHandler.getProperty( "DUM_image" ), 
									SvgImageUrl.getSize(url));
							ImageIO.write(image, "PNG", response.getOutputStream());
						}
					}
				}
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
	}

}
