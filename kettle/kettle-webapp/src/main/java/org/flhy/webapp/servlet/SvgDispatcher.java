package org.flhy.webapp.servlet;

import java.awt.image.BufferedImage;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.flhy.webapp.utils.StepImageManager;
import org.springframework.util.StringUtils;

public class SvgDispatcher extends HttpServlet {

	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String url = request.getServletPath();
		String imageFile = url.substring(1);
		
		int scale = 16;
		String scale_str = request.getParameter("scale");
		if(StringUtils.hasText(scale_str) && scale_str.matches("\\d+"))
			scale = Integer.parseInt(scale_str);
		
		ClassLoader cl = Thread.currentThread().getContextClassLoader();
		BufferedImage image = StepImageManager.getUniversalImage(cl, imageFile, scale);
		response.setContentType("image/png");
		ImageIO.write(image, "PNG", response.getOutputStream());
		response.getOutputStream().flush();
	}

}
