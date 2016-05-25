package org.flhy.ext.utils;

import java.awt.image.BufferedImage;

public class SvgImageUrl {

	public static final String url_format = "%s/%s.svg";
	
	public static final String Size_Small = "small";
	public static final String Size_Middle = "middle";
	
	
	public static String getUrl(String stepId, String size) {
		return String.format(url_format, size, stepId);
	}
	
	public static String getSize(String url) {
		if(url.startsWith("/"))
			url = url.substring(1);
		
		return url.substring(0, url.indexOf("/"));
	}
	
	public static String getStepId(String url) {
		if(url.startsWith("/"))
			url = url.substring(1);
		
		return url.substring(url.indexOf("/") + 1, url.indexOf("."));
	}
	
	public static int getHeight(String size) {
		if(Size_Small.equals(size)) return 16;
		return 40;
	}
	
	public static int getWidth(String size) {
		if(Size_Small.equals(size)) return 16;
		return 40;
	}
	
	public static BufferedImage createImage(String size) {
		if(Size_Small.equals(size)) {
			return new BufferedImage(16, 16, BufferedImage.TYPE_INT_ARGB);
		};
		return new BufferedImage(40, 40, BufferedImage.TYPE_INT_ARGB);
	}
	
	public static void main(String[] args) {
		String url = getUrl("Dummy", SvgImageUrl.Size_Small);
		System.out.println(url);
		System.out.println("Size = " + getSize(url));
		System.out.println("StepId = " + getStepId(url));
	}
}
