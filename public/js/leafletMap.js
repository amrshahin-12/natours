/* eslint-disable */
const mapContainer = document.getElementById('map');

if (mapContainer) {
  const locations = JSON.parse(mapContainer.dataset.locations);

  //create a new interactive map, and render it inside the element with id 'map'
  const map = L.map('map', {
    scrollWheelZoom: false,
  });

  //L.tileLayer(url, options) — creates a "layer" that knows how to fetch and display tile images
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_3hnr_1_7919a6022668d9eb950535ab',
    {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  ).addTo(map);
  //.addTo(map) — attaches this tile layer to your map object, so it renders.

  // Custom marker icon using existing .marker CSS class
  const customIcon = L.divIcon({
    className: 'marker',
    iconSize: [20, 25],
    iconAnchor: [16, 40], // bottom-center of the pin touches the actual location
    popupAnchor: [0, -40], // popup opens above the pin tip, not through it
  });

  const points = []; //will fill the array with the locations

  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);

    //creates an actual marker pin at that specific coordinate
    L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
        // closeOnClick: false, // Prevents closing when clicking on the map
      })
      .openPopup();
  });

  //takes your array of [lat, lng] pairs
  //and calculates the smallest rectangular box that contains all of them.
  const bounds = L.latLngBounds(points).pad(0.5);

  //instead of hardcoding fixed center
  //dynamically calc it based on tours coordinates
  map.fitBounds(bounds);
}
