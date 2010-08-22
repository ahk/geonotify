/**
* PolylineControl Class v0.1
*  Copyright (c) 2008
*  Author: Chris Marx
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
* This class lets you add a polyline control for digitizing polylines to the GeometryControls framework.
*/

/**
 * Constructor for PolylineControl, which is used for creating/digitizing polylines.
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
 *     @param {Object} opts
 *       @param {Boolean} opts.clickable Is geometry clickable
 *       @param {Boolean} opts.geodesic Is the line geodesic
 *   @param {Boolean} multiEdit Determines whether one can add multiple geometries at once (rather than having the control turn off after each addition)
 *   @param {Object} htmlTemplateParams Optional data object for html template 
 *   @param {String} cssId The prefix used for id's in the css
 *   @param {Function} optionalGeometryListeners Optional function to add additional listeners to geometries 
 *   @param {Boolean} autoSave Determines whether saving geometry data also triggers a post to a DB
 *   @param {Boolean} executeClassExtensions Should the class extenstions function be executed
 */
function PolylineControl(opt_opts) {
  var me = this;
  me.type = "polyline";
  me.name = me.type + "Control";
  me.zuper = null;
  me.digitizerShape = null;
  me.editLineHandler = null;
  me.endLineHandler = null;
  me.infoWindowHtml = "";
  me.styles = {
    standard:{}//TODO
  };
  
  /**
  * Array used for storage. Remember to check for nulls when exporting data
  * Geometries are tied to their index, so entries are cleared, not deleted
  * titles/descriptions are stored as [][0,1] with 0,1 entries for current/previous values
  */
  me.storage = [/*array of GeometryControls#beans#Geometry*/];
  
  //self documenting object with default settings
  me.Options = {
    button_opts:{
      img_up_url:'http://www.google.com/intl/en_us/mapfiles/ms/t/Blu.png',
      img_down_url:'http://www.google.com/intl/en_us/mapfiles/ms/t/Bld.png',
      name:'polyline',
      tooltip:'Draw a line'
    },
    position:{
      controlPosition:[210,3]
    },
    tooltip:{
      anchor:[-30,-8],
      cursor_on:"", //only for overriding default digitizing cursor
      cursor_off:"",
      /**
       * Polyline titles are different from marker or polygon titles, because distance is reported in the tooltip. 
       * Note: the tooltip function targets the first childNode (0ft || &nbsp;) and is necessary for proper functioning
       */
      titles:{
          start: "0ft<br/>Click to start drawing a line",
          middle: "&nbsp;<br/>Click to continue drawing a line",
          end: "&nbsp;<br/>Click a vertex once, or double click on the map to end this line"
      },
      /**
       * @see GeometryControls#tooltipFactory
       * @param {GLatLng} latlng Latlng from mousemove listener 
       * @param {DOM Element} tooltipContainer The div container used by tooltip
       */
      callback:function(latlng,tooltipContainer){        
        if (me.digitizerShape.getVertexCount() > 0) {
          tooltipContainer.childNodes[0].data = me.zuper.convertFromMetric(
            me.digitizerShape.getVertex(me.digitizerShape.getVertexCount() - 1).distanceFrom(latlng),
            me.digitizerShape.getLength()
          );          
        }
      }
    },
    newGeometryOptions: { 
      strokeColor:"#0000FF",
      strokeWeight:3,
      strokeOpacity:0.25,
      opts:{
        clickable:true,
        geodesic:false
      }
    },
    multiEdit:false, //need this for polys?
    htmlTemplateParams:{},
    cssId:"emmc-polygon",
    optionalGeometryListeners:null,
    autoSave:false,
    executeClassExtensions:true     
  };
  
  //overide the default marker options
  if(typeof(opt_opts)!="undefined"){
  	for (var o in opt_opts) {
      if(typeof(opt_opts[o]) === "object"){
        for (var p in opt_opts[o]){
          me.polygonOptions[o][p] = opt_opts[o][p];
        }  
      } else {
        me.polygonOptions[o] = opt_opts[o];  
      }  		
  	}
  } else {
  	//me._super.debug("??");
  }
};

PolylineControl.prototype = new GControl();

/**
 * Expected by GControl, sets control position 
 */
PolylineControl.prototype.getDefaultPosition = function(){
  var me = this;
  return me.zuper.getDefaultPosition(me.Options.position);
};

/**
 * Extend for polygon specific implementation
 * @param {GMap2} map The map that has had this ExtMapTypeControl added to it.
 * @return {DOM Object} Div that holds the control
 */ 
PolylineControl.prototype.initialize = function(map){
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
PolylineControl.prototype.runInitFunctions = function(){
  var me = this;
  
  me.tooltip();
  me.assembleInfoWindowHtml(me.Options.htmlTemplateParams); 
  me.extendGPolyline();
  
  //check for any extended functions
  if(me.Options.executeClassExtensions){
    me.extendBaseClass();
  }
};

/**
 * Starts digitizing process, turns on tooltip, calls function for geometry creation
 * @see #newGPolyline
 * @see #extendBaseClass Important! must annotate AOP extensions, otherwise you will be in pain later on...
 */
PolylineControl.prototype.startDigitizing = function() {
  var me = this, zuper = me.zuper, map = zuper.map, Options = me.Options;
  me.tooltip.on(Options.tooltip.titles["start"], Options.tooltip.callback);
  me.digitizerShape = me.newGPolyline([], Options.newGeometryOptions);  
  map.addOverlay(me.digitizerShape);
  me.digitizerShape.enableDrawing({});
  
  //change the tooltip text while digitizing
  //TODO this handler is never cleared, does the GEvent release the memory?
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
  
  //create permanent polyline
  me.endLineHandler = GEvent.addListener(me.digitizerShape,"endline",function(latlng){
    var coords = [];
    for(var i=0;i<me.digitizerShape.getVertexCount();i++){
      coords[i] = me.digitizerShape.getVertex(i);
    }
    var polyline = me.createPolyline(coords, me.infoWindowHtml); 
    map.addOverlay(polyline);    
            
    //TODO would allow for multiple additions of polylines (need this??)
    if (!Options.multiEdit) {
      me.stopDigitizing();
      GEvent.trigger(polyline,"click"); //open the infowindow
    } else {
      //TODO default behavior for multi edits??
    }    
  });
};

/**
 * Ends digitizing of a poly, removes editing listeners, turns off tooltip, and removes poly overlay
 * TODO candidate for moving entirely to zuper
 * @param {Boolean} toggleButtons If toggleButtons is true, then the geometry control buttons state is reset. 
 */
PolylineControl.prototype.stopDigitizing = function(toggleButtons) {
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
 * Creates instance of tooltips for PolylineControl, which replaces the function below
 * @see GeometryControls#tooltipFactory
 */
PolylineControl.prototype.tooltip = function(){ 
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
 */
PolylineControl.prototype.assembleInfoWindowHtml = function(dataObject){
  var me = this, zuper = me.zuper, zuperHtml = zuper.infoWindowHtmlTemplates;
  dataObject = dataObject || {};
  dataObject["geometry_style_link"] = zuperHtml["geometry_style_link_params"][0][me.type];
  me.infoWindowHtml = zuper.parseMicroTemplate("template_1",dataObject,zuperHtml["template_1"]) + zuperHtml["polyline_2"];
};

/**
 * Creates (and recreates) polylines
 * @param {Array} coords An array of GLatLngs 
 * @param {String} html The html content for the infowindow 
 * @param {Number} opt_currentIndex Override automatic index increment for recreating an existing marker
 * @param {Number} opt_currentIcon Override current icon for recreating existing marker
 */
PolylineControl.prototype.createPolyline = function(coords, html, opt_currentIndex, opt_currentStyle){
  var me = this, opts = me.Options;
  var isNewPolyline = (typeof(opt_currentIndex) === "number") ? false : true;
  var index = (isNewPolyline) ? me.storage.length : opt_currentIndex;
  var savedStyle = opt_currentStyle || opts.newGeometryOptions;
  var polyline = me.newGPolyline(coords, savedStyle);
  polyline.index = index;
  polyline.savedStyle = savedStyle;
  polyline.unsavedStyle = {};
  
  me.addGeometryListeners(polyline, html);
 
  //store poly and if its a new poly, create a new Geometry object, otherwise, update storage with modified poly. 
  if (isNewPolyline) {
    me.storage[index] = new me.zuper.beans.Geometry({
        type:me.type,
        geometry:polyline
    });
  } else {
    me.storage[index].geometry = polyline;
  }
  return polyline;
};

/**
 * Add's listeners to a geometry. Separated from geometry creation function for easier extension and overriding
 * @param {GPolyline} polyline The polyline to which to attach listeners
 * @param {String} html The html content for infoWindow
 */
PolylineControl.prototype.addGeometryListeners = function(polyline, html){
  var me = this;
  
  polyline.enableEditing({onEvent: "mouseover"});
  polyline.disableEditing({onEvent: "mouseout"});
  GEvent.addListener(polyline,"click",function(para) {
    var latlng = para || polyline.getBounds().getCenter();
    me.zuper.map.openInfoWindowHtml(latlng,html);
    me.bindInfoWindow(polyline);
  });
  GEvent.addListener(polyline,"mouseover",function(){
    polyline.setStrokeStyle({
      opacity:(polyline.unsavedStyle.strokeOpacity || polyline.savedStyle.strokeOpacity) + 0.3
    });
  });
  GEvent.addListener(polyline,"mouseout",function(){
    polyline.setStrokeStyle({
      opacity:(polyline.unsavedStyle.strokeOpacity || polyline.savedStyle.strokeOpacity)
    });
  });
  
  if(me.Options.optionalGeometryListeners){
    me.Options.optionalGeometryListeners();
  }
  
  //expose the object to aop functions
  return polyline;
};

/**
 * TODO, a mouseover/out implementation for better tooltips (on the polylines)
 * @param {Object} index
 */
PolylineControl.prototype.hoverTooltip = function(){
 //
};

/**
 * BindInfoWindow - implement any specific behaviors, then invoke super bindIndoWindow for behaviors in infoWindow
 * @param {GPolyline} polyline The polyline to which to bind behaviors
 * @see GeometryControls#bindInfoWindow
 */
PolylineControl.prototype.bindInfoWindow = function(polyline){
  var me = this, opts = me.Options, index = polyline.index;
  
  //update the style link display
  var styleLink = (me.zuper.isIE) ? get$("msiwsi").childNodes[0].childNodes[0] : get$("msiwsi").childNodes[1].childNodes[0];  //TODO IE wants 0, firefox wants 1??
  styleLink.style.backgroundColor = polyline.savedStyle.strokeColor;

  //call super method
  me.zuper.bindInfoWindow({
    index:index,
    storage:me.storage,
    geometryStyleFunc:function(){
      me.bindStyleInfoWindow(index);
    },
    //stores value for an undo
    undoStyling:function(){
      me.changeStyling(index,polyline.savedStyle);
      polyline.unsavedStyle = {};
    },
    commitStyling:function(){
      //check for any entries in unsavedStyle, and copy to savedStyle
      for (var p in polyline.unsavedStyle){
        polyline.savedStyle[p] = polyline.unsavedStyle[p];
      }
      polyline.unsavedStyle = {};
      //update global current style //TODO have option for this??
      for(var o in polyline.savedStyle){
        me.Options.newGeometryOptions[o] = polyline.savedStyle[o];
      }
    }
  });
};

/**
 * Binds Info Window for Polygon Styling (change colors, widths, opacity, etc)
 * @param {Integer} index The index of this geometry in the storage variable
 * @see #bindInfoWindow
 */
PolylineControl.prototype.bindStyleInfoWindow = function(index){
  var me = this, cssId = me.zuper.Options.cssId;
  
  //reference to the shape styles
  var geometry = me.storage[index].geometry;
  var savedStyle = geometry.savedStyle;
  var unsavedStyle = geometry.unsavedStyle;
  var lineColor = get$(cssId + "-line-color");
  var lineWidth = get$(cssId + "-line-width");
  var lineOpacity = get$(cssId + "-line-opacity");
  var geomStyleDiv = get$(cssId + "-style");
  
  //set colors and values for shape style
  lineColor.style.backgroundColor = unsavedStyle.strokeColor || savedStyle.strokeColor;
  lineWidth.value = geometry.getStrokeWeight();
  lineOpacity.value = geometry.getStrokeOpacity();
    
  //bind color inputs, that change color of geometry automatically
  GEvent.addDomListener(lineColor,"click",function(){
    me.zuper.showColorPicker({
      target:lineColor,
      callback:function(color){
        me.changeStyling(index,{strokeColor:color});
      }
    });
  });
  
  //bind back link
  GEvent.addDomListener(get$("emmc-geom-style-back"),"click",function(){  
    //revert to stored style. Only these properties need to be reverted, because they are applied without hitting the ok button
    me.changeStyling(index,{
      stroke:{color:savedStyle.strokeColor}
    });
    geomStyleDiv.style.display = "none";   
  }); 
  
  //bind "Ok" link
  GEvent.addDomListener(get$("emmc-msls-ok"),"click",function(){
    var hackMemoryLeakFix = parseInt(geometry.setStrokeWeight(lineWidth.value)); //TODO - have no idea why giving this value to the function directly, creats a memory leak in Chrome
    me.changeStyling(index,{
      strokeWeight: hackMemoryLeakFix,
      strokeOpacity: geometry.setStrokeOpacity(lineOpacity.value),
      strokeColor:lineColor.style.backgroundColor
    });
    //update the style link display
    var styleLink = (me.zuper.isIE) ? get$("msiwsi").childNodes[0].childNodes[0] : get$("msiwsi").childNodes[1].childNodes[0]; //ie wants 0, firefox wants 1
    styleLink.style.backgroundColor = lineColor.style.backgroundColor;
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
PolylineControl.prototype.changeStyling = function(index,styles){
  var me = this;
  var geometry = me.storage[index].geometry;   
  
  //serialize from standard shape options to short names used in options
  //@see GPolyStyleOptions
  if(styles){
    var stroke = {}, strokeFlag = false;
    for(var style in styles){
      if(style.indexOf("stroke") > -1){
        var shortName = style.replace("stroke","").toLowerCase();
        stroke[shortName] = strokeFlag = styles[style];
      }
    }
    
    //TODO dont use flag, check if object is empty
    if(strokeFlag){
      geometry.setStrokeStyle(stroke);
    }
    
    //update unsavedStyles
    for(var o in styles){
      geometry.unsavedStyle[o] = styles[o];
    }
        
  }
  
  //style.replace(/\b[a-z]/g,style[0].toUpperCase()); //capitalizes first letter
};

/**
 * Loads polylines from json
 * @param {Object} record The json representation of polyline
 */
PolylineControl.prototype.loadPolylines = function(record){
  var me = this;
  var polyline = me.createPolyline(record.coordinates,me.infoWindowHtml,false,record.style);
  me.storage[polyline.index].title = [record.title,record.title];
  me.storage[polyline.index].description = [record.description,record.description];
  me.zuper.map.addOverlay(polyline); 
  return polyline;
};

/**
 * Convenience method to be able to pass in options as an object
 * @param {Array} coords An array of GLatLngs 
 * @param {Object} opts An object with the standard opts for a GPolyline
 */
PolylineControl.prototype.newGPolyline = function(coords, opts){
  return new GPolyline(coords, opts.strokeColor, opts.strokeWeight, opts.strokeOpacity, opts.opts);
};

/**
 * Convenience add getter/setters for objects that need translation between stored and displayed value
 * And do basic input validation (and revert to stored values if values are invalid)
 * Note: if these methods are eventually added to the api, then these methods will need to be updated
 * to use call() to access super method.
 */
PolylineControl.prototype.extendGPolyline = function(){
  GPolyline.unsavedStyle = {};
  GPolyline.savedStyle = {};
    
  GPolyline.prototype.getStrokeWeight = function(){
    return (this.unsavedStyle.strokeWeight || this.savedStyle.strokeWeight);
  };

  GPolyline.prototype.setStrokeWeight = function(weight){
    if(!isNaN(weight)){
      this.unsavedStyle.strokeWeight = (weight > 20) ? 20 : (weight < 1) ? 1 : weight;
    } else {
      this.unsavedStyle.strokeWeight = this.savedStyle.strokeWeight;
    }
    return this.unsavedStyle.strokeWeight || this.savedStyle.strokeWeight;
  };
  
  GPolyline.prototype.getStrokeOpacity = function(){
      return (this.unsavedStyle.strokeOpacity || this.savedStyle.strokeOpacity) * 100;
  };
  
  GPolyline.prototype.setStrokeOpacity = function(opacity){
      if(!isNaN(opacity)){
        var storedOpacity = (opacity > 100) ? 100 : (opacity < 0) ? 0 : opacity;
        this.unsavedStyle.strokeOpacity = storedOpacity / 100;
      } else {
        this.unsavedStyle.strokeOpacity = this.savedStyle.strokeOpacity;
      }
      return this.unsavedStyle.strokeOpacity || this.savedStyle.strokeOpacity;
  };   
};

/**
 * AOP Extensions to the PolylineControl Class
 * Put All Custom Behaviors here, so that you can swap in new versions of the file
 * And still have your customizations intact (perhaps they will need tweaking)
 */
PolylineControl.prototype.extendBaseClass = function(){
  var me = this, zuper = me.zuper, map = zuper.map;
  
  /**
   * Adds a distance readout to the tooltip during digitizing
   * @extends startDigitizing
   */
  var addEditingDistanceToTooltip = function(){    
   
    zuper.aop.addAfter(me, 'addGeometryListeners', function(result){
      var polyline = result; //result is the return value from original function
      var isTooltipOn = false;
      
      //currently there is no dragstart event. This should be used when it's added (hopefully...)
      /*GEvent.addListener(polyline,"dragstart",function(){
        me.tooltip.on(convertFromMetric(polyline.getLength()));
      });*/
      GEvent.addListener(polyline,"drag",function(){
        if(!isTooltipOn){
          me.tooltip.on();
          isTooltipOn = !isTooltipOn;
        }
        me.tooltip.tooltipContainer.innerHTML = zuper.convertFromMetric(polyline.getLength());
      });
      GEvent.addListener(polyline,"dragend",function(){
        me.tooltip.off();
        isTooltipOn = !isTooltipOn;
      });
    });
  }();
  
};

