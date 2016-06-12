package org.flhy.ext.utils;

import java.awt.image.BufferedImage;

import org.pentaho.di.core.plugins.PluginInterface;

public class SvgImageUrl {

	public static final String Size_Small = "small";
	public static final String Size_Middle = "middle";
	
	public static String getSmallUrl(PluginInterface plugin) {
		return url(plugin.getImageFile(), Size_Small);
	}
	
	public static String getSmallUrl(String imageFile) {
		return url(imageFile, Size_Small);
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
		return imageFile + "?scale=" + scale; 
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
}
