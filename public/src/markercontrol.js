/**
* MarkerControl Class v0.3
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
* This class lets you add a marker control to the GeometryControls framework.
*/

/**
 * Constructor for MarkerControl, which is used for creating/digitizing polylines.
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
 *     @param {String} tooltip.titles Titles used for tooltip
 *   @param {Object} newGeometryOptions The options used when creating new geometries
 *     @param {GIcon} newGeometryOptions.icon The icon to use
 *     @param {Boolean} newGeometryOptions.dragCrossMove Move cross downwards or upwards
 *     @param {String} newGeometryOptions.title The title to use
 *     @param {Boolean} newGeometryOptions.clickable Is the geometry clickable
 *     @param {Boolean} newGeometryOptions.draggable Is the geometry draggable
 *     @param {Boolean} newGeometryOptions.bouncy Is the geometry bouncy
 *     @param {Integer} newGeometryOptions.bounceGravity The acceleration rate of the bounce
 *     @param {Boolean} newGeometryOptions.autoPan Does map autopan
 *   @param {Boolean} multiEdit Determines whether one can add multiple geometries at once (rather than having the control turn off after each addition)
 *   @param {Object} htmlTemplateParams Optional data object for html template 
 *   @param {String} cssId The prefix used for id's in the css
 *   @param {Function} optionalGeometryListeners Optional function to add additional listeners to geometries 
 *   @param {Boolean} autoSave Determines whether saving geometry data also triggers a post to a DB
 */
function MarkerControl(opt_opts) {
  var me = this;
  me.type = "point"; //standardize between point and marker?
  me.name = "markerControl"; //inheriting from GControl overrides the default constructor name, so we need this instead. Do Not Override
  me.zuper = null; //is set when passed to GeometryControls.addControl()  
  me.clickHandler = null;
  me.icons = {
    standard:new GIcon(G_DEFAULT_ICON,"images/blue-dot.png")
  };
  me.infoWindowHtml = "";
  
  /**
  * Arrays are used for storage.
  * Remember to check for nulls when exporting data
  * Markers are tied to their index, so entries are cleared, not deleted
  * @see GeometryControls#beans#Geometry For expected structure of storage entries
  */
  me.storage = [/*array of GeometryControls#beans#Geometry*/];
  
  //self documenting object with default settings specific for MarkerControl
  me.Options = {
    button_opts:{
      img_up_url:'http://www.google.com/intl/en_us/mapfiles/ms/t/Bmu.png',
      img_down_url:'http://www.google.com/intl/en_us/mapfiles/ms/t/Bmd.png',
      name:'point', //TODO still need this?
      tooltip:'Add a placemark'
    },
    position:{
      controlPosition:[175,3]
    },
    tooltip:{
      anchor:[-30,-8],
      cursor_on: "url(images/blue-dot.cur),default",
      cursor_off:"url(http://maps.google.com/intl/en_us/mapfiles/openhand.cur),default",
      title:"Click on the map to create a new marker"
    },
    newGeometryOptions:{ 
      icon:me.icons.standard,
      dragCrossMove:false,
      title:"Drag to move this placemark",
      clickable:true,
      draggable:true,
      bouncy:false,
      bounceGravity:1,
      autoPan:true
      //zIndexProcess 
    },
    multiEdit:false,
    htmlTemplateParams:{},
    cssId:"emmc-marker",
    optionalGeometryListeners:null, /*GEvent.addListener(marker,"dragend", function(){});*/ //TODO need to save position
    autoSave:false 
  };
  
  //overide the default marker options
  if(typeof(opt_opts)!="undefined"){
  	for (var o in opt_opts) {
      if(typeof(opt_opts[o]) === "object"){
        for (var p in opt_opts[o]){
          me.Options[o][p] = opt_opts[o][p]; //if deeper cloning is needed, rewrite with recursion
        }  
      } else {
        me.Options[o] = opt_opts[o];  
      }  		
  	}
  } else {
  	//me.zuper.debug("??");
  }
  
};

MarkerControl.prototype = new GControl();

/**
 * Expected by GControl
 */
MarkerControl.prototype.getDefaultPosition = function(){
  var me = this;
  return me.zuper.getDefaultPosition(me.Options.position);
};

/**
 * Extend for marker specific implementation
 * @param {GMap2} map The map that has had this ExtMapTypeControl added to it.
 * @return {DOM Object} Div that holds the control
 */ 
MarkerControl.prototype.initialize = function(map){
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
MarkerControl.prototype.runInitFunctions = function(){
  var me = this;
  me.tooltip();
  me.assembleInfoWindowHtml(me.Options.htmlTemplateParams);
};

/**
 * Starts digitizing process, turns on tooltip, calls function for geometry creation
 */
MarkerControl.prototype.startDigitizing = function() {
  var me = this, zuper = me.zuper, map = zuper.map;
  me.tooltip.on(me.Options.tooltip.title);
  me.clickHandler = GEvent.addListener(map, "click", function(overlay,latlng){
    var marker = me.createMarker(latlng,me.infoWindowHtml);
    map.addOverlay(marker);
            
    if (!me.Options.multiEdit) {
      me.stopDigitizing();
      GEvent.trigger(marker,"click"); //open the infowindow
      //TODO need hook here for custom callbacks?
    } else {
      //TODO default behavior for multi edits??
    }
    
  });
};

/**
 * Ends digitizing of a geometry, removes editing listeners, turns off tooltip, and removes geometry overlay
 * TODO candidate for moving entirely to zuper
 * @param {Boolean} toggleButtons If toggleButtons is true, then the geometry control buttons state is reset. 
 */
MarkerControl.prototype.stopDigitizing = function(toggleButtons) {
  var me = this;
  try{GEvent.removeListener(me.clickHandler);}catch(e){};
  me.tooltip.off();
  if (toggleButtons !== false) {
    me.zuper.toggleButtons();
  }
};

/**
 * Creates instance of tooltips for MarkerControl, which replaces the function below
 * @see GeometryControls#tooltipFactory
 */
MarkerControl.prototype.tooltip = function(){
  var me = this;  
  var tooltip = me.zuper.tooltipFactory(me.Options.tooltip);  
  //note this function is being redefined by the tooltip object from zuper
  me.tooltip = tooltip;
  return tooltip;
};

/**
 * Assembles html fragments from geometry html template file at initialization
 */
MarkerControl.prototype.assembleInfoWindowHtml = function(dataObject){
  var me = this, zuper = me.zuper, zuperHtml = zuper.infoWindowHtmlTemplates;
  dataObject = dataObject || {};
  dataObject["geometry_style_link"] = zuperHtml["geometry_style_link_params"][0]["marker"];
  me.infoWindowHtml = zuper.parseMicroTemplate("template_1",dataObject,zuperHtml["template_1"]) + zuperHtml["marker_2"];
};

/**
 * Creates (and recreates) markers
 * @param {GLatLng} latlng Location of new marker
 * @param {String} html The html content for the marker
 * @param {Number} opt_currentIndex Override automatic index increment for recreating an existing marker
 * @param {GIcon} opt_currentIcon Override current icon for recreating existing marker
 */
MarkerControl.prototype.createMarker = function(latlng, html, opt_currentIndex, opt_currentIcon){
  var me = this, Options = me.Options;
  var isNewMarker = (typeof(opt_currentIndex) === "number") ? false : true;
  var index = (isNewMarker) ? me.storage.length : opt_currentIndex;
  var marker = new GMarker(latlng, Options.newGeometryOptions);   //option to set title or other info when used to create markers can be set in opts.newGeometryOptions
  marker.index = index;
  //TODO - refactor using a full storedOptions object?
  //marker.storedOptions = opts.newGeometryOptions;
  //marker.storedOptions.icon = opt_currentIcon || opts.newGeometryOptions.icon;
  marker.storedIcon = opt_currentIcon || Options.newGeometryOptions.icon;
  me.addGeometryListeners(marker,html); 
 
  //store marker and if its a new marker, create an array to store marker info
  if (isNewMarker) {
    me.storage[index] = new me.zuper.beans.Geometry({
        type:"point",
        geometry:marker
    });
  } else {
    me.storage[index].geometry = marker;
  }  
  return marker;
};

/**
 * Add's listeners to a geometry. Separated from geometry creation function for easier extension and overriding
 * @param {GMarker} marker The marker to which to attach listeners
 * @param {String} html The html content for infoWindow
 */
MarkerControl.prototype.addGeometryListeners = function(marker, html){
  var me = this;
  GEvent.addListener(marker, "click", function() {
    marker.openInfoWindowHtml(html);
    me.bindInfoWindow(marker);
  });
  
  if(me.Options.optionalGeometryListeners){
    me.Options.optionalGeometryListeners();
  }
};

/**
 * TODO, a mouseover/out implementation for better tooltips (popup instantly)
 * @param {Object} index
 */
MarkerControl.prototype.markerTooltip = function(){
  //
};

/**
 * BindInfoWindow - implement any specific behaviors, then invoke super bindIndoWindow for behaviors in infoWindow
 * @param {GMarker} marker The marker/infoWindow to be bound
 * @see GeometryControls#bindInfoWindow
 */
MarkerControl.prototype.bindInfoWindow = function(marker){
  var me = this, Options = me.Options, index = marker.index;
  
  //update the style link display
  var styleLink = (me.zuper.isIE) ? get$("msiwsi").childNodes[0] : get$("msiwsi").childNodes[1];
  var markerIcon = marker.getIcon();
  styleLink.setAttribute("src",markerIcon.image);
  styleLink.style.width = markerIcon.iconSize.width + "px";     //TODO scale these values?
  styleLink.style.height = markerIcon.iconSize.height + "px"; 
      
  //call super method
  me.zuper.bindInfoWindow({
    index:index,
    storage:me.storage,
    geometryStyleFunc:function(){
      me.bindStyleInfoWindow(index);
    },
    //stores value for an undo
    undoStyling:function(){
      me.changeStyling(index,marker.storedIcon);
    },
    commitStyling:function(){
      marker.storedIcon = new GIcon(Options.newGeometryOptions.icon);
    }
  });
};

/**
 * Binds Info Window for Marker Styling (change icons, etc)
 * @param {Integer} index The index of the marker in the storage array
 * @see #bindInfoWindow
 */
MarkerControl.prototype.bindStyleInfoWindow = function(index){
  var me = this;
  
  //dom node traversal for marker icons
  var iconImages = get$("msim-icons").getElementsByTagName("img");
  
  //reference to the marker
  var marker = me.storage[index].geometry;
  
  for(var i=0; i<iconImages.length; i++){
    var iconImage = iconImages[i];
    
    //add hover effect
    GEvent.addDomListener(iconImage,"mouseover",function(){
      this.style.borderColor = "#3D69B1";
    });
    GEvent.addDomListener(iconImage,"mouseout",function(){
      this.style.borderColor = "#FFFFFF";
    });
    
    //change marker's icon
    GEvent.addDomListener(iconImage,"click",function(){
      //determine icon from markerIcon multidimensional array
      var position = this.style.backgroundPosition.split(" ");
      var x = Math.abs(position[0].split("px")[0]) / 32;
      var y = Math.abs(position[1].split("px")[0]) / 32;        
      
      var markerIcon = me.checkIconStatus(x,y);         
      
      me.changeStyling(index,me.icons[markerIcon.name]);       

      //TODO use setImage for existing icons instead of recreate in #changeStyling?
      //me.storage[index].geometry.setImage(url?+markerIcon.images[x]);              
    });
  }
};

/**
 * Check if named icon from html(data) download exists. 
 * If not create a new icon, else change its image
 * TODO support for used created icons
 * @param {Integer} x Index in the marker images array
 * @param {Integer} y Index in the marker icon arrary
 * @return {GIcon}
 */
MarkerControl.prototype.checkIconStatus = function(x,y){
  var me = this, zuperInfoWindow = me.zuper.infoWindowHtmlTemplates;
  
  //check if "y" position in loaded icons is defined, otherwise, take the last defined icon (should be kml) 
  var markerIcon = zuperInfoWindow["markerIcons"][y] || zuperInfoWindow["markerIcons"][zuperInfoWindow["markerIcons"].length-1];

  //determine source of icons, then switch icon image or create icon
  switch(true){
    case (markerIcon.name !== "kml") :
      if(typeof(me.icons[markerIcon.name]) === "undefined"){
        me.createIcon(markerIcon,x);
      } else {
        me.icons[markerIcon.name].image = markerIcon.imageUrl + markerIcon.images[x];
      }        
    break;
    case (markerIcon.name === "kml") :     
      var imageUrl = markerIcon.imageUrl + "pal" + (y-1) + "/icon" + x;
      if(typeof(me.icons[markerIcon.name]) === "undefined"){
        markerIcon.shadow = imageUrl + "s.png";
        me.createIcon(markerIcon, imageUrl + ".png");
      } else {
        me.icons[markerIcon.name].image = imageUrl + ".png";
      }
    break;
  } 
    
  return markerIcon;  
  //TODO extend for custom sprite-based icons?
};

/**
 * Function that changes style of marker
 * @param {Integer} index The index of the geometry in the storage array
 * @param {GIcon} icon The GICon to use for the marker
 * @see #bindInfoWindow
 * @see #bindStyleInfoWindow
 * @required
 */
MarkerControl.prototype.changeStyling = function(index,icon){
  var me = this, map = me.zuper.map;
  var marker = me.storage[index].geometry;     
  
  //reset global current icon (and without referencing original icon)
  me.Options.newGeometryOptions.icon = new GIcon(icon); 
  
  //recreate with new icon
  map.removeOverlay(marker); 
  var newMarker = me.createMarker(marker.getLatLng(),me.infoWindowHtml,index,marker.getIcon());      
  map.addOverlay(newMarker); 
  GEvent.trigger(newMarker,"click");
};

/**
 * CreateIcon - an Icon factory method for creating new icons, which are automatically stored in #MarkerControl.icons object
 * @param {Object} opts
 *   @param {String} name - name of the icon
 *   @param {Array} iconSize - icon width and height, respectively
 *   @param {String} shadow - url of the shadow image
 *   @param {Array} shadowSize - shadow width and height, respectively
 *   @param {Array} anchor - x and y position of icon anchor
 *   @param {Array} wAnchor - x and y postition of infoWindow anchor
 *   @param {Array} images - array of alternate images for icon
 *   @param {String} imageRef - image url, either the numeric position in "images" array or a full url
 */
MarkerControl.prototype.createIcon = function(opts,imageRef){
	var me = this;
	var icon = new GIcon();
  icon.image = (!isNaN(parseInt(imageRef))) ? opts.imageUrl+opts.images[imageRef] : imageRef;
  if(opts.shadow){
		icon.shadow = opts.shadow;
		icon.shadowSize = new GSize(opts.shadowSize[0],opts.shadowSize[1]);
	}
	icon.iconSize = new GSize(opts.iconSize[0], opts.iconSize[1]);
	icon.iconAnchor = new GPoint(opts.anchor[0], opts.anchor[1]);
	icon.infoWindowAnchor = new GPoint(opts.wAnchor[0], opts.wAnchor[1]);
  icon.dragCrossAnchor = (typeof(opts.dragCrossAnchor)!=="undefined")?new GPoint(opts.dragCrossAnchor[0],opts.dragCrossAnchor[1]):new GPoint(7,8);
	icon.transparent = opts.transparent || "";
	//TODO doesn't work for version 2.x at the moment. (havent checked lately)
	//icon.imageMap = opts.imageMap;
  //custom property
  icon.name = opts.name;
	me.icons[opts.name] = icon;
};

/**
 * LoadMarkers - loads markers from kml or json, tries to resolve style to existing icon
 * @param {record} - json representation of marker
 */
MarkerControl.prototype.loadMarkers = function(record){
  var me = this;
   
  var markerIcon = me.checkIconStatus(record.style.icon.x,record.style.icon.y);
  me.Options.newGeometryOptions.icon = new GIcon(me.icons[markerIcon.name]); //could this be combined with MarkerControl#checkIconStatus?
  
  //override other Options?
  var marker = me.createMarker(new GLatLng(record.coordinates[0].lat,record.coordinates[0].lng),me.infoWindowHtml);
  me.storage[marker.index].title = [record.title,record.title];
  me.storage[marker.index].description = [record.description,record.description];
  me.zuper.map.addOverlay(marker); 
  return marker;   
};

