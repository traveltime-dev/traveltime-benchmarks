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
  generateRandomCoordinate,
  oneScenario as scenarios,
  oneScenarioReport,
  deleteOneScenarioMetrics,
  setThresholdsForScenarios,
  summaryTrendStats,
  getProtoLocationCoordinates,
  randomIndex,
  transportationTypeProto,
  countryCodeProto
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
  const host = __ENV.HOST
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const protocol = __ENV.PROTOCOL || 'https'
  const travelTime = parseInt(__ENV.TRAVEL_TIME || 3600)
  const cellResolution = parseInt(__ENV.RESOLUTION || 6)

  const location = __ENV.LOCATION || 'UK/London'
  const country = location.slice(0, 2).toLowerCase()
  const locationCoords = getProtoLocationCoordinates(location)

  const query = __ENV.QUERY || `api/v3/${countryCodeProto(country)}/geohash/fast/${transportation}`
  const uniqueRequestsAmount = parseInt(__ENV.UNIQUE_REQUESTS || 100)
  const disableBodyDecoding = __ENV.DISABLE_DECODING === 'true'

  const url = `${protocol}://${appId}:${apiKey}@${host}/${query}`

  const params = {
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    tags: {
      resolution: cellResolution,
      serviceImage,
      mapDate
    },
    responseType: 'binary'
  }

  const requestBodies = precomputedDataFile
    ? readRequestsBodies(transportation, travelTime, cellResolution, precomputedDataFile)
    : generateRequestBodies(uniqueRequestsAmount, locationCoords, transportation, travelTime, cellResolution)

  return { url, requestBodies, params, disableBodyDecoding }
}

export default function (data) {
  const index = randomIndex(data.requestBodies.length)
  const requestBodyEncoded = protobuf
    .load('GeohashFastRequest.proto', 'GeohashFastRequest')
    .encode(data.requestBodies[index])
  const response = http.post(data.url, requestBodyEncoded, data.params)

  const isBenchmarkStage = getCurrentStageIndex() === 1

  if (isBenchmarkStage) {
    check(response, {
      'status is 200': (r) => r.status === 200
    })
  }

  if (!data.disableBodyDecoding && response.status === 200) {
    const decodedResponse = protobuf.load('GeohashFastResponse.proto', 'GeohashFastResponse').decode(response.body)

    if (isBenchmarkStage) {
      check(decodedResponse, {
        'response body is not empty': (r) => r.cells && r.cells.ids && r.cells.ids.length !== 0
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

function generateBody (coord, transportation, travelTime, cellResolution) {
  return JSON.stringify({
    oneToManyRequest: {
      departureLocation: coord,
      transportation: {
        type: transportationTypeProto(transportation)
      },
      arrivalTimePeriod: 'WEEKDAY_MORNING',
      travelTime,
      resolution: cellResolution,
      properties: ['MEAN']
    }
  })
}

function readRequestsBodies (transportation, travelTime, cellResolution, precomputedDataFile) {
  const data = papaparse
    .parse(precomputedDataFile, { header: true, skipEmptyLines: true })
    .data
    .map(origins =>
      generateBody(
        { lat: parseFloat(origins.lat), lng: parseFloat(origins.lng) },
        transportation,
        travelTime,
        cellResolution
      )
    )
  console.log('The amount of requests read: ' + data.length)
  return data
}

function generateRequestBodies (count, coords, transportation, travelTime, cellResolution) {
  console.log('The amount of requests generated: ' + count)
  const diff = 0.005

  return Array
    .from(
      { length: count },
      () => generateBody(
        generateRandomCoordinate(coords.lat, coords.lng, diff),
        transportation,
        travelTime,
        cellResolution
      )
    )
}
