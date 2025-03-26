let map;
let userLocation = null;
let markers = [];
let selectedVendors = new Set();
const suratCoordinates = { lat: 21.1702, lng: 72.8311 };
let infoWindow = null;
let reviews = JSON.parse(localStorage.getItem('foodReviews')) || [];

// Vendor data with additional details
const vendorData = [
    {id: '1', key: 'Asal Amdavadi Tava Fry', location: { lat: 21.216963633909845, lng: 72.79996173130824 }, city: 'Surat', cuisines: ['Gujarati'], isVeg: false, rating: 4.2, description: 'Famous for its authentic Amdavadi style tava fry and seafood dishes.'},
    {id: '2', key: 'Radhe Dhokla', location: { lat: 21.18564219958459, lng: 72.83323808183071 }, city: 'Surat', cuisines: ['Gujarati'], isVeg: true, rating: 4.5, description: 'Best place for fresh, fluffy dhoklas and other Gujarati snacks.'}, 
    {id: '3', key: 'Taj Mahal Restaurant', location: { lat: 21.205593079895934, lng: 72.83978022511813 }, city: 'Surat', cuisines: ['Gujarati'], isVeg: true, rating: 4.0, description: 'Classic Gujarati thali with unlimited servings in a traditional setting.'},
    {id: '4', key: 'Gopal Ji',  location: { lat: 21.191719346821177, lng: 72.84072601543068 }, city: 'Surat', cuisines: ['Gujarati'], isVeg: true, rating: 4.3, description: 'Renowned for its delicious kachoris and jalebis since 1975.'},
    {id: '5', key: 'Mahesh Pav Bhaji',   location: { lat: 21.235513980307406, lng: 72.82737943072536 }, city: 'Surat', cuisines: ['Gujarati'], isVeg: true, rating: 4.1, description: 'Buttery pav bhaji with a special Surati twist that keeps people coming back.'},
    {id: '6', key: 'Pahelvan Brothers', location: { lat: 21.18780348498252, lng: 72.84367440791706 }, city: 'Surat', cuisines: ['Gujarati'], isVeg: true, rating: 4.4, description: 'Legendary for its locho - a Surat specialty that you must try.'},  
    {id: '7', key: 'Agrawal Bhel & Chat Centre', location: { lat: 21.191086091491226, lng: 72.84428552678384 }, city: 'Surat', cuisines: ['Snacks'], isVeg: true, rating: 4.2, description: 'Crispy bhel puri and sev puri made with fresh ingredients daily.'},  
    {id: '8', key: 'Raj Food Corner', location: { lat: 21.11566092738725, lng: 73.10703689566782 }, city: 'Surat', cuisines: ['Gujarati'], isVeg: true, rating: 3.9, description: 'Local favorite for affordable and tasty Gujarati meals.'},  
    {id: '9', key: 'Badshah Foods', location: { lat: 21.194554324812717, lng: 72.83480351343961 }, city: 'Surat', cuisines: ['Snacks'], isVeg: true, rating: 4.3, description: 'Famous for its dabeli - a spicy potato filling in a bun with special chutneys.'},  
    {id: '10', key: 'Rd Sharma Pavbhaji And Dosa', location: { lat: 21.19848148837342, lng: 72.84814379844724 }, city: 'Surat', cuisines: ['Gujarati'], isVeg: true, rating: 4.0, description: 'Unique fusion of Gujarati and South Indian flavors in their dishes.'},
    {id: '11', key: 'Mukesh Egg Center', location: { lat: 21.14629404472685, lng: 72.79205700289023}, city: 'Surat', cuisines: ['Gujarati'], isVeg: false, rating: 4.1, description: 'Best egg dishes in town - try their egg bhurji and anda pav.'},
    {id: '12', key: 'Sai Ragda Patties', location: { lat: 21.198220414795273, lng: 72.83359966003849 }, city: 'Surat', cuisines: ['Gujarati'], isVeg: true, rating: 4.2, description: 'Crispy patties served with spicy ragda and tangy chutneys.'},
    {id: '13', key: 'Gopal Locho', location: { lat: 21.203907636678963, lng: 72.83620605571478 }, city: 'Surat', cuisines: ['Gujarati'], isVeg: true, rating: 4.5, description: 'The original locho destination in Surat - a must-visit for foodies.'}, 
    {id: '14', key: 'Famous Aalupuri And Khawsa', location: { lat: 21.187204048710175, lng: 72.8235546074276 }, city: 'Surat', cuisines: ['Snacks'], isVeg: true, rating: 4.0, description: 'Try their special aalupuri - a unique Surat street food item.'}, 
    {id: '15', key: 'Shankar Fancy Dhosa', location: { lat: 21.184714076266708, lng: 72.81273533563046 }, city: 'Surat', cuisines: ['South Indian'], isVeg: true, rating: 4.3, description: 'Innovative dosa varieties with a Gujarati influence.'}
];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: suratCoordinates,
        zoom: 13,
        mapId: 'da37f3254c6a6d1c',
        disableDefaultUI: true,
        zoomControl: true
    });

    // Initialize services
    window.directionsService = new google.maps.DirectionsService();
    window.directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
            strokeColor: '#4285F4',
            strokeOpacity: 0.8,
            strokeWeight: 4
        }
    });
    directionsRenderer.setMap(map);

    // Initialize info window
    infoWindow = new google.maps.InfoWindow();

    // Get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                document.getElementById('userLocation').innerHTML = 
                    `<i class="fas fa-map-marker-alt"></i> Your Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                addUserMarker();
                loadVendors();
            },
            error => {
                console.error('Geolocation error:', error);
                userLocation = suratCoordinates;
                addUserMarker();
                loadVendors();
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    } else {
        userLocation = suratCoordinates;
        addUserMarker();
        loadVendors();
    }

    // Event listeners
    document.getElementById('cuisineFilter').addEventListener('change', loadVendors);
    document.getElementById('vegFilter').addEventListener('change', loadVendors);
    document.getElementById('sortFilter').addEventListener('change', loadVendors);
    
    // Load reviews
    loadReviews();
    
    // Review form submission
    document.getElementById('reviewForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const reviewData = {
            userName: document.getElementById('userName').value,
            text: document.getElementById('reviewText').value,
            rating: parseInt(document.getElementById('reviewRating').value),
            timestamp: new Date().toISOString()
        };
        
        if (!reviewData.rating) {
            alert('Please select a rating');
            return;
        }
        
        reviews.unshift(reviewData);
        localStorage.setItem('foodReviews', JSON.stringify(reviews));
        loadReviews();
        e.target.reset();
        alert('Thank you for your review!');
    });
}

function loadVendors() {
    showLoading('Loading vendors...');
    
    const cuisine = document.getElementById('cuisineFilter').value;
    const vegOnly = document.getElementById('vegFilter').checked;
    const sortBy = document.getElementById('sortFilter').value;

    // Filter vendors
    let vendors = vendorData.filter(vendor => {
        const cuisineMatch = cuisine === 'all' || vendor.cuisines.includes(cuisine);
        const vegMatch = !vegOnly || vendor.isVeg;
        return cuisineMatch && vegMatch;
    });

    // Calculate distances
    vendors = vendors.map(vendor => ({
        ...vendor,
        distance: userLocation ? calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            vendor.location.lat, 
            vendor.location.lng
        ) : null
    }));

    // Sort vendors
    vendors = sortVendors(vendors, sortBy);

    renderVendors(vendors);
    updateMapMarkers(vendors);
    
    hideLoading();
}

function sortVendors(vendors, sortBy) {
    switch(sortBy) {
        case 'distance':
            return vendors.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        case 'name':
        default:
            return vendors.sort((a, b) => a.key.localeCompare(b.key));
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

function renderVendors(vendors) {
    const vendorList = document.getElementById('vendorList');
    vendorList.innerHTML = vendors.length ? '' : '<p>No vendors found matching criteria</p>';
    
    vendors.forEach(vendor => {
        const card = document.createElement('div');
        card.className = `vendor-card ${selectedVendors.has(vendor.id) ? 'highlighted' : ''}`;
        
        const distanceText = vendor.distance ? 
            `<span class="distance-badge">${vendor.distance.toFixed(1)} km away</span>` : '';
        
        card.innerHTML = `
            <div class="vendor-info">
                <h3>${vendor.key}</h3>
                ${distanceText}
            </div>
            <div class="location-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>${vendor.location.lat.toFixed(5)}, ${vendor.location.lng.toFixed(5)}</span>
            </div>
            <p class="vendor-description">${vendor.description}</p>
            <div class="vendor-tags">
                <span class="tag ${vendor.isVeg ? 'veg' : 'non-veg'}">
                    ${vendor.isVeg ? 'VEG' : 'NON-VEG'}
                </span>
                ${vendor.cuisines.map(cuisine => `<span class="tag">${cuisine}</span>`).join('')}
                <span class="tag"><i class="fas fa-star"></i> ${vendor.rating}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button onclick="toggleSelection('${vendor.id}', event)">
                    <i class="fas fa-${selectedVendors.has(vendor.id) ? 'check-' : ''}square"></i> 
                    ${selectedVendors.has(vendor.id) ? 'Selected' : 'Select'}
                </button>
                <button class="secondary" onclick="showVendorOnMap('${vendor.id}', event)">
                    <i class="fas fa-map-marked-alt"></i> View
                </button>
            </div>
        `;
        
        // Clicking anywhere on the card selects the vendor
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                toggleSelection(vendor.id);
            }
        });
        
        vendorList.appendChild(card);
    });
}

function toggleSelection(vendorId, event = null) {
    if (event) event.stopPropagation();
    
    if (selectedVendors.has(vendorId)) {
        selectedVendors.delete(vendorId);
    } else {
        selectedVendors.add(vendorId);
    }
    loadVendors();
}

function showVendorOnMap(vendorId, event = null) {
    if (event) event.stopPropagation();
    
    const vendor = vendorData.find(v => v.id === vendorId);
    if (vendor) {
        map.panTo(new google.maps.LatLng(vendor.location.lat, vendor.location.lng));
        map.setZoom(16);
        
        // Highlight the marker
        const marker = markers.find(m => m.getTitle() === vendor.key);
        if (marker) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 1400);
            
            // Show info window
            infoWindow.setContent(`
                <div style="padding: 1rem; max-width: 250px;">
                    <h3 style="margin: 0 0 0.5rem 0;">${vendor.key}</h3>
                    <p style="margin: 0 0 0.5rem 0; color: #555;">${vendor.description}</p>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="tag ${vendor.isVeg ? 'veg' : 'non-veg'}" style="font-size: 0.8rem;">
                            ${vendor.isVeg ? 'VEG' : 'NON-VEG'}
                        </span>
                        <span class="tag" style="font-size: 0.8rem;">
                            <i class="fas fa-star"></i> ${vendor.rating}
                        </span>
                    </div>
                    <button onclick="window.toggleSelection('${vendor.id}')" 
                        style="width: 100%; padding: 0.5rem; margin-top: 0.5rem;">
                        <i class="fas fa-${selectedVendors.has(vendor.id) ? 'check-' : ''}square"></i> 
                        ${selectedVendors.has(vendor.id) ? 'Remove from Route' : 'Add to Route'}
                    </button>
                </div>
            `);
            infoWindow.open(map, marker);
        }
    }
}

// Fixed findOptimalRoute function with proper error handling
async function findOptimalRoute() {
    if (!userLocation) {
        alert('Please allow location access to find the optimal route');
        return;
    }
    
    if (selectedVendors.size === 0) {
        alert('Please select at least one vendor to find a route');
        return;
    }

    showLoading('Calculating best route...');
    
    try {
        const vendors = Array.from(selectedVendors).map(id => 
            vendorData.find(vendor => vendor.id === id)
        );
        
        const waypoints = vendors.map(vendor => ({
            location: new google.maps.LatLng(vendor.location.lat, vendor.location.lng),
            stopover: true
        }));

        // First try with optimizeWaypoints: true
        let request = {
            origin: userLocation,
            destination: userLocation,
            waypoints: waypoints,
            travelMode: 'DRIVING',
            optimizeWaypoints: true,
            provideRouteAlternatives: false
        };

        const response = await new Promise((resolve) => {
            directionsService.route(request, (result, status) => {
                if (status === 'OK') {
                    resolve(result);
                } else {
                    // If optimization fails, try without optimization
                    request.optimizeWaypoints = false;
                    directionsService.route(request, (result, status) => {
                        resolve(status === 'OK' ? result : null);
                    });
                }
            });
        });

        if (!response) {
            throw new Error('Could not calculate route');
        }

        // Display the route
        directionsRenderer.setDirections(response);
        
        // Show route summary
        const route = response.routes[0];
        const summaryPanel = document.getElementById('vendorList');
        
        let stopsHTML = '';
        route.legs.forEach((leg, index) => {
            const vendor = vendors.find(v => 
                Math.abs(v.location.lat - leg.end_location.lat()) < 0.0001 && 
                Math.abs(v.location.lng - leg.end_location.lng()) < 0.0001
            );
            
            if (vendor) {
                stopsHTML += `
                    <div style="padding: 0.5rem; border-bottom: 1px solid #eee; display: flex; align-items: center;">
                        <span style="background: var(--primary-color); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 0.5rem;">
                            ${index + 1}
                        </span>
                        <span>${vendor.key}</span>
                        <span style="margin-left: auto; font-size: 0.8rem; color: #666;">
                            ${leg.duration.text} • ${leg.distance.text}
                        </span>
                    </div>
                `;
            }
        });
        
        summaryPanel.innerHTML = `
            <div class="route-summary">
                <h3><i class="fas fa-route"></i> Optimal Route Found</h3>
                <p><strong>Total Distance:</strong> ${route.legs[0].distance.text}</p>
                <p><strong>Estimated Duration:</strong> ${route.legs[0].duration.text}</p>
                <p><strong>Number of Stops:</strong> ${selectedVendors.size}</p>
                
                <div style="margin: 1rem 0;">
                    <h4>Route Order:</h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${stopsHTML}
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="zoomToRoute()"><i class="fas fa-search-location"></i> View Full Route</button>
                    <button class="danger" onclick="clearRoute()"><i class="fas fa-times"></i> Clear Route</button>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Route calculation error:', error);
        document.getElementById('vendorList').innerHTML = `
            <div class="route-error">
                <h3><i class="fas fa-exclamation-triangle"></i> Route Calculation Failed</h3>
                <p>We couldn't calculate the optimal route. Please try again with fewer locations or check your internet connection.</p>
                <button onclick="findOptimalRoute()"><i class="fas fa-sync-alt"></i> Try Again</button>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// New helper function to zoom to show entire route
function zoomToRoute() {
    const directions = directionsRenderer.getDirections();
    if (!directions) return;
    
    const bounds = new google.maps.LatLngBounds();
    directions.routes[0].legs.forEach(leg => {
        bounds.extend(leg.start_location);
        bounds.extend(leg.end_location);
    });
    map.fitBounds(bounds);
}

// New function to get multiple route alternatives
async function getRouteAlternatives(origin, waypoints) {
    const requests = [
        // Fastest route
        {
            origin,
            destination: origin,
            waypoints,
            travelMode: 'DRIVING',
            optimizeWaypoints: true,
            provideRouteAlternatives: false
        },
        // Shortest distance route
        {
            origin,
            destination: origin,
            waypoints,
            travelMode: 'DRIVING',
            optimizeWaypoints: true,
            provideRouteAlternatives: false,
            drivingOptions: {
                departureTime: new Date(),
                trafficModel: 'bestguess'
            }
        }
    ];

    const results = await Promise.all(
        requests.map(request => 
            new Promise((resolve) => {
                directionsService.route(request, (result, status) => {
                    if (status === 'OK') {
                        resolve(result.routes[0]);
                    } else {
                        resolve(null);
                    }
                });
            })
        )
    );

    return results.filter(route => route !== null);
}

// New function to display route options
function displayRouteOptions(routes) {
    const vendorList = document.getElementById('vendorList');
    
    // Sort routes by duration (fastest first)
    routes.sort((a, b) => a.legs[0].duration.value - b.legs[0].duration.value);
    
    let routeOptionsHTML = `
        <div class="route-summary">
            <h3><i class="fas fa-route"></i> Choose Your Route</h3>
            <div class="route-options">
                <p>Select your preferred route option:</p>
    `;
    
    routes.forEach((route, index) => {
        const duration = route.legs[0].duration.text;
        const distance = route.legs[0].distance.text;
        
        routeOptionsHTML += `
            <div class="route-option">
                <input type="radio" id="route${index}" name="routeOption" value="${index}" 
                    ${index === 0 ? 'checked' : ''}>
                <label for="route${index}">
                    Option ${index + 1}: ${duration} (${distance})
                </label>
            </div>
        `;
    });
    
    routeOptionsHTML += `
            </div>
            <button onclick="applySelectedRoute()" style="margin-top: 1rem;">
                <i class="fas fa-check"></i> Use Selected Route
            </button>
            <div id="routeDetails" class="route-details"></div>
        </div>
    `;
    
    vendorList.innerHTML = routeOptionsHTML;
    
    // Show details for the first route by default
    if (routes.length > 0) {
        showRouteDetails(0, routes[0]);
    }
    
    // Add event listeners for route selection
    routes.forEach((route, index) => {
        document.getElementById(`route${index}`).addEventListener('change', () => {
            showRouteDetails(index, route);
        });
    });
}

// New function to show details for a specific route
function showRouteDetails(index, route) {
    const vendors = Array.from(selectedVendors).map(id => 
        vendorData.find(vendor => vendor.id === id)
    );
    
    let stopsHTML = '';
    route.legs.forEach((leg, i) => {
        const vendor = vendors.find(v => 
            v.location.lat === leg.end_location.lat() && 
            v.location.lng === leg.end_location.lng()
        );
        
        if (vendor) {
            stopsHTML += `
                <div class="route-alternative" onclick="highlightRouteStop(${i}, ${index})">
                    <strong>Stop ${i + 1}:</strong> ${vendor.key}
                    <div style="font-size: 0.8rem; color: #555;">
                        ${leg.duration.text} • ${leg.distance.text}
                    </div>
                </div>
            `;
        }
    });
    
    const routeDetails = document.getElementById('routeDetails');
    routeDetails.innerHTML = `
        <h4>Route Details (Option ${index + 1})</h4>
        <p><strong>Total Distance:</strong> ${route.legs[0].distance.text}</p>
        <p><strong>Estimated Duration:</strong> ${route.legs[0].duration.text}</p>
        <div style="margin-top: 1rem;">
            <h5>Route Stops:</h5>
            ${stopsHTML}
        </div>
    `;
    routeDetails.style.display = 'block';
}

// New function to apply the selected route
function applySelectedRoute() {
    const selectedRouteIndex = document.querySelector('input[name="routeOption"]:checked').value;
    const route = window.routeAlternatives[selectedRouteIndex];
    
    directionsRenderer.setDirections({
        routes: [route],
        request: {
            origin: userLocation,
            destination: userLocation,
            waypoints: Array.from(selectedVendors).map(id => ({
                location: new google.maps.LatLng(
                    vendorData.find(v => v.id === id).location.lat,
                    vendorData.find(v => v.id === id).location.lng
                ),
                stopover: true
            })),
            travelMode: 'DRIVING'
        }
    });
    
    // Update the display with the final selected route
    const vendorList = document.getElementById('vendorList');
    vendorList.innerHTML = `
        <div class="route-summary">
            <h3><i class="fas fa-route"></i> Your Selected Route</h3>
            <p><strong>Total Distance:</strong> ${route.legs[0].distance.text}</p>
            <p><strong>Estimated Duration:</strong> ${route.legs[0].duration.text}</p>
            <button class="danger" onclick="clearRoute()" style="margin-top: 1rem;">
                <i class="fas fa-times"></i> Clear Route
            </button>
            <div id="routeDetails" class="route-details" style="display: block;">
                ${document.getElementById('routeDetails').innerHTML}
            </div>
        </div>
    `;
}

// New function to highlight a specific stop on the map
function highlightRouteStop(stopIndex, routeIndex) {
    const route = window.routeAlternatives[routeIndex];
    const leg = route.legs[stopIndex];
    
    // Center map on this stop
    map.panTo(leg.end_location);
    map.setZoom(16);
    
    // Find and bounce the marker
    const vendor = vendorData.find(v => 
        v.location.lat === leg.end_location.lat() && 
        v.location.lng === leg.end_location.lng()
    );
    
    if (vendor) {
        const marker = markers.find(m => m.getTitle() === vendor.key);
        if (marker) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 1400);
        }
    }
}

function clearRoute() {
    directionsRenderer.setDirections({routes: []});
    selectedVendors.clear();
    loadVendors();
}

function addUserMarker() {
    new google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFF',
            strokeWeight: 2,
            scale: 8
        },
        zIndex: 1000
    });
}

function updateMapMarkers(vendors) {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    vendors.forEach(vendor => {
        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(vendor.location.lat, vendor.location.lng),
            map: map,
            title: vendor.key,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: selectedVendors.has(vendor.id) ? '#2ecc71' : '#e74c3c',
                fillOpacity: 1,
                strokeColor: '#FFF',
                strokeWeight: 2,
                scale: 8
            }
        });

        marker.addListener('click', () => {
            map.panTo(marker.getPosition());
            map.setZoom(16);
            
            // Show info window
            infoWindow.setContent(`
                <div style="padding: 1rem; max-width: 250px;">
                    <h3 style="margin: 0 0 0.5rem 0;">${vendor.key}</h3>
                    <p style="margin: 0 0 0.5rem 0; color: #555;">${vendor.description}</p>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="tag ${vendor.isVeg ? 'veg' : 'non-veg'}" style="font-size: 0.8rem;">
                            ${vendor.isVeg ? 'VEG' : 'NON-VEG'}
                        </span>
                        <span class="tag" style="font-size: 0.8rem;">
                            <i class="fas fa-star"></i> ${vendor.rating}
                        </span>
                    </div>
                    <button onclick="window.toggleSelection('${vendor.id}')" 
                        style="width: 100%; padding: 0.5rem; margin-top: 0.5rem;">
                        <i class="fas fa-${selectedVendors.has(vendor.id) ? 'check-' : ''}square"></i> 
                        ${selectedVendors.has(vendor.id) ? 'Remove from Route' : 'Add to Route'}
                    </button>
                </div>
            `);
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    });
}

function loadReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.innerHTML = '';
    
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviews.slice(0, 5).forEach(review => {
        const reviewDate = new Date(review.timestamp);
        
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
            <div class="review-author">${review.userName}</div>
            <div class="review-date">${reviewDate.toLocaleDateString()}</div>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <div class="review-text">${review.text}</div>
        `;
        reviewsContainer.appendChild(reviewItem);
    });
}

function showLoading(text = 'Loading...') {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

window.initMap = initMap;
window.toggleSelection = toggleSelection;
window.findOptimalRoute = findOptimalRoute;
window.clearRoute = clearRoute;
window.showVendorOnMap = showVendorOnMap;