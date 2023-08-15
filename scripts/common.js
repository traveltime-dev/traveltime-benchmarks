export let commonOptions = {
    stages: [
        {duration: '1m', target: 5}, //5 virtual users over 1 minutes
        {duration: '3m', target: 10}, //10 virtual users over 3 minutes
        {duration: '10s', target: 0},
    ]
};


export const countries = {
    'lv': {lat: 56.945614, lng: 24.120870},
    'nl': {lat: 52.3650144, lng: 4.892851},
    'at': {lat: 48.2244617, lng: 16.326472},
    'be': {lat: 50.8610222, lng: 4.384314},
    'de': {lat: 52.5446, lng: 13.35},
    'fr': {lat: 48.8540899, lng: 2.325747},
    'ie': {lat: 53.3129170, lng: -6.3308734},
    'lt': {lat: 54.6584053, lng: 25.2288244},
    'uk': {lat: 51.42561, lng: -0.128015},
    'us_akst': {lat: 61.218056, lng: -149.900284},
    'us_cstn': {lat: 41.8781136, lng: -87.6297982},
    'us_csts': {lat: 34.7303688, lng: -86.5861037},
    'us_estn': {lat: 40.712776, lng: -74.005974},
    'us_ests': {lat: 38.907192, lng: -77.036873},
    'us_hi': {lat: 21.3098845, lng: -157.8581401},
    'us_mst': {lat: 39.739235, lng: -104.990250},
    'us_pst': {lat: 34.052235, lng: -118.243683}
};

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function generateRandomCoordinate(lat, lng, diff) {
    return {
        lat: randomInRange(lat - diff, lat + diff),
        lng: randomInRange(lng - diff, lng + diff),
    };
}

export function generateDestinations(numCoordinates, departure, diff) {
    return Array.from({length: numCoordinates}, () =>
        generateRandomCoordinate(departure.lat, departure.lng, diff)
    );
}

export function destinationDeltas(departure, destinations) {
    return destinations.flatMap((destination) =>
        [encodeFixedPoint(departure.lat, destination.lat), encodeFixedPoint(departure.lng, destination.lng)]
    );
}

function encodeFixedPoint(sourcePoint, targetPoint) {
    return Math.round((targetPoint - sourcePoint) * (10 ** 5));
}

