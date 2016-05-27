package org.flhy.webapp.controller;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.swing.JLabel;

import org.flhy.ext.PluginFactory;
import org.flhy.ext.trans.steps.FilterRows;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.SvgImageUrl;
import org.pentaho.di.core.Condition;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.plugins.JobEntryPluginType;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.StepPluginType;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.row.ValueMetaAndData;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.core.row.value.ValueMetaPluginType;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.job.entry.JobEntryCopy;
import org.pentaho.di.trans.steps.systemdata.SystemDataTypes;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value="/system")
public class SystemMainController {
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/steps")
	protected void steps(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		JSONArray jsonArray = new JSONArray();
		
		PluginRegistry registry = PluginRegistry.getInstance();
		final List<PluginInterface> baseSteps = registry.getPlugins(StepPluginType.class);
		final List<String> baseCategories = registry.getCategories(StepPluginType.class);

		int i=0;
		for (String baseCategory : baseCategories) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("id", "category" + i++);
			jsonObject.put("text", baseCategory);
			jsonObject.put("icon", "ui/images/folder_connection.png");
			jsonObject.put("cls", "nav-node");
			JSONArray children = new JSONArray();

			List<PluginInterface> sortedCat = new ArrayList<PluginInterface>();
			for (PluginInterface baseStep : baseSteps) {
				if (baseStep.getCategory().equalsIgnoreCase(baseCategory)) {
					sortedCat.add(baseStep);
				}
			}
			Collections.sort(sortedCat, new Comparator<PluginInterface>() {
				public int compare(PluginInterface p1, PluginInterface p2) {
					return p1.getName().compareTo(p2.getName());
				}
			});
			for (PluginInterface p : sortedCat) {
				String pluginName = p.getName();
				String pluginDescription = p.getDescription();
				
				JSONObject child = new JSONObject();
				child.put("id", p.getIds()[0]);
				child.put("text", PluginFactory.containBean(p.getIds()[0]) ? pluginName : "<font color='red'>" + pluginName + "</font>");
				child.put("icon", SvgImageUrl.getUrl(p.getIds()[0], SvgImageUrl.Size_Small));
				child.put("dragIcon", SvgImageUrl.getUrl(p.getIds()[0], SvgImageUrl.Size_Middle));
				child.put("cls", "nav");
				child.put("qtip", pluginDescription);
				child.put("leaf", true);
				children.add(child);
				// if ( !filterMatch( pluginName ) && !filterMatch(
				// 	pluginDescription ) ) {
				// continue;
				// }
			}
			jsonObject.put("children", children);
			jsonArray.add(jsonObject);
		}
		
		response.setContentType("text/javascript; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/jobentrys")
	protected void jobentrys(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		JSONArray jsonArray = new JSONArray();
		
		PluginRegistry registry = PluginRegistry.getInstance();
		final List<PluginInterface> baseJobEntries = registry.getPlugins(JobEntryPluginType.class);
		final List<String> baseCategories = registry.getCategories(JobEntryPluginType.class);

		int i=0;
		for (String baseCategory : baseCategories) {
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("id", "category" + i++);
			jsonObject.put("text", baseCategory);
			jsonObject.put("icon", "ui/images/folder_connection.png");
			jsonObject.put("cls", "nav-node");
			JSONArray children = new JSONArray();

			List<PluginInterface> sortedCat = new ArrayList<PluginInterface>();
			if ( baseCategory.equalsIgnoreCase( JobEntryPluginType.GENERAL_CATEGORY ) ) {
				JobEntryCopy startEntry = JobMeta.createStartEntry();
				JSONObject child = new JSONObject();
				child.put("id", startEntry.getEntry().getPluginId() + "0");
				child.put("text", startEntry.getName());
				child.put("icon", SvgImageUrl.getUrl(startEntry.getEntry().getPluginId() + "0", SvgImageUrl.Size_Small));
				child.put("dragIcon", SvgImageUrl.getUrl(startEntry.getEntry().getPluginId() + "0", SvgImageUrl.Size_Middle));
				child.put("cls", "nav");
				child.put("qtip", startEntry.getDescription());
				child.put("leaf", true);
				children.add(child);
				
				JobEntryCopy dummyEntry = JobMeta.createDummyEntry();
				child = new JSONObject();
				child.put("id", dummyEntry.getEntry().getPluginId() + "1");
				child.put("text", dummyEntry.getName());
				child.put("icon", SvgImageUrl.getUrl(dummyEntry.getEntry().getPluginId() + "1", SvgImageUrl.Size_Small));
				child.put("dragIcon", SvgImageUrl.getUrl(dummyEntry.getEntry().getPluginId() + "1", SvgImageUrl.Size_Middle));
				child.put("cls", "nav");
				child.put("qtip", dummyEntry.getDescription());
				child.put("leaf", true);
				children.add(child);
		    }
			for (PluginInterface baseJobEntry : baseJobEntries) {
				if ( baseJobEntry.getIds()[ 0 ].equals( "SPECIAL" ) ) 
					continue;
				
				if (baseJobEntry.getCategory().equalsIgnoreCase(baseCategory)) {
					sortedCat.add(baseJobEntry);
				}
			}
			Collections.sort(sortedCat, new Comparator<PluginInterface>() {
				public int compare(PluginInterface p1, PluginInterface p2) {
					return p1.getName().compareTo(p2.getName());
				}
			});
			for (PluginInterface p : sortedCat) {
				String pluginName = p.getName();
				String pluginDescription = p.getDescription();
				
				JSONObject child = new JSONObject();
				child.put("id", p.getIds()[0]);
				child.put("text", PluginFactory.containBean(p.getIds()[0]) ? pluginName : "<font color='red'>" + pluginName + "</font>");
				child.put("icon", SvgImageUrl.getUrl(p.getIds()[0], SvgImageUrl.Size_Small));
				child.put("dragIcon", SvgImageUrl.getUrl(p.getIds()[0], SvgImageUrl.Size_Middle));
				child.put("cls", "nav");
				child.put("qtip", pluginDescription);
				child.put("leaf", true);
				children.add(child);
				// if ( !filterMatch( pluginName ) && !filterMatch(
				// 	pluginDescription ) ) {
				// continue;
				// }
			}
			jsonObject.put("children", children);
			jsonArray.add(jsonObject);
		}
		
		response.setContentType("text/javascript; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/systemDataTypes")
	protected void systemDataTypes(HttpServletRequest request, HttpServletResponse response) throws IOException {
		JSONArray jsonArray = new JSONArray();
		
		SystemDataTypes[] values = SystemDataTypes.values();
		for (SystemDataTypes value : values) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("code", value.getCode());
			jsonObject.put("descrp", value.getDescription());
			jsonArray.add(jsonObject);
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/valueMeta")
	protected void valueMeta(HttpServletRequest request, HttpServletResponse response) throws IOException {
		JSONArray jsonArray = new JSONArray();
		
		PluginRegistry pluginRegistry = PluginRegistry.getInstance();
		List<PluginInterface> plugins = pluginRegistry.getPlugins(ValueMetaPluginType.class);
		for (PluginInterface plugin : plugins) {
			int id = Integer.valueOf(plugin.getIds()[0]);
			if (id > 0 && id != ValueMetaInterface.TYPE_SERIALIZABLE) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("id", id);
				jsonObject.put("name", plugin.getName());
				jsonArray.add(jsonObject);
			}
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/valueFormat")
	protected void valueFormat(HttpServletRequest request, HttpServletResponse response) throws IOException {
		JSONArray jsonArray = new JSONArray();
		
		String valueType = request.getParameter("valueType");
		int type = ValueMeta.getType(valueType);

		switch (type) {
		case ValueMetaInterface.TYPE_INTEGER:
			String[] fmt = Const.getNumberFormats();
			for (String f : fmt) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", f);
				jsonArray.add(jsonObject);
			}
			break;
		case ValueMetaInterface.TYPE_NUMBER:
			fmt = Const.getNumberFormats();
			for (String f : fmt) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", f);
				jsonArray.add(jsonObject);
			}
			break;
		case ValueMetaInterface.TYPE_DATE:

			fmt = Const.getDateFormats();
			for (String f : fmt) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", f);
				jsonArray.add(jsonObject);
			}
			break;
		case ValueMetaInterface.TYPE_BIGNUMBER:
			break;
		default:
			break;
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/valueString")
	protected void inputOutputFields(HttpServletRequest request, HttpServletResponse response, @RequestParam String valueMeta) throws Exception {
		JSONObject jsonObject = JSONObject.fromObject(valueMeta);
		
		FilterRows filterRows = (FilterRows) PluginFactory.getBean("FilterRows");
		ValueMetaAndData valueMetaAndData = filterRows.decodeValueMetaAndData(jsonObject);
		String value = valueMetaAndData.toString();
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(value);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/func")
	protected void func(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		JSONArray jsonArray = new JSONArray();
		for(int i=0; i<Condition.functions.length; i++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", Condition.functions[i]);
			jsonArray.add(jsonObject);
		}
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(jsonArray.toString());
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.GET, value="/text2image")
	protected void text2image(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String text = request.getParameter("text");
		
		Font f = new Font("Arial", Font.PLAIN, 12);
		JLabel j = new JLabel();
		FontMetrics fm = j.getFontMetrics(f);
		 
		int width = fm.stringWidth(text), height = 12;
		BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB); 
		Graphics g = image.getGraphics(); 
		g.fillRect(0, 0, width, height); 
		g.setFont(new Font("Arial",Font.PLAIN, 11)); 
		g.setColor(Color.BLACK);
		g.drawString(text, 0, height - (height - 8) / 2); 
		g.dispose();
		response.setContentType("text/image");
		ImageIO.write(image, "JPEG", response.getOutputStream()); 
	}

	@ResponseBody
	@RequestMapping(method=RequestMethod.GET, value="/text2image/width")
	protected void text2image_width(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String text = request.getParameter("text");
		
		Font f = new Font("Arial", Font.PLAIN, 12);
		JLabel j = new JLabel();
		FontMetrics fm = j.getFontMetrics(f);
		
		response.getWriter().write(String.valueOf(fm.stringWidth(text)));
		
	}
}
