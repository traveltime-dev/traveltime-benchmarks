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
  summaryTrendStats
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
  const appId = __ENV.APP_ID
  const apiKey = __ENV.API_KEY
  const host = __ENV.HOST
  const endpointUrl = __ENV.FULL_URL || false
  // if fullUrl is given, use it, otherwise build url with host etc
  const url = endpointUrl || `https://${host}/v4/geocoding/search`

  const query = __ENV.QUERY || 'Parliament square'
  const withinCountry = __ENV.WITHIN_COUNTRY
  const limit = parseInt(__ENV.LIMIT)
  const forceAddPostcode = __ENV.FORCE_ADD_POSTCODE === 'true'
  const formatName = __ENV.FORMAT_NAME === 'true'
  const formatExcludeCountry = __ENV.FORMAT_EXCLUDE_COUNTRY === 'true'
  const bounds = __ENV.BOUNDS

  const fullUrl = generateUrl(url, query, withinCountry, limit, forceAddPostcode, formatName, formatExcludeCountry, bounds)

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

function generateUrl (baseUrl, query, withinCountry, limit, forceAddPostcode, formatName, formatExcludeCountry, bounds) {
  let fullUrl = baseUrl
  fullUrl += `?query=${query}`
  if (withinCountry) fullUrl += `&within.country=${withinCountry}`
  if (limit) fullUrl += `&limit=${limit}`
  if (forceAddPostcode) fullUrl += `&force.add.postoce=${forceAddPostcode}`
  if (formatName) fullUrl += `&format.name=${formatName}`
  if (formatExcludeCountry) fullUrl += `&format.exclude.country=${formatExcludeCountry}`
  if (bounds) fullUrl += `&bounds=${bounds}`
  return fullUrl
}
