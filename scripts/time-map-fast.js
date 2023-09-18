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
  protoCountries,
  optionSetter,
  timeMapScenarios as scenarios,
  setThresholdsForScenarios,
  deleteTimeMapMetrics
} from './common.js'

export const options = optionSetter(scenarios)
setThresholdsForScenarios(options)

export default function () {
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const host = __ENV.HOST || 'api.traveltimeapp.com'
  const countryCode = __ENV.COUNTRY || 'uk'
  const countryCoords = protoCountries[countryCode]
  const url = `https://${host}/v4/time-map/fast`
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const travelTime = __ENV.TRAVEL_TIME || 3800
  const arrivalTimePeriod = __ENV.ARRIVAL_TIME_PERIOD || 'weekday_morning'
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }
  const dateTime = new Date().toISOString()

  const response = http.post(url, generateBody(countryCode, travelTime,
    transportation, countryCoords, dateTime, arrivalTimePeriod), params)

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response body is not empty': (r) => r.body.length > 0
  })
  sleep(1)
}

export function handleSummary (data) {
  deleteTimeMapMetrics(data)

  return {
    stdout: textSummary(data, {
      indent: ' ',
      enableColors: true
    })
  }
}

function generateBody (countryCode, travelTime, transportation, countryCoords, dateTime, arrivalTimePeriod) {
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
