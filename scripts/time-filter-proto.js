import http from 'k6/http';
import protobuf from 'k6/x/protobuf';
import {check, randomSeed, sleep} from 'k6';
import {countries, destinationDeltas, generateDestinations, generateRandomCoordinate} from './common.js';
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";


const configs = {
    scenarios: {
        sending_5000_destinations: {
            executor: 'constant-vus',
            duration: '5s',
            env: {DESTINATIONS: '5000'},

            vus: 1,
            startTime: '1s',
            gracefulStop: '2s',
        },
        sending_10000_destinations: {
            executor: 'constant-vus',
            env: {DESTINATIONS: '10000'},
            duration: '5s',
            vus: 1,
            startTime: '1s',
            gracefulStop: '2s',
        },
        sending_25000_destinations: {
            executor: 'constant-vus',
            env: {DESTINATIONS: '25000'},
            duration: '5s',
            vus: 1,
            startTime: '1s',
            gracefulStop: '2s',
        },
        sending_100000_destinations: {
            executor: 'constant-vus',
            env: {DESTINATIONS: '100000'},
            duration: '5s',
            vus: 1,
            startTime: '1s',
            gracefulStop: '2s',
        },
    },
    summaryTrendStats: ['avg', 'min', 'max', 'p(90)', 'p(95)'],

    thresholds: {
        // Intentionally empty. We'll programatically define our bogus
        // thresholds (to generate the sub-metrics) below. In your real-world
    }
}

export let options = configs

for (let key in options.scenarios) {
    options.thresholds[`http_req_duration{scenario:${key}}`] = ['max>=0']
    options.thresholds[`http_req_receiving{scenario:${key}}`] = ['max>=0']
    options.thresholds[`http_req_sending{scenario:${key}}`] = ['max>=0']
    options.thresholds[`http_req_connecting{scenario:${key}}`] = ['max>=0']

}

export default function () {
    const serviceImage = __ENV.SERVICE_IMAGE || 'unknown'
    const appId = __ENV.APP_ID
    const apiKey = __ENV.API_KEY
    const host = __ENV.HOST || 'proto.api.traveltimeapp.com'
    const destinations = __ENV.DESTINATIONS || '100000'
    const seed = __ENV.SEED || 1234567
    const country = __ENV.COUNTRY || 'uk'
    const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
    const query = __ENV.QUERY || `api/v2/${country}/time-filter/fast/${transportation}`
    const protocol = __ENV.PROTOCOL || 'https'
    const travelTime = __ENV.TRAVEL_TIME || 7200

    const countryCoords = countries[country]
    const destinationsAmount = parseInt(destinations)

    randomSeed(seed)
    const url = `${protocol}://${appId}:${apiKey}@${host}/${query}`

    const requestBody = protobuf
        .load('proto/request.proto', 'TimeFilterFastRequest')
        .encode(generateBody(destinationsAmount, countryCoords, transportation, travelTime))


    const response = http.post(
        url,
        requestBody,
        {
            headers: {'Content-Type': 'application/octet-stream'},
            tags: {'destinations': destinationsAmount, 'serviceImage': serviceImage}
        }
    );

    const decodedResponse = protobuf.load('proto/response.proto', 'TimeFilterFastResponse').decode(response.body)

    check(response, {
        'status is 200': (r) => r.status === 200,
    });

    check(decodedResponse, {
        'response body is not empty': (r) => r.length !== 0,
    });


    sleep(1);
}

export function handleSummary(data) {
    delete data.metrics['http_req_duration']
    delete data.metrics['http_req_sending']
    delete data.metrics['http_req_receiving']
    delete data.metrics['http_req_blocked']
    delete data.metrics[`http_req_duration{expected_response:true}`]
    delete data.metrics['http_req_waiting']
    delete data.metrics['http_reqs']
    delete data.metrics['iteration_duration']
    delete data.metrics['iterations']
    delete data.metrics['vus']
    delete data.metrics['http_req_connecting']
    delete data.metrics['http_req_failed']
    delete data.metrics['http_req_tls_handshaking']

    data = reportPerDestination(data, 5000)
    data = reportPerDestination(data, 10000)
    data = reportPerDestination(data, 25000)
    data = reportPerDestination(data, 100000)

    return {
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    }
}

function reportPerDestination(data, destinations) {
    data.metrics[`http_req_duration(${destinations} destinations)`] = data.metrics[`http_req_duration{scenario:sending_${destinations}_destinations}`]
    delete data.metrics[`http_req_duration{scenario:sending_${destinations}_destinations}`]
    data.metrics[`http_req_sending(${destinations} destinations)`] = data.metrics[`http_req_sending{scenario:sending_${destinations}_destinations}`]
    delete data.metrics[`http_req_sending{scenario:sending_${destinations}_destinations}`]
    data.metrics[`http_req_receiving(${destinations} destinations)`] = data.metrics[`http_req_receiving{scenario:sending_${destinations}_destinations}`]
    delete data.metrics[`http_req_receiving{scenario:sending_${destinations}_destinations}`]
    data.metrics[`http_req_connecting(${destinations} destinations)`] = data.metrics[`http_req_connecting{scenario:sending_${destinations}_destinations}`]
    delete data.metrics[`http_req_connecting{scenario:sending_${destinations}_destinations}`]
    return data
}


function transportationType(transportation) {
    switch (transportation) {
        case 'driving+ferry':
            return 'DRIVING_AND_FERRY'
        case 'pt':
            return 'PUBLIC_TRANSPORT'
        default:
            return null
    }
}


function generateBody(destinationsAmount, coord, transportation, travelTime) {
    const diff = 0.005
    const departure = generateRandomCoordinate(coord.lat, coord.lng, diff)
    const destinations = generateDestinations(destinationsAmount, departure, diff)
    return JSON.stringify({
        oneToManyRequest: {
            departureLocation: departure,
            locationDeltas: destinationDeltas(departure, destinations),
            transportation: {
                type: transportationType(transportation)
            },
            travelTime: travelTime
        }
    })
}
//  http_req_receiving.............: avg=7.13ms   min=32µs     med=278µs    max=27ms     p(90)=15.43ms  p(95)=16.48ms
//  http_req_sending...............: avg=147.41µs min=63µs     med=138µs    max=525µs    p(90)=224.6µs  p(95)=245.89µs
//
