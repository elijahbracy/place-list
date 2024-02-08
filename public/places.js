let markers = [];
let map;

const addPlace = async () => {
    const label = document.querySelector("#label").value;
    const address = document.querySelector("#address").value;
    await axios.put('/places', { label: label, address: address });
    await loadPlaces();
}

const deletePlace = async (id) => {
    await axios.delete(`/places/${id}`);
    await loadPlaces();
}

const renderMap = () => {
    map = L.map('map').setView([41, -74], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

const onRowClick = (e) => {
    let row = e.target;
    if (e.target.tagName.toUpperCase() === 'TD') {
        row = e.target.parentNode;
    }
    const lat = row.dataset.lat;
    const lng = row.dataset.lng;
    console.log(lat);
    console.log(lng);
    if (lat != 0 && lng != 0){
        map.flyTo(new L.LatLng(lat, lng));
    }
        
};

const loadPlaces = async () => {
    const response = await axios.get('/places');
    const tbody = document.querySelector('tbody');
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    for (const marker of markers) {
        map.removeLayer(marker);
    }
    markers = [];
    
    if (response && response.data && response.data.places) {
        for (const place of response.data.places) {
            const tr = document.createElement('tr');
            tr.dataset.lat = place.lat;
            tr.dataset.lng = place.lng;
            if (tr.dataset.lat != 0 && tr.dataset.lng != 0) {
                tr.classList.add('clickable');
            }
            tr.addEventListener('click', onRowClick);
            tr.innerHTML = `
                <td>${place.label}</td>
                <td>${place.address}</td>
                <td>
                    <button class='btn btn-danger' onclick='deletePlace(${place.id})'>Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
            if (place.lat && place.lng) {
                const marker = L.marker([place.lat, place.lng]).addTo(map)
                    .bindPopup(`<b>${place.label}</b><br/>${place.address}`);
                markers.push(marker);
            }
        }
    }
}

