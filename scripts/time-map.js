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
  deleteOneScenarioMetrics,
  oneScenarioReport,
  handleSummaryInternal,
  getCountryCoordinates,
  generateRequestBodies,
  summaryTrendStats,
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
  const url = `https://${host}/v4/time-map`
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const travelTime = parseInt(__ENV.TRAVEL_TIME || 7200)
  const uniqueRequestsAmount = parseInt(__ENV.UNIQUE_REQUESTS || 1)

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }
  const dateTime = new Date().toISOString()

  const requestBodies = generateRequestBodies(uniqueRequestsAmount, generateBody, travelTime, transportation, countryCoords, dateTime)
  return { url, requestBodies, params }
}

export default function (data) {
  const index = randomIndex(data.requestBodies.length)
  const response = http.post(data.url, data.requestBodies[index], data.params)

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response body is not empty': (r) => r.body.length > 0
  })
  sleep(1)
}

export function handleSummary (data) {
  // removing default metrics
  deleteOneScenarioMetrics(data)

  data = oneScenarioReport(data)

  return {
    stdout: textSummary(data, {
      indent: ' ',
      enableColors: true
    })
  }
}

function generateBody (travelTime, transportation, countryCoords, dateTime) {
  const coordinates = countryCoords
  return JSON.stringify({
    departure_searches: [{
      id: 'Time map benchmark',
      coords: generateRandomCoordinate(coordinates.lat, coordinates.lng, 0.005),
      departure_time: dateTime,
      travel_time: travelTime,
      transportation: {
        type: transportation
      }
    }]
  })
}
