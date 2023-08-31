import http from 'k6/http';
import {
    check,
    sleep
} from 'k6';
import {
    generateRandomCoordinate,
    commonOptions,
    getCapitalCoordinates,
    destinations,
    configs,
    setThresholdsForScenarios,
    summaryFormatter
} from './common.js';

export let options = configs

setThresholdsForScenarios(options)

export default function() {
    const appId = __ENV.APP_ID;
    const apiKey = __ENV.API_KEY;
    const host = __ENV.HOST || 'api-dev.traveltimeapp.com';
    const country = __ENV.COUNTRY || 'GB'
    const countryCode = country.toUpperCase()
    const url = `https://${host}/v4/time-filter`;
    const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
    const travelTime = __ENV.TRAVEL_TIME || 1900
    const destinationsAmount = __ENV.SCENARIO_DESTINATIONS || 2000
    const rangeWidth = __ENV.RANGE || 0
    const rangeSettings = {
        enabled: rangeWidth === 0 ? false : true,
        max_results: 3,
        width: rangeWidth === 0 ? 1 : parseInt(rangeWidth)
    };

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'X-Application-Id': appId,
            'X-Api-Key': apiKey
        },
    };

    const response = http.post(url, generateBody(countryCode, travelTime,
        transportation, destinationsAmount, rangeSettings), params);
    check(response, {
        'status is 200': (r) => r.status === 200,
        'response body is not empty': (r) => r.body.length > 0,
    });
    sleep(1);
}

export function handleSummary(data) {
    return summaryFormatter(data)
}

function generateBody(countryCode, travelTime, transportation, destinationsAmount, rangeSettings) {
    const coordinates = getCapitalCoordinates(countryCode);
    const destinations = [];

    for (let i = 1; i <= destinationsAmount; i++) {
        destinations.push({
            id: `destination${i}`,
            coords: generateRandomCoordinate(coordinates.latitude, coordinates.longitude, 0.005)
        });
    }

    const departureSearches = [{
        id: 'Time filter benchmark',
        departure_location_id: 'destination1',
        arrival_location_ids: destinations.map(destination => destination.id),
        departure_time: '2023-08-25T10:00:00Z',
        travel_time: travelTime,
        properties: [
            'travel_time'
        ],
        transportation: {
            type: transportation
        },
        range: rangeSettings
    }];

    return JSON.stringify({
        locations: destinations,
        departure_searches: departureSearches
    });
}