export const summaryTrendStats = ['avg', 'min', 'max', 'p(90)', 'p(95)']

export const rpm = parseInt(__ENV.RPM || '60')
export const durationInMinutes = parseInt(__ENV.TEST_DURATION || '3')
const warmupDurationInMinutes = 2

export const oneScenario = {
  mainScenario: {
    executor: 'ramping-arrival-rate',
    startRate: 0,
    timeUnit: '1m',
    gracefulStop: '15s',
    preAllocatedVUs: 10,
    maxVUs: 300,
    stages: [
      { target: rpm, duration: warmupDurationInMinutes + 'm' },
      { target: rpm, duration: durationInMinutes + 'm' }
    ]
  }
}

export function deleteOneScenarioMetrics (data) {
  delete data.metrics.http_req_blocked
  delete data.metrics['http_req_duration{expected_response:true}']
  delete data.metrics.http_req_waiting
  delete data.metrics.http_reqs
  delete data.metrics.iteration_duration
  delete data.metrics.iterations
  delete data.metrics.vus
  delete data.metrics.http_req_connecting
  delete data.metrics.http_req_failed
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
  return data
}

export function setThresholdsForScenarios (options) {
  for (const key in options.scenarios) {
    options.thresholds[`http_req_duration{scenario:${key}}`] = ['max>=0']
    options.thresholds[`http_req_receiving{scenario:${key}}`] = ['max>=0']
    options.thresholds[`http_req_sending{scenario:${key}}`] = ['max>=0']
  }
}

export function getCountryCoordinates (location) {
  return countries[location]
}

export function getProtoCountryCoordinates (location) {
  return protoCountries[location]
}

export const countries = JSON.parse(open('../locations/locations_data.json'))
export const protoCountries = JSON.parse(open('../locations/proto_locations_data.json'))

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
