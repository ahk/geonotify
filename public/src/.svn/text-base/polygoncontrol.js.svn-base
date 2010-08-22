/**
 * @class PolygonControl 
 * @version 0.3
 * @copyright (c) . 2008
 * @author Chris Marx
 *
 * @fileoverview MarkerControl is used to create points/markers
 * <br /><br />
 */

/*
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
*/

/**
 * PolygonControl
 * @constructor 
 * @param {Object} opt_opts
 *   @param {Object} button_opts
 *     @param {String} opt_opts.img_up_url The image to display on the button in the up state
 *     @param {String} opt_opts.img_down_url The image to display on the button in the down state
 *     @param {String} opt_opts.name The name of the button
 *     @param {String} opt_opts.tooltip The button's tooltip text
 *   @param {Object} opt_opts.position Position options
 *     @param {Array} position.controlPosition The offsets for the control's position
 *   @param {Object} opt_opts.tooltip Tooltip Options
 *     @param {Array} tooltip.anchor The offset for postion of tooltip
 *     @param {String} tooltip.cursor_on The url for a custom css cursor
 *     @param {String} tooltip.cursor_off The url for a custom css cursor
 *     @param {Object} titles Titles used for tooltip
 *       @param {String} titles.img_up_url Url of up image
 *       @param {String} titles.img_down_url Url of down image
 *       @param {String} titles.tooltip Text of tooltip
 *     @param {Function} tooltip.callback Optional callback executed for tooltips
 *   @param {Object} newGeometryOptions The options used when creating new geometries
 *     @param {String} newGeometryOptions.strokeColor The stroke (line) color
 *     @param {Integer} newGeometryOptions.strokeWieght The stroke (line) weight (width)
 *     @param {Float} newGeometryOptions.strokeOpacity The stroke (line) opacity
 *     @param {String} newGeometryOptions.fillColor The fill color
 *     @param {Float} newGeometryOptions.fillOpacity The fill opacity
 *     @param {Object} opts
 *       @param {Boolean} opts.clickable Is geometry clickable
 *   @param {Object} geometryListenerOpts Settings for geometry listeners
 *     @param {Boolean} geometryListenerOpts.mouseoverEditingEnabled Is mousover editing enabled
 *     @param {Boolean} geometryListenerOpts.infoWindowHtmlEnabled Is the default infoWindow with html
 *     @param {Boolean} geometryListenerOpts.mouseoverHighlightingEnabled Is mouseover highlighting enabled
 *     @param {Boolean} geometryListenerOpts.infoWindowTabsEnabled Is the default infoWindow with tabs
 *     @param {Function} geometryListenerOpts.assembleInfoWindowTabs Configurable for custom tabs. If default content is desired, add it to the first tab
 *   @param {Boolean} multiEdit Determines whether one can add multiple geometries at once (rather than having the control turn off after each addition)
 *   @param {Object} htmlTemplateParams Optional data object for html template 
 *   @param {String} cssId The prefix used for id's in the css
 *   @param {Function} optionalGeometryListeners Optional function to add additional listeners to geometries 
 *   @param {Boolean} autoSave Determines whether saving geometry data also triggers a post to a DB
 */
function PolygonControl(opt_opts) {
  var me = this;
  me.type = "polygon";
  me.name = me.type + "Control";
  me.zuper = null;
  me.digitizerShape = null;
  me.editLineHandler = null;
  me.endLineHandler = null;
  me.infoWindowHtml = "";
  me.infoWindowTabs = [];
  me.styles = {
    standard:{}//TODO
  };
  
  /**
  * Array used for storage. Remember to check for nulls when exporting data
  * Geometries are tied to their index, so entries are cleared, not deleted
  * @see GeometryControls#beans#Geometry For expected strucutre of storage entries
  */
  me.storage = [/*array of GeometryControls#beans#Geometry*/];
  
  //self documenting object with default settings specific for PolygonControl
  me.Options = {
    button_opts:{
      img_up_url:'http://www.google.com/intl/en_us/mapfiles/ms/t/Bpu.png',
      img_down_url:'http://www.google.com/intl/en_us/mapfiles/ms/t/Bpd.png',
      name:'polygon',
      tooltip:'Draw a shape'
    },
    position:{
      controlPosition:[245,3]
    },
    tooltip:{
      anchor:[-30,-8],
      cursor_on:"", //only for overriding default digitizing cursor
      cursor_off:"",
      titles:{
         start:"Click to start drawing a shape",
         middle:"Click to continue drawing a shape",
         end:"Click a vertex once, or double click on the map to end this shape"
      },
      callback:null      
    },
    newGeometryOptions: { 
      strokeColor:"#000000",
      strokeWeight:3,
      strokeOpacity:0.25,
      fillColor:"#0000FF",
      fillOpacity:0.45,
      opts:{
        clickable:true
      }
    },
    geometryListenerOpts:{
      mouseoverEditingEnabled:true,
      infoWindowHtmlEnabled:true,
      mouseoverHighlightingEnabled:true,
      infoWindowTabsEnabled:false,
      /**
       * Optional function to load up additional information from html template for tabs
       * If the original infoWindowHtml content is desired, add it as the first tab in the array.
       */
      assembleInfoWindowTabs:function(){
        me.infoWindowTabs.push(new GInfoWindowTab("Geometry Controls", me.infoWindowHtml));
        me.infoWindowTabs.push(new GInfoWindowTab("Example Tab", me.zuper.infoWindowHtmlTemplates["infoWindowTabContent1"]));      
      }      
    },
    multiEdit:false, //allows for digitzing multiple geometries, useful for points, should polys support it too?
    htmlTemplateParams:{},
    cssId:"emmc-polygon",
    optionalGeometryListeners:null,
    autoSave:false     
  };
  
  //TODO candidate to move to GeometryControls
  //overide the default options
  if(typeof(opt_opts)!="undefined"){
  	for (var o in opt_opts) {
      if(typeof(opt_opts[o]) === "object"){
        for (var p in opt_opts[o]){
          me.Options[o][p] = opt_opts[o][p];
        }  
      } else {
        me.Options[o] = opt_opts[o];  
      }  		
  	}
  } else {
  	//me._super.debug("??");
  }  
};

PolygonControl.prototype = new GControl();

/**
 * Expected by GControl, sets control position 
 */
PolygonControl.prototype.getDefaultPosition = function(){
  var me = this;
  return me.zuper.getDefaultPosition(me.Options.position);
};

/**
 * Extend for polygon specific implementation
 * @param {GMap2} map The map that has had this ExtMapTypeControl added to it.
 * @return {DOM Object} Div that holds the control
 */ 
PolygonControl.prototype.initialize = function(map){
  var me = this;  
  me.container = document.createElement("div");
  me.container.id = "mymaps-control-"+me.Options.button_opts.name;
  
  var button = me.zuper.createButton({
      controlName:me.name,
      button_opts:me.Options.button_opts,
      startDigitizing:function(){
        me.startDigitizing();
      },
      stopDigitizing:function(t){
        me.stopDigitizing(t);
      }
  });
  
  me.container.appendChild(button.img);
  map.getContainer().appendChild(me.container);
  
  me.runInitFunctions();
  
  return me.container;
};

/**
 * Remember, all init functions get executed from #initialize because zuper isn't defined
 * until the control is added to zuper, with GeometryControls#addControl, and that's 
 * when initialize is called automatically by GControl
 * @see #initialize
 */
PolygonControl.prototype.runInitFunctions = function(){
  var me = this;
  me.tooltip();
  me.assembleInfoWindowHtml(me.Options.htmlTemplateParams);
  me.extendGPolygon();
};

/**
 * Starts digitizing process, turns on tooltip, calls function for geometry creation
 * TODO - break up some of the functions?
 * @see #newGPolygon
 */
PolygonControl.prototype.startDigitizing = function() {
  var me = this, zuper = me.zuper, map = zuper.map, Options = me.Options;
  me.tooltip.on(Options.tooltip.titles["start"]);
  me.digitizerShape = me.newGPolygon([], Options.newGeometryOptions);  
  map.addOverlay(me.digitizerShape);
  me.digitizerShape.enableDrawing({});
  
  //change the tooltip text while digitizing
  me.editLineHandler = GEvent.addListener(me.digitizerShape,"lineupdated",function(){
    switch(me.digitizerShape.getVertexCount()){
      case 2: me.tooltip.tooltipContainer.innerHTML = Options.tooltip.titles["middle"];
      break;
      case 3: me.tooltip.tooltipContainer.innerHTML = Options.tooltip.titles["end"];
      break;
    }
  });
  
  //listen for cancel events
  GEvent.addListener(me.digitizerShape,"cancelline",function(){
    me.stopDigitizing();
  });
  
  //create permanent polygon
  me.endLineHandler = GEvent.addListener(me.digitizerShape,"endline",function(latlng){
    var coords = [];
    for(var i=0;i<me.digitizerShape.getVertexCount();i++){
      coords[i] = me.digitizerShape.getVertex(i);
    }
    var polygon = me.createPolygon(coords, me.infoWindowHtml); 
    map.addOverlay(polygon);    
            
    //TODO would allow for multiple additions of polygons (need this??)
    if (!Options.multiEdit) {
      me.stopDigitizing();
      GEvent.trigger(polygon,"click"); //open the infowindow
    } else {
      //TODO default behavior for multi edits??
    }    
  });
};

/**
 * Ends digitizing of a poly, removes editing listeners, turns off tooltip, and removes poly overlay
 * @param {Boolean} toggleButtons If toggleButtons is true, then the geometry control buttons state is reset. 
 */
PolygonControl.prototype.stopDigitizing = function(toggleButtons) {
  var me = this, zuper = me.zuper;
  try{GEvent.removeListener(me.endLineHandler);}catch(e){};
  me.tooltip.off();
  if (toggleButtons !== false) {
    zuper.toggleButtons();
  }
  //calling removeOverlay on an editable shape before it has been completely finalized prevents the overlay from being removed
  //so use a timeout to execute it a little afterwards
  zuper.setLocalTimeout(function(){
    if (me.digitizerShape) {
      me.digitizerShape.disableEditing(); //shapes removed while still being edited need to have editing disabled in order to be removed completely
      zuper.map.removeOverlay(me.digitizerShape);
      me.digitizerShape = null;
    }
  },500);
};

/**
 * Creates instance of tooltips for PolygonControl, which replaces the function below
 * @see GeometryControls#tooltipFactory
 */
PolygonControl.prototype.tooltip = function(){ 
  var me = this;  
  var tooltip = me.zuper.tooltipFactory(me.Options.tooltip);  
  //note this function is being redefined by the tooltip object from zuper
  me.tooltip = tooltip;
  return tooltip;
};

/**
 * Assembles html fragments for infowWindow from html template file at initialization
 * @param {Object} dataObject An optional JSON object with data to insert into placeholders in the html template
 * @see GeometryControls#getInfoWindowHtml_
 * @see GeometryControls#parseMicroTemplate
 * @see #geometryListenerOpts.assembleInfoWindowTabs
 */
PolygonControl.prototype.assembleInfoWindowHtml = function(dataObject){
  var me = this, zuper = me.zuper, zuperHtml = zuper.infoWindowHtmlTemplates;
  dataObject = dataObject || {};
  dataObject["geometry_style_link"] = zuperHtml["geometry_style_link_params"][0][me.type];
  me.infoWindowHtml = zuper.parseMicroTemplate("template_1",dataObject,zuperHtml["template_1"]) + zuperHtml["polygon_2"];
  
  if(me.Options.geometryListenerOpts.infoWindowTabsEnabled){
    me.Options.geometryListenerOpts.assembleInfoWindowTabs();
  }
};

/**
 * Creates (and recreates) polygons
 * @param {Array} coords An array of GLatLngs 
 * @param {String} html The html content for the infowindow
 * @param {Number} opt_currentIndex Override automatic index increment for recreating an existing marker
 * @param {Number} opt_currentIcon Override current icon for recreating existing marker
 */
PolygonControl.prototype.createPolygon = function(coords, html, opt_currentIndex, opt_currentStyle){
  var me = this, Options = me.Options;
  var isNewPolygon = (typeof(opt_currentIndex) === "number") ? false : true;
  var index = (isNewPolygon) ? me.storage.length : opt_currentIndex;
  var savedStyle = opt_currentStyle || Options.newGeometryOptions;
  var polygon = me.newGPolygon(coords, savedStyle);
  polygon.index = index;
  polygon.savedStyle = savedStyle;
  polygon.unsavedStyle = {};
  
  me.addGeometryListeners(polygon, html);
 
  //store poly and if its a new poly, create a new Geometry object, otherwise, update storage with modified poly. 
  if (isNewPolygon) {
    me.storage[index] = new me.zuper.beans.Geometry({
        type:me.type,
        geometry:polygon
    });
  } else {
    me.storage[index].geometry = polygon;
  }
  return polygon;
};

/**
 * Add's listeners to a geometry. Separated from geometry creation function for easier extension and overriding
 * @param {GPolygon} polygon The polygon to which to attach listeners
 * @param {String} html The html content for infoWindow
 */
PolygonControl.prototype.addGeometryListeners = function(polygon, html){
  var me = this, opts = me.Options.geometryListenerOpts, map = me.zuper.map;

  if (opts.mouseoverEditingEnabled) {
    GEvent.addListener(polygon,"mouseover",function(){
      polygon.enableEditing();  
    });
    GEvent.addListener(polygon,"mouseout",function(){
      polygon.disableEditing();
    });
  }
  if (opts.infoWindowHtmlEnabled && !opts.infoWindowTabsEnabled) {
    GEvent.addListener(polygon,"click",function(para) {
      var latlng = para || polygon.getBounds().getCenter();
      map.openInfoWindowHtml(latlng,html);
      me.bindInfoWindow(polygon);
    });
  }
  if(opts.infoWindowTabsEnabled && !opts.infoWindowHtmlEnabled){
    GEvent.addListener(polygon,"click",function(para) {
      var latlng = para || polygon.getBounds().getCenter();
      map.openInfoWindowTabs(latlng,me.infoWindowTabs);
      me.bindInfoWindow(polygon);
    });
  }      
  if(opts.mouseoverHighlightingEnabled){
    GEvent.addListener(polygon,"mouseover",function(){
      polygon.setFillStyle({
        opacity:(polygon.unsavedStyle.fillOpacity || polygon.savedStyle.fillOpacity) + 0.3
      });
    });
    GEvent.addListener(polygon,"mouseout",function(){
      polygon.setFillStyle({
        opacity:(polygon.unsavedStyle.fillOpacity || polygon.savedStyle.fillOpacity)
      });
    });  
  }

  //pass polygon on to optional geometry listeners
  if(me.Options.optionalGeometryListeners){
    me.Options.optionalGeometryListeners(polygon);
  }
  
  //expose the object to aop functions
  return polygon;
};

/**
 * BindInfoWindow - implement any specific behaviors, then invoke super bindIndoWindow for behaviors in infoWindow
 * @param {GPolygon} polygon The polygon to which to bind behaviors
 * @see GeometryControls#bindInfoWindow
 */
PolygonControl.prototype.bindInfoWindow = function(polygon){
  var me = this, Options = me.Options, index = polygon.index;
  
  //update the style link display
  var styleLink = (me.zuper.isIE) ? get$("msiwsi").childNodes[0] : get$("msiwsi").childNodes[1];  //TODO IE wants 0, firefox wants 1??
  styleLink.style.backgroundColor = polygon.savedStyle.fillColor;

  //call super method
  me.zuper.bindInfoWindow({
    index:index,
    storage:me.storage,
    geometryStyleFunc:function(){
      me.bindStyleInfoWindow(index);
    },
    //stores value for an undo
    undoStyling:function(){
      me.changeStyling(index,polygon.savedStyle);
      polygon.unsavedStyle = {};
    },
    commitStyling:function(){
      //check for any entries in unsavedStyle, and copy to savedStyle
      for (var p in polygon.unsavedStyle){
        polygon.savedStyle[p] = polygon.unsavedStyle[p];
      }
      polygon.unsavedStyle = {};
      //update global current style //TODO have option for this??
      for(var o in polygon.savedStyle){
        Options.newGeometryOptions[o] = polygon.savedStyle[o];
      }
    }
  });
};

/**
 * Binds Info Window for Polygon Styling (change colors, widths, opacity, etc)
 * @param {Integer} index The index of this geometry in the storage variable
 * @see #bindInfoWindow
 */
PolygonControl.prototype.bindStyleInfoWindow = function(index){
  var me = this, cssId = me.zuper.Options.cssId;
  
  //reference to the shape styles
  var geometry = me.storage[index].geometry;
  var savedStyle = geometry.savedStyle;
  var unsavedStyle = geometry.unsavedStyle;
  var lineColor = get$(cssId + "-line-color");
  var lineWidth = get$(cssId + "-line-width");
  var lineOpacity = get$(cssId + "-line-opacity");
  var fillColor = get$(cssId + "-fill-color");
  var fillOpacity = get$(cssId + "-fill-opacity");
  var geomStyleDiv = get$(cssId + "-style");
  
  //set colors and values for shape style
  lineColor.style.backgroundColor = unsavedStyle.strokeColor || savedStyle.strokeColor;
  lineWidth.value = geometry.getStrokeWeight();
  lineOpacity.value = geometry.getStrokeOpacity();
  fillColor.style.backgroundColor = unsavedStyle.fillColor || savedStyle.fillColor;
  fillOpacity.value = geometry.getFillOpacity();
    
  //bind color inputs, that change color of geometry automatically
  GEvent.addDomListener(lineColor,"click",function(){
    me.zuper.showColorPicker({
      target:lineColor,
      callback:function(color){
        me.changeStyling(index,{strokeColor:color});
      }
    });
  });
  GEvent.addDomListener(fillColor,"click",function(){
    me.zuper.showColorPicker({
      target:fillColor,
      callback:function(color){
        me.changeStyling(index,{fillColor: color});
      }
    });
  });
  
  //bind back link
  GEvent.addDomListener(get$("emmc-geom-style-back"),"click",function(){  
    //revert to stored style. Only these properties need to be reverted, because they are applied without hitting the ok button
    me.changeStyling(index,{
      stroke:{color:savedStyle.strokeColor},
      fill:{color:savedStyle.fillColor}
    });
    geomStyleDiv.style.display = "none";   
  }); 
  
  //bind "Ok" link
  GEvent.addDomListener(get$("emmc-msls-ok"),"click",function(){
    var hackMemoryLeakFix = parseInt(geometry.setStrokeWeight(lineWidth.value)); //TODO - have no idea why giving this value to the function directly, creats a memory leak in Chrome
    me.changeStyling(index,{
      strokeWeight: hackMemoryLeakFix,
      strokeOpacity: geometry.setStrokeOpacity(lineOpacity.value),
      fillOpacity: geometry.setFillOpacity(fillOpacity.value),
      strokeColor:lineColor.style.backgroundColor,
      fillColor:fillColor.style.backgroundColor
    });
    //update the style link display
    var styleLink = (me.zuper.isIE) ? get$("msiwsi").childNodes[0] : get$("msiwsi").childNodes[1]; //ie wants 0, firefox wants 1
    styleLink.style.backgroundColor = fillColor.style.backgroundColor;
    geomStyleDiv.style.display = "none";
  }); 
};

/**
 * Function that changes styles of the poly that are not set immediately (like colors).
 * @param {Integer} index The index of the geometry in the storage array
 * @param {Object} styles 
 * @see #bindStyleInfoWindow
 * @required
 */
PolygonControl.prototype.changeStyling = function(index,styles){
  var me = this;
  var geometry = me.storage[index].geometry;   
  
  //serialize from standard shape options to short names used in options
  //@see GPolyStyleOptions
  if(styles){
    var stroke = {}, strokeFlag = false, fill = {}, fillFlag = false;
    for(var style in styles){
      if(style.indexOf("stroke") > -1){
        var shortName = style.replace("stroke","").toLowerCase();
        stroke[shortName] = strokeFlag = styles[style];
      }
      if(style.indexOf("fill") > -1){
        var shortName = style.replace("fill","").toLowerCase();
        fill[shortName] = fillFlag = styles[style];
      }
    }
    
    //TODO dont use flag, check if object is empty
    if(strokeFlag){
      geometry.setStrokeStyle(stroke);
    }
    if(fillFlag){
      geometry.setFillStyle(fill);
    }
    
    //update unsavedStyles
    for(var o in styles){
      geometry.unsavedStyle[o] = styles[o];
    }
        
  }
  
  //style.replace(/\b[a-z]/g,style[0].toUpperCase()); //capitalizes first letter
};

/**
 * TODO, a mouseover/out implementation for better tooltips (on the polygons)
 * @param {Object} index
 */
PolygonControl.prototype.hoverTooltip = function(){
 //
};

/**
 * Loads polygons from json
 * @param {Object} record The json representation of polygon
 */
PolygonControl.prototype.loadPolygons = function(record){
  var me = this;
  var polygon = me.createPolygon(record.coordinates,me.infoWindowHtml,false,record.style);
  me.storage[polygon.index].title = [record.title,record.title];
  me.storage[polygon.index].description = [record.description,record.description];
  me.zuper.map.addOverlay(polygon); 
  return polygon;
};

/**
 * Convenience method to be able to pass in options as an object
 * @param {Array} coords An array of GLatLngs 
 * @param {Object} opts An object with the standard opts for a GPolygon
 */
PolygonControl.prototype.newGPolygon = function(coords, opts){
  return new GPolygon(coords, opts.strokeColor, opts.strokeWeight, opts.strokeOpacity, opts.fillColor, opts.fillOpacity, opts.opts);
};

/**
 * Convenience add getter/setters for objects that need translation between stored and displayed value
 * And do basic input validation (and revert to stored values if values are invalid)
 * Note: if these methods are eventually added to the api, then these methods will need to be updated
 * to use call() to access super method.
 */
PolygonControl.prototype.extendGPolygon = function(){
  GPolygon.unsavedStyle = {};
  GPolygon.savedStyle = {};
    
  GPolygon.prototype.getStrokeWeight = function(){
    return (this.unsavedStyle.strokeWeight || this.savedStyle.strokeWeight);
  };

  GPolygon.prototype.setStrokeWeight = function(weight){
    if(!isNaN(weight)){
      this.unsavedStyle.strokeWeight = (weight > 20) ? 20 : (weight < 1) ? 1 : weight;
    } else {
      this.unsavedStyle.strokeWeight = this.savedStyle.strokeWeight;
    }
    return this.unsavedStyle.strokeWeight || this.savedStyle.strokeWeight;
  };
  
  GPolygon.prototype.getStrokeOpacity = function(){
      return (this.unsavedStyle.strokeOpacity || this.savedStyle.strokeOpacity) * 100;
  };
  
  GPolygon.prototype.setStrokeOpacity = function(opacity){
      if(!isNaN(opacity)){
        var storedOpacity = (opacity > 100) ? 100 : (opacity < 0) ? 0 : opacity;
        this.unsavedStyle.strokeOpacity = storedOpacity / 100;
      } else {
        this.unsavedStyle.strokeOpacity = this.savedStyle.strokeOpacity;
      }
      return this.unsavedStyle.strokeOpacity || this.savedStyle.strokeOpacity;
  };
  
  GPolygon.prototype.getFillOpacity = function(){
      return (this.unsavedStyle.fillOpacity || this.savedStyle.fillOpacity) * 100;
  };
  
  GPolygon.prototype.setFillOpacity = function(opacity){
    if(!isNaN(opacity)){
       var storedOpacity = (opacity > 100) ? 100 : (opacity < 0) ? 0 : opacity;
       this.unsavedStyle.fillOpacity = storedOpacity / 100; 
    } else {
        this.unsavedStyle.fillOpacity = this.savedStyle.fillOpacity;
    }
    return this.unsavedStyle.fillOpacity || this.savedStyle.fillOpacity; 
  };    
};



