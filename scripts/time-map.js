import http from 'k6/http';
import {check, sleep} from 'k6';
import {
    generateRandomCoordinate,
    getCapitalCoordinates,
    destinations,
    configs,
    setThresholdsForScenarios,
    summaryFormatter
} from './common.js';


export let options = configs
setThresholdsForScenarios(options)

export default function () {
    const appId = __ENV.APP_ID
    const apiKey = __ENV.API_KEY
    const host = __ENV.HOST || 'api-dev.traveltimeapp.com'
    const country = __ENV.COUNTRY || 'GB'
    const countryCode = country.toUpperCase()
    const url = `https://${host}/v4/time-map`;
    const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
    const travelTime = __ENV.TRAVEL_TIME || 7200
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'X-Application-Id': appId,
            'X-Api-Key': apiKey
        },
    };

    const response = http.post(url, generateBody(countryCode, travelTime, transportation), params);

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response body is not empty': (r) => r.body.length > 0,
    });
    sleep(1);
}

export function handleSummary(data) {
    return summaryFormatter(data)
}

function generateBody(countryCode, travelTime, transportation) {
    const coordinates = getCapitalCoordinates(countryCode);
    return JSON.stringify({
        departure_searches: [
            {
                id: 'Time map fast benchmark',
                coords: generateRandomCoordinate(coordinates.latitude,  coordinates.longitude, 0.005),
                departure_time: '2023-08-25T10:00:00Z',
                travel_time: travelTime,
                transportation: {
                    type: transportation
                }
            }
        ]
    });
}