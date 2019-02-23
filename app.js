'use strict';

var express = require('express');
var app = express();
var geocoder = require('./geocoder.js');

function getParams (req, res) {
  var lat = req.query.latitude || false;
  var lon = req.query.longitude || false;
  var maxResults = req.query.maxResults || 1;
  if (!lat || !lon) {
    return res.status(400).send('Bad Request');
  }
  var points = [];
  if (Array.isArray(lat) && Array.isArray(lon)) {
    if (lat.length !== lon.length) {
      return res.status(400).send('Bad Request');
    }
    for (var i = 0, lenI = lat.length; i < lenI; i++) {
      points[i] = {latitude: lat[i], longitude: lon[i]};
    }
  } else {
    points[0] =  {latitude: lat, longitude: lon};
  }
  return { points, maxResults };
}

/**
 *
 * @param addresses
 */
function getShortname (addresses) {
  const { asciiName, countryCode, admin1Code } = addresses.flat()[0];
  const shortname = `${asciiName}, ${admin1Code.asciiName}, ${countryCode}`;
  return shortname;
}

app.get(/shortname/, (req, res) => {
  const { points } = getParams(req, res);
  const maxResults = 1;

  geocoder.lookUp(points, maxResults, (err, addresses) => {
    if (err) {
      return res.status(400).send(err);
    }
    let locationName = {};
    try {
      locationName = getShortname(addresses);
    } catch (err) {
      console.log(err);
    }

    return res.send(locationName);
  });
});

app.get(/geocode/, (req, res) => {
  const { points, maxResults } = getParams(req, res);

  geocoder.lookUp(points, maxResults, (err, addresses) => {
    if (err) {
      return res.status(400).send(err);
    }
    return res.send(addresses);
  });
});

geocoder.init({}, () => {
  var port = Number(process.env.PORT || 3000);
  app.listen(port, function() {
    console.log('Local reverse geocoder listening on port ' + port);
  });
});
