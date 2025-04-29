import { getCurrentStageIndex } from 'https://jslib.k6.io/k6-utils/1.3.0/index.js'
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.3/index.js'
import http from 'k6/http'
import protobuf from 'k6/x/protobuf'
import {
  check,
  randomSeed
} from 'k6'
import {
  destinationDeltas,
  generateDestinations,
  generateRandomCoordinate,
  oneScenario as scenarios,
  oneScenarioReport,
  deleteOneScenarioMetrics,
  setThresholdsForScenarios,
  summaryTrendStats,
  getProtoLocationCoordinates,
  randomIndex
} from './common.js'

export const options = {
  setupTimeout: '1000s',
  scenarios,
  summaryTrendStats,

  thresholds: {
    // Intentionally empty. I'll define bogus thresholds (to generate the sub-metrics) below.
  }
}

setThresholdsForScenarios(options)
randomSeed(__ENV.SEED || 1234567)

const precomputedDataFile = __ENV.DATA_PATH ? open(__ENV.DATA_PATH) : undefined

export function setup () {
  const serviceImage = __ENV.SERVICE_IMAGE || 'unknown'
  const mapDate = __ENV.MAP_DATE || 'unknown'
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const destinationsAmount = parseInt(__ENV.DESTINATIONS || 50)
  const host = __ENV.HOST
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const protocol = __ENV.PROTOCOL || 'https'
  const travelTime = parseInt(__ENV.TRAVEL_TIME || 7200)

  const location = __ENV.LOCATION || 'UK/London'
  const country = location.slice(0, 2).toLowerCase()
  const locationCoords = getProtoLocationCoordinates(location)

  const query = __ENV.QUERY || `api/v2/${countryCode(country)}/time-filter/fast/${transportation}`
  const isManyToOne = __ENV.MANY_TO_ONE !== undefined
  const uniqueRequestsAmount = parseInt(__ENV.UNIQUE_REQUESTS || 100)
  const disableBodyDecoding = __ENV.DISABLE_DECODING === 'true'

  const url = `${protocol}://${appId}:${apiKey}@${host}/${query}`

  const params = {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    tags: {
      destinations: destinationsAmount,
      serviceImage,
      mapDate
    }
  }

  const requestBodies = precomputedDataFile
    ? readRequestsBodies(destinationsAmount, transportation, travelTime, isManyToOne, precomputedDataFile)
    : generateRequestBodies(uniqueRequestsAmount, destinationsAmount, locationCoords, transportation, travelTime, isManyToOne)

  return { url, requestBodies, params, disableBodyDecoding }
}

export default function (data) {
  const index = randomIndex(data.requestBodies.length)
  const requestBodyEncoded = protobuf
    .load('TimeFilterFastRequest.proto', 'TimeFilterFastRequest')
    .encode(data.requestBodies[index])
  const response = http.post(data.url, requestBodyEncoded, data.params)

  const isBenchmarkStage = getCurrentStageIndex() === 1

  if (isBenchmarkStage) {
    check(response, {
      'status is 200': (r) => r.status === 200
    })
  }

  if (!data.disableBodyDecoding) {
    const decodedResponse = protobuf.load('TimeFilterFastResponse.proto', 'TimeFilterFastResponse').decode(response.body)

    if (isBenchmarkStage) {
      check(decodedResponse, {
        'response body is not empty': (r) => r.length !== 0
      })
    }
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

function transportationType (transportation) {
  switch (transportation) {
    case 'driving+ferry':
      return 'DRIVING_AND_FERRY'
    case 'walking+ferry':
      return 'WALKING_AND_FERRY'
    case 'cycling+ferry':
      return 'CYCLING_AND_FERRY'
    case 'pt':
      return 'PUBLIC_TRANSPORT'
    default:
      return null
  }
}

function countryCode (country) {
  if (country.startsWith('us_')) { return 'us' } else { return country }
}

function generateBody (destinationsAmount, coord, transportation, travelTime, isManyToOne) {
  const diff = 0.005
  const originLocation = coord
  const destinations = generateDestinations(destinationsAmount, originLocation, diff)
  if (isManyToOne) {
    return JSON.stringify({
      manyToOneRequest: {
        arrivalLocation: originLocation,
        locationDeltas: destinationDeltas(originLocation, destinations),
        transportation: {
          type: transportationType(transportation)
        },
        travelTime
      }
    })
  } else {
    return JSON.stringify({
      oneToManyRequest: {
        departureLocation: originLocation,
        locationDeltas: destinationDeltas(originLocation, destinations),
        transportation: {
          type: transportationType(transportation)
        },
        travelTime
      }
    })
  }
}

function readRequestsBodies (destinationsAmount, transportation, travelTime, isManyToOne, precomputedDataFile) {
  const data = papaparse
    .parse(precomputedDataFile, { header: true, skipEmptyLines: true })
    .data
    .map(origins =>
      generateBody(
        destinationsAmount,
        { lat: parseFloat(origins.lat), lng: parseFloat(origins.lng) },
        transportation,
        travelTime,
        isManyToOne
      )
    )
  console.log('The amount of requests read: ' + data.length)
  return data
}

function generateRequestBodies (
  count,
  destinationsAmount,
  coords,
  transportation,
  travelTime,
  isManyToOne
) {
  console.log('The amount of requests generated: ' + count)
  const diff = 0.005

  return Array
    .from(
      { length: count },
      () => generateBody(
        destinationsAmount,
        generateRandomCoordinate(coords.lat, coords.lng, diff),
        transportation,
        travelTime,
        isManyToOne
      )
    )
}
