var mymap;
var lyrOsm;
var lyrTopo;
var lyrImagery;
var mrkCurrentLocation;
var ctlAttribute;
var ctlScale;
var ctlPan;
//var ctlZoomslider;
var ctlMouseposition;
var ctlMeasure;
var ctlEasybutton;
var ctlSidebar;
var ctlSearch;
var ctlResults;
var ctlLayers;
var ctlBasemaps;
var ctlOverlays;

$(document).ready(function(){
    mymap = L.map('map', {center:[44.505, -89.548], zoom:9, zoomControl:false, attributionControl:false});
    lyrOsm = L.tileLayer.provider('OpenStreetMap.Mapnik');
    lyrTopo = L.tileLayer.provider('Thunderforest.Outdoors', {apikey:  'c5765bcedc4c418493a2e018e456b08a'});
    lyrImagery = L.tileLayer.provider('Esri.WorldImagery');

    mymap.addLayer(lyrOsm);

    objBasemaps = {
        "Open Street Maps":lyrOsm,
        "Topo":lyrTopo,
        "Imagery":lyrImagery
    };

    objOverlays = {};

    ctlLayers = L.control.layers(objBasemaps, objOverlays).addTo(mymap);

    ctlPan = L.control.pan().addTo(mymap);
    //ctlZoomslider = L.control.zoomslider({position:'topright'}).addTo(mymap);
    ctlScale = L.control.scale({position:'bottomleft', imperial:true}).addTo(mymap);
    ctlMouseposition = L.control.mousePosition().addTo(mymap);
    ctlMeasure = L.control.polylineMeasure({unit:'landmiles', showBearings:true}).addTo(mymap);
    ctlSidebar = L.control.sidebar('side-bar').addTo(mymap);
    ctlEasybutton = L.easyButton('glyphicon-transfer', function() {
        ctlSidebar.toggle();
    }).addTo(mymap);
    //add esri geocoder search box
    ctlSearch = L.esri.Geocoding.geosearch().addTo(mymap);
    // create an empty layer group to store the results and add it to the map
    ctlResults = L.layerGroup().addTo(mymap);
    // listen for the results event and add every result to the map
    ctlSearch.on("ctlResults", function(data) {
        ctlResults.clearLayers();
        for (var i = data.ctlResults.length - 1; i >= 0; i--) {
            ctlResults.addLayer(L.marker(data.ctlResults[i].latlng));
        }
    });
    ctlAttribute = L.control.attribution({position:'bottomright'}).addTo(mymap);
    ctlAttribute.addAttribution('<a href="https://www.openstreetmap.org">OSM</a>')
    ctlAttribute.addAttribution('&copy; Left Handed Data, LLC');

    mymap.on('locationfound', function(e) {
        console.log(e);
        if (mrkCurrentLocation) {
            mrkCurrentLocation.remove();
        }
        mrkCurrentLocation = L.circle(e.latlng, {radius:e.accuracy/2}).addTo(mymap);
        mymap.setView(e.latlng, 14);
    });

    mymap.on('locationerror', function(e) {
        console.log(e);
        alert("Location was not found");
    });

    /*mymap.on('zoomend', function(){
        $("#zoom-level").html(mymap.getZoom());
    });

    mymap.on('moveend', function(){
        $("#map-center").html(LatLngToArrayString(mymap.getCenter()));
    });*/

//    mymap.on('mousemove', function(e){
//        $("#mouse-location").html(LatLngToArrayString(e.latlng));
//    });

    $("#btnLocate").click(function(){
        mymap.locate();
    });

    /*$("#btnSP").click(function(){
        mymap.setView([44.52001, -89.56450], 13);
        mymap.openPopup(popPoint);
    })*/
});
