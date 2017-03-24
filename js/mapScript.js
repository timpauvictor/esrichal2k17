var __startingCoords = [43.240, -79.848];
var __zoomLevel = 5;
var __map;
var __shapeLayers = [];
var __activatedLayers = [];
var chargeStations = [];
var geolocation = undefined;
var dirLayer = undefined;
var accessToken = "nothing";
var directionLayers = [];
var directionStr = "";
var customWaypoint;
var geoMarker;
var carinfo;

var chargeIcon = L.icon({
    iconUrl: './img/chargeIcon.png',
    iconSize: [32, 32]
});

function loadMap() {
    __map = L.map("map").setView(__startingCoords, __zoomLevel);
    console.log('map created');
    L.esri.basemapLayer("Topographic").addTo(__map);
    console.log('topographic layer added');
}

function addPolygonShapeFile(path) { //generic function to add shapeFiles to the map, then stores the added shpfile object in an array
    console.log("attempting to load shapefile from " + path);
    var shpfile = new L.Shapefile(path, {
        onEachFeature: function(feature, layer) {
            // console.log(feature.properties);
            if (feature.properties.DAY) {
                var garDay = feature.properties.DAY;
                layer.setStyle({
                    weight: 2,
                    opacity: 1,
                    color: '#4CAF50',
                    fillOpacity: 0.7
                });
                if (garDay === "Monday") {
                    layer.setStyle({
                        fillColor: '#fc8d62',
                        // weight: 2,
                        // opacity: 1,
                        // color: '#4CAF50',
                        // fillOpacity: 0.7
                    });
                } else if (garDay === "Tuesday") {
                    layer.setStyle({
                        fillColor: '#fc8d62',
                        // weight: 2,
                        // opacity: 1,
                        // color: '#4CAF50',
                        // fillOpacity: 0.7
                    });
                } else if (garDay === "Wednesday") {
                    layer.setStyle({
                        fillColor: '#8da0cb',
                        // weight: 2,
                        // opacity: 1,
                        // color: '#4CAF50',
                        // fillOpacity: 0.7
                    });
                } else if (garDay === "Thursday") {
                    layer.setStyle({
                        fillColor: '#e78ac3',
                        // weight: 2,
                        // opacity: 1,
                        // color: '#4CAF50',
                        // fillOpacity: 0.7
                    });
                } else if (garDay === "Friday") {
                    layer.setStyle({
                        fillColor: '#a6d854',
                        // weight: 2,
                        // opacity: 1,
                        // color: '#4CAF50',
                        // fillOpacity: 0.7
                    });
                }
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight
                });
            } //end day if

            if (feature.properties.Available) {
                if (feature.properties.Available === "Yes") {
                    layer.setStyle({
                        fillColor: '#4CAF50',
                        weight: 2,
                        opacity: 1,
                        color: '#4CAF50',
                        fillOpacity: 0.7
                    });
                } else {
                    layer.setStyle({
                        fillColor: '#f44336',
                        weight: 2,
                        opacity: 1,
                        color: '#4CAF50',
                        fillOpacity: 0.7
                    });
                }
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight
                });

            } //end yard if

        }

    });
    shpfile.once("data:loaded", function() {
        console.log("finished loading from " + path);
        __map.invalidateSize(); //leaflet has a bug where you either invalidate the size or
        // the tiles don't load properly
    });
    __shapeLayers.push(shpfile);
    // console.log(shpfile.attribute('alt'));
    __activatedLayers.push(false);
}

function resetHighlight(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#4CAF50',
        fillOpacity: 0.7
    })


}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 4,
        color: '#212121',
        fillOpacity: 0.8
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

function addMarkerShapeFile(path, arr) { //generic function to add shapeFiles to the map, then stores the added shpfile object in an array
    console.log("attempting to load shapefile from " + path);
    var shpfile = new L.Shapefile(path, {
        onEachFeature: function(feature, layer) {
            if (feature.properties) {
                if (arr === chargeStations) {
                    layer.setIcon(chargeIcon);
                }
                
                arr.push(feature);
                layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                    if (k == "Charging_L") {
                        label = "Charging Level";
                    } else if (k == "Level_2_Ch") {
                        label = "Level 2 Chargers";                        
                    } else if (k == "Level_3_Ch") {
                        label = "Level 3 Chargers";
                    } else {
                        label = k
                    }
                    return "<div><span class=\"markerTitle\"><b>" + label + "</b></span>" + "<span class=\"markerText\">" + feature.properties[k] + "</span>";
                }).join("<br />"), {
                    maxHeight: 300
                });
            }

        }
    });
    shpfile.once("data:loaded", function() {
        console.log("finished loading from " + path);
        __map.invalidateSize(); //leaflet has a bug where you either invalidate the size or
        // the tiles don't load properly
    });
    __shapeLayers.push(shpfile);
    __activatedLayers.push(false);
}


function toggleLayer(index) {
    if (geolocation != undefined) {
        __map.removeLayer(geolocation);
    } else {
        //do nothing
    }
    if (__activatedLayers[index] === false) {
        __shapeLayers[index].addTo(__map);
        __activatedLayers[index] = true;
    } else {
        __map.removeLayer(__shapeLayers[index]);
        __activatedLayers[index] = false;
    }
}

function clearAllLayers() {
    for (var i = 0; i < __shapeLayers.length; i++) {
        __map.removeLayer(__shapeLayers[i]);
        __activatedLayers[i] = false;
    }

    if (leafLegendActive) {
        __map.removeControl(leafLegend);
        leafLegendActive = false;
    }

    if (garLegendActive) {
        __map.removeControl(garLegend);
        garLegendActive =false;
    }

    clearDirections();
}

function findMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            if (geolocation != undefined) {
                __map.removeLayer(geolocation);
            }
            geoMarker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(__map);
            geoMarker.bindPopup("<b><center>This is you!</center></b><br> The nearest charging station to you is " + findNearestMarker(position, chargeStations));
            // marker.openPopup();
            geolocation = geoMarker;
            __map.setView([position.coords.latitude, position.coords.longitude], 16)
            geoMarker.openPopup();
            // geoMarker.setContent("testContent");
        });
    } else {
        //show a search bar
    }
}


function addFindMeButton() {
    L.easyButton('icon ion-pin larger', function() {
            findMe();
        },
        "Find my location").addTo(__map);
}

function addHomeButton() {
    L.easyButton("icon ion-home larger", function() {
        __map.setView(__startingCoords, __zoomLevel);
    },
    "Reset to initial view").addTo(__map);
}

function toRad(value) {
    return value * Math.PI / 180;
}

function getDistance(pos1, pos2) { //using the haversine formula!
    //it might not be the closest to drive to, but whatever
    var R = 6371000; // metres, earth's distance
    var p1 = toRad(pos1[0]);
    var p2 = toRad(pos2[0]);
    var deltaP = toRad(pos2[0] - pos1[0]);
    var deltaL = toRad(pos2[1] - pos1[1]);

    var a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
        Math.cos(p1) * Math.cos(p2) *
        Math.sin(deltaL / 2) * Math.sin(deltaL / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c;
    return d;
}

function findNearestMarker(position, featureArr) {
    var lowestIndex = 0;
    var lowestDistance = Infinity; //good luck being greater than that!
    // console.log(featureArr[4]);
    for (var i = 0; i < featureArr.length; i++) {
        featureCoords = [featureArr[i].geometry.coordinates[1], featureArr[i].geometry.coordinates[0]]; //for some reason it stores them backwards, beats me im just a code monkey
        // console.log(featureCoords);
        var distance = getDistance([position.coords.latitude, position.coords.longitude], featureCoords);
        if (distance < lowestDistance) {
            lowestDistance = distance;
            lowestIndex = i;
        }
    }
    var nearestName = "";
    if (featureArr[lowestIndex].properties.HOST) {
        nearestName = featureArr[lowestIndex].properties.HOST;
    } else {
        nearestName = "Nameless";
    }

    var nearestAddress = featureArr[lowestIndex].properties.ADDRESS;
    var htmlAddressBeginning = "<a onclick=\"addressGeocode([" + position.coords.latitude + ", " + position.coords.longitude + "],&#34;" + nearestAddress + "&#34;)\"" + " href=\"javascript:void(0)\">";
    // console.log(htmlAddressBeginning);
    var htmlAddressEnding = "</a>";
    // console.log(nearestName + " at " + htmlAddressBeginning + nearestAddress + htmlAddressEnding + "<br>");
    return nearestName + " at " + htmlAddressBeginning + nearestAddress + htmlAddressEnding + "<br>";
}

function requestToken() {
    return $.post("https://www.arcgis.com/sharing/rest/oauth2/token/", {
        "client_id": "4zKEN5BilxUnVaqy",
        "client_secret": "804e33b62c6247e4b2465d6cbc929e43",
        "grant_type": "client_credentials"
    });
    // var realPromise = Promise.resolve(jQueryPromise);
    // realPromise.then(function(val) {
    //     valObj = JSON.parse(val);
    //     accessToken = valObj.access_token;
    //     console.error(accessToken);
    // });
}

function addressGeocode(startCoords, endAddress) {
    L.esri.Geocoding.geocode().text(endAddress).run(function(err, results, response) {
        showDirections(startCoords, [results.results[0].latlng.lat, results.results[0].latlng.lng]);
    })
}

function showDirections(startCoords, endCoords) {
    console.log("routing from: " + startCoords + "to: " + endCoords);
    // openSpecPopup(endCoords);
    var stops = startCoords[1] + ", " + startCoords[0] + "; " + endCoords[1] + ", " + endCoords[0];
    var getPromise = $.get("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve", {
        "token": accessToken,
        "stops": stops,
        "f": "json"
    })
    var realPromise = Promise.resolve(getPromise);
    realPromise.then(function(val) {
        valObj = JSON.parse(val);
        // console.log(valObj);
        directionPoints = valObj.routes.features[0].geometry.paths[0];
        directionStr = valObj.directions[0].features;
        // console.log(directionStr);
        drawDirections(directionPoints);
        changeWaypointText(directionStr);
    });
}

function showDirections(startCoords, endCoords) {
    console.log("routing from: " + startCoords + "to: " + endCoords);
    // openSpecPopup(endCoords);
    var stops = startCoords[1] + ", " + startCoords[0] + "; " + endCoords[1] + ", " + endCoords[0];
    var getPromise = $.get("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve", {
        "token": accessToken,
        "stops": stops,
        "f": "json"
    })
    var realPromise = Promise.resolve(getPromise);
    realPromise.then(function(val) {
        valObj = JSON.parse(val);
        // console.log(valObj);
        directionPoints = valObj.routes.features[0].geometry.paths[0];
        directionStr = valObj.directions[0].features;
        // console.log(directionStr);
        drawDirections(directionPoints);
        changeWaypointText(directionStr);
    });
}

function drawDirections(points) {
    // clearDirections();
    // console.log(points);
    for (var i = 0; i < points.length - 1; i++) {
        var pointA = new L.LatLng(points[i][1], points[i][0]);
        var pointB = new L.LatLng(points[i + 1][1], points[i + 1][0]);
        var pointsList = [pointA, pointB];
        var myPolyline = L.polyline(pointsList, {
            color: 'red',
            weight: 5,
            opacity: 0.5,
            smoothFactor: 1
        });
        directionLayers.push(myPolyline);
        myPolyline.addTo(__map);
    }
}

function changeWaypointText(directions) {
    customString = "";
    for (var i = 0; i < Object.keys(directions).length; i++) {
        directions[i].attributes.text.replace(/Location 2/i, "Destination");
        customString += "<b>" + i + "</b>: " + directions[i].attributes.text + "<br>";
        console.log(directions[i].attributes.text);
    }

    if (customWaypoint != undefined) {
        customWaypoint.getPopup().setContent(customString);
    } else if (geoMarker.getPopup() != undefined) {
        geoMarker.getPopup().setContent(customString);
    }
    // console.log(geoMarker.getPopup());
}

function onMapClick(e) {
    if (customWaypoint) {
        __map.removeLayer(customWaypoint);
        for (var i = 0; i < directionLayers.length; i++) {
        __map.removeLayer(directionLayers[i]);
        }
    }
    makeCustomWaypointPopup(e);
    var gettingIso = true;
    if (gettingIso) {
        
    }
}

function makeCustomWaypointPopup(e) {
    customWaypoint = L.marker([e.latlng.lat, e.latlng.lng]).addTo(__map);
    var position = { //this is hideous oh my god but i didn't want to rewrite code so whatever it works
            coords: {
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
            }
        }
    customWaypoint.bindPopup("<b><center>This is your custom waypoint at " + e.latlng.lat + "," + e.latlng.lng + "</center></b><br> The <b>nearest charging station</b> is " + findNearestMarker(position, chargeStations));
    customWaypoint.openPopup();
}

function parseJsonPoints() {
    $.getJSON('../data/openChargeMap.json', function(response) {
        chargeMap = response;
        console.log(chargeMap[1300]);


        for (i in chargeMap) {
            var pos = [chargeMap[i].AddressInfo.Latitude, chargeMap[i].AddressInfo.Longitude];
            // console.log(pos);
            var newWaypoint = L.marker(pos);
            var toPush = {
                geometry: {
                    coordinates: [pos[1], pos[0]]
                },
                properties: {
                    HOST: chargeMap[i].AddressInfo.Title,
                    ADDRESS: chargeMap[i].AddressInfo.AddressLine1 + ", " + chargeMap[i].AddressInfo.Town + ", " + chargeMap[i].AddressInfo.StateOrProvince + ", " + chargeMap[i].AddressInfo.Postcode
                }
            };
            chargeStations.push(toPush);
            // return "<div><span class=\"markerTitle\"><b>" + label + "</b></span>" + "<span class=\"markerText\">" + feature.properties[k] + "</span>";

            newWaypoint.bindPopup("<div><span class=\"markerTitle\"><b>" + toPush.properties.HOST + "</b></span><br>" + "<span class=\"markerText\">" + toPush.properties.ADDRESS + "</span>");
            newWaypoint.setIcon(chargeIcon).addTo(__map);
            // console.log(chargeStations);
        }
    });
}

function parseJSONCars() {
    $.getJSON("../data/carinfo.json", function(response) {
        carInfo = response;
        console.log(carInfo[1]);
        var table = document.getElementById("carTable");
        for (var i = 0; i < carInfo.length - 1; i++) {
           var row = table.insertRow(1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2); 
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);

            cell1.innerHTML = carInfo[i].Make;
            cell2.innerHTML = carInfo[i].Year;
            cell3.innerHTML = carInfo[i].Model;
            cell4.innerHTML = carInfo[i].Range_km;
            cell5.innerHTML = carInfo[i].Recharge_Time_hr;
        }
    });
}

function mapSetup() {
    requestToken().then( function(tokenData) {
        accessToken = JSON.parse(tokenData).access_token;
        loadMap(); //loads map and adds it to div
        // test();
        parseJSONCars();
        parseJsonPoints();
        // test2();
        // var myLayer = L.GeoJSON().addTo(__map);

        //load out shapefiles, having to keep track of the layers here is probably the dumbest thing I've done
        // addPolygonShapeFile("../data/wasteday.zip"); //layer 0
        // addPolygonShapeFile("../data/LeafYardServices.zip"); //layer 1
        // addMarkerShapeFile("../data/municipalnew.zip", municipalMarkers); //layer 2
        // addMarkerShapeFile("../data/privatenew.zip", privateMarkers); //layer 3
        // addMarkerShapeFile("../data/composting_facilities.zip", compostMarkers); //layer 4
        // addMarkerShapeFile("../data/chargeStations.zip", chargeStations); //layer 0
        // toggleLayer(0);

        __map.invalidateSize(); //just in case that bug rears it's ugly head
        //load our buttons
        addHomeButton();
        addFindMeButton();


        __map.on('click', onMapClick);
    });
}



//console.dir(privateMarkers);
mapSetup();
