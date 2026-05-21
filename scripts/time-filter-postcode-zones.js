import { getCurrentStageIndex } from 'https://jslib.k6.io/k6-utils/1.3.0/index.js'
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js'
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
  getLocationCoordinates,
  summaryTrendStats,
  randomIndex,
  checkMutuallyExclusiveParams
} from './common.js'

const VALID_KINDS = ['districts', 'sectors']

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
  checkMutuallyExclusiveParams(__ENV.HOST, __ENV.FULL_URL, 'HOST and FULL_URL')
  const kind = __ENV.KIND || 'districts'
  if (!VALID_KINDS.includes(kind)) {
    throw new Error(`KIND must be one of ${VALID_KINDS.join(', ')}, got "${kind}".`)
  }
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const location = __ENV.LOCATION || 'GB/London'
  const locationCoords = getLocationCoordinates(location)
  const url = __ENV.HOST ? `https://${__ENV.HOST}/v4/time-filter/postcode-${kind}` : __ENV.FULL_URL
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const travelTime = parseInt(__ENV.TRAVEL_TIME || 1800)
  const uniqueRequestsAmount = parseInt(__ENV.UNIQUE_REQUESTS || 100)
  const threshold = parseFloat(__ENV.REACHABLE_POSTCODES_THRESHOLD || 0.1)
  const properties = (__ENV.PROPERTIES || 'coverage,travel_time_reachable,travel_time_all').split(',')
  const dateTime = __ENV.DATE_TIME || new Date().toISOString()
  const id = `Postcode ${kind} benchmark`

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }

  const requestBodies = precomputedDataFile
    ? readRequestsBodies(id, travelTime, transportation, dateTime, threshold, properties, precomputedDataFile)
    : generateRequestBodies(uniqueRequestsAmount, id, travelTime, transportation, locationCoords, dateTime, threshold, properties)

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

function generateBody (id, travelTime, transportation, coords, dateTime, threshold, properties) {
  return JSON.stringify({
    departure_searches: [{
      id,
      coords,
      departure_time: dateTime,
      travel_time: travelTime,
      reachable_postcodes_threshold: threshold,
      transportation: {
        type: transportation
      },
      properties
    }]
  })
}

function readRequestsBodies (id, travelTime, transportation, dateTime, threshold, properties, precomputedDataFile) {
  const data = papaparse
    .parse(precomputedDataFile, { header: true, skipEmptyLines: true })
    .data
    .map(origins =>
      generateBody(
        id,
        travelTime,
        transportation,
        { lat: parseFloat(origins.lat), lng: parseFloat(origins.lng) },
        dateTime,
        threshold,
        properties
      )
    )
  console.log('The amount of requests read: ' + data.length)
  return data
}

function generateRequestBodies (count, id, travelTime, transportation, locationCoords, dateTime, threshold, properties) {
  console.log('The amount of requests generated: ' + count)
  const diff = 0.01

  return Array
    .from(
      { length: count },
      () => generateBody(
        id,
        travelTime,
        transportation,
        generateRandomCoordinate(locationCoords.lat, locationCoords.lng, diff),
        dateTime,
        threshold,
        properties
      )
    )
}
