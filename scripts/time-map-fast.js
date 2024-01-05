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
  summaryTrendStats,
  timeMapScenarios as scenarios,
  setThresholdsForScenarios,
  deleteTimeMapMetrics,
  timeMapReport,
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
  const url = `https://${host}/v4/time-map/fast`
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const travelTime = __ENV.TRAVEL_TIME || 7200
  const arrivalTimePeriod = __ENV.ARRIVAL_TIME_PERIOD || 'weekday_morning'
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }

  const response = http.post(url, generateBody(travelTime, transportation, countryCoords, arrivalTimePeriod), params)

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

function generateBody (travelTime, transportation, countryCoords, arrivalTimePeriod) {
  const coordinates = countryCoords
  return JSON.stringify({
    arrival_searches: {
      one_to_many: [
        {
          id: 'Time map fast benchmark',
          coords: generateRandomCoordinate(coordinates.lat, coordinates.lng, 0.005),
          arrival_time_period: arrivalTimePeriod,
          travel_time: travelTime,
          transportation: {
            type: transportation
          }
        }
      ]
    }
  })
}
