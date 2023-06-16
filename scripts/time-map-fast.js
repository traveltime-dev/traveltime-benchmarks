import http from 'k6/http';
import { check, sleep } from 'k6';
import { generateRandomCoordinate, commonOptions } from './common.js';

export let options = commonOptions

export default function () {
    const appId = __ENV.APP_ID
    const apiKey = __ENV.API_KEY
    const host = __ENV.HOST || 'api.traveltimeapp.com'
    const url = `https://${host}/v4/time-map/fast`;

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
        arrival_searches: {
            one_to_many:[
                {
                    id: 'Time map fast benchmark',
                    coords: generateRandomCoordinate(51.50750,  51.50950, -0.128015, -0.128615),
                    arrival_time_period: 'weekday_morning',
                    travel_time: 900,
                    transportation: {
                        type: 'public_transport'
                    },
                    level_of_detail: {
                        scale_type: 'simple',
                        level: 'lowest'
                    }
                }
            ]
        }
    });
}
