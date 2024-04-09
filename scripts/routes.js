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
  oneScenario as scenarios,
  setThresholdsForScenarios,
  summaryTrendStats,
  deleteOneScenarioMetrics as deleteRoutesMetrics,
  oneScenarioReport as routesReport,
  getCountryCoordinates,
  generateRequestBodies,
  randomIndex
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

export function setup () {
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const host = __ENV.HOST || 'api.traveltimeapp.com'
  const countryCode = __ENV.COUNTRY || 'gb'
  const countryCoords = getCountryCoordinates(countryCode, __ENV.COORDINATES)
  const url = `https://${host}/v4/routes`
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const uniqueRequests = parseInt(__ENV.UNIQUE_REQUESTS || 1)
  const dateTime = new Date().toISOString()

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }

  const requestBodies = generateRequestBodies(uniqueRequests, generateBody, transportation, countryCoords, dateTime)
  return { url, requestBodies, params }
}

export default function (data) {
  const index = randomIndex(data.requestBodies.length)
  const response = http.post(data.url, data.requestBodies[index], data.params)

  console.log(response.status)

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response body is not empty': (r) => r.body.length > 0
  })
  sleep(1)
}

export function handleSummary (data) {
  // removing default metrics
  deleteRoutesMetrics(data)
  data = routesReport(data)

  return {
    stdout: textSummary(data, {
      indent: ' ',
      enableColors: true
    })
  }
}

function generateBody (
  transportation,
  countryCoords,
  dateTime
) {
  const coordinates = countryCoords
  const diff = 0.01

  const origin = {
    id: 'origin',
    coords: generateRandomCoordinate(coordinates.lat, coordinates.lng, diff)
  }

  const destination = {
    id: 'destination',
    coords: generateRandomCoordinate(coordinates.lat, coordinates.lng, diff)
  }

  const departureSearches = [{
    id: 'Routes benchmark',
    departure_location_id: origin.id,
    arrival_location_ids: [destination.id],
    departure_time: dateTime,
    properties: [
      'travel_time', 'distance', 'route'
    ],
    transportation: {
      type: transportation
    }
  }]

  return JSON.stringify({
    locations: [origin, destination],
    departure_searches: departureSearches
  })
}
