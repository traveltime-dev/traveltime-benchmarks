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
  oneScenarioReport,
  deleteOneScenarioMetrics,
  summaryTrendStats,
  getLocationCoordinates,
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
  const url = `https://${host}/v4/time-filter/fast`
  const transportation = __ENV.TRANSPORTATION || 'driving+ferry'
  const travelTime = parseInt(__ENV.TRAVEL_TIME || 1900)
  const destinationsAmount = parseInt(__ENV.DESTINATIONS || 50)
  const arrivalTimePeriod = __ENV.ARRIVAL_TIME_PERIOD || 'weekday_morning'
  const uniqueRequestsAmount = parseInt(__ENV.UNIQUE_REQUESTS || 2)

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }

  const requestBodies = precomputedDataFile
    ? readRequestsBodies(travelTime, transportation, arrivalTimePeriod, destinationsAmount, precomputedDataFile)
    : generateRequestBodies(uniqueRequestsAmount, travelTime, transportation, arrivalTimePeriod, destinationsAmount, locationCoords)

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

function generateBody (
  travelTime,
  transportation,
  arrivalTimePeriod,
  destinationsAmount,
  coords
) {
  const originLocation = {
    id: 'destination1',
    coords: { lat: coords.lat, lng: coords.lng }
  }

  const randomDestinations = Array.from({ length: destinationsAmount }, (_, i) => ({
    id: `destination${i + 2}`,
    coords: generateRandomCoordinate(coords.lat, coords.lng, 0.005)
  }))

  const allLocations = [originLocation, ...randomDestinations]

  const arrivalSearches = {
    one_to_many: [
      {
        id: 'Time filter benchmark',
        departure_location_id: 'destination1',
        arrival_location_ids: randomDestinations.map(destination => destination.id),
        arrival_time_period: arrivalTimePeriod,
        travel_time: travelTime,
        properties: [
          'travel_time'
        ],
        transportation: {
          type: transportation
        }
      }
    ]
  }

  return JSON.stringify({
    locations: allLocations,
    arrival_searches: arrivalSearches
  })
}

function readRequestsBodies (travelTime, transportation, arrivalTimePeriod, destinationsAmount, precomputedDataFile) {
  const data = papaparse
    .parse(precomputedDataFile, { header: true, skipEmptyLines: true })
    .data
    .map(origins =>
      generateBody(
        travelTime,
        transportation,
        arrivalTimePeriod,
        destinationsAmount,
        { lat: parseFloat(origins.lat), lng: parseFloat(origins.lng) }
      )
    )
  console.log('The amount of requests read: ' + data.length)
  return data
}

function generateRequestBodies (
  count,
  travelTime,
  transportation,
  arrivalTimePeriod,
  destinationsAmount,
  locationCoords
) {
  console.log('The amount of requests generated: ' + count)
  const diff = 0.005

  return Array
    .from(
      { length: count },
      () => generateBody(
        travelTime,
        transportation,
        arrivalTimePeriod,
        destinationsAmount,
        generateRandomCoordinate(locationCoords.lat, locationCoords.lng, diff)
      )
    )
}
