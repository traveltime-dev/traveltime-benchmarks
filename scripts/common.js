import exec from 'k6/execution'
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js'

export const summaryTrendStats = ['avg', 'min', 'max', 'p(90)', 'p(95)']
export const rpm = parseInt(__ENV.RPM || '60')
export const durationInMinutes = parseInt(__ENV.TEST_DURATION || '3')
const warmupDurationInMinutes = 2

export const oneScenario = {
  // Separate scenario so its samples aren't tagged scenario:mainScenario; gracefulStop 0
  // keeps in-flight warm-up requests out of the measured window.
  warmup: {
    executor: 'ramping-arrival-rate',
    startRate: 0,
    timeUnit: '1m',
    gracefulStop: '0s',
    preAllocatedVUs: 10,
    maxVUs: 1000,
    stages: [
      { target: rpm, duration: warmupDurationInMinutes + 'm' }
    ]
  },
  mainScenario: {
    executor: 'constant-arrival-rate',
    rate: rpm,
    timeUnit: '1m',
    duration: durationInMinutes + 'm',
    startTime: warmupDurationInMinutes + 'm',
    gracefulStop: '15s',
    preAllocatedVUs: 10,
    maxVUs: 1000
  }
}

export function isMeasuredScenario () {
  return exec.scenario.name === 'mainScenario'
}

export function deleteOneScenarioMetrics (data) {
  delete data.metrics.http_req_blocked
  delete data.metrics['http_req_duration{expected_response:true}']
  delete data.metrics.http_reqs
  delete data.metrics.iteration_duration
  delete data.metrics.iterations
  delete data.metrics.vus
  delete data.metrics.http_req_connecting
  delete data.metrics.http_req_tls_handshaking
}

export function oneScenarioReport (data) {
  data.metrics.http_req_sending =
    data.metrics['http_req_sending{scenario:mainScenario}']
  delete data.metrics['http_req_sending{scenario:mainScenario}']
  data.metrics.http_req_duration =
    data.metrics['http_req_duration{scenario:mainScenario}']
  delete data.metrics['http_req_duration{scenario:mainScenario}']
  data.metrics.http_req_receiving =
    data.metrics['http_req_receiving{scenario:mainScenario}']
  delete data.metrics['http_req_receiving{scenario:mainScenario}']
  data.metrics.http_req_waiting =
    data.metrics['http_req_waiting{scenario:mainScenario}']
  delete data.metrics['http_req_waiting{scenario:mainScenario}']
  return data
}

export function setThresholdsForScenarios (options) {
  options.thresholds.checks = ['rate==1.00']
  // These cannot fail; they exist solely to generate the per-scenario sub-metrics.
  options.thresholds['http_req_duration{scenario:mainScenario}'] = ['max>=0']
  options.thresholds['http_req_receiving{scenario:mainScenario}'] = ['max>=0']
  options.thresholds['http_req_sending{scenario:mainScenario}'] = ['max>=0']
  options.thresholds['http_req_waiting{scenario:mainScenario}'] = ['max>=0']
}

function getLocation (location, locationsMap) {
  const coordinates = locationsMap.get(location)
  if (coordinates === undefined) {
    throw new Error(`Location "${location}" doesn't exist.`)
  }
  return coordinates
}

export function getLocationCoordinates (location) {
  return getLocation(location, locations)
}

export function getProtoLocationCoordinates (location) {
  return getLocation(location, protoLocations)
}

function parseLocations (filePath) {
  const file = open(filePath)
  const parsedData = papaparse.parse(file, { header: true, skipEmptyLines: true }).data

  return new Map(parsedData.map(location => {
    const name = location.name
    const lat = parseFloat(location.lat)
    const lng = parseFloat(location.lng)

    return [name, { lat, lng }]
  }))
}

export const locations = parseLocations('../locations/locations_data.csv')
export const protoLocations = parseLocations('../locations/proto_locations_data.csv')

function randomInRange (min, max) {
  return Math.random() * (max - min) + min
}

export function randomIndex (length) {
  return Math.floor(randomInRange(0, length))
}

export function generateRandomCoordinate (lat, lng, diff) {
  return {
    lat: randomInRange(lat - diff, lat + diff),
    lng: randomInRange(lng - diff, lng + diff)
  }
}

export function generateDestinations (numCoordinates, departure, diff) {
  return Array.from({ length: numCoordinates }, () =>
    generateRandomCoordinate(departure.lat, departure.lng, diff)
  )
}

export function destinationDeltas (departure, destinations) {
  return destinations.flatMap((destination) =>
    [encodeFixedPoint(departure.lat, destination.lat), encodeFixedPoint(departure.lng, destination.lng)]
  )
}

function encodeFixedPoint (sourcePoint, targetPoint) {
  return Math.round((targetPoint - sourcePoint) * (10 ** 5))
}

export function transportationTypeProto (transportation) {
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

export function countryCodeProto (country) {
  if (country.startsWith('us_')) { return 'us' } else { return country }
}

export function checkMutuallyExclusiveParams (a, b, message) {
  if (typeof a === 'undefined' && typeof b === 'undefined') {
    throw new Error(`Of ${message} none are provided. Provide exactly one of them.`)
  }
  if (typeof a !== 'undefined' && typeof b !== 'undefined') {
    throw new Error(`Both ${message} are provided. Provide only one of them.`)
  }
}
