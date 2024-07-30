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
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const host = __ENV.HOST
  const location = __ENV.LOCATION || 'GB/London'
  const locationCoords = getLocationCoordinates(location)
  const url = `https://${host}/v4/distance-map`
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const travelDistance = parseInt(__ENV.TRAVEL_DISTANCE || 2000)
  const uniqueRequestsAmount = parseInt(__ENV.UNIQUE_REQUESTS || 100)

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }
  const dateTime = new Date().toISOString()

  const requestBodies = precomputedDataFile
    ? readRequestsBodies(travelDistance, transportation, dateTime, precomputedDataFile)
    : generateRequestBodies(uniqueRequestsAmount, travelDistance, transportation, locationCoords, dateTime)

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

function generateBody (travelDistance, transportation, coords, dateTime) {
  return JSON.stringify({
    departure_searches: [{
      id: 'Distance map benchmark',
      coords,
      departure_time: dateTime,
      travel_distance: travelDistance,
      transportation: {
        type: transportation
      }
    }]
  })
}

function readRequestsBodies (travelDistance, transportation, dateTime, precomputedDataFile) {
  const data = papaparse
    .parse(precomputedDataFile, { header: true, skipEmptyLines: true })
    .data
    .map(origins =>
      generateBody(
        travelDistance,
        transportation,
        { lat: parseFloat(origins.lat), lng: parseFloat(origins.lng) },
        dateTime
      )
    )
  console.log('The amount of requests read: ' + data.length)
  return data
}

function generateRequestBodies (count, travelDistance, transportation, locationCoords, dateTime) {
  console.log('The amount of requests generated: ' + count)
  const diff = 0.01

  return Array
    .from(
      { length: count },
      () => generateBody(
        travelDistance,
        transportation,
        generateRandomCoordinate(locationCoords.lat, locationCoords.lng, diff),
        dateTime
      )
    )
}
