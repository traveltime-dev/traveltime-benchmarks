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
  summaryTrendStats,
  oneScenario as scenarios,
  setThresholdsForScenarios,
  oneScenarioReport,
  deleteOneScenarioMetrics,
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
const isManyToOne = __ENV.MANY_TO_ONE !== undefined

export function setup () {
  checkMutuallyExclusiveParams(__ENV.HOST, __ENV.FULL_URL, 'HOST and FULL_URL')
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const location = __ENV.LOCATION || 'GB/London'
  const locationCoords = getLocationCoordinates(location)
  const url = __ENV.HOST ? `https://${__ENV.HOST}/v4/time-map/fast` : __ENV.FULL_URL
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const travelTime = parseInt(__ENV.TRAVEL_TIME || 7200)
  const levelOfDetail = parseInt(__ENV.LEVEL_OF_DETAIL || __ENV.LEVEL_OF_DETAILS || -8)
  const arrivalTimePeriod = __ENV.ARRIVAL_TIME_PERIOD || 'weekday_morning'
  const uniqueRequestsAmount = parseInt(__ENV.UNIQUE_REQUESTS || 100)
  console.log(`time-map-fast: ${isManyToOne ? 'many_to_one' : 'one_to_many'} mode`)

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }

  const requestBodies = precomputedDataFile
    ? readRequestsBodies(travelTime, transportation, arrivalTimePeriod, levelOfDetail, precomputedDataFile)
    : generateRequestBodies(uniqueRequestsAmount, travelTime, transportation, locationCoords, arrivalTimePeriod, levelOfDetail)

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

function generateBody (travelTime, transportation, coords, arrivalTimePeriod, levelOfDetail) {
  const searchType = isManyToOne ? 'many_to_one' : 'one_to_many'
  const searches = {}
  searches[searchType] = [
    {
      id: 'Time map fast benchmark',
      coords,
      arrival_time_period: arrivalTimePeriod,
      travel_time: travelTime,
      transportation: {
        type: transportation
      },
      level_of_detail: {
        scale_type: 'simple_numeric',
        level: levelOfDetail
      }
    }
  ]
  return JSON.stringify({ arrival_searches: searches })
}

function readRequestsBodies (travelTime, transportation, arrivalTimePeriod, levelOfDetail, precomputedDataFile) {
  const data = papaparse
    .parse(precomputedDataFile, { header: true, skipEmptyLines: true })
    .data
    .map(origins =>
      generateBody(
        travelTime,
        transportation,
        { lat: parseFloat(origins.lat), lng: parseFloat(origins.lng) },
        arrivalTimePeriod,
        levelOfDetail
      )
    )
  console.log('The amount of requests read: ' + data.length)
  return data
}

function generateRequestBodies (count, travelTime, transportation, locationCoords, arrivalTimePeriod, levelOfDetail) {
  console.log('The amount of requests generated: ' + count)
  const diff = 0.01

  return Array
    .from(
      { length: count },
      () => generateBody(
        travelTime,
        transportation,
        generateRandomCoordinate(locationCoords.lat, locationCoords.lng, diff),
        arrivalTimePeriod,
        levelOfDetail
      )
    )
}
