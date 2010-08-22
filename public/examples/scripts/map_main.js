
var geometryControls; //for testing, give firebug access
var markerControl; //ditto
var polygonControl;

$(function(){
	GEvent.addDomListener(window,"load",function(){
	  if (GBrowserIsCompatible()) {
  
	    var map = new GMap2(document.getElementById("map_canvas"));
	    map.setCenter(new GLatLng(47.6062095, -122.3320708), 10);
	    map.addControl(new GLargeMapControl());
	    map.addControl(new GHierarchicalMapTypeControl());
	    map.addMapType(G_PHYSICAL_MAP);
	    map.addMapType(G_SATELLITE_3D_MAP);
	    map.enableScrollWheelZoom();
		
	    geometryControls = new GeometryControls();
	    polygonControl = new PolygonControl();
	    geometryControls.addControl(polygonControl);
	    map.addControl(geometryControls);
    
	    //for testing
	   geometryControls.Options.autoSave = false;    
	  }
	});

	GEvent.addDomListener(window,"unload",function(){
		GUnload();
	});
});