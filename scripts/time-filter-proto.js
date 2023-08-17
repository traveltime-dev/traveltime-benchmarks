import http from 'k6/http';
import protobuf from 'k6/x/protobuf';
import {check, randomSeed, sleep} from 'k6';
import {countries, destinationDeltas, generateDestinations, generateRandomCoordinate} from './common.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.3/index.js';

const destinations = (__ENV.DESTINATIONS || '5000,10000,25000,100000')
    .split(',')
    .map((curDestinations) => parseInt(curDestinations))

const scenarios = destinations.reduce((accumulator, currentDestinations) => {
    accumulator[`sending_${currentDestinations}_destinations`] = {
        executor: 'constant-vus',
        duration: '1m',
        env: {SCENARIO_DESTINATIONS: currentDestinations.toString()},

        vus: 1,
        startTime: '10s',
        gracefulStop: '10s',
    }
    return accumulator
}, {})

const configs = {
    scenarios: scenarios,
    summaryTrendStats: ['avg', 'min', 'max', 'p(90)', 'p(95)'],

    thresholds: {
        // Intentionally empty. I'll define bogus thresholds (to generate the sub-metrics) below.
    }
}

export let options = configs

// used to create sub-metrics for each scenario
for (let key in options.scenarios) {
    options.thresholds[`http_req_duration{scenario:${key}}`] = ['max>=0']
    options.thresholds[`http_req_receiving{scenario:${key}}`] = ['max>=0']
    options.thresholds[`http_req_sending{scenario:${key}}`] = ['max>=0']
}

export default function () {
    const serviceImage = __ENV.SERVICE_IMAGE || 'unknown'
    const mapDate = __ENV.MAP_DATE || 'unknown'
    const appId = __ENV.APP_ID
    const apiKey = __ENV.API_KEY
    const destinationsAmount = __ENV.SCENARIO_DESTINATIONS
    const host = __ENV.HOST || 'proto.api.traveltimeapp.com'
    const seed = __ENV.SEED || 1234567
    const country = __ENV.COUNTRY || 'uk'
    const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
    const query = __ENV.QUERY || `api/v2/${countryCode(country)}/time-filter/fast/${transportation}`
    const protocol = __ENV.PROTOCOL || 'https'
    const travelTime = __ENV.TRAVEL_TIME || 7200
    const countryCoords = countries[country]

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
            tags: {'destinations': destinationsAmount, 'serviceImage': serviceImage, 'mapDate': mapDate}
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
    // removing default metrics
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

    data = destinations.reduce((curData, curDestinations) => {
        return reportPerDestination(curData, curDestinations)
    }, data)

    return {
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    }
}

function reportPerDestination(data, destinations) {
    data.metrics[`http_req_sending(${destinations} destinations)`] = data.metrics[`http_req_sending{scenario:sending_${destinations}_destinations}`]
    delete data.metrics[`http_req_sending{scenario:sending_${destinations}_destinations}`]
    data.metrics[`http_req_receiving(${destinations} destinations)`] = data.metrics[`http_req_receiving{scenario:sending_${destinations}_destinations}`]
    delete data.metrics[`http_req_receiving{scenario:sending_${destinations}_destinations}`]
    data.metrics[`http_req_duration(${destinations} destinations)`] = data.metrics[`http_req_duration{scenario:sending_${destinations}_destinations}`]
    delete data.metrics[`http_req_duration{scenario:sending_${destinations}_destinations}`]
    return data
}


function transportationType(transportation) {
    switch (transportation) {
        case 'driving+ferry':
            return 'DRIVING_AND_FERRY'
        case 'walking+ferry':
            return 'WALKING_FERRY'
        case 'cycling+ferry':
            return 'CYCLING_FERRY'
        case 'pt':
            return 'PUBLIC_TRANSPORT'
        default:
            return null
    }
}

function countryCode(country) {
    if (country.startsWith("us_"))
        return "us"
    else
        return country
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
