console.log("logic.js is loaded");

// Write query URL - earthquakes with 2.5+ mag in last 7 days
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Get data and send features to the createFeatures function
d3.json(queryURL).then(function(data) {
    createFeatures(data.features);
});

// Define createFeatures function
function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature
    });

    createMap(earthquakes);
}

// Define createMap function
function createMap(earthquakes) {

    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite",
        accessToken: API_KEY
      });

    // Define a baseMaps object to hold our base layers
     var baseMaps = {
        "Satellite Map": satelliteMap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

     // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [satelliteMap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

}