import http from 'k6/http'
import protobuf from 'k6/x/protobuf'
import {
  check,
  randomSeed,
  sleep
} from 'k6'
import {
  destinationDeltas,
  generateDestinations,
  generateRandomCoordinate,
  destinations,
  timeFilterScenarios as scenarios,
  setThresholdsForScenarios,
  deleteTimeFilterMetrics,
  summaryTrendStats,
  reportPerDestination,
  getCountryCoordinates
} from './common.js'
import {
  textSummary
} from 'https://jslib.k6.io/k6-summary/0.0.3/index.js'

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
  const serviceImage = __ENV.SERVICE_IMAGE || 'unknown'
  const mapDate = __ENV.MAP_DATE || 'unknown'
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const destinationsAmount = __ENV.SCENARIO_DESTINATIONS
  const host = __ENV.HOST || 'proto.api.traveltimeapp.com'
  const country = __ENV.COUNTRY || 'uk'
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const query = __ENV.QUERY || `api/v2/${countryCode(country)}/time-filter/fast/${transportation}`
  const protocol = __ENV.PROTOCOL || 'https'
  const travelTime = __ENV.TRAVEL_TIME || 7200
  const countryCoords = getCountryCoordinates(countryCode, __ENV.COORDINATES, true)

  const url = `${protocol}://${appId}:${apiKey}@${host}/${query}`

  const requestBody = protobuf
    .load('proto/TimeFilterFastRequest.proto', 'TimeFilterFastRequest')
    .encode(generateBody(destinationsAmount, countryCoords, transportation, travelTime))

  const response = http.post(
    url,
    requestBody, {
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      tags: {
        destinations: destinationsAmount,
        serviceImage,
        mapDate
      }
    }
  )

  const decodedResponse = protobuf.load('proto/TimeFilterFastResponse.proto', 'TimeFilterFastResponse').decode(response.body)

  check(response, {
    'status is 200': (r) => r.status === 200
  })

  check(decodedResponse, {
    'response body is not empty': (r) => r.length !== 0
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

function transportationType (transportation) {
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

function countryCode (country) {
  if (country.startsWith('us_')) { return 'us' } else { return country }
}

function generateBody (destinationsAmount, coord, transportation, travelTime) {
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
      travelTime
    }
  })
}
