import http from 'k6/http';
import {check, sleep} from 'k6';
import {generateRandomCoordinate} from './common.js';

export let options = {
    scenarios: {
        load_balance_scenario: {
            executor: 'constant-arrival-rate',
            duration: '2m',
            rate: 10,
            timeUnit: '1s',
            preAllocatedVUs: 10,
            maxVUs: 50,
            startTime: '2s',
            gracefulStop: '10s'
        }
    }
}


export default function () {
    const appId = __ENV.APP_ID
    const apiKey = __ENV.API_KEY
    const host = __ENV.HOST || 'api-dev.traveltimeapp.com'
    const url = `https://${host}/v4/time-map`;
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'X-Application-Id': appId,
            'X-Api-Key': apiKey
        },
    };

    const response = http.post(url, generateBody(), params);

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response body is not empty': (r) => r.body.length > 0,
    });
    sleep(1);
}

function generateBody() {
    return JSON.stringify({
        departure_searches: [
            {
                id: 'Time map fast benchmark',
                coords: generateRandomCoordinate(51.507609, -0.128315, -0.128615),
                departure_time: '2023-08-25T10:00:00Z',
                travel_time: 3600,
                transportation: {
                    type: 'driving'
                }
            }
        ]
    });
}
