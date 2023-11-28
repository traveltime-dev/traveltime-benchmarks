import {
  textSummary
} from 'https://jslib.k6.io/k6-summary/0.0.3/index.js'
import http from 'k6/http'
import {
  check,
  sleep
} from 'k6'
import {
  generateRandomCoordinate,
  countries,
  timeMapScenarios as scenarios,
  setThresholdsForScenarios,
  summaryTrendStats,
  deleteTimeMapMetrics,
  timeMapReport
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
  const countryCoords = countries[countryCode]
  const url = `https://${host}/v4/time-map`
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const travelTime = __ENV.TRAVEL_TIME || 7200
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }
  const dateTime = new Date().toISOString()

  const response = http.post(url, generateBody(countryCode, travelTime, transportation, countryCoords, dateTime), params)
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response body is not empty': (r) => r.body.length > 0
  })
  sleep(1)
}

export function handleSummary (data) {
  deleteTimeMapMetrics(data)

  data = timeMapReport(data)

  return {
    stdout: textSummary(data, {
      indent: ' ',
      enableColors: true
    })
  }
}

function generateBody (countryCode, travelTime, transportation, countryCoords, dateTime) {
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
