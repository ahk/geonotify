/**
 * Main Map Script
 */
var geometryControls; //for testing, give firebug access
var markerControl; //ditto
var polygonControl;
var polylineControl;

GEvent.addDomListener(window,"load",function(){
  if (GBrowserIsCompatible()) {
  
    var map = new GMap2(document.getElementById("map_canvas"));
    map.setCenter(new GLatLng(37.88, -122.442626), 10);
    map.addControl(new GLargeMapControl());
    map.addControl(new GHierarchicalMapTypeControl());
    map.addMapType(G_PHYSICAL_MAP);
    map.addMapType(G_SATELLITE_3D_MAP);
    map.enableScrollWheelZoom();
		
    geometryControls = new GeometryControls();
    markerControl = new MarkerControl();
    polygonControl = new PolygonControl();
    polylineControl = new PolylineControl();
    geometryControls.addControl(markerControl);
    geometryControls.addControl(polygonControl);
    geometryControls.addControl(polylineControl);
    map.addControl(geometryControls);
    
    geometryControls.loadData({
      type:"json",
      url:"data/testdata.js"
    });
    
    geometryControls.loadData({
      type:"kml",
      url:"data/example.xml"
    });
    
    //for testing
   geometryControls.Options.autoSave = false;    
  }
});

GEvent.addDomListener(window,"unload",function(){
	GUnload();
});

/**
 * Toggles the autoSaveProperty which determines if ajax post requests are made
 * after changing geometries
 * For testing only
 * @param {Object} button
 */
function mockAutoSave(button){
  if(button.value.indexOf("On") > -1){
    geometryControls.Options.autoSave = true;
    button.value = "Turn AutoSave Off";
  } else {
    geometryControls.Options.autoSave = false;
    button.value = "Turn AutoSave On";
  }
}