package org.flhy.ext.utils;

import java.awt.image.BufferedImage;

import org.pentaho.di.core.plugins.PluginInterface;

public class SvgImageUrl {

	public static final String Size_Small = "small";
	public static final String Size_Middle = "middle";
	
	public static String getSmallUrl(PluginInterface plugin) {
		return url(plugin.getImageFile(), Size_Middle);
	}
	
	public static String getSmallUrl(String imageFile) {
		return url(imageFile, Size_Middle);
	}
	
	public static String getMiddleUrl(String imageFile) {
		return url(imageFile, Size_Middle);
	}
	
	public static String getMiddleUrl(PluginInterface plugin) {
		return url(plugin.getImageFile(), Size_Middle);
	}
	
	public static String url(PluginInterface plugin, String scale) {
		return url(plugin.getImageFile(), scale);
	}
	
	public static String url(String imageFile, String scale) {
		return imageFile + "?scale=" + SvgImageUrl.Size_Middle; 
	}
	
//	public static String getSize(String url) {
//		if(url.startsWith("/"))
//			url = url.substring(1);
//		
//		return url.substring(0, url.indexOf("/"));
//	}
//	
//	public static String getPluginId(String url) {
//		if(url.startsWith("/"))
//			url = url.substring(1);
//		
//		return url.substring(url.indexOf("/") + 1, url.indexOf("."));
//	}
	
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
	
//	public static void main(String[] args) {
//		String url = getUrl("Dummy", SvgImageUrl.Size_Small);
//		System.out.println(url);
//		System.out.println("Size = " + getSize(url));
//		System.out.println("StepId = " + getPluginId(url));
//	}
}
