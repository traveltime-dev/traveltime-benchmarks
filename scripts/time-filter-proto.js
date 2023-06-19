import http from 'k6/http';
import protobuf from 'k6/x/protobuf';
import {check, sleep, randomSeed} from 'k6';
import {generateDestinations, destinationDeltas, generateRandomCoordinate, countries} from './common.js';


const configs = {
    scenarios: {
        main_scenario: {
            executor: 'constant-vus',
            duration: '4m',
            vus: 2,
            startTime: '20s',
            gracefulStop: '20s',
        },
    }
}

// used for continious benchmarking
if (__ENV.SCENARIO === 'load-test') {
    configs.scenarios = {
        first_scenario: {
            executor: 'constant-vus',
            duration: '4m',
            vus: 2,
            startTime: '20s',
            gracefulStop: '20s',
        },
        second_scenario: {
            executor: 'constant-vus',
            env: {DESTINATIONS: '10000'},
            duration: '4m',
            vus: 5,
            startTime: '5m',
            gracefulStop: '20s',
        },
        third_scenario: {
            executor: 'constant-vus',
            env: {DESTINATIONS: '25000'},
            duration: '4m',
            vus: 5,
            startTime: '10m',
            gracefulStop: '20s',
        },
        forth_scenario: {
            executor: 'constant-vus',
            duration: '4m',
            env: {DESTINATIONS: '100000'},
            vus: 5,
            startTime: '15m',
            gracefulStop: '20s',
        }
    }
}

export let options = configs


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

function transportationType(transportation) {
    console.log(transportation)

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

