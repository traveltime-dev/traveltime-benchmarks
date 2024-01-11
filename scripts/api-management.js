import http from 'k6/http';
import {sleep} from 'k6';

export const options = {
    scenarios: {
        main_scenario: {
            executor: 'constant-arrival-rate',
            duration: '1m',
            rate: '8000',
            timeUnit: '1m',
            startTime: '5s',
            gracefulStop: '10s',
            preAllocatedVUs: 10,
            maxVUs: 100,
        }
    },
};

export default function () {
    http.get('http://localhost:8080/auth?app_id=4da26ce0&api_key=26548ef9f1e83a01797f33f2e97f2846&usage%5Blegacy_hits%5D=1&token=ADflbhcOBW09jeEYlxzlqVBYkgZ33DBXufDySUy6WotQxG9za9wSOofGShiq');
    // Each VU makes a request approximately every second
    sleep(1);
};
