// rd_CompSetter.jsx
// Copyright (c) 2006-2015 redefinery (Jeffrey R. Almasol). All rights reserved.
// check it: www.redefinery.com
// 
// Name: rd_CompSetter
// Version: 3.3
// 
// Description:
// This script displays a palette with controls for changing the 
// size, pixel aspect ratio, duration, frame rate, preserve options,
// motion blur, and renderer of the selected compositions, and all nested 
// compositions (pre-comp layers) in it. When you lengthen the 
// composition's duration, all layers whose out points are at or 
// beyond the end of the composition are also lengthened to the new 
// duration, including layers within pre-comps. You also have the option
// to change all layers to 2D or 3D.
// 
// Note: If the Project panel is focused, it'll process all selected
// compositions in that panel. If another panel is focused, it'll process
// the active composition (last selected in a Composition or Timeline
// panel).
// 
// Note: This version of the script requires After Effects CS5 
// or later. It can be used as a dockable panel by placing the 
// script in a ScriptUI Panels subfolder of the Scripts folder, 
// and then choosing this script from the Window menu.
// 
// Originally requested by Stu Maschwitz, Tim Thiessen, and Scott Just.
// Updates requested by Matthew Crnich, Matthew Law, Zach Lovatt, and
// Steve Kellener.
// 
// Legal stuff:
// This script is provided "as is," without warranty of any kind, expressed
// or implied. In no event shall the author be held liable for any damages 
// arising in any way from the use of this script.
// 
// In other words, I'm just trying to share knowledge with and help out my
// fellow AE script heads, so don't blame me if my code doesn't rate. :-)




// rd_CompSetter()
// 
// Description:
// This function contains the main logic for this script.
// 
// Parameters:
// thisObj - "this" object.
// 
// Returns:
// Nothing.
//
(function rd_CompSetter(thisObj)
{
	// Globals
	/*global alert, app, AVLayer, CompItem, Panel, ShapeLayer, TextLayer, Window*/
	
	var rd_CompSetterData = [];	// Store globals in an object
	var rdcsePal;	
	
	rd_CompSetterData.scriptName = "rd: Composition Setter";
	rd_CompSetterData.scriptTitle = rd_CompSetterData.scriptName + " v3.3";
	
	rd_CompSetterData.strDuration = {en: "Duration:"};
	rd_CompSetterData.strDurationAsFrames = {en: "frames"};
	rd_CompSetterData.strDurationAsSecs = {en: "seconds"};
	rd_CompSetterData.strFPS = {en: "Frame Rate:"};
	rd_CompSetterData.strFPSCaption = {en: "fps"};
	rd_CompSetterData.strWidth = {en: "Width:"};
	rd_CompSetterData.strHeight = {en: "Height:"};
	rd_CompSetterData.strSizeCaption = {en: "px"};
	rd_CompSetterData.strPAR = {en: "PAR:"};
	rd_CompSetterData.strRenderer = {en: "Renderer:"};
	rd_CompSetterData.strRendererEnums = ["ADBE Advanced 3d", "ADBE Picasso"];
	rd_CompSetterData.strRendererOptions = {en: '["Don\'t Change", "Classic 3D", "Ray-traced 3D"]'};
	rd_CompSetterData.strPreserveFrameRate = {en: "Preserve frame rate when nested or in render queue:"};
	rd_CompSetterData.strPreserveResolution = {en: "Preserve resolution when nested:"};
	rd_CompSetterData.strPreserveOptions = {en: '["Don\'t Change", "Preserve", "Don\'t Preserve"]'};
	rd_CompSetterData.strShutterAngle = {en: "Shutter Angle:"};
	rd_CompSetterData.strShutterPhase = {en: "Shutter Phase:"};
	rd_CompSetterData.strSamplesPerFrame = {en: "Samples Per Frame:"};
	rd_CompSetterData.strAdaptiveSampleLimit = {en: "Adaptive Sample Limit:"};
	rd_CompSetterData.strLayerSwitchesOpts = {en: "Layer Switches and Options (modify all layers)"};
	rd_CompSetterData.strLayerDim = {en: "Dimensionality:"};
	rd_CompSetterData.strLayerDimOptions = {en: '["Don\'t Change", "Switch to 3D, including Per-char 3D Text", "Switch to 3D", "Switch to 2D"]'};
	rd_CompSetterData.strRecursive = {en: "Update nested compositions"};
	rd_CompSetterData.strApply = {"en": "Apply"};
	rd_CompSetterData.strHelp = {"en": "?"};
	rd_CompSetterData.strErrNoProj = {en: "Cannot perform operation. Please create or open a project, open a single composition, and try again."};
	rd_CompSetterData.strErrNoCompSel = {en: "Cannot perform operation. Please select or open a single composition in the Project window, and try again."};
	rd_CompSetterData.strMinAE100 = {en: "This script requires Adobe After Effects CS5 or later."};
	rd_CompSetterData.strHelpText = 
	{
		"en": "Copyright (c) 2006-2015 redefinery (Jeffrey R. Almasol). \n" +
		"All rights reserved.\n" +
		"\n" +
		"This script displays a palette with controls for changing the size, pixel aspect ratio, duration, frame rate, preserve options, motion blur, and renderer of the selected compositions, and all nested compositions (pre-comp layers) in it. When you lengthen the composition's duration, all layers whose out points are at or beyond the end of the composition are also lengthened to the new duration, including layers within pre-comps. You also have the option to change all layers to 2D or 3D.\n" +
		"\n" +
		"Note: If the Project panel is focused, it'll process all selected compositions in that panel. If another panel is focused, it'll process the active composition (last selected in a Composition or Timeline panel).\n" +
		"\n" +
		"Note: This version of the script requires After Effects CS5 or later. It can be used as a dockable panel by placing the script in a ScriptUI Panels subfolder of the Scripts folder, and then choosing this script from the Window menu.\n" +
		"\n" +
		"Originally requested by Stu Maschwitz, Tim Thiessen, and Scott Just.\n" +
		"Updates requested by Matthew Crnich, Matthew Law, Zach Lovatt, and Steve Kellener.\n"
	};
	
	
	
	
	// rd_CompSetter_localize()
	// 
	// Description:
	// This function localizes the given string variable based on the current locale.
	// 
	// Parameters:
	//   strVar - The string variable's name.
	// 
	// Returns:
	// String.
	//
	function rd_CompSetter_localize(strVar)
	{
		return strVar.en;
	}
	
	
	
	
	// rd_CompSetter_buildUI()
	// 
	// Description:
	// This function builds the user interface.
	// 
	// Parameters:
	// thisObj - Panel object (if script is launched from Window menu); null otherwise.
	// 
	// Returns:
	// Window or Panel object representing the built user interface.
	//
	function rd_CompSetter_buildUI(thisObj)
	{
		var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", rd_CompSetterData.scriptName, undefined, {resizeable:true});
		var res;
		
		if (pal !== null)
		{
			/*jshint multistr: true */
			res = 
			"group { \
				orientation:'column', alignment:['fill','top'], \
				header: Group { \
					alignment:['fill','top'], \
					title: StaticText { text:'" + rd_CompSetterData.scriptName + "', alignment:['fill','center'] }, \
					help: Button { text:'" + rd_CompSetter_localize(rd_CompSetterData.strHelp) +"', maximumSize:[30,20], alignment:['right','center'] }, \
				}, \
				width: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: Checkbox { text:'" + rd_CompSetter_localize(rd_CompSetterData.strWidth) + "', value:false }, \
					fld: EditText { text:'1920', characters:7, preferredSize:[-1,20] }, \
					uom: StaticText { text:'" + rd_CompSetter_localize(rd_CompSetterData.strSizeCaption) + "' }, \
				}, \
				height: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: Checkbox { text:'" + rd_CompSetter_localize(rd_CompSetterData.strHeight) + "', value:false }, \
					fld: EditText { text:'1080', characters:7, preferredSize:[-1,20] }, \
					uom: StaticText { text:'" + rd_CompSetter_localize(rd_CompSetterData.strSizeCaption) + "' }, \
				}, \
				par: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: Checkbox { text:'" + rd_CompSetter_localize(rd_CompSetterData.strPAR) + "', value:false }, \
					fld: EditText { text:'1.0', characters:7, preferredSize:[-1,20] }, \
				}, \
				fps: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: Checkbox { text:'" + rd_CompSetter_localize(rd_CompSetterData.strFPS) + "', value:false }, \
					fld: EditText { text:'29.97', characters:7, preferredSize:[-1,20] }, \
					uom: StaticText { text:'" + rd_CompSetter_localize(rd_CompSetterData.strFPSCaption) + "' }, \
				}, \
				dur: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: Checkbox { text:'" + rd_CompSetter_localize(rd_CompSetterData.strDuration) + "', value:false }, \
					fld: EditText { text:'300', characters:7, preferredSize:[-1,20] }, \
					durFrames: RadioButton { text:'" + rd_CompSetter_localize(rd_CompSetterData.strDurationAsFrames) + "', value:true }, \
					durSecs: RadioButton { text:'" + rd_CompSetter_localize(rd_CompSetterData.strDurationAsSecs) + "' }, \
				}, \
				sep: Group { \
					orientation:'row', alignment:['fill','top'], \
					rule: Panel { \
						height: 2, alignment:['fill','center'], \
					}, \
				}, \
				renderer: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					lbl: StaticText { text:'" + rd_CompSetter_localize(rd_CompSetterData.strRenderer) + "' }, \
					lst: DropDownList { properties:{items:" + rd_CompSetter_localize(rd_CompSetterData.strRendererOptions) + " }, alignment:['left','center'], preferredSize:[-1,20] }, \
				}, \
				preserveFR: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					lbl: StaticText { text:'" + rd_CompSetter_localize(rd_CompSetterData.strPreserveFrameRate) + "' }, \
					lst: DropDownList { properties:{items:" + rd_CompSetter_localize(rd_CompSetterData.strPreserveOptions) + " }, alignment:['fill','center'], preferredSize:[-1,20] }, \
				}, \
				preserveRes: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: StaticText { text:'" + rd_CompSetter_localize(rd_CompSetterData.strPreserveResolution) + "' }, \
					lst: DropDownList { properties:{items:" + rd_CompSetter_localize(rd_CompSetterData.strPreserveOptions) + " }, alignment:['fill','center'], preferredSize:[-1,20] }, \
				}, \
				sa: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: Checkbox { text:'" + rd_CompSetter_localize(rd_CompSetterData.strShutterAngle) + "', value:false }, \
					fld: EditText { text:'180', characters:7, preferredSize:[-1,20] }, \
				}, \
				sp: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: Checkbox { text:'" + rd_CompSetter_localize(rd_CompSetterData.strShutterPhase) + "', value:false }, \
					fld: EditText { text:'-90', characters:7, preferredSize:[-1,20] }, \
				}, \
				spf: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: Checkbox { text:'" + rd_CompSetter_localize(rd_CompSetterData.strSamplesPerFrame) + "', value:false }, \
					fld: EditText { text:'16', characters:7, preferredSize:[-1,20] }, \
				}, \
				asl: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: Checkbox { text:'" + rd_CompSetter_localize(rd_CompSetterData.strAdaptiveSampleLimit) + "', value:false }, \
					fld: EditText { text:'128', characters:7, preferredSize:[-1,20] }, \
				}, \
				sep2: Group { \
					orientation:'row', alignment:['fill','top'], \
					rule: Panel { \
						height: 2, alignment:['fill','center'], \
					}, \
				}, \
				layerSwitchesOpts: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					txt: StaticText { text:'" + rd_CompSetter_localize(rd_CompSetterData.strLayerSwitchesOpts) + "' }, \
				}, \
				layerDim: Group { \
					alignment:['fill','top'], alignChildren:['left','center'], \
					opt: StaticText { text:'" + rd_CompSetter_localize(rd_CompSetterData.strLayerDim) + "' }, \
					lst: DropDownList { properties:{items:" + rd_CompSetter_localize(rd_CompSetterData.strLayerDimOptions) + " }, alignment:['fill','center'], preferredSize:[-1,20] }, \
				}, \
				sep3: Group { \
					orientation:'row', alignment:['fill','top'], \
					rule: Panel { \
						height: 2, alignment:['fill','center'], \
					}, \
				}, \
				recursive: Checkbox { text:'"  + rd_CompSetter_localize(rd_CompSetterData.strRecursive) + "', value:true, alignment:['fill','center'] }, \
				cmds: Group { \
					alignment:['right','top'], \
					applyBtn: Button { text:'" + rd_CompSetter_localize(rd_CompSetterData.strApply) + "', preferredSize:[-1,20] }, \
				}, \
			}";
			pal.grp = pal.add(res);
			
			pal.grp.width.opt.preferredSize.width = 
				pal.grp.height.opt.preferredSize.width = 
				pal.grp.par.opt.preferredSize.width = 
				pal.grp.dur.opt.preferredSize.width = pal.grp.fps.opt.preferredSize.width;
			pal.grp.sa.opt.preferredSize.width = 
				pal.grp.sp.opt.preferredSize.width = 
				pal.grp.spf.opt.preferredSize.width = pal.grp.asl.opt.preferredSize.width;
			
			pal.grp.renderer.lst.selection = pal.grp.preserveFR.lst.selection = pal.grp.preserveRes.lst.selection = pal.grp.layerDim.lst.selection = 0;
			
			pal.layout.layout(true);
			pal.grp.minimumSize = pal.grp.size;
			pal.layout.resize();
			pal.onResizing = pal.onResize = function () {this.layout.resize();};
			
			pal.grp.width.opt.onClick = pal.grp.height.opt.onClick = pal.grp.fps.opt.onClick = function ()
			{
				var state = this.value;
				this.parent.fld.enabled = this.parent.uom.enabled = state;
				if (state)
					this.parent.fld.active = true;
			};
			pal.grp.par.opt.onClick = pal.grp.sa.opt.onClick = pal.grp.sp.opt.onClick = pal.grp.spf.opt.onClick = pal.grp.asl.opt.onClick = function ()
			{
				var state = this.value;
				this.parent.fld.enabled = state;
				if (state)
					this.parent.fld.active = true;
			};
			pal.grp.dur.opt.onClick = function ()
			{
				var state = this.value;
				this.parent.fld.enabled = this.parent.durFrames.enabled = this.parent.durSecs.enabled = state;
				if (state)
					this.parent.fld.active = true;
			};
			
			pal.grp.width.fld.onChange = pal.grp.height.fld.onChange = function ()
			{
				var enteredValue = parseInt(this.text);
				
				if (isNaN(enteredValue) || (enteredValue < 4))
					this.text = "4";
				else if (enteredValue > 30000)
					this.text = "30000";
				else
					this.text = enteredValue.toString();
			};
			
			pal.grp.par.fld.onChange = function ()
			{
				var enteredValue = parseFloat(this.text);
				
				if (isNaN(enteredValue) || (enteredValue < 0.01))
					this.text = "1";
				else if (enteredValue > 99)
					this.text = "99";
				else
					this.text = enteredValue.toString();
			};
			
			pal.grp.fps.fld.onChange = function ()
			{
				var enteredValue = this.text;
				
				if (isNaN(enteredValue) || (enteredValue <= 1))
					this.text = "1";
				else if (enteredValue > 99)
					this.text = "99";
			};
			
			pal.grp.dur.fld.onChange = function ()
			{
				var enteredValue = this.text;
				
				if (isNaN(enteredValue) || (enteredValue <= 0))
					this.text = "1";
				else if (this.parent.durFrames.value)
					this.text = parseInt(this.text).toString();
			};
			
			pal.grp.dur.durFrames.onClick = function ()
			{
				// In frames mode, we need an integer number of frames
				this.parent.parent.fld.text = parseInt(this.parent.parent.fld.text).toString();
			};
			
			pal.grp.sa.fld.onChange = function ()
			{
				var enteredValue = this.text;
				
				if (isNaN(enteredValue) || (enteredValue < 0))
					this.text = "0";
				else if (enteredValue > 720)
					this.text = "720";
				else
					this.text = parseFloat(enteredValue).toString();
			};
			
			pal.grp.sp.fld.onChange = function ()
			{
				var enteredValue = this.text;
				
				if (isNaN(enteredValue) || (enteredValue < -360))
					this.text = "-360";
				else if (enteredValue > 360)
					this.text = "360";
				else
					this.text = parseFloat(enteredValue).toString();
			};
			
			pal.grp.spf.fld.onChange = function ()
			{
				var enteredValue = this.text;
				
				if (isNaN(enteredValue) || (enteredValue < 2))
					this.text = "2";
				else if (enteredValue > 64)
					this.text = "64";
				else
					this.text = parseFloat(enteredValue).toString();
			};
			
			pal.grp.asl.fld.onChange = function ()
			{
				var enteredValue = this.text;
				
				if (isNaN(enteredValue) || (enteredValue < 16))
					this.text = "16";
				else if (enteredValue > 256)
					this.text = "256";
				else
					this.text = parseFloat(enteredValue).toString();
			};
			
			pal.grp.header.help.onClick = function () {alert(rd_CompSetterData.scriptTitle + "\n" + rd_CompSetter_localize(rd_CompSetterData.strHelpText), rd_CompSetterData.scriptName);};
			pal.grp.cmds.applyBtn.onClick = rd_CompSetter_doCompSetter;
		}
		
		return pal;
	}
	
	
	
	
	function rd_CompSetter_compSetRecursively(comp, width, height, par, fps, dur, ren, fr, res, sa, sp, spf, asl, layerDim, recurse)
	{
		var layer;
		var oldCompDur = comp.duration;
		var i, oldOutPt, isLocked;
		
		// Change the comp's size
		if (width !== -1)
			comp.width = width;
		if (height !== -1)
			comp.height = height;
		
		// Change the comp's par
		if (par !== -1)
			comp.pixelAspect = par;
		
		// Change the comp's frame rate
		if (fps !== -1)
			comp.frameRate = fps;
		
		// Change the comp's duration
		if (dur !== -1)
			comp.duration = dur;
		
		// Change the comp's renderer
		if (ren !== -1)
			comp.renderer = rd_CompSetterData.strRendererEnums[ren];
		
		// Change the comp's preserve options
		if (fr !== -1)
			comp.preserveNestedFrameRate = (fr === 0);
		if (res !== -1)
			comp.preserveNestedResolution = (res === 0);
		
		// Change the comp's motion blur
		if (sa !== -1)
			comp.shutterAngle = sa;
		if (sp !== -1)
			comp.shutterPhase = sp;
		if (spf !== -1)
			comp.motionBlurSamplesPerFrame = spf;
		if (asl !== -1)
			comp.motionBlurAdaptiveSampleLimit = asl;
		
		for (i=1; i<=comp.numLayers; i++)
		{
			layer = comp.layer(i);
			
			// Change the comp's layer switches and options
			if (layerDim !== -1)
			{
				if ((layer instanceof AVLayer) || (layer instanceof TextLayer) || (layer instanceof ShapeLayer))
				{
					isLocked = layer.locked;	// remember lock status, to restore layer
					layer.locked = false;	// temporarily unlock layer so we can change switches
					
					layer.threeDLayer = (layerDim !== 2);	// not Switch to 2D
					if ((layer instanceof TextLayer) && layer.threeDLayer)
						layer.threeDPerChar = (layerDim === 0);	// Switch to 3D, including Per-char 3D
					
					layer.locked = isLocked;
				}
			}
			
			// Recurse into pre-comps
			if (recurse && (layer instanceof AVLayer) && (layer.source !== null) && (layer.source instanceof CompItem))
				rd_CompSetter_compSetRecursively(layer.source, width, height, par, fps, dur, ren, fr, res, sa, sp, spf, asl, layerDim, recurse);
			
			// Lengthen layer
			if (dur !== -1)
			{
				if (layer.stretch >= 0)
				{
					if (layer.outPoint >= oldCompDur)
						layer.outPoint = comp.duration;
				}
				else
				{
					if (layer.inPoint >= oldCompDur)
					{
						oldOutPt = layer.outPoint;
						layer.inPoint = comp.duration;
						layer.outPoint = oldOutPt;
					}
				}
			}
		}
	}
	
	
	
	
	// rd_CompSetter_doCompSetter()
	// 
	// Description:
	// This callback function change the selected composition 
	// based on the settings provided.
	// 
	// Parameters:
	// None.
	// 
	// Returns:
	// Nothing.
	//
	function rd_CompSetter_doCompSetter()
	{
		var proj, selComps, i, comp;
		var newWidth, newHeight, newPAR, newFPS, newDur, newRenderer, newPreserveFR, newPreserveRes, newSA, newSP, newSPF, newASL, newLayerDim;
		
		// Check that a project exists
		if (app.project === null)
		{
			alert(rd_CompSetter_localize(rd_CompSetterData.strErrNoProj), rd_CompSetterData.scriptName);
			return;
		}
		
		proj = app.project;
		
		// Do the work
		app.beginUndoGroup(rd_CompSetterData.scriptName);
		
		// Determine the comps to process (active comp or selected in Project panel)
		if ((app.project.activeItem !== null) && (app.project.activeItem instanceof CompItem))
		{
			// Project panel isn't focused, so use last active Composition/Timeline panel
			selComps = [app.project.activeItem];
		}
		else
		{
			// Project panel is focused, so use the selection in it
			selComps = proj.selection;
		}
		
		// Loop through all selected comps
		for (i=0; i<selComps.length; i++)
		{
			comp = selComps[i];
			if (!(comp instanceof CompItem))
				continue;
			
			newWidth = this.parent.parent.width.opt.value ? parseInt(this.parent.parent.width.fld.text) : -1;
			newHeight = this.parent.parent.height.opt.value ? parseInt(this.parent.parent.height.fld.text) : -1;
			newPAR = this.parent.parent.par.opt.value ? parseFloat(this.parent.parent.par.fld.text) : -1;
			
			newDur = this.parent.parent.dur.opt.value ? parseFloat(this.parent.parent.dur.fld.text) : -1;
			if (this.parent.parent.dur.durFrames.value && (newDur !== -1))
				newDur /= comp.frameRate;
			
			newFPS = this.parent.parent.fps.opt.value ? parseFloat(this.parent.parent.fps.fld.text) : -1;
			
			newRenderer = this.parent.parent.renderer.lst.selection.index - 1;
			
			newPreserveFR = this.parent.parent.preserveFR.lst.selection.index - 1;
			newPreserveRes = this.parent.parent.preserveRes.lst.selection.index - 1;
			
			newSA = this.parent.parent.sa.opt.value ? parseFloat(this.parent.parent.sa.fld.text) : -1;
			newSP = this.parent.parent.sp.opt.value ? parseFloat(this.parent.parent.sp.fld.text) : -1;
			newSPF = this.parent.parent.spf.opt.value ? parseFloat(this.parent.parent.spf.fld.text) : -1;
			newASL = this.parent.parent.asl.opt.value ? parseFloat(this.parent.parent.asl.fld.text) : -1;
			
			newLayerDim = this.parent.parent.layerDim.lst.selection.index - 1;
			
			rd_CompSetter_compSetRecursively(comp, newWidth, newHeight, newPAR, newFPS, newDur, newRenderer, newPreserveFR, newPreserveRes, newSA, newSP, newSPF, newASL, newLayerDim, this.parent.parent.recursive.value);
		}
		
		app.endUndoGroup();
	}
	
	
	
	
	// main code:
	//
	
	// Prerequisites check
	if (parseFloat(app.version) < 10.0)
		alert(rd_CompSetter_localize(rd_CompSetterData.strMinAE100), rd_CompSetterData.scriptName);
	else
	{
		// Build and show the console's floating palette
		rdcsePal = rd_CompSetter_buildUI(thisObj);
		if (rdcsePal !== null)
		{
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_widthOpt"))
				rdcsePal.grp.width.opt.value = (app.settings.getSetting("redefinery", "rd_CompSetter_widthOpt") === "false") ? false : true;
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_width"))
				rdcsePal.grp.width.fld.text = parseInt(app.settings.getSetting("redefinery", "rd_CompSetter_width")).toString();
			rdcsePal.grp.width.fld.enabled = rdcsePal.grp.width.opt.value;
			
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_heightOpt"))
				rdcsePal.grp.height.opt.value = (app.settings.getSetting("redefinery", "rd_CompSetter_heightOpt") === "false") ? false : true;
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_height"))
				rdcsePal.grp.height.fld.text = parseInt(app.settings.getSetting("redefinery", "rd_CompSetter_height")).toString();
			rdcsePal.grp.height.fld.enabled = rdcsePal.grp.height.opt.value;
			
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_parOpt"))
				rdcsePal.grp.par.opt.value = (app.settings.getSetting("redefinery", "rd_CompSetter_parOpt") === "false") ? false : true;
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_par"))
				rdcsePal.grp.par.fld.text = parseFloat(app.settings.getSetting("redefinery", "rd_CompSetter_par")).toString();
			rdcsePal.grp.par.fld.enabled = rdcsePal.grp.par.opt.value;
			
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_fpsOpt"))
				rdcsePal.grp.fps.opt.value = (app.settings.getSetting("redefinery", "rd_CompSetter_fpsOpt") === "false") ? false : true;
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_fps"))
				rdcsePal.grp.fps.fld.text = parseFloat(app.settings.getSetting("redefinery", "rd_CompSetter_fps")).toString();
			rdcsePal.grp.fps.fld.enabled = rdcsePal.grp.fps.opt.value;
			
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_durOpt"))
				rdcsePal.grp.dur.opt.value = (app.settings.getSetting("redefinery", "rd_CompSetter_durOpt") === "false") ? false : true;
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_dur"))
				rdcsePal.grp.dur.fld.text = parseFloat(app.settings.getSetting("redefinery", "rd_CompSetter_dur")).toString();
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_durFrames"))
				rdcsePal.grp.dur.durFrames.value = (app.settings.getSetting("redefinery", "rd_CompSetter_durFrames") === "false") ? false : true;
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_durSecs"))
				rdcsePal.grp.dur.durSecs.value = (app.settings.getSetting("redefinery", "rd_CompSetter_durSecs") === "false") ? false : true;
			rdcsePal.grp.dur.fld.enabled = rdcsePal.grp.dur.durFrames.enabled = rdcsePal.grp.dur.durSecs.enabled = rdcsePal.grp.dur.opt.value;
			
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_renderer"))
				rdcsePal.grp.renderer.lst.selection = parseInt(app.settings.getSetting("redefinery", "rd_CompSetter_renderer"), 10);
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_preserveFR"))
				rdcsePal.grp.preserveFR.lst.selection = parseInt(app.settings.getSetting("redefinery", "rd_CompSetter_preserveFR"), 10);
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_preserveRes"))
				rdcsePal.grp.preserveRes.lst.selection = parseInt(app.settings.getSetting("redefinery", "rd_CompSetter_preserveRes"), 10);
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_saOpt"))
				rdcsePal.grp.sa.opt.value = (app.settings.getSetting("redefinery", "rd_CompSetter_saOpt") === "false") ? false : true;
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_sa"))
				rdcsePal.grp.sa.fld.text = parseFloat(app.settings.getSetting("redefinery", "rd_CompSetter_sa")).toString();
			rdcsePal.grp.sa.fld.enabled = rdcsePal.grp.sa.opt.value;
			
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_spOpt"))
				rdcsePal.grp.sp.opt.value = (app.settings.getSetting("redefinery", "rd_CompSetter_spOpt") === "false") ? false : true;
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_sp"))
				rdcsePal.grp.sp.fld.text = parseFloat(app.settings.getSetting("redefinery", "rd_CompSetter_sp")).toString();
			rdcsePal.grp.sp.fld.enabled = rdcsePal.grp.sp.opt.value;
			
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_spfOpt"))
				rdcsePal.grp.spf.opt.value = (app.settings.getSetting("redefinery", "rd_CompSetter_spfOpt") === "false") ? false : true;
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_spf"))
				rdcsePal.grp.spf.fld.text = parseFloat(app.settings.getSetting("redefinery", "rd_CompSetter_spf")).toString();
			rdcsePal.grp.spf.fld.enabled = rdcsePal.grp.spf.opt.value;
			
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_aslOpt"))
				rdcsePal.grp.asl.opt.value = (app.settings.getSetting("redefinery", "rd_CompSetter_aslOpt") === "false") ? false : true;
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_asl"))
				rdcsePal.grp.asl.fld.text = parseFloat(app.settings.getSetting("redefinery", "rd_CompSetter_asl")).toString();
			rdcsePal.grp.asl.fld.enabled = rdcsePal.grp.asl.opt.value;
			
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_layerDim"))
				rdcsePal.grp.layerDim.lst.selection = parseInt(app.settings.getSetting("redefinery", "rd_CompSetter_layerDim"), 10);
			
			if (app.settings.haveSetting("redefinery", "rd_CompSetter_recursive"))
				rdcsePal.grp.recursive.value = (app.settings.getSetting("redefinery", "rd_CompSetter_recursive") === "false") ? false : true;
			
			// Save current UI settings upon closing the palette
			rdcsePal.onClose = function()
			{
				app.settings.saveSetting("redefinery", "rd_CompSetter_widthOpt", this.grp.width.opt.value);
				app.settings.saveSetting("redefinery", "rd_CompSetter_width", this.grp.width.fld.text);
				app.settings.saveSetting("redefinery", "rd_CompSetter_heightOpt", this.grp.height.opt.value);
				app.settings.saveSetting("redefinery", "rd_CompSetter_height", this.grp.height.fld.text);
				app.settings.saveSetting("redefinery", "rd_CompSetter_parOpt", this.grp.par.opt.value);
				app.settings.saveSetting("redefinery", "rd_CompSetter_par", this.grp.par.fld.text);
				app.settings.saveSetting("redefinery", "rd_CompSetter_fpsOpt", this.grp.fps.opt.value);
				app.settings.saveSetting("redefinery", "rd_CompSetter_fps", this.grp.fps.fld.text);
				app.settings.saveSetting("redefinery", "rd_CompSetter_durOpt", this.grp.dur.opt.value);
				app.settings.saveSetting("redefinery", "rd_CompSetter_dur", this.grp.dur.fld.text);
				app.settings.saveSetting("redefinery", "rd_CompSetter_durFrames", this.grp.dur.durFrames.value);
				app.settings.saveSetting("redefinery", "rd_CompSetter_durSecs", this.grp.dur.durSecs.value);
				
				app.settings.saveSetting("redefinery", "rd_CompSetter_renderer", this.grp.renderer.lst.selection.index);
				app.settings.saveSetting("redefinery", "rd_CompSetter_preserveFR", this.grp.preserveFR.lst.selection.index);
				app.settings.saveSetting("redefinery", "rd_CompSetter_preserveRes", this.grp.preserveRes.lst.selection.index);
				app.settings.saveSetting("redefinery", "rd_CompSetter_saOpt", this.grp.sa.opt.value);
				app.settings.saveSetting("redefinery", "rd_CompSetter_sa", this.grp.sa.fld.text);
				app.settings.saveSetting("redefinery", "rd_CompSetter_spOpt", this.grp.sp.opt.value);
				app.settings.saveSetting("redefinery", "rd_CompSetter_sp", this.grp.sp.fld.text);
				app.settings.saveSetting("redefinery", "rd_CompSetter_spfOpt", this.grp.spf.opt.value);
				app.settings.saveSetting("redefinery", "rd_CompSetter_spf", this.grp.spf.fld.text);
				app.settings.saveSetting("redefinery", "rd_CompSetter_aslOpt", this.grp.asl.opt.value);
				app.settings.saveSetting("redefinery", "rd_CompSetter_asl", this.grp.asl.fld.text);
				
				app.settings.saveSetting("redefinery", "rd_CompSetter_layerDim", this.grp.layerDim.lst.selection.index);
				
				app.settings.saveSetting("redefinery", "rd_CompSetter_recursive", this.grp.recursive.value);
			};
			
			if (rdcsePal instanceof Window)
			{
				// Show the palette
				rdcsePal.center();
				rdcsePal.show();
			}
			else
				rdcsePal.layout.layout(true);
		}
	}
})(this);
