import {
    textSummary
} from 'https://jslib.k6.io/k6-summary/0.0.3/index.js'
import http from 'k6/http'
import {
    check,
    sleep,
    randomSeed
} from 'k6'
import {
    generateRandomCoordinate,
    destinations,
    multipleDestinationsScenarios as scenarios,
    setThresholdsForScenarios,
    summaryTrendStats,
    deleteTimeFilterMetrics,
    reportPerDestination,
    getCountryCoordinates
} from './common.js'

export const options = {
    scenarios,
    summaryTrendStats,

    thresholds: {
        // Intentionally empty. I'll define bogus thresholds (to generate the sub-metrics) below.
    }
}

setThresholdsForScenarios(options)
randomSeed(__ENV.SEED || 1234567)

export default function () {
    const appId = __ENV.APP_ID
    const apiKey = __ENV.API_KEY
    const host = __ENV.HOST || 'api.traveltimeapp.com'
    const countryCode = __ENV.COUNTRY || 'gb'
    const countryCoords = getCountryCoordinates(countryCode, __ENV.COORDINATES)
    const url = `https://${host}/v4/time-filter`
    const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
    const travelTime = parseInt(__ENV.TRAVEL_TIME || 1900)
    const destinationsAmount = __ENV.SCENARIO_DESTINATIONS
    const dateTime = new Date().toISOString()

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'X-Application-Id': appId,
            'X-Api-Key': apiKey
        }
    }

    const response = http.post(url, generateBody(travelTime, transportation, destinationsAmount, rangeSettings, countryCoords, dateTime), params)
    console.log(response.status)
    check(response, {
        'status is 200': (r) => r.status === 200,
        'response body is not empty': (r) => r.body.length > 0
    })
    sleep(1)
}

export function handleSummary (data) {
    // removing default metrics
    deleteTimeFilterMetrics(data)

    data = destinations.reduce((curData, curDestinations) => {
        return reportPerDestination(curData, curDestinations)
    }, data)

    return {
        stdout: textSummary(data, {
            indent: ' ',
            enableColors: true
        })
    }
}

function generateBody (
    travelTime,
    transportation,
    destinationsAmount,
    rangeSettings,
    countryCoords,
    dateTime
) {
    const coordinates = countryCoords

    const destinations = Array.from({
        length: destinationsAmount
    }, (_, i) => ({
        id: `destination${i + 1}`,
        coords: generateRandomCoordinate(coordinates.lat, coordinates.lng, 0.005)
    }))

    const departureSearches = [{
        id: 'Routes benchmark',
        departure_location_id: 'destination1',
        arrival_location_ids: destinations.map(destination => destination.id),
        departure_time: dateTime,
        properties: [
            'travel_time', 'distance', 'route'
        ],
        transportation: {
            type: transportation
        },
        range: rangeSettings
    }]

    return JSON.stringify({
        locations: destinations,
        departure_searches: departureSearches
    })
}
