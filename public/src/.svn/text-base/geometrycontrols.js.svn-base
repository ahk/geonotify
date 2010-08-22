/**
* GeometryControls Class v0.2
* Copyright (c) 2008, Google 
* Author: Chris Marx and Pamela Fox and others
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*       http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* This class lets you add a control to the map which mimics the MyMaps controls
* and allows for adding markers, polylines and polygons to the map and for uploading.
*/

/**
 * Global wrapper function for getElementsById()
 * @param {String} id Element's id
 */
function get$(id) {
  return document.getElementById(id);
  //TODO implement an element cache?
};

/**
 * Creates the parent class for Geometry Controls
 * @constructor
 * @param {Object} opt_opts Named optional arguments:
 *   @param {Object} opt_opts.controlPositionFloat A GControlAnchor for positioning the parent control container (if used)
 *   @param {Object} opt_opts.controlPosition An array with pixel values for parent control position
 *   @param {String} opt_opts.buttonWidth Button width in pixels
 *   @param {String} opt_opts.buttonHeight Button height in pixels
 *   @param {String} opt_opts.buttonBorder Button border in pixels
 *   @param {String} opt_opts.infoWindowHtmlURL The url if the html template file, containing configurable html and json for control infowindows and options
 *   @param {Object} opt_opts.stylesheets An array of urls of stylesheets to be appended 
 *   @param {Boolean} opt_opts.autoSave Determines whether the autoSave feature (via AOP) is turned on or off
 *   @param {String} opt_opts.cssId The base name for css styles
 *   @param {Boolean} opt_opts.debug Sets debug statements to GLog or turns them off for production
 */
function GeometryControls(opt_opts){
  var me = this;
  
  //self documenting object with default settings shared by geometry controls
  me.Options = {
    controlPostitionFloat:G_ANCHOR_TOP_RIGHT, 
    controlPosition:[0,0],
    buttonWidth:'33',
    buttonHeight:'33',
    buttonBorder:'0',
    buttonCursor:'pointer',
    infoWindowHtmlURL:"data/geometry_html_template.html",
    stylesheets:["styles/google.maps.base.css","styles/google.maps.ms_styles.css"],
    autoSave:true, //TODO have option to turn on autoSave for individual controls?
    cssId:"emmc-geom", //for generic components shared between multiple controls 
    debug:true   
  };
  
  //overide the default Options
  if(opt_opts){
  	for (var o in opt_opts) {
  		me.Options[o] = opt_opts[o];
  	}
  } else {
  	//me.debug("??");
  }
  
  me.isIE = navigator.appName.indexOf('Explorer') > -1;
  me.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1; 
  me.map = null;
  me.container = null;
  me.controls = {};
  me.buttons_ = {};
  me.stopDigitizingFuncs_ = {};
  me.infoWindowHtmlTemplates = {};
  me.bounds = new GLatLngBounds(); //for setting bounds when loading data
  me.autoSaveListener = null;  //external handle for aop
  
  //run functions that need to be initialized at startup
  me.runInitFunctions_();
};

/**
 * Inherits from GControl, makes it convenient to use map.addControl()
 */
GeometryControls.prototype = new GControl();

/**
 * Run functions that need to load content when class is instantiated
 */
GeometryControls.prototype.runInitFunctions_ = function(){
  var me = this;
  me.getInfoWindowHtml_();  
  me.addGoogleMapsCSS_();
  if(me.Options.autoSave){
    me.addAutoSaveAspect();
  };
};

/**
 * Required by GMaps API for controls.
 * @param {Object} opt_opts  
 *   @param {Object} opt_opts.controlPositionFloat Constant for float position
 *   @param {Object} opt_opts.controlPosition An array with top/left offset for control
 * @return {GControlPosition} Default location for control
 */
GeometryControls.prototype.getDefaultPosition = function(opt_opts) {
  var me = this, opt = me.Options, ctrlPosition;
  if (opt_opts) {
    ctrlPosition = new GControlPosition(opt_opts.controlPositionFloat,new GSize(opt_opts.controlPosition[0],opt_opts.controlPosition[1]));
  } else {
    ctrlPosition = new GControlPosition(opt.controlPositionFloat, new GSize(opt.controlPosition[0],opt.controlPosition[1]));
  }
  return ctrlPosition;
};

/**
 * Is called by GMap2's addOverlay method. Creates the button and appends to the map div.
 * Since this is called after being added to map, we can access #addControl to add geometry controls and 
 * make them available here. 
 * @param {GMap2} map The map that has had this ExtMapTypeControl added to it.
 * @return {DOM Object} Div that holds the control
 */ 
GeometryControls.prototype.initialize = function(map){
  var me = this;
  me.map = map;
  
  //could be used to group all controls. currently controls are set to position themselves in their own containers
  me.container = document.createElement("div"); 
  map.getContainer().appendChild(me.container);
  
  //initialize the controls added with #addControl
  for(var name in me.controls){
    map.addControl(me.controls[name]);
  }
  
  //initialize the maps's infowindow (it appears it takes longer the first time it is created, so avoid this timing issue)
  map.getInfoWindow();
  
  return me.container;
};

/**
 * Creates a button, and attaches listeners
 * @param {Object} required_opts All parameters are required!!
 *   @param {String} required_opts.controlName Name of control
 *   @param {Object} required_opts.button_opts 
 *     @param {String} button_opts.img_up_url Url of up image
 *     @param {String} button_opts.img_down_url Url of down image
 *     @param {String} button_opts.tooltip Text of tooltip
 *   @param {Function} required_opts.startDigitizing Function for turning on this digitizer control
 *   @param {Function} required_opts.stopDigitizing Function for turnong off this digitizer control
 */
GeometryControls.prototype.createButton = function(required_opts){
  var me = this, opts = required_opts, Options = me.Options;
  
  //make sure a digitizing function is present
  if(typeof(opts.startDigitizing) && typeof(opts.stopDigitizing) !== "function"){
    me.debug("Digitizing functions for #createButton are required");
    return;
  }
  
  var button = {};
  button.opts = opts.button_opts;  
  var button_img = document.createElement('img');
  button_img.style.cursor = button.opts.buttonCursor || Options.buttonCursor;
  button_img.width = button.opts.buttonWidth || Options.buttonWidth;
  button_img.height = button.opts.buttonHeight || Options.buttonHeight;
  button_img.border = button.opts.buttonBorder || Options.buttonBorder;
  button_img.src = button.opts.img_up_url;
  button_img.title = button.opts.tooltip;
    
  button.img = button_img;
 
  //Button toggle. First click turns it on (and other buttons off), triggers bound events. Second click turns it off
  GEvent.addDomListener(button.img, "click", function() { 
    if(button.img.getAttribute("src") === button.opts.img_up_url){
      me.toggleButtons(opts.controlName);
      opts.startDigitizing();
    } else {
      me.toggleButtons(opts.controlName);
      opts.stopDigitizing();
    }    
  });  

  me.buttons_[opts.controlName] = button;
  me.stopDigitizingFuncs_[opts.controlName] = opts.stopDigitizing;
  return button;
};

/**
 * Turns on selected digitizer button, turns off the other buttons
 * At the moment, name reference is passed rather than object, is this necessary?
 * @param {String} button_name
 */
GeometryControls.prototype.toggleButtons = function(button_name){
  var me = this;
  
  //Calls with no name will turn everything off. Calls with a name will turn all off except the named button
  for (var button in me.buttons_) {
      me.buttons_[button].img.src = me.buttons_[button].opts.img_up_url;
  }  
  if(button_name){
      me.buttons_[button_name].img.src = me.buttons_[button_name].opts.img_down_url;  
  }
  
  //turn off other digitizing listeners. Note: to avoid recursion, external calls to this function should always be made
  //without parameters!!!
  if (button_name) {
    for (var func in me.stopDigitizingFuncs_) {
      if (func != button_name) {
        me.stopDigitizingFuncs_[func](false);
      }
    }
  }
};

/**
 * Adds a geometry control to this.controls, which are then added to the map
 * Note: Would like to use the constructor name of control, so that name is not hard-coded
 * but inheriting from GControl overrides the original constructor name :(
 * @param {Object} control
 * @see #initialize
 */
GeometryControls.prototype.addControl = function(control){
  var me = this;
  
  //thanks Ates Goral
  //inheriting from GControl overrides original constructor so we use a final variable from the control(name)
  /*var controlName = function getObjectClass(obj) {  
    if (obj && obj.constructor && obj.constructor.toString) {  
      var arr = obj.constructor.toString().match(/function\s*(\w+)/);    
      if (arr && arr.length == 2) {  
           return arr[1];  
       }  
    }   
    me.debug("Can't find constructor name of control");
    return null;  
  }(control);*/ 
  
  control.zuper = me;
  me.controls[control.name] = control;
  
  //TODO turn on auto-save?
};

/**
 * Returns a custom tooltip function. 
 * Takes care of one time setup variables and functions and stores then in closure.
 * @param {Object} tooltip_opts
 *           {Array} tooltip_opts.anchor The position offsets for tooltip anchor
 *           {String} tooltip_opts.cursor_on The url for a custom cursor
 *           {String} tooltip_opts.curson_off The url for a custom cursor
 *           {Object} titles
 *             {String} titles.start The text displayed at start of shape digitizing
 *             {String} titles.middle The text displayed at the middle of shape digitizing
 *             {String} titles.end The text displayed at the end of shape digitizing
 * @return {Object} tooltipFunc
 *           {Object} me This
 *           {Object} tooltip_opts See tooltip_opts param
 *           {Object} tooltipHandler 
 *           {DOM Object} tooltipContainer The div container for the tooltip
 *           {Function} on Turns the tooltip on
 *           {Function} off Turns the tooltip off
 */
GeometryControls.prototype.tooltipFactory = function(tooltip_opts){
  var me = this, map = me.map;
  
  //One time setup (memoization)
  var tooltipContainer = document.createElement("div");
  tooltipContainer.id = "tooltipContainer";
  tooltipContainer.className = "emmc-tooltip";
  map.getContainer().appendChild(tooltipContainer);
  
  var calculatePosition = function(latlng,tooltipContainer) {
		var offset=map.getCurrentMapType().getProjection().fromLatLngToPixel(map.getBounds().getSouthWest(),map.getZoom());
		var point=map.getCurrentMapType().getProjection().fromLatLngToPixel(latlng,map.getZoom());
		var anchor= new GPoint(tooltip_opts.anchor[0],tooltip_opts.anchor[1]);
		var width = -12;
		var position = new GControlPosition(G_ANCHOR_BOTTOM_LEFT, new GSize(point.x - offset.x - anchor.x + width,- point.y + offset.y +anchor.y)); 
		position.apply(tooltipContainer);
	};
  
  //TODO Chrome interprets hotspot on cursor incorrectly, so don't use custom cursor for now. 
  var customCursorFunc = function(){
    if(tooltip_opts.cursor_on !== "" && !me.isChrome){
      var dragObject = me.map.getDragObject();
      return function(){
        dragObject.setDraggableCursor(tooltip_opts.cursor_on); 
      };
    } else {
      return function(){};
    }
  }();
  
  //Returns custom tooltip function/object
  var tooltipFunc = {
    me:me,
    tooltip_opts:tooltip_opts,
    tooltipHandler:null,
    tooltipContainer:tooltipContainer,
    on:function(message,callback){
      var self_ = this;      
      tooltipContainer.innerHTML = message;
      tooltipContainer.style.display = "block";
      //TODO add listener for map drag (tooltip doesnt follow cursor during map drag)
      //TODO execute less often (not every mousemove)?
      this.tooltipHandler = GEvent.addListener(self_.me.map,"mousemove", function(latlng){ //really need local reference to me?
        calculatePosition(latlng,tooltipContainer);
        customCursorFunc();
        if(typeof(callback)==="function"){
          callback(latlng,tooltipContainer);
        }
      });
    },
    off:function(){
      this.me.map.getDragObject().setDraggableCursor(this.tooltip_opts.cursor_off);
      tooltipContainer.style.display = "none";
      try{GEvent.removeListener(this.tooltipHandler);}catch(e){};
    }
  };
  
  me.tooltip = function(tooltip_opts){
    tooltipFunc.tooltip_opts = tooltip_opts;
    return tooltipFunc;
  };
  
  return tooltipFunc;
};

/**
 * Create, then store and show/hide an event-bound color picker
 * @param opts
 *   @param {DOM Object} opts.target - element to receive the selected color
 *   @param {Function} opts. callback - callback function
 */
GeometryControls.prototype.showColorPicker = function(opts){
  var me = this, row, cell;
  
  //one time setup
  //TODO could be moved to separate function
  var colors = eval(me.infoWindowHtmlTemplates["colorTable"]);
  var div = document.createElement("div");
  document.getElementsByTagName("body")[0].appendChild(div);
  div.innerHTML = me.infoWindowHtmlTemplates["colorTableHtml"];
  var colorPicker = get$("emmc-menu-color");
  var colorPickerTable = get$("emmc-color-table");
  row = colorPickerTable.insertRow(0);
  for(var i in colors){
    if(i%7 === 0 && i!==0){ row = colorPickerTable.insertRow(i/7);}
    cell = row.insertCell(i%7);
    cell.innerHTML = '<div id="menu_cp_'+colors[i]+'" bgcolor="'+colors[i]+'" style="border: 1px solid rgb(187, 187, 187); margin: 0px;' +
                     'padding: 0px; width: 15px; height: 15px; background-color:'+colors[i]+'" unselectable="on"><img height="1" width="1"/></div>';
  }
  
  //private scope variables for use by stored function
  var target, color, callback;//DOM node
  
  //hide the color picker. TODO : better way??
  var colorPickerHandler = GEvent.addDomListener(colorPicker,"mouseover",function(){
    var tempHandler = GEvent.addDomListener(me.map.getInfoWindow().getContentContainers()[0],"mouseover",function(){
      colorPicker.style.display = "none"; 
      GEvent.removeListener(tempHandler);
    });
    var tempHandler2 = GEvent.addListener(me.map,"infowindowclose",function(){
      colorPicker.style.display = "none"; 
      GEvent.removeListener(tempHandler2);
    });  
  });
  //attach listeners for color picker behaviors
  var cells = colorPickerTable.getElementsByTagName("div");
  for(var j=0; j<cells.length; j++){
    var td = cells[j]; 
    //add hover effect
    GEvent.addDomListener(td,"mouseover",function(){
      this.style.borderColor = "#FFFFFF";
    });
    GEvent.addDomListener(td,"mouseout",function(){
      this.style.borderColor = "#BBBBBB";
    });    
    //return the color
    GEvent.addDomListener(td,"click",function(){
      color = this.getAttribute("bgColor");
      target.setAttribute("bgColor",color);
      target.style.backgroundColor = color;
      colorPicker.style.display = "none";
      callback(color);
    });
  }
  
  //new function
  var newFunc = function(opts){
    var position = me.getAbsolutePosition(opts.target);
    colorPicker.style.left = position.x+1 + "px";
    colorPicker.style.top = position.y + "px";
    colorPicker.style.display = "block";
    colorPicker.focus();    
    target = opts.target;
    callback = opts.callback;
    return colorPicker;
  };
  
  //avoid memory leaks
  colors = colorPickerTable = row = cells = null;
  
  me.showColorPicker = newFunc;   //override itself
  return newFunc(opts);   //one time execution
};

/**
 * Dynamically append CSS stylesheets
 */
GeometryControls.prototype.addGoogleMapsCSS_ = function(){
  var me = this, css;
  
  //attempt to add the css and then keep trying till it happens
  var appendCSS = function(css) {
    try {
      document.getElementsByTagName("head")[0].appendChild(css);
    } catch(e) {
      me.debug("Having trouble adding stylesheets, trying again....");
      setTimeout(function(){appendCSS(css);}, 100);
    }
  };
   
  for(var i=0; i<me.Options.stylesheets.length; i++){
    css = document.createElement("link");
    css.setAttribute("href",me.Options.stylesheets[i]);
    css.setAttribute("rel","stylesheet");
    css.setAttribute("type","text/css");
    appendCSS(css);
  }
  
  css = null;
};

/**
 * Makes XHR for html template file, and stores the data in the infoWindowHtmlTemplates object. 
 * Note: IE gaves errors on textContent, had to use childNode.data
 */
GeometryControls.prototype.getInfoWindowHtml_ = function(){
  var me = this;
  
  //clean-up content from html file
  var trim = function(stringToTrim) {
    return stringToTrim.replace(/^\s+|\s+$/g,"");
  };
  
  var processHtml = function(doc) {
    var nodes = doc.getElementsByTagName("script");
    if (nodes.length >= 1) {
      for(var i=0;i<nodes.length;i++){
        var str = nodes[i].getAttribute("id");
        var content = trim( (me.isIE) ? nodes[i].childNodes[0].data : nodes[i].textContent );
        me.infoWindowHtmlTemplates[str] = (nodes[i].getAttribute('evalRequired') === "true") ? eval(content) : content;
    	}  
    } else {
      me.debug("GeometryControls#getInfoWindowHtml says: failed to get html from template"); 
    }
  };          
  
  try{      
    //a synchonous call is made, because other functions depend on this data being available
    var request = GXmlHttp.create();
    request.open("GET", me.Options.infoWindowHtmlURL, false);
    /*request.onreadystatechange = function() { //doesnt work synchronously
      alert(request.responseText);
      if (request.readyState == 4) {
        processHtml(request.responseText);
      }
    }*/
    request.send(null);
    var doc = GXml.parse(request.responseText);
    processHtml(doc); //workaround, dont check for readyState
  } catch(e) {
    me.debug("GeometryControls#getInfoWindowHtml says: looks like you provided an invalid URL. The URL is "+ me.Options.infoWindowHtmlURL + 
            " The error is: " + e + " " + e.description);
  }
};

/**
 * Loads html fragments from a .html template file, and inserts dynamically added values. 
 * Note: Public function, called from child controls.
 * Simple JavaScript Templating
 * John Resig - http://ejohn.org/ - MIT Licensed
 * @param {String} str Name used to reference this template in the local cache
 * @param {Object} data A JSON object with values matching dynamic placeholders in template
 * @param {Object} node Target script in html template 
 */
GeometryControls.prototype.parseMicroTemplate = function(str, data, node){

  var cache = {};
  
  this.parseMicroTmpl = function tmpl(str, data, node){
    // Figure out if we're getting a template, or if we need to load the template, and be sure to cache the result.
    var nodeOrStr = (typeof(node) !== "undefined") ? node : str;
    var fn = !/\W/.test(str) ? cache[str] = cache[str] || tmpl(nodeOrStr) :
      
      // Generate a reusable function that will serve as a template generator (and which will be cached).
      new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};" +
        
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'") +
        "');}return p.join('');");
    
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
  
  return this.parseMicroTmpl(str,data,node);
};

/**
 * Binds elements shared between all geometry tools
 * Assumes common id naming between different geometry infowindows 
 * Rich text editor might need to be some kind of pre-packaged javascript library
 * @param geomInfo
 *   @param {Number} geomInfo.index The index of the geometry in the storage array
 *   @param {Array} geomInfo.storage The array used to store geometries
 *   @param {Function} geomInfo.geometryStyleFunc The function which will bind behaviors for the style pane in the infowindow
 *   @param {Function} geomInfo.undoStyling A function to undo unstored style changes
 *   @param {Function} geomInfo.commitStyling A function to commit any unstored style changes
 */
GeometryControls.prototype.bindInfoWindow = function(geomInfo){
  var me = this, map = me.map, index = geomInfo.index, cssId = me.Options.cssId;   
  
  var record = geomInfo.storage[index];
  var geometry = record.geometry;
  var title = record.title; 
  var description = record.description;
    
  //store references to id's that can be called multiple times
  var geomStyleLink = get$("msiwsi");
  var geomStyleDiv = get$(cssId + "-style");
  var titleInput = get$(cssId + "-title");
  var descriptionInput = get$(cssId + "-description");
  
  //flag - indicates whether the styleInfoWindow window has already been bound
  var isStyleInfoWindowBound = false;
  
  //bind geometry style links and "back" link, using function supplied in parameters
  GEvent.addDomListener(geomStyleLink,"click", function(){
    geomStyleDiv.style.display = "block";
    if(isStyleInfoWindowBound === false){
      //call controls's custom styling functions, and update the flag
      geomInfo.geometryStyleFunc();
      isStyleInfoWindowBound = true;
    }    
  });
  GEvent.addDomListener(get$("emmc-geom-style-back"),"click",function(){
    geomStyleDiv.style.display = "none";
  });
  
  //Update & Bind Text Entry  
  titleInput.value = (title[1]) ? ((title[0] === title[1]) ? title[0] : title[1]) : ""; //return the saved data or most recent edit
  descriptionInput.value = (description[1]) ? ((description[0] === description[1]) ? description[0] : description[1]) : "";
  GEvent.addDomListener(titleInput,"change", function(){
    title[1] = titleInput.value;
  });
  GEvent.addDomListener(descriptionInput,"change", function(){
    description[1] = descriptionInput.value;
  });
  //onchange doesnt fire when infowindow is closed by clicking on the map, so add a listener for that too
  //listener has to be added to map, because polys dont have the event, so make it garbage collect itself
  var windowOnCloseHandler = GEvent.addListener(map,"infowindowbeforeclose",function(){
    title[1] = titleInput.value;
    description[1] = descriptionInput.value;
    GEvent.removeListener(windowOnCloseHandler);
  });  
  
  //Bind Delete/Cancel/OK buttons
  GEvent.addDomListener(get$(cssId + "-delete"),"click",function(){
    if(confirm("Are you sure you want to delete this?")){
      map.removeOverlay(geometry);
      geomInfo.storage[index] = null;
      map.closeInfoWindow();
    } 
  });
  GEvent.addDomListener(get$(cssId + "-cancel"),"click", function(){
    geomInfo.undoStyling();
    title[1] = title[0];
    description[1] = description[0];
    GEvent.removeListener(windowOnCloseHandler); //dont save on cancel
    map.closeInfoWindow();
  });
  GEvent.addDomListener(get$(cssId + "-ok"),"click",function(){
    //update permanent values
    title[0] = title[1];
    description[0] = description[1];
    geomInfo.commitStyling();
    map.closeInfoWindow();
  });   
  //TODO callbacks? additional user provided methods?
};

/**
 * Data Services
 * @param {Object} opts
 *   @param {String} type Json or kml
 *   @param {String} url Url of the resource
 */
GeometryControls.prototype.loadData = function(opts){
  var me = this;
  GDownloadUrl(opts.url, function(data, responseCode){
    (opts.type === "kml") ? me.handleKmlDataResponse_(data, responseCode) : me.handleJsonDataResponse_(data, responseCode);  
  });
};

/**
 * EGeoXml Kml Processing (modified)
 * http://econym.googlepages.com/egeoxml.htm (Thanks Mike!)
 * TODO This code could be optimized, should I fix?
 * @param {XMLDocument} data - data from #loadData
 * @param {String} responseCode - response code from ajax GDownloadUrl
 */
GeometryControls.prototype.handleKmlDataResponse_ = function(data, responseCode){
  var me = this;
  
  //Helper functions
  var EGeoXml = {
    value:function(e){
      a = GXml.value(e);
      a = a.replace(/^\s*/, "");
      a = a.replace(/\s*$/, "");
      return a;
    },
    styles:{}
  }  
  
  //called if there are errors in kml parsing
  function error(e) {
    me.debug("Looks like you provided an invalid URL or parameters or invalid xml. The URL is  ____ ."+
             "The error is:"+e+" at line "+e.lineNumber+" in file "+e.fileName); //TODO
  }
  
  if (responseCode == 200) {
    try{
      var xmlDoc = GXml.parse(data);
      // Read through the Styles
      var styles = xmlDoc.documentElement.getElementsByTagName("Style");
      for (var i = 0; i < styles.length; i++) {
        var styleID = styles[i].getAttribute("id");
        
        //is it a marker style? (the following logic corresponds to predefined icons in the mymaps_html_template)
        //TODO move these to individual overridable functions? 
        var icons = styles[i].getElementsByTagName("Icon");
        if (icons.length > 0) {
          var href=EGeoXml.value(icons[0].getElementsByTagName("href")[0]);
          if (!!href) {
            var icon = {name:styleID};
            //get names of defined icons 
            var markerIcons = {};
            for(var j in me.infoWindowHtmlTemplates["markerIcons"]){
              markerIcons[me.infoWindowHtmlTemplates["markerIcons"][j].name] = me.infoWindowHtmlTemplates["markerIcons"][j];                   
            }
            //can't use href[index] in ie :(
            switch(true){
              case(href.indexOf("kml") > -1):          
                icon.y = parseInt(href.charAt(href.indexOf("pal")+3))+1; //TODO to match with MarkerControl.checkIconStatus
                icon.x = parseInt(href.substring(href.indexOf("icon")+4,href.indexOf(".png")));
              break;
              case(href.indexOf("dot") > -1):
                icon.y = 0;
                if (markerIcons["dot"]) {
                  var images = markerIcons["dot"].images;
                  var image = href.split("/").pop();
                  for (var k in images) {
                    if (image === images[k]) {
                      icon.x = k;
                    }
                  }
                } else {
                  me.debug("Cannot Load Kml - There is no icon defined for markers with images like *-dot.png");
                }
              break;
            }
            //TODO add rest of markers or improve marker detection
            /*if (me.opts.printgif) {
              var bits = href.split("/");
              var gif = bits[bits.length-1];
              gif = me.opts.printgifpath + gif.replace(/.png/i,".gif");
              me.styles["#"+styleID].printImage = gif;
              me.styles["#"+styleID].mozPrintImage = gif;
            }*/
          }
          EGeoXml.styles["#"+icon.name] = icon;
        }
        
        // is it a LineStyle ?
        var linestyles=styles[i].getElementsByTagName("LineStyle");
        if (linestyles.length > 0) {
          var width = parseInt(GXml.value(linestyles[0].getElementsByTagName("width")[0]));
          if (width < 1) {width = 5;}
          var color = EGeoXml.value(linestyles[0].getElementsByTagName("color")[0]);
          var aa = color.substr(0,2);
          var bb = color.substr(2,2);
          var gg = color.substr(4,2);
          var rr = color.substr(6,2);
          color = "#" + rr + gg + bb;
          var opacity = parseInt(aa,16)/256;
          if (!EGeoXml.styles["#"+styleID]) {
            EGeoXml.styles["#"+styleID] = {};
          }
          EGeoXml.styles["#"+styleID].color=color;
          EGeoXml.styles["#"+styleID].width=width;
          EGeoXml.styles["#"+styleID].opacity=opacity;
        }
        
        // is it a PolyStyle ?
        var polystyles=styles[i].getElementsByTagName("PolyStyle");
        if (polystyles.length > 0) {
          var fill = parseInt(GXml.value(polystyles[0].getElementsByTagName("fill")[0]));
          var outline = parseInt(GXml.value(polystyles[0].getElementsByTagName("outline")[0]));
          var color = EGeoXml.value(polystyles[0].getElementsByTagName("color")[0]);
  
          if (polystyles[0].getElementsByTagName("fill").length === 0) {fill = 1;}
          if (polystyles[0].getElementsByTagName("outline").length === 0) {outline = 1;}
          var aa = color.substr(0,2);
          var bb = color.substr(2,2);
          var gg = color.substr(4,2);
          var rr = color.substr(6,2);
          color = "#" + rr + gg + bb;
  
          var opacity = Math.round((parseInt(aa,16)/256)*100)/100; //round to 2 decimals
          if (!EGeoXml.styles["#"+styleID]) {
            EGeoXml.styles["#"+styleID] = {};
          }
          EGeoXml.styles["#"+styleID].fillcolor=color;
          EGeoXml.styles["#"+styleID].fillopacity=opacity;
          if (!fill) {
            EGeoXml.styles["#" + styleID].fillopacity = 0;
          }
          if (!outline) {
            EGeoXml.styles["#" + styleID].opacity = 0;
          }
        }
      }

      // Read through the Placemarks
      var placemarks = xmlDoc.documentElement.getElementsByTagName("Placemark");
      for (var i = 0; i < placemarks.length; i++) {
        var name = EGeoXml.value(placemarks[i].getElementsByTagName("name")[0]);
        var desc = EGeoXml.value(placemarks[i].getElementsByTagName("description")[0]);
        if (desc.match(/^http:\/\//i)) {
          desc = '<a href="' + desc + '">' + desc + '</a>';
        }
        if (desc.match(/^https:\/\//i)) {
          desc = '<a href="' + desc + '">' + desc + '</a>';
        }
        var style = EGeoXml.styles[EGeoXml.value(placemarks[i].getElementsByTagName("styleUrl")[0])] || {}; 
        var coords=GXml.value(placemarks[i].getElementsByTagName("coordinates")[0]); //TODO what about inner boundaries?
        coords=coords.replace(/\s+/g," "); // tidy the whitespace
        coords=coords.replace(/^ /,"");    // remove possible leading whitespace
        coords=coords.replace(/ $/,"");    // remove possible trailing whitespace
        coords=coords.replace(/, /,",");   // tidy the commas
        var path = coords.split(" ");
  
        // Is this a polyline/polygon?
        if (path.length > 1) {
          // Build the list of points
          var points = [];
          //var pbounds = new GLatLngBounds(); //TODO what does this do?
          for (var p=0; p<path.length; p++) {
            var latlng = path[p].split(",");
            var point = new GLatLng(parseFloat(latlng[1]),parseFloat(latlng[0]));
            points.push(point);
            me.bounds.extend(point);
            //pbounds.extend(point);
          }
          var linestring=placemarks[i].getElementsByTagName("LineString");
          if (linestring.length) {
            // it's a polyline grab the info from the style
            if (style.width) {
              style.width = 5;
              style.color = "#0000ff";
              style.opacity = 0.45;
            }
            // Does the user have their own createmarker function?
            /*if (!!me.opts.createpolyline) {
              me.opts.createpolyline(points,color,width,opacity,pbounds,name,desc);
            } else {*/
              me.createGeometry_({
                type:"line",
                coordinates:points,
                title:name,
                description:desc,
                style: {
                  strokeColor:style.fillcolor,
                  strokeWeight:3,
                  strokeOpacity:style.fillopacity,
                  opts:{
                    clickable:true //TODO make option configurable
                  } 
                }
              });
            //}
          }
  
          var polygons=placemarks[i].getElementsByTagName("Polygon");
          if (polygons.length) {
            // it's a polygon grab the info from the style or provide defaults
            if (style.width) {
              style.width = 5;
              style.color = "#0000ff";
              style.opacity = 0.45;
              style.fillopacity = 0.25; 
              style.fillcolor = "#0055ff";
            }
            // Does the user have their own createmarker function?
            /*if (!!me.opts.createpolygon) {
              me.opts.createpolygon(points,color,width,opacity,fillcolor,fillopacity,pbounds,name,desc);
            } else {*/
              me.createGeometry_({
                type:"poly",
                coordinates:points,
                title:name,
                description:desc,
                style: {
                  strokeColor:style.fillcolor,
                  strokeWeight:3,
                  strokeOpacity:style.fillopacity,
                  fillColor:style.fillcolor,
                  fillOpacity:style.fillopacity ,
                  opts:{
                    clickable:true //TODO make option configurable
                  } 
                }
              });
            //}
          }  
        } else {
        // It's not a poly, so I guess it must be a marker
          var bits = path[0].split(",");
          // Does the user have their own createmarker function?
          /*if (!!me.opts.createmarker) {
            me.opts.createmarker(point, name, desc, style);
          } else {*/
          
          var geometry = me.createGeometry_({
            type:"point",
            coordinates:[{lat:parseFloat(bits[1]),lng:parseFloat(bits[0])}],
            title:name,
            description:desc,
            style:{
              icon:style
            }
          });
          
          me.bounds.extend(geometry.getLatLng());
          
          //}
        }
      }
      
      me.zoomToBounds();
  
      //TODO should sidebar be included?
      // Is this the last file to be processed?
      /*me.progress--;
      if (me.progress == 0) {
        // Shall we zoom to the bounds?
        if (!me.opts.nozoom) {
          me.map.setZoom(me.map.getBoundsZoomLevel(me.bounds));
          me.map.setCenter(me.bounds.getCenter());
        }
        // Shall we display the sidebar?
        if (me.opts.sortbyname) {
          me.side_bar_list.sort();
        }
        if (me.opts.sidebarid) {
          for (var i=0; i<me.side_bar_list.length; i++) {
            var bits = me.side_bar_list[i].split("$$$",4);
            me.side_bar_html += me.sidebarfn(me.myvar,bits[0],bits[1],bits[2],bits[3]); 
          }
          document.getElementById(me.opts.sidebarid).innerHTML += me.side_bar_html;
        }
        if (me.opts.dropboxid) {
          for (var i=0; i<me.side_bar_list.length; i++) {
            var bits = me.side_bar_list[i].split("$$$",4);
            if (bits[1] == "marker") {
              me.side_bar_html += me.dropboxfn(me.myvar,bits[0],bits[1],bits[2],bits[3]); 
            }
          }
          document.getElementById(me.opts.dropboxid).innerHTML = '<select onChange="var I=this.value;if(I>-1){GEvent.trigger('+me.myvar+'.gmarkers[I],\'click\'); }">'
            + '<option selected> - Select a location - </option>'
            + me.side_bar_html
            + '</select>';
        }
  
        //GEvent.trigger(me,"parsed");*/
      //}      
    } catch(e){
     error(e); 
    }
  } else {
    error();
  }
  
};

/**
 * Create geometries from JSON
 * @param {Object} data 
 * @param {Integer} responseCode
 */
GeometryControls.prototype.handleJsonDataResponse_ = function(data, responseCode){
  var me = this;
  
  if (responseCode == 200) {
    var json_data = eval('(' + data + ')');
    json_data = json_data[0];
    if (json_data.status != 'success') {
      me.debug("The JSON was invalid");
      return;
    }
    
    //TODO why is operation here?
    switch (json_data.operation) {
      case 'get':
        var geometries = json_data.result.geometries;
        for (var i=0; i < geometries.records.length; i++) {
          var record = geometries.records[i];
          if (record.type === 'point') {
            var geometry = me.createGeometry_(record);
            me.bounds.extend(geometry.getLatLng());
          } else if (record.type === 'line' || record.type == 'poly') {
            var latlng, latlngArray = [];
            record.coordinates = function(){
              for(var i in record.coordinates){
                latlng = new GLatLng(record.coordinates[i].lat,record.coordinates[i].lng);
                latlngArray[i] = latlng;
              } return latlngArray;
            }();
            var geometry = me.createGeometry_(record);
            me.bounds.extend(geometry.getBounds().getCenter()); //need to extend with all points?
          }  
        }
        me.zoomToBounds();
    }
  } else {
    me.debug("Looks like you provided an invalid URL or parameters. The URL is ___"); //TODO
  }
};

/**
 * Set map center and zoom to a GBounds
 * @param {Object} record - see #createGeometry_
 */
GeometryControls.prototype.zoomToBounds = function(record){
  var me = this, bounds = me.bounds;
  
  if  (!bounds.isEmpty()) {
    me.map.setCenter(bounds.getCenter());
    me.map.setZoom(me.map.getBoundsZoomLevel(bounds));
  }
};

/**
 * Delegate object creation to appropriate geometry control
 * TODO - If all controls come in with a standardized property (point,line,poly,etc), 
 * then you could replace the switch with a simple lookup, and a generic call to a loading method
 * @param {Object} record
 *   @param {String} type The type of geometry
 *   @param {Object} coordinates An array of objects {lat,lng}
 *   @param {String} title The text used for geometry infowindow title
 *   @param {String} description The text used for geometry infowindow description
 *   @param {Object} style The full style definition for the geometry
 */
GeometryControls.prototype.createGeometry_ = function(record){
  var me = this;
  
  try {
    switch (record.type) {
      case "point":
        return me.controls["markerControl"].loadMarkers(record);
      case "line":
        return me.controls["polylineControl"].loadPolylines(record);
      case "poly":
        return me.controls["polygonControl"].loadPolygons(record);
    }
  } 
  catch (e) {
    me.debug("A geometry Control has not been added for the geometry type you are trying to load or there is an error." +
             "Your error is: " + e + " at line " + e.lineNumber + " in file " + e.fileName);
  }
};

/**
 * Add aspects that listen for "Ok" button clicks, triggering an upload to the db
 * TODO - need explicit extra variable (autoSaveListener) for passing references?
 */
GeometryControls.prototype.addAutoSaveAspect = function(){
  var me = this;
  
  me.aop.addBefore(me, 'bindInfoWindow', function(args){
    var geomInfo = args[0];
    //expose the function by passing reference to autoSaveListener variable
    me.autoSaveListener = geomInfo.commitStyling;
    geomInfo.commitStyling = function(){
      me.autoSaveListener();
    };
    //attach the listener
    me.aop.addAfter(me, 'autoSaveListener', function(){
      if(me.Options.autoSave){
        me.saveData({
          allData:false,
          geomInfo:geomInfo
        }); 
      }
    }); 
    return args;
  });
};

/**
 * Post data for storage to a db. Options to send all information or just one object?
 * @see #addAutoSaveAspect
 * @param {Object} opts
 *   @param {Object} geomInfo - @see #bindInfoWindow
 */
GeometryControls.prototype.saveData = function(opts){
  var me = this;
  if(opts.allData === true){
    //me.saveAllData();
  } else {
    //construct a json data record
    var geomInfo = opts.geomInfo, index = opts.geomInfo.index;
    var record = geomInfo.storage[index];  
    var recordJSON = {};
    recordJSON.type = record.type;
    recordJSON.coordinates = [];
    
    //determine geometry type, and copy geometry appropriately
    if(record.type === "point"){
      recordJSON.coordinates.push({lat:record.geometry.getLatLng().lat(),lng:record.geometry.getLatLng().lng()});
    } else {
      var vertex;
      for(var i=0;i<record.geometry.getVertexCount();i++){
        vertex = record.geometry.getVertex(i);
        recordJSON.coordinates.push({lat:vertex.lat(),lng:vertex.lng()});
      }
    }
    
    //add title and description
    recordJSON.title = record.title[0];
    recordJSON.description = record.description[0];
    
    //TODO add styles 
    recordJSON.style = ""; //TODO
  }  
  
  //TODO Make separate prototype function?
  function postData(data){
    //TODO 
    me.debug(data);
  };
  
  postData(me.serialize(recordJSON));
};

/**
 * Loops through all stored geometries by accessing variable for storage
 * In all of the the controls that have been added.
 * @see #addControl
 */
GeometryControls.prototype.saveAllData = function(){
  var me = this;
  //TODO
  //call save data with each geometry?
};

//================================================================= Utility Methods ========================================================//

/**
 * Javascript Beans (Value Objects)
 * @static
 */
GeometryControls.prototype.beans = {
  /**
   * Geometry Class
   * Titles/descriptions are stored as [][0,1] with 0,1 entries representing current(0)/previous(1) values
   * TODO change title/desc storage to use hash, rather than array
   * @param {Object} p 
   */
  Geometry:function(p){
    this.type = p.type;
    this.geometry = p.geometry;
    this.title = p.title || ["",""];
    this.description = p.description || ["",""];
  },
  /**
   * Style Class
   * @param {Object} p
   */
  Style:function(p){
    //TODO
  }
};

/**
 * Utility function for executing functions not in global scope
 * @param {Object} milliseconds
 * @param {Object} func
 */
GeometryControls.prototype.setLocalTimeout = function(func,milliseconds){
  function delayedFunction(){
    func();
  }
  setTimeout(delayedFunction, milliseconds);
};

/**
 * Utility function for getting the absolute position of an element
 * @param {DOM Object} el The element of which to get the position
 * @see http://www.faqts.com/knowledge_base/view.phtml/aid/9095
 */
GeometryControls.prototype.getAbsolutePosition = function(el){
	for (var lx=0,ly=0;el!==null;lx+=el.offsetLeft,ly+=el.offsetTop,el=el.offsetParent){};
	return {x:lx,y:ly};
};

/**
 * Returns the distance of one of the sum of two distances in feet/miles with appropriate units
 * @param {Integer} distance1 The distance to convert
 * @param {Integer} opt_distance2 Optional second distance to add to first, and then convert
 */
GeometryControls.prototype.convertFromMetric = function(distance1, opt_distance2){
  var distance = opt_distance2 + distance1 || distance1;
  return (distance < 1609.344) ? (distance * 3.2808399).toFixed(2) + "ft" : (distance * 0.0006213711).toFixed(2) + "mi";
};   
        
/**
 * Wrapper function for GLog.write, allows debugging to be turned on/off globally
 * Note: debugging mode is set at instantiation, so that production mode does not incur processing
 * @param {Object} msg
 */
GeometryControls.prototype.debug = function(msg){
  var me = this, tempFunc;
  if(me.Options.debug){
    tempFunc = function(msg){
      GLog.write(msg);
    };
  } else {
    tempFunc = function(){};
  }
  me.debug = tempFunc;
  return tempFunc(msg);
};

/**
 * Serialize JSON to parameters
 * @param {Object} obj Object to serialize
 */
GeometryControls.prototype.serialize = function(obj){
  var me = this;
  var params = [];
  
  function traverseObject(myObj){
    for (var prop in myObj) {
      if (typeof(myObj[prop]) === "object") {
        traverseObject(myObj[prop]);
      } else {
        params.push(prop + "=" + myObj[prop]);      
      }
    }
  };
  
  traverseObject(obj);
  
  return params.join("&");
};

/**
 * Ajaxpect 0.9.0 (AOP)
 * http://code.google.com/p/ajaxpect
 * With slight formatting modifications (switched "_process" -> "process_", etc.)
 */
GeometryControls.prototype.aop = {
  addBefore: function(obj, filter, before) {
    var link = function(orig) {
      return function() {
        return orig.apply(this, before(arguments, orig, this));
      };
    };
    this.process_(obj, filter, link);
  },
  addAfter: function(obj, filter, after) {
    var link = function(orig) {
      return function() {
        return after(orig.apply(this, arguments), arguments, orig, this);
      };
    };
    this.process_(obj, filter, link);
  },
  addAround: function(obj, filter, around) {
    var link = function(orig) {
      return function() {
        return around(arguments, orig, this);
      };
    };
    this.process_(obj, filter, link);
  },  
  process_: function(obj, filter, link) {
    var check;
    if (filter.exec) {
      check = function(str) { return filter.exec(str); };
    } else if (filter.call) {
      check = function(str) { return filter.call(this, str); };
    }
    if (check) {
      for (var member in obj) {
        if (check(member)) {
          this.attach_(obj, member, link);
        }
      }
    } else {
      this.attach_(obj, filter, link);
    }
  },
  attach_: function(obj, member, link) {
    var orig = obj[member];
    obj[member] = link(orig);
  }  
};

