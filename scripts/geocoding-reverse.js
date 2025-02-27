import { getCurrentStageIndex } from 'https://jslib.k6.io/k6-utils/1.3.0/index.js'
import {
  textSummary
} from 'https://jslib.k6.io/k6-summary/0.0.3/index.js'
import http from 'k6/http'
import {
  check,
  randomSeed
} from 'k6'
import {
  oneScenario as scenarios,
  setThresholdsForScenarios,
  deleteOneScenarioMetrics,
  oneScenarioReport,
  summaryTrendStats,
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

export function setup () {
  checkMutuallyExclusiveParams(__ENV.HOST, __ENV.FULL_URL, `HOST and FULL_URL`)
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const url = __ENV.HOST ? `https://${__ENV.HOST}/v4/geocoding/reverse` : __ENV.FULL_URL

  const lat = __ENV.LAT || '51.4952113'
  const lng = __ENV.LNG || '-0.183122'

  const fullUrl = url + `?lat=${lat}&lng=${lng}`

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Application-Id': appId,
      'X-Api-Key': apiKey
    }
  }

  return { fullUrl, params }
}

export default function (data) {
  const response = http.get(data.fullUrl, data.params)

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
