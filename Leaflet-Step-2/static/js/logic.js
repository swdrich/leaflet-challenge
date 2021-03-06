console.log("logic.js is loaded");

// Store our API endpoint inside queryUrl - all earthquakes greater than 2.5 mag in the last 7 days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Define a function to determine marker size based on magnitude
function markerSize(mag) {
    return mag * 3;
}

// Define a function to color feature markers based on depth
function chooseColor(depth) {
    switch (true) {
        case (depth < 10):
            return "#81fa6e";
            break;
        case (depth >= 10 && depth < 30):
            return "#00dfa6";
            break;
        case (depth >= 30 && depth < 50):
            return "#00bbdb";
            break;
        case (depth >= 50 && depth < 70):
            return "#0093f5";
            break;
        case (depth >= 70 && depth < 90):
            return "#0062df";
            break;
        default:
            return "#58199b";
    };
}

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
    console.log(data);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define markers
    function pointToLayer(feature, latlng) {
        return new L.CircleMarker(latlng, {
            radius: markerSize(feature.properties.mag),
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.8,
            stroke: true,
            color: "black",
            weight: 1,
        });
    }

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "<br>Magnitude: " + feature.properties.mag +
        "<br>Depth: " + feature.geometry.coordinates[2] + " kilometers</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

// Perform a GET request to plate data
d3.json("data/PB2002_boundaries.json").then(function(data) {
  console.log(data);
  
  var plates = L.geoJson(data, {
    style: function(feature) {
      return {
        color: "yellow",
        weight: 3
      };
    },
  })
  return plates;
});


// function drawPlates(plateData) {
//   var plates = L.geoJson(plateData, {
//     style: function(feature) {
//       return {
//         color: "yellow",
//         weight: 3
//       };
//     },
//     onEachFeature: function(feature, layer) {
//       layer.bindPopup("<h3>" + feature.properties.PlateName + "</h3>");
//     }
//   });
//   createMap(plates);
//}

function createMap(earthquakes) {

  // Define satellite and lightmap layers
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "?? <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> ?? <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "?? <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> ?? <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satelliteMap,
    "Light Map": lightMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Plates: plates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      30.09, -100.71
    ],
    zoom: 3,
    layers: [satelliteMap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);

  // Add a legend to explain depth colors
  var legend = L.control({position: "bottomright"});

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var labels = ["<strong>Earthquake Depth</strong>"];
    var levels = ["< 10 km", "10-30 km", "30-50 km", "50-70 km", "70-90 km", "> 90 km"];
    var colors = ["#81fa6e", "#00dfa6", "#00bbdb", "#0093f5", "#0062df", "#58199b"];

    console.log(levels);
    console.log(colors);
    
    for (var i=0; i < levels.length; i++) {
        div.innerHTML += labels.push('<i style="background:' + colors[i] + '"></i>' + levels[i] + '<br>');
      }
      div.innerHTML = labels.join('<br><br>');
    return div;
  };
  legend.addTo(myMap);

}
