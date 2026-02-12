import axios from 'axios';

// Mocks database IDs based on the requirement
const MUNICIPALITIES = [
    { id: 1, name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { id: 2, name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
    { id: 3, name: 'Salem', lat: 11.6643, lon: 78.1460 }
];

export const determineMunicipality = async (latitude, longitude) => {
    try {
        // Reverse Geocoding via Nominatim
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const address = response.data.address;

        let detectedCity = 'Unknown';

        // Check address fields for city names
        // Nominatim returns different fields depending on location (city, town, village, county, state_district)
        const possibleFields = [address.city, address.town, address.village, address.county, address.state_district];

        // Simple string matching
        for (const field of possibleFields) {
            if (field) {
                if (field.includes('Chennai')) detectedCity = 'Chennai';
                else if (field.includes('Coimbatore')) detectedCity = 'Coimbatore';
                else if (field.includes('Salem')) detectedCity = 'Salem';
            }
        }

        // If Nominatim fails or returns outside known areas, fall back to distance
        if (detectedCity === 'Unknown') {
            detectedCity = getNearestCity(latitude, longitude);
        }

        const municipality = MUNICIPALITIES.find(m => m.name === detectedCity);
        return municipality ? municipality : MUNICIPALITIES[0]; // Default to Chennai if all else fails

    } catch (error) {
        console.error("Error determining municipality:", error);
        return getNearestCityObj(latitude, longitude); // Fallback to distance
    }
};

const getNearestCity = (lat, lon) => {
    let nearest = MUNICIPALITIES[0];
    let minDist = Infinity;

    MUNICIPALITIES.forEach(city => {
        const dist = Math.sqrt(Math.pow(city.lat - lat, 2) + Math.pow(city.lon - lon, 2));
        if (dist < minDist) {
            minDist = dist;
            nearest = city;
        }
    });

    return nearest.name;
};

const getNearestCityObj = (lat, lon) => {
    let nearest = MUNICIPALITIES[0];
    let minDist = Infinity;

    MUNICIPALITIES.forEach(city => {
        const dist = Math.sqrt(Math.pow(city.lat - lat, 2) + Math.pow(city.lon - lon, 2));
        if (dist < minDist) {
            minDist = dist;
            nearest = city;
        }
    });

    return nearest;
};
