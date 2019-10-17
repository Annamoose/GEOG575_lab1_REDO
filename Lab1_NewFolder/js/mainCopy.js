//Using Time series Proportional Symbol Maps with Leaflet and jQuery 
//A Fritz GEOG 575  Lab 1- October 2019
//Load data onto map
//load baselayers on map and control for baselayers
//create slider for varying the year of the data; and the pop-up changes based on the slider year = sequence control
//create proportional symbols based on if the P value is high (> 0.25 mg/l) or not


//Step 1.
//WHAT WORKS Create the Leaflet map with 3 basemap control layers styled from Mapbox tilesets
//DOESN"T WORK: to get the HU-2 tileset created in Mapbox to plot within the control box; circumvented by using the USGS CachedHydro services
function createMap(){
       
    //add REST endpoint for HU-2 boundaries from Watershed Boundary Dataset (WBD) as another layer on the map. These endpoints don't seem to work?
   //var WBDURL = '<a href="https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/1'<a/> 
    //OR add WBD as styled mapbox tileset? and I can't seem to get this to work either...
    //STYLE WBDURL: mapbox://styles/annamoose/ck1qdzacn3krz1cp70tjc3ie2 
    
    //Varibles for attribution box on the map.
    var mbAttr = '<a href="http://openstreetmap.org">OpenStreetMap</a> |' + ' <a href="http://mapbox.com">Mapbox</a> |' + '<a href="https://annamoose.github.io/">Annamoose</a>'+ ' <a href="https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer">USGS WBD</a> |'; 
    
    //Variable for storing your Mapbox API Token
    var apitoken = 'pk.eyJ1IjoiYW5uYW1vb3NlIiwiYSI6ImNqNnh3dDlkdDFvbGYyd21ubzVyemFrdTIifQ.25r36ZiVm1gzeDwHBp_ZrA' 
        
     //URL used for Standard MaxBox Styles
    var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}';
    
    //styleURL used for Custom MapBox Style 
    var mbStyleUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={token}';
    
    //For basemap control layers 
    var satellite = L.tileLayer(mbStyleUrl, {id: 'annamoose/ck1fg0hqh3mqo1co4qq8f1dyj', token: apitoken,  attribution: mbAttr});
    
    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', token: apitoken, attribution: mbAttr});
    
    var outdoors = L.tileLayer(mbUrl, {id: 'mapbox.outdoors', token: apitoken,  attribution: mbAttr});
    
    //appears to be an issue with the WBD services... the HydroCached ones work.  
    //var wbd = L.tileLayer.wms("https://hydro.nationalmap.gov:443/arcgis/services/wbd/MapServer/WmsServer?", {
    var nhd = L.tileLayer.wms("https://basemap.nationalmap.gov:443/arcgis/services/USGSHydroCached/MapServer/WmsServer?", {
        layers: '0',
        format: 'image/png',
        transparent: true,
        attribution: "USGS"
    });
    
/*tried to get fancy and add crop type layer from national ag statistics service... didn't work. focus on popups and getting slider to work.    
//var cdd = L.tileLayer.wms("https://nassgeodata.gmu.edu/CropScapeService/wms_cdl_nd.cgi?", {
        layers: 'cdl_2018_nd',
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        crs: 'EPSG4326',
        uppercase: true,
        attribution: "NASSGEODATA"
    });
    */
    var overlayMap = {
        "Drainage" : nhd,
//        "Crop Type": cdd
    };
          
	//create the map
	var map = L.map('map', {
		center: [47.35, -100.29],
		zoom: 7,
        layers: outdoors //default 
	});
    
  //create the basemap control layer and add to map*/
    var baseLayers = {
		"Outdoors": outdoors,
        "Grayscale": grayscale,
		"Satellite": satellite,
       };
    
    L.control.layers(baseLayers, overlayMap).addTo(map); 
    getData(map);
};


//Step 2 Main function to load geojson; 
//CALL TO OTHER FUNCTIONS. DOESN"T COMPLETELY WORK. load the features on the map; call functions to interact with features 
function getData(map) {
//load data - but it's not working; ajax or getJSON both not working????
$.getJSON("data/pNDlakes.geojson", {
        //dataType: "geojson",
        success: function(data) {
        //create attribute array
        var attributes = processData(data);
        console.log(data);
    
        createPropSymbols(data, map, attributes); //attributes = timestamps, min, max
        createSequenceControls(map, attributes);
        createLegend(map, attributes);
        }
      });
};

//Step 2a, process the data into an array; get values that can be used as input for other functions
function processData(data) {
    //empty array to hold values
	var attributes = [];

    //properties of first feature in dataset
    var properties = data.features[0].properties;
    
    //push each attribute into the array
	for (var attribute in properties) {
        attributes.push(attribute);
    };
    return attributes;
    console.log(attributes);
};
        
/*
		var properties = data.features[feature].properties; 
			for (var attribute in properties) { 
				if (attribute != "StationID" && attribute != "WATER_NAME" && attribute != "WATER_TYPE" && attribute != "count" && attribute != "SUBBASIN") {
					if ( $.inArray(attribute,timestamps) === -1) {
						timestamps.push(attribute);		
					}
					if (properties[attribute] < min) {	
						min = properties[attribute];
					}
					if (properties[attribute] > max) { 
						max = properties[attribute]; 
					}
				}
			}
		}
		return {
			timestamps : timestamps,
			min : min,
			max : max
		}
	};
*/

//Step 3 create layer for proportional symbols
function createPropSymbols(data, map, attributes) {
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Step 4. create proportional symbols - now with attributes showing (as soon as they care converted to numbers! - bind to layer
function pointToLayer(feature, latlng, attributes) { 
   // lakes = L.geoJSON(data, {
    var attribute = attributes[0];
    
    var markOp = {
        fillColor: "#faa21b",
        color: "#faa21b",
        weight: 1,
        fillOpacity: 0.6
    };
    
    var attValue = Number(feature.properties[attribute]);
   //these need to be converted to numbers; NaN error message!
    markOp.radius = calcPropRadius(attValue);
    
    var layer = L.circleMarker(latlng, markOp);
    var popup = new Popup(feature.properties, attribute, layer, markOp.radius);
    popup.bindToLayer();
    layer.on({
                    mouseover: function() {
                    this.openPopup();
                    this.setStyle({color: "red"});
                },
                mouseout: function() {
                    this.closePopup();
                    this.setStyle({color: "#709749"}); 
                },
                click: function() {
                    this.openPopup();
                }
        });
    return layer;
};
    
/*        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                fillColor: "#faa21b",
                color: "#faa21b",
                weight: 1,
                fillOpacity: 0.6
            })  .on({
                mouseover: function() {
                    this.openPopup();
                    this.setStyle({color: "red"});
                },
                mouseout: function() {
                    this.closePopup();
                    this.setStyle({color: "#709749"}); 
                },
                click: function() {
                    $("#panel").html(panelContent);
                }
            });
        }
    }).addTo(map);
    updatePropSymbols(timestamps[0]);
};*/

//Step 4a. calculate proportional symbols radius.  NEED TO CONVERT TO NUMBERS SO THIS WORKS
function calcPropRadius(attValue) {
		var scaleFactor = 10;
		var area = attValue * scaleFactor;
        var radius = Math.sqrt(area/Math.PI);
        return radius;
	};


//DOESN"T WORK create pop-up content and bind to features
/*
function onEachFeature(feature, layer) {
    var popContent = " ";
    if(feature.properties) {
        for (var property in feature.properties) {
            popUpContent += "<p>"+ property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popUpContent);
    };
};
*/
//Step 5. create popup with stationID and P value (or at least I hope)
function popup(properties, attributes, layer, radius) {
    this.properties = properties;
    this.attribute = attribute;
    this.layer = layer;
    this.station = properties.StationID;
    this.year = attribute.split("_")[0];
    this.pVal = this.properties[attribute];
    this.content = "<p><b>stationID: </b>" + this.station + "<br><b>Phosphorus " + this.pVal + " mg/L</b>" + "</i> in </i>" + this.year + "</i>";
    this.bindToLayer = function () {
        this.layer.bindPopup(this.content, {
            offset: new L.Point(0, -radius)
        });
    };
};

//Step 6 
//be ablet to pass timestamps to other functions
function updatePropSymbols(map, attribute) {
    map.eachLayer(function (layer){
        if (layer.feature && layer.feature.properties[attribute]){
            var props = layer.feature.properties;
            var radius = calcPropRadius(prop[attribute]);
            layer.setRadius(radius);
            var popup = new Popup(props, attribute, layer, radius);
            popup.bindToLayer();
            updateLegend(map, attribute);
        };
    });
};


/*function updatePropSymbols(map, attribute) {
    lakes.eachLayer(function (layer) {
        var props = layer.feature.properties;
        var radius = calcPropRadius(props[timestamp]);
        var popupContent = "<b>" + String(props[timestamp]) + " mg/L</b><br>" + "<i>" + props.name + "</i> in </i>" +   timestamp + "</i>";
        layer.setRadius(radius);
        layer.bindPopup(popupContent);
        //layer.bindPopup(popupContent, {offset: new L.Point(0, -radius) });
    });
};*/



//DOESN'T WORK becuase there's no code here yet.  create timeslider that shows points that had samples during that particular year
// maybe? put the update createPropSymbols and iterate through the timestmaps n, N+1
function createSlider(timestamps){
    
}

//VALUES DON'T SHOW UP; BUT THE PANEL IS CREATED. create sequence controls to cycle through the timestamps and sample results
//if this one had UpdatePropsymbols and passed the iterative timestamps n, n+1 to slider
//create slider would be right after this; pass attributes as timestamp?
//Step 7 - create the legend control and sequencer
function createSequenceControls(map, attributes) {
    var SequenceControl = L.Control.extend({
        options: {
            position: 'topright'
        },
        onAdd: function (map) {
            //sequence control contain div element
            
            var container = L.DomUtil.create('div', 'sequence-control-container');
            
            //header for controler
            $(container).append('<h3 align-center id="header">Average Annual Phosphorus Concentrations</h3>');
            
            //sequence legend
            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            $(container).append('<button class="skip" id="reverse">Previous</button>');
            $(container).append('<button class="skip" id="forward">Next</button>');
          
            //kill any mouse event listeners on the map
            //kill double click to zoom
            $(container).on('dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            
            // Disable dragging when user's cursor enters the element
            container.addEventListener('mouseover', function () {
                map.dragging.disable();
            });

            // Re-enable dragging when user's cursor leaves the element
            container.addEventListener('mouseout', function () {
                map.dragging.enable();
            });

            return container;
        }
    })
    
    map.addControl(new SequenceControl());
            
            
        }
    })
   /* $('#panel').append('<input class="range-slider" type = "range">');
    $('.range-slider').attr({
        max: 29,
        min: 0,
        value: 0,
        step: 1*/
    });
};



$(document).ready(createMap); 	






