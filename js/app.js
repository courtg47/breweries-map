let map;

let bounds;

let markers = [];

let infoWindows = [];


$(document).ready(function() {
  /**
  * @description Checks screen size for desktop size and triggers KO funtion
  * @returns {boolean} makes sidebar static if desktop size or hides it if mobile/tablet
  */
  function checkScreenSize() {
    return $('.sidebar').css('bottom') === '20px' ? ViewModel.staticSidebar() : ViewModel.desktop(false);
  }

  checkScreenSize();
  $(window).resize(checkScreenSize);
});


/**
* @description Initializes the Google Map on screen load
*/
function initMap() {

  /**
  * @description Provides a custom styled map option
  * @constructor
  */
  const styledMapType = new google.maps.StyledMapType (
    [
      {elementType: 'geometry', stylers: [{color: '#5d92ad'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#f7fcf9'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#5d92a'}]},
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{color: '#5dada0'}]
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{color: '#5dada0'}]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{color: '#5d92ad'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [{color: '#5dada0'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#f5f1e6'}]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{color: '#fdfcf8'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#f8c967'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#e9bc62'}]
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry',
        stylers: [{color: '#e98d58'}]
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry.stroke',
        stylers: [{color: '#db8555'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{color: '#5d6aad'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{color: '#9fc7f5'}]
      },
      {
        featureType: 'transit.station.airport',
        elementType: 'geometry.fill',
        stylers: [{color: '#5d6aad'}]
      },
  ],
  {name: 'Styled Map'});


  /**
  * @description Creates a new Google Map display and sets properties
  * @constructor
  * @param {string} - HTML Div where map will live
  * @param {string} - Parameters such as location and zoom to set the map
  */
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 33.5215841, lng: -86.8009778},
    zoom: 13,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
          'styled_map']
        }
  });


  // Set default map to styled map.
  map.mapTypes.set('styled_map', styledMapType);
  map.setMapTypeId('styled_map');

  /**
  * @description Creates a new instance of an Infowindow from Google Maps API
  * @constructor
  */
  let infoWindow = new google.maps.InfoWindow();

  /**
  * @description Creates new lat/long bounds from Google Maps API
  * @constructor
  */
  let bounds = new google.maps.LatLngBounds();

  /**
  * @description Adds Google Maps autocomplete functionality to the Search Timeframe input field
  * @constructor
  * @param {string} - Input field from the search timeframe/directions form
  */
  const timeAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('search-timeframe'));


  /* Looping through breweries and creating a map marker for each
  location with a Drop animation on initial loading of map. */
  for (let i = 0; i < breweries.length; i++) {
    let location = breweries[i].location;
    let name = breweries[i].name;

    // Creating map marker.
    let marker = createMarker(location, name, i);

  /**
  * @description creates click event listener for Google Maps Markers
  */
  marker.addListener('click', function() {
    ViewModel.animateMarker(this.name);
  });

  bounds.extend(marker.position);
  }

  map.fitBounds(bounds);
};
// END INIT MAP


// MODEL
/**
* @description Constructor that creates each new instance of Brewery
* @constructor
* @param {string} name - Name of brewery
* @param {number} location - Lat/Long coordinates of brewery
*/
const Brewery = function(name, location) {
  this.name = name;
  this.location = location;
};


/**
* @description Creates and stores all breweries for this project with their name
* and lat/long coordinates
*/
const breweries = [
  new Brewery('TrimTab Brewing Company', {lat: 33.51255364485525, lng: -86.79065083047135}),
  new Brewery('Good People Brewing Company', {lat: 33.507089689798256, lng: -86.81189824498354}),
  new Brewery('Ghost Train Brewing Co.', {lat: 33.514744, lng: -86.793811}),
  new Brewery('Cahaba Brewing Company', {lat: 33.527779, lng: -86.765096}),
  new Brewery('Avondale Brewing Company', {lat: 33.52449064618634, lng: -86.7741910819789}),
  new Brewery('Red Hills Brewing Company', {lat: 33.47924542428795, lng: -86.79459356212321}),
];


/**
* @description Initiates Foursquare API AJAX Call and finds venueID Information
* for specific brewery
* @param {string} name - Name of brewery
* @returns {string} Venue ID of brewery
*/
function initFourSquare(name) {
  const url = 'https://api.foursquare.com/v2/venues/search?';
  let venue = name.replace(/\s+/g, '-').toLowerCase();
  const clientID = '2HARRIFBQDACIAHT1KDGSBGMUHDV14PST4PHOR4VDHXECHPM';
  const clientSecret = 'FRVNSUOYQGL0C1U2QJJQTKKSX1NJY134KGRKSWLM44EVNBFF';
  const version = '20180518';
  let venueID = '';

  $.ajax({
    url: url,
    method: 'GET',
    dataType: 'json',
    data: {
      client_id: clientID,
      client_secret: clientSecret,
      v: version,
      ll: '33.5128535,-86.7930727',
      venuePhotos: 1,
      query: venue,
      async: true
    },
    success: function(data) {
      venueID = data.response.venues[0].id;
      getFourSquareDetails(venueID, clientID, clientSecret, version);
    },
    error: function(response) {
      window.alert("We're sorry, but we cannot access the Foursquare API. Please try again later.");
      console.log(response.responseText);
    }
  });
}


/**
* @description Takes Venue ID and extracts other Brewery info from another
* Foursquare API endpoint
* @param {string} venueID - venue ID identifying each brewery
* @param {string} clientID - client ID from API key
* @param {string} clientSecret - client secret from API key
* @param {string} version - version of Foursquare API
* @returns {string} image, url, likes, phone number, and if open for each brewery
*/
function getFourSquareDetails(venueID, clientID, clientSecret, version) {

  $.ajax({
    url: "https://api.foursquare.com/v2/venues/" + venueID,
    method: 'GET',
    dataType: 'json',
    data: {
      client_id: clientID,
      client_secret: clientSecret,
      venue_id: venueID,
      v: version,
      async: true
    },
    success: function(data) {
      let imagePrefix = data.response.venue.bestPhoto.prefix;
      let imageSuffix = data.response.venue.bestPhoto.suffix;
      let completeImage = imagePrefix + '200x200' + imageSuffix;
      let breweryUrl = data.response.venue.url;
      let phoneNumber = data.response.venue.contact.formattedPhone;
      let likes = data.response.venue.likes.summary;
      let hours;

      if (data.response.venue.hours === undefined) {
        ViewModel.hours('');
      } else {
        hours = data.response.venue.hours.status;
        ViewModel.hours(hours);
      }
      // Adds data from API to KO observables in ViewModel
      ViewModel.image(completeImage);
      ViewModel.breweryUrl(breweryUrl);
      ViewModel.phoneNumber(phoneNumber);
      ViewModel.likes(likes);
    },
    error: function(response) {
      window.alert("We're sorry, but we cannot access the Foursquare API. Please try again later.");
      console.log(response.responseText);
    }
  });
}
// END MODEL


//VIEWMODEL
/**
* @description ViewModel for KnockoutJS which communicates with the View/HTML
*/
const ViewModel = {
  hamburger: ko.observable(false),
  desktop: ko.observable(false),
  isSelected: ko.observable(''),
  isVisible: ko.observable(true),
  duration: ko.observableArray(['10 min', '15 min', '30 min', '60 min']),
  chosenDuration: ko.observableArray(['10 min']),
  transportationModes: ko.observableArray(['DRIVING', 'WALKING', 'BICYCLING', 'TRANSIT']),
  chosenMode: ko.observableArray(['DRIVING']),
  maxDuration: ko.observable(''),
  mode: ko.observable(''),
  searchValue: ko.observable(''),
  breweries: ko.observableArray(breweries),
  animateListItem: ko.observable(''),
  image: ko.observable(''),
  breweryUrl: ko.observable(''),
  phoneNumber: ko.observable(''),
  likes: ko.observable(''),
  hours: ko.observable(''),
  /**
  * @description Makes sidebar static when desktop size. Otherwise,
  * hides sidebar until Hamburger icon is pressed
  * @returns {boolean} Hamburger observable false and desktop observable true
  */
  staticSidebar: function() {
      this.hamburger(false);
      this.desktop(true);
  },
  /**
  * @description Makes hamburger icon visible or invisible
  * @returns {boolean} Hamburger observable false or true
  */
  slideSidebar: function() {
    return this.hamburger() ? this.hamburger(false) : this.hamburger(true);
  },
  /**
  * @description Shows all Brewery map markers on map
  * @returns {string} Google map markers and bounds
  */
  showBreweries: function() {
    let bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  },
  /**
  * @description Hides all brewery map markers on map
  * @returns {boolean} Map markers become null
  */
  hideBreweries: function() {
    closeInfoWindows(infoWindows);
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  },
  /**
  * @description Submits location info for directions in Google Maps API
  * @returns {string} Infowindows
  */
  timeFrameButton: function() {
    closeInfoWindows(infoWindows);
    searchTimeframeAndMode();
    if (this.desktop() === false) {
      this.slideSidebar();
    }
  },
  /**
  * @description Resets map and list item view in its entirety
  * @returns {boolean} Clears out all variables/observables pertaining to state
  */
  resetButton: function() {
    closeInfoWindows(infoWindows);
    this.showBreweries();
    this.isVisible(true);
    this.image('');
    this.breweryUrl('');
    this.phoneNumber('');
    this.likes('');
    this.hours('');
  },
/**
* @description Searches List Items and Map Markers for Brewery in search field
* @returns {string} Name of marker to be passed to other functions
*/
searchForm: function() {
  //Unwraps observable and converts to lower case with no whitespace for comparison
  const searchValue = ko.utils.unwrapObservable(this.searchValue).toLowerCase().replace(/ /g,'');
  let atLeastOne = false;
  //If infowindows are open, close all of them.
  closeInfoWindows(infoWindows);
  for (let i = 0; i < markers.length; i++) {
    //Converting name of marker to lower case and no whitespace for comparison
    let compareName = markers[i].name.toLowerCase().replace(/ /g,'');
      //Comparing name of marker and name entered in text box for a match
      if (compareName.indexOf(searchValue) != -1 || searchValue.indexOf(compareName) != -1) {
        //Search for marker
        atLeastOne = true;
        search(markers[i]);
        //Search for list item
        this.isSelected(markers[i].name);
        this.makeInvisible();
        initFourSquare(markers[i].name);
      }
} if (atLeastOne === false) {
    window.alert("We're sorry, no breweries in the area match your search. Please try again.");
  }
},
  /**
  * @description Makes additional Brewery Information Disappear
  * @returns {boolean} isVisible observable to false
  */
  makeInvisible: function() {
    const selected = ko.utils.unwrapObservable(this.isSelected);
      if (selected !== '') {
        this.isVisible(false);
      }
  },
  /**
  * @description Animates map marker with infowindow and list item
  * @param {string} name - Name of Brewery
  * @returns {string} Brewery name, infowindow, and map marker
  */
  animateMarker: function(name) {
    name = ko.utils.unwrapObservable(name);
    for (let i = 0; i < markers.length; i++) {
      if (name === markers[i].name) {
        initFourSquare(name);
        let infoWindow = new google.maps.InfoWindow();
        closeInfoWindows(infoWindows);
        toggleBounce(markers[i]);
        populateInfoWindow(markers[i], infoWindow);
        this.animateListItem(name);
      }
    }
  },
};
/**
* @description Custom KO Binding to get sidebar to fade out when the close
* window icon is clicked
* @returns {string} jQuery animation
*/
ko.bindingHandlers.fadeVisible = {
  init: function(element, valueAccessor) {
    // Initially set the element to toggle
    const value = valueAccessor();
    $(element).toggle(ko.unwrap(value));
  },
  update: function(element, valueAccessor) {
      // Whenever the value changes, slide sidebar or fade out
      const value = valueAccessor();
      ko.unwrap(value) ? $(element).animate({width: 'toggle'}) : $(element).fadeOut();
  }
};
// Applies Knockout bindings
ko.applyBindings(ViewModel);
//END VIEWMODEL


/**
* @description Creates Map Markers for Brewery
* @param {string} location - Location coordinates for Brewery
* @param {string} name - Name of Brewery
* @param {string} i - Index of brewery array containing name and location
* @returns {string} Map marker
*/
function createMarker(location, name, i) {
  // Creating map marker.
  let marker = new google.maps.Marker({
    map: map,
    position: location,
    name: name,
    animation: google.maps.Animation.DROP,
    id: i
  });

  markers.push(marker);
  return marker;
}


/**
* @description Animates Map Marker for 2 seconds with a bounce effect
* @param {string} marker - Map marker to be animated
* @returns {boolean} Initiates animation and timesout after 2 seconds
*/
function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation() == null;
    }, 2000);
  }
}


/**
* @description Searches list items and markers for brewery entered into search field
* @param {string} marker - Google Maps marker
* @returns {string} marker and infowindow for matching brewery
*/
function search(marker) {
  const geocoder = new google.maps.Geocoder();
  marker = marker;
  const address = ko.utils.unwrapObservable(ViewModel.searchValue);

  if (address == '') {
    window.alert('You must enter a Brewery name.');
  } else {
    geocoder.geocode(
      { address: address,
        componentRestrictions: {locality: 'Birmingham'}
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(15);
          infoWindow = new google.maps.InfoWindow();

          populateInfoWindow(marker, infoWindow);
          toggleBounce(marker);

          infoWindow.open(map, marker);
          marker.infoWindow = infoWindow;

        } else {
            window.alert('Sorry, we could not find that location. Try entering another.');
          }
      });
   }
}


/**
* @description Searches for breweries within a specified distance away from a particular
* address, given a mode of transportation and an address using Google Maps API
* @returns {string} Matching origin and destination addresses from Google Maps API
*/
function searchTimeframeAndMode() {
  const distanceMatrixService = new google.maps.DistanceMatrixService;
  const address = document.getElementById('search-timeframe').value;

  if (address == '') {
    window.alert('You must enter an address.');
  } else {
    ViewModel.hideBreweries;
    closeInfoWindows(infoWindows);

    let destinations = [];
    let origin = [];

    for (let i = 0; i < markers.length; i++) {
      destinations[i] = markers[i].position;
    }

    origin.push(address);

    const mode = ko.utils.unwrapObservable(ViewModel.mode);

    distanceMatrixService.getDistanceMatrix({
      origins: origin,
      destinations: destinations,
      travelMode: google.maps.TravelMode[mode],
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      }, function(response, status) {
        if (status !== google.maps.DistanceMatrixStatus.OK) {
          window.alert('Error was ' + status);
        } else {
          displayMarkersWithinTimeframe(response);
        }
      });
    }
}


/**
* @description Displays map markers that fit the timeframe search
* @param {string} response - API response from searchTimeframeAndMode function
* @returns {string} Populated infowindow and markers of matching locations
*/
function displayMarkersWithinTimeframe(response) {
  let maxDuration = ko.utils.unwrapObservable(ViewModel.maxDuration);
  maxDuration = parseInt(maxDuration);
  const destinations = response.destinationAddresses;
  const origins = response.originAddresses;
  let atLeastOne = false;

  for (let i = 0; i < destinations.length; i++) {
    let results = response.rows[i].elements;

    for (let j = 0; j < results.length; j++) {
      let element = results[j];
      if (element.status === 'OK') {
        const distanceText = element.distance.text;

        const duration = element.duration.value / 60;
        const durationText = element.duration.text;

        if (duration <= maxDuration) {
          markers[j].setMap(map);
          atLeastOne = true;

          /* Display infowindow with duration of time away and distance away,
          along with a 'view route' button. */
          let infowindow = new google.maps.InfoWindow({
            content: '<div class="infowindow">' + markers[j].name + '</br></br>' + durationText + ' away, ' + distanceText + '</div>' +
            '<div><input class="view-route" type="button" value="View Route" onclick="displayDirections(&quot;' +  destinations[j] + '&quot;)";></input></div>'
          });

          infoWindows.push(infowindow);
          infowindow.open(map, markers[j]);

          markers[j].infowindow = infowindow;
          google.maps.event.addListener(markers[j], 'click', function() {
            this.infowindow.close();
          });
        }
      }
    }
    if (atLeastOne === false) {
      window.alert('Sorry, we could not find any locations in that distance. Please try another mode of transportation or timeframe.');
    }
  }
}


/**
* @description Displays route from address of origin to location of brewery
* when 'view route' button is clicked
* @param {string} destination - Destination address
* @returns Google Maps route from origin to destination
*/
function displayDirections(destination) {
  ViewModel.hideBreweries;
  closeInfoWindows(infoWindows);
  const directionsService = new google.maps.DirectionsService;

  const originAddress = document.getElementById('search-timeframe').value;

  const mode = ko.utils.unwrapObservable(ViewModel.mode);

  directionsService.route({
    origin: originAddress,
    destination: destination,
    travelMode: google.maps.TravelMode[mode]
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        directions: response,
        draggable: true,
        polylineOptions: {
          strokeColor: 'green'
        }
      });
      document.getElementById('search-timeframe-button').addEventListener('click', function() {
        clearDirections(directionsDisplay);
      });
      document.getElementById('reset').addEventListener('click', function() {
        clearDirections(directionsDisplay);
      });
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}


/**
* @description Clears directions route from map
* @param {string} directionsDisplay - Directions route
* @returns {boolean} Sets directions route to null
*/
function clearDirections(directionsDisplay) {
  directionsDisplay.set('directions', null);
}


// Used by both initMap and ViewModel
/**
* @description Closes all populated infowindows on map
* @param {string} infoWindows - Populated infowindows
* @returns {boolean} Closes open infowindows
*/
function closeInfoWindows(infoWindows) {
  // If infowindows are open, close all of them.
  for (let i = 0; i < infoWindows.length; i++) {
    infoWindows[i].close();
  }
}


/* Populates infowindow with information about Brewery when
marker is clicked. */
/**
* @description Populates blank infowindows with Google Streetview image and name
* @param {string} marker - Map marker for brewery
* @param {string} infowindow - Infowindow for brewery
* @returns {string} Populated infowindow with Streetview image and name
*/
function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('');

    infoWindows.push(infowindow);

    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    google.maps.event.addListener(marker, 'click', function() {
      this.infowindow.close();
    });

    const streetViewService = new google.maps.StreetViewService();
    const radius = 50;

    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        const nearStreetViewLocation = data.location.latLng;
        const heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
          //Adds Streetview and name of Brewery to infowindow when marker is clicked
          infowindow.setContent('<div class="infowindow"><h3>' + marker.name + '</h3></div>' + '<div id="pano" class="pano""></div>');
          const panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 20
            }
          };
          const panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div class="infowindow"><h3>' + marker.name + '</h3></div>' +
      '<div><p>Street View Not Found</p></div>');
      }
    }
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    infowindow.open(map, marker);
  }
}
