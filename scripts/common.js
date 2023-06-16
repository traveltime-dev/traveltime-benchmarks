export let commonOptions = {
    stages: [
        { duration: '1m', target: 5 }, //5 virtual users over 1 minutes
        { duration: '3m', target:  10}, //10 virtual users over 3 minutes
        { duration: '10s', target: 0 },
    ]
};

export const protoOptions = {
    scenarios: {
        main_scenario: {
            executor: 'constant-vus',
            duration: '4m',
            vus: 2,
            startTime: '20s',
            gracefulStop: '20s',
        },
    }
};


export const countries = {
    'uk': { lat: 51.42561, lng: -0.128015 },
    'de': { lat: 51.1657, lng: 10.4515 },
    'au': { lat: -25.2744, lng: 133.7751 },
    'jp': { lat: 36.2048, lng: 138.2529 }
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

