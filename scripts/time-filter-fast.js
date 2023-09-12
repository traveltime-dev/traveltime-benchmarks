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
  destinations,
  timeFilterScenarios as scenarios,
  setThresholdsForScenarios,
  countries,
  summaryTrendStats,
  deleteTimeFilterMetrics,
  reportPerDestination
} from './common.js'

export const options = {
  scenarios,
  summaryTrendStats,

  thresholds: {
    // Intentionally empty. I'll define bogus thresholds (to generate the sub-metrics) below.
  }
}

setThresholdsForScenarios(options)

export default function () {
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const host = __ENV.HOST || 'api.traveltimeapp.com'
  const countryCode = __ENV.COUNTRY || 'gb'
  const countryCoords = countries[countryCode]
  const url = `https://${host}/v4/time-filter/fast`
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const travelTime = __ENV.TRAVEL_TIME || 1900
  const destinationsAmount = __ENV.SCENARIO_DESTINATIONS
  const arrivalTimePeriod = __ENV.ARRIVAL_TIME_PERIOD || 'weekday_morning'

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }

  const response = http.post(url, generateBody(countryCode, travelTime,
    transportation, destinationsAmount, countryCoords, arrivalTimePeriod), params)

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
  countryCode,
  travelTime,
  transportation,
  destinationsAmount,
  countryCoords,
  arrivalTimePeriod
) {
  const coordinates = countryCoords

  const destinations = Array.from({
    length: destinationsAmount
  }, (_, i) => ({
    id: `destination${i + 1}`,
    coords: generateRandomCoordinate(coordinates.lat, coordinates.lng, 0.005)
  }))

  const arrivalSearches = [{
    one_to_many: [
      {
        id: 'Time filter fast benchmark',
        arrival_location_ids: destinations.map(destination => destination.id),
        departure_location_id: 'destination1',
        arrival_time_period: arrivalTimePeriod,
        properties: [
          'travel_time'
        ],
        transportation: {
          type: transportation
        },
        travel_time: travelTime
      }
    ]
  }]

  return JSON.stringify({
    locations: destinations,
    arrival_searches: arrivalSearches
  })
}
