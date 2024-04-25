import { getCurrentStageIndex } from 'https://jslib.k6.io/k6-utils/1.3.0/index.js'
import {
  textSummary
} from 'https://jslib.k6.io/k6-summary/0.0.3/index.js'
import http from 'k6/http'
import {
  check,
  randomSeed
} from 'k6'
import {
  generateRandomCoordinate,
  oneScenario as scenarios,
  setThresholdsForScenarios,
  deleteOneScenarioMetrics,
  oneScenarioReport,
  getCountryCoordinates,
  summaryTrendStats,
  randomIndex,
  rpm,
  durationInMinutes
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
  const uniqueRequestsPercentage = parseFloat(__ENV.UNIQUE_REQUESTS || 2)
  const uniqueRequestsAmount = Math.ceil((rpm * durationInMinutes) * (uniqueRequestsPercentage / 100))

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }
  const dateTime = new Date().toISOString()

  console.log('The amount of requests generated: ' + uniqueRequestsAmount)

  const requestBodies = generateRequestBodies(uniqueRequestsAmount, travelTime, transportation, countryCoords, dateTime)
  return { url, requestBodies, params }
}

export default function (data) {
  const index = randomIndex(data.requestBodies.length)
  const response = http.post(data.url, data.requestBodies[index], data.params)

  if (getCurrentStageIndex() === 1) { // Ignoring results from warm-up stage
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response body is not empty': (r) => r.body.length > 0
    })
  }
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

function generateRequestBodies (count, travelTime, transportation, countryCoords, dateTime) {
  return Array.from({ length: count }, () => generateBody(travelTime, transportation, countryCoords, dateTime))
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
