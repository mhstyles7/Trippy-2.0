import React, { useEffect } from 'react';
//const mapRef = useRef(null);

const GoogleMap = ({onMapLoad}) => {
  
  
  useEffect(() => {
    // Loading Google Maps script
    const loadScript = (url) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // Function to initialize the map and autocomplete
    async function initMapAndAutocomplete(lat, lng)  {
      // Request needed libraries.
      const { Map } = await google.maps.importLibrary("maps");
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
      
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: lat, lng: lng },
        zoom: 7,
        mapTypeId: 'hybrid',
        mapId: '1',
        disableDefaultUI: true
      });

      // Expose the map instance to parent component
      if (onMapLoad) {
        onMapLoad(map);
        const mapRef = useRef(null);
      }


      //Marker Adjustments
      // A marker with a with a URL pointing to a PNG.
      const beachFlagImg = document.createElement("img");
      
       beachFlagImg.src = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

    //   const currentLocationMarker = new AdvancedMarkerElement({
    //     map,
    //     position: { lat: lat, lng: lng},
    //     content: beachFlagImg,
    //     title: "Current Location",
    //   });


    let marker = new AdvancedMarkerElement({
        map,
        position:{lat: lat, lng: lng},
        content: beachFlagImg,
        });

    //Alt icon: "https://img.icons8.com/nolan/2x/marker.png"
    //Alt icon for current location: https://cdn1.iconfinder.com/data/icons/maps-7/48/Current_Position-512.png 


    //InfoWindow
    const detailWindow = new google.maps.InfoWindow({
            content: `<h4>Current Location</h4>`
        });
    
        marker.addListener("mouseover", () =>{
            detailWindow.open(map, marker);
        })
    
    //On click button function (needs more testing)
    function addMarker(){
        var destination = document.getElementById('to').value;
        
        let destiMarkers = new AdvancedMarkerElement({
            map,
            position: destination,
            icon: "https://img.icons8.com/nolan/2x/marker.png"
        });
    }
    //End of button function  

      const input1 = document.getElementById('to');
      //const input2 = document.getElementById('from');
      if (input1) {
        new window.google.maps.places.Autocomplete(input1);
      }
    //   if (input2) {
    //     new window.google.maps.places.Autocomplete(input2);
    //   }
    };

    // Function to handle geolocation
    const handleGeolocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          initMapAndAutocomplete(lat, lng);
        },
        () => {
          alert("This site wants to use your location. Please allow location access or your default location will be set to Dhaka, Bangladesh.");
          const defaultLat = 23.8041;
          const defaultLng = 90.4152;
          initMapAndAutocomplete(defaultLat, defaultLng);
        }
      );
    };

    // Load the Google Maps script with places library
    const apiKey = 'AIzaSyDmu00NLOVAlqySFmgviQiKW-S1g5W0V7s';
    loadScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`)
      .then(() => {
        // Initialize map and autocomplete after the script has loaded and geolocation is determined
        handleGeolocation();
      })
      .catch(error => {
        console.error('Error loading Google Maps script:', error);
      });

  }, [onMapLoad]);

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '500px', backgroundColor: '#000000' }} />
    </div>
  );
};

export default GoogleMap;
