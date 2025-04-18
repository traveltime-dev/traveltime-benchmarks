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
  summaryTrendStats,
  deleteOneScenarioMetrics,
  oneScenarioReport,
  getLocationCoordinates,
  randomIndex,
  checkMutuallyExclusiveParams
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
  checkMutuallyExclusiveParams(__ENV.HOST, __ENV.FULL_URL, 'HOST and FULL_URL')
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const location = __ENV.LOCATION || 'GB/London'
  const locationCoords = getLocationCoordinates(location)
  const url = __ENV.HOST ? `https://${__ENV.HOST}/v4/routes` : __ENV.FULL_URL
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const uniqueRequestsAmount = parseInt(__ENV.UNIQUE_REQUESTS || 100)
  const useSharc = __ENV.USE_SHARC === 'true'
  const dateTime = __ENV.DATE_TIME || new Date().toISOString()

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }

  const requestBodies = precomputedDataFile
    ? readRequestsBodies(transportation, dateTime, precomputedDataFile)
    : generateRequestBodies(uniqueRequestsAmount, transportation, locationCoords, dateTime, useSharc)
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

function generateBody (transportation, dateTime, originCoords, destinationCoords, useSharc) {
  const origin = {
    id: 'origin',
    coords: originCoords
  }

  const destination = {
    id: 'destination',
    coords: destinationCoords
  }

  const departureSearches = [{
    id: 'Routes benchmark',
    departure_location_id: origin.id,
    arrival_location_ids: [destination.id],
    departure_time: dateTime,
    properties: [
      'travel_time', 'distance', 'route'
    ],
    use_sharc: useSharc,
    transportation: {
      type: transportation
    }
  }]

  return JSON.stringify({
    locations: [origin, destination],
    departure_searches: departureSearches
  })
}

function readRequestsBodies (transportation, dateTime, precomputedDataFile) {
  const data = papaparse
    .parse(precomputedDataFile, { header: true, skipEmptyLines: true })
    .data
    .map(route =>
      generateBody(
        transportation,
        dateTime,
        { lat: parseFloat(route.origin_lat), lng: parseFloat(route.origin_lng) },
        { lat: parseFloat(route.dest_lat), lng: parseFloat(route.dest_lng) }
      )
    )
  console.log('The amount of requests read: ' + data.length)
  return data
}

function generateRequestBodies (count, transportation, locationCoords, dateTime, useSharc) {
  console.log('The amount of requests generated: ' + count)
  const diff = 0.01

  return Array
    .from(
      { length: count },
      () => generateBody(
        transportation,
        dateTime,
        generateRandomCoordinate(locationCoords.lat, locationCoords.lng, diff),
        generateRandomCoordinate(locationCoords.lat, locationCoords.lng, diff),
        useSharc
      )
    )
}
