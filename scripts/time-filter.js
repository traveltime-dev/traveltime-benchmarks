import http from 'k6/http';
import {
    check,
    sleep
} from 'k6';
import {
    generateRandomCoordinate,
    commonOptions
} from './common.js';

export let options = commonOptions;

export default function() {
    const appId = __ENV.APP_ID;
    const apiKey = __ENV.API_KEY;
    const host = __ENV.HOST || 'api.traveltimeapp.com';
    const url = `https://${host}/v4/time-filter`;
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
        locations: [{
                id: 'London center',
                coords: {
                    lat: 51.508930,
                    lng: -0.131387
                }
            },
            {
                id: 'Hyde Park',
                coords: {
                    lat: 51.508824,
                    lng: -0.167093
                }
            },
            {
                id: 'ZSL London Zoo',
                coords: {
                    lat: 51.536067,
                    lng: -0.153596
                }
            },
            {
                id: '27 Devonshire St',
                coords: {
                    lat: 51.521694,
                    lng: -0.148151
                }
            }
        ],
        departure_searches: [{
            id: 'Time filter benchmark',
            departure_location_id: 'London center',
            arrival_location_ids: [
                'Hyde Park',
                'ZSL London Zoo',
                '27 Devonshire St'
            ],
            departure_time: '2023-08-25T10:00:00Z',
            travel_time: 1900,
            properties: [
                'travel_time'
            ],
            transportation: {
                type: 'bus',
                max_changes: {
                    enabled: true,
                    limit: 3
                }
            },
            range: {
                enabled: true,
                max_results: 3,
                width: 600
            }
        }]
    });
}