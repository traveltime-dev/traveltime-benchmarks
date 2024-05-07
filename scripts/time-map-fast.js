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
  getCountryCoordinates,
  randomIndex
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

const precomputedDataFile = __ENV.DATA_PATH ? open(__ENV.DATA_PATH) : undefined

export function setup () {
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const host = __ENV.HOST || 'api.traveltimeapp.com'
  const countryCode = __ENV.COUNTRY || 'gb'
  const countryCoords = getCountryCoordinates(countryCode, __ENV.COORDINATES)
  const url = `https://${host}/v4/time-map/fast`
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const travelTime = parseInt(__ENV.TRAVEL_TIME || 7200)
  const levelOfDetails = parseInt(__ENV.LEVEL_OF_DETAILS || -8)
  const arrivalTimePeriod = __ENV.ARRIVAL_TIME_PERIOD || 'weekday_morning'
  const uniqueRequestsAmount = parseFloat(__ENV.UNIQUE_REQUESTS || 100)

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }

  const requestBodies = precomputedDataFile
    ? readRequestsBodies(travelTime, transportation, arrivalTimePeriod, levelOfDetails, precomputedDataFile)
    : generateRequestBodies(uniqueRequestsAmount, travelTime, transportation, countryCoords, arrivalTimePeriod, levelOfDetails)

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

function generateBody (travelTime, transportation, coords, arrivalTimePeriod, levelOfDetails) {
  return JSON.stringify({
    arrival_searches: {
      one_to_many: [
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
            level: levelOfDetails
          }
        }
      ]
    }
  })
}

function readRequestsBodies (travelTime, transportation, arrivalTimePeriod, levelOfDetails, precomputedDataFile) {
  const data = papaparse
    .parse(precomputedDataFile, { header: true, skipEmptyLines: true })
    .data
    .map(origins =>
      generateBody(
        travelTime,
        transportation,
        { lat: parseFloat(origins.lat), lng: parseFloat(origins.lng) },
        arrivalTimePeriod,
        levelOfDetails
      )
    )
  console.log('The amount of requests read: ' + data.length)
  return data
}

function generateRequestBodies (count, travelTime, transportation, countryCoords, arrivalTimePeriod, levelOfDetails) {
  console.log('The amount of requests generated: ' + count)
  const diff = 0.01

  return Array
    .from(
      { length: count },
      () => generateBody(
        travelTime,
        transportation,
        generateRandomCoordinate(countryCoords.lat, countryCoords.lng, diff),
        arrivalTimePeriod,
        levelOfDetails
      )
    )
}
