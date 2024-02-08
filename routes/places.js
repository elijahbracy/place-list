const express = require('express');
const router = express.Router();
const geo = require('node-geocoder');

const buildAddress = (geoEntry) => {
    let address = ''
    const streetNumber = geoEntry[0].streetNumber || '';
    const street = geoEntry[0].streetName || '';
    const city = geoEntry[0].city || '';
    const state = geoEntry[0].state || '';
    const postalCode = geoEntry[0].zipcode || '';
    const country = geoEntry[0].country || '';
    if (streetNumber) {
        address += streetNumber;
        address += ' '
    }
    if (street) {
    address += street;
    }
    if (city) {
        if (address) {
            address += ', ';
        }
        address += city;
    }
    if (state) {
        if (address) {
            address += ', ';
        }
        address += state;
    }
    if (postalCode) {
        if (address) {
            address += ' ';
        }
        address += postalCode;
    }
    if (country) {
        if (address) {
        address += ', ';
        }
        address += country;
    }
    return address;
}

router.get('/', async (req, res) => {
    const places = await req.db.findPlaces();
    res.json({ places: places });
});

router.put('/', async (req, res) => {
    const geocoder = geo({ provider: 'openstreetmap' });
    const result = await geocoder.geocode(req.body.address);
    if (result.length > 0) {
        console.log(`The location is ${result[0].latitude}/${result[0].longitude}`)
        const address = buildAddress(result);
        const lat = result[0].latitude || 0;
        const lng = result[0].longitude || 0;
        const id = await req.db.createPlace(req.body.label, address, lat, lng);
        res.json({ 
            id: id, 
            label: req.body.label, 
            address: address, 
            lat: lat, 
            lng: lng 
        });
    } else {
        const id = await req.db.createPlace(req.body.label, req.body.address, 0, 0);
        res.json({ 
            id: id, 
            label: req.body.label, 
            address: req.body.address, 
            lat: 0, 
            lng: 0 
        });
    };
});

router.delete('/:id', async (req, res) => {
    await req.db.deletePlace(req.params.id);
    res.status(200).send();
})

module.exports = router;