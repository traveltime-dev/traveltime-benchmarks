export const summaryTrendStats = ['avg', 'min', 'max', 'p(90)', 'p(95)']

export const timeMapScenarios = {
  mainScenario: {
    executor: 'constant-vus',
    duration: '10s',
    vus: 1,
    startTime: '1s',
    gracefulStop: '10s'
  }
}

export function deleteTimeMapMetrics (data) {
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

export function timeMapReport (data) {
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

export const destinations = (__ENV.DESTINATIONS || '50, 100, 150')
  .split(',')
  .map((curDestinations) => parseInt(curDestinations))

export const timeFilterScenarios = destinations.reduce((accumulator, currentDestinations) => {
  accumulator[`sending_${currentDestinations}_destinations`] = {
    executor: 'constant-vus',
    duration: '10s',
    env: { SCENARIO_DESTINATIONS: currentDestinations.toString() },

    vus: 1,
    startTime: '1s',
    gracefulStop: '10s'
  }
  return accumulator
}, {})

export function deleteTimeFilterMetrics (data) {
  delete data.metrics.http_req_duration
  delete data.metrics.http_req_sending
  delete data.metrics.http_req_receiving
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

export function reportPerDestination (data, destinations) {
  data.metrics[`http_req_sending(${destinations} destinations)`] =
               data.metrics[`http_req_sending{scenario:sending_${destinations}_destinations}`]
  delete data.metrics[`http_req_sending{scenario:sending_${destinations}_destinations}`]
  data.metrics[`http_req_receiving(${destinations} destinations)`] =
               data.metrics[`http_req_receiving{scenario:sending_${destinations}_destinations}`]
  delete data.metrics[`http_req_receiving{scenario:sending_${destinations}_destinations}`]
  data.metrics[`http_req_duration(${destinations} destinations)`] =
               data.metrics[`http_req_duration{scenario:sending_${destinations}_destinations}`]
  delete data.metrics[`http_req_duration{scenario:sending_${destinations}_destinations}`]
  return data
}

export function setThresholdsForScenarios (options) {
  for (const key in options.scenarios) {
    options.thresholds[`http_req_duration{scenario:${key}}`] = ['max>=0']
    options.thresholds[`http_req_receiving{scenario:${key}}`] = ['max>=0']
    options.thresholds[`http_req_sending{scenario:${key}}`] = ['max>=0']
  }
};

export const countries = {
  gs: { lat: -54.283333, lng: -36.5 },
  tf: { lat: -49.35, lng: 70.216667 },
  ps: { lat: 31.7666666666667, lng: 35.233333 },
  ax: { lat: 60.116667, lng: 19.9 },
  nr: { lat: -0.5477, lng: 166.920867 },
  mf: { lat: 18.0731, lng: -63.0822 },
  tk: { lat: -9.166667, lng: -171.833333 },
  eh: { lat: 27.153611, lng: -13.203333 },
  af: { lat: 34.5166666666667, lng: 69.183333 },
  al: { lat: 41.3166666666667, lng: 19.816667 },
  dz: { lat: 36.75, lng: 3.05 },
  as: { lat: -14.2666666666667, lng: -170.7 },
  ad: { lat: 42.5, lng: 1.516667 },
  ao: { lat: -8.83333333333333, lng: 13.216667 },
  ai: { lat: 18.2166666666667, lng: -63.05 },
  ag: { lat: 17.1166666666667, lng: -61.85 },
  ar: { lat: -34.5833333333333, lng: -58.666667 },
  am: { lat: 40.1666666666667, lng: 44.5 },
  aw: { lat: 12.5166666666667, lng: -70.033333 },
  au: { lat: -35.2666666666667, lng: 149.133333 },
  at: { lat: 48.2, lng: 16.366667 },
  az: { lat: 40.3833333333333, lng: 49.866667 },
  bs: { lat: 25.0833333333333, lng: -77.35 },
  bh: { lat: 26.2333333333333, lng: 50.566667 },
  bd: { lat: 23.7166666666667, lng: 90.4 },
  bb: { lat: 13.1, lng: -59.616667 },
  by: { lat: 53.9, lng: 27.566667 },
  be: { lat: 50.8333333333333, lng: 4.333333 },
  bz: { lat: 17.25, lng: -88.766667 },
  bj: { lat: 6.48333333333333, lng: 2.616667 },
  bm: { lat: 32.2833333333333, lng: -64.783333 },
  bt: { lat: 27.4666666666667, lng: 89.633333 },
  bo: { lat: -16.5, lng: -68.15 },
  ba: { lat: 43.8666666666667, lng: 18.416667 },
  bw: { lat: -24.6333333333333, lng: 25.9 },
  br: { lat: -15.7833333333333, lng: -47.916667 },
  vg: { lat: 18.4166666666667, lng: -64.616667 },
  bn: { lat: 4.88333333333333, lng: 114.933333 },
  bg: { lat: 42.6833333333333, lng: 23.316667 },
  bf: { lat: 12.3666666666667, lng: -1.516667 },
  mm: { lat: 16.8, lng: 96.15 },
  bi: { lat: -3.36666666666667, lng: 29.35 },
  kh: { lat: 11.55, lng: 104.916667 },
  cm: { lat: 3.86666666666667, lng: 11.516667 },
  ca: { lat: 45.4166666666667, lng: -75.7 },
  cv: { lat: 14.9166666666667, lng: -23.516667 },
  ky: { lat: 19.3, lng: -81.383333 },
  cf: { lat: 4.36666666666667, lng: 18.583333 },
  td: { lat: 12.1, lng: 15.033333 },
  cl: { lat: -33.45, lng: -70.666667 },
  cn: { lat: 39.9166666666667, lng: 116.383333 },
  cx: { lat: -10.4166666666667, lng: 105.716667 },
  cc: { lat: -12.1666666666667, lng: 96.833333 },
  co: { lat: 4.6, lng: -74.083333 },
  km: { lat: -11.7, lng: 43.233333 },
  cd: { lat: -4.31666666666667, lng: 15.3 },
  cg: { lat: -4.25, lng: 15.283333 },
  ck: { lat: -21.2, lng: -159.766667 },
  cr: { lat: 9.93333333333333, lng: -84.083333 },
  ci: { lat: 6.81666666666667, lng: -5.266667 },
  hr: { lat: 45.8, lng: 16 },
  cu: { lat: 23.1166666666667, lng: -82.35 },
  cw: { lat: 12.1, lng: -68.916667 },
  cy: { lat: 35.1666666666667, lng: 33.366667 },
  cz: { lat: 50.0833333333333, lng: 14.466667 },
  dk: { lat: 55.6666666666667, lng: 12.583333 },
  dj: { lat: 11.5833333333333, lng: 43.15 },
  dm: { lat: 15.3, lng: -61.4 },
  do: { lat: 18.4666666666667, lng: -69.9 },
  ec: { lat: -0.216666666666667, lng: -78.5 },
  eg: { lat: 30.05, lng: 31.25 },
  sv: { lat: 13.7, lng: -89.2 },
  gq: { lat: 3.75, lng: 8.783333 },
  er: { lat: 15.3333333333333, lng: 38.933333 },
  ee: { lat: 59.4333333333333, lng: 24.716667 },
  et: { lat: 9.03333333333333, lng: 38.7 },
  fk: { lat: -51.7, lng: -57.85 },
  fo: { lat: 62, lng: -6.766667 },
  fj: { lat: -18.1333333333333, lng: 178.416667 },
  fi: { lat: 60.1666666666667, lng: 24.933333 },
  fr: { lat: 48.8666666666667, lng: 2.333333 },
  pf: { lat: -17.5333333333333, lng: -149.566667 },
  ga: { lat: 0.383333333333333, lng: 9.45 },
  gm: { lat: 13.45, lng: -16.566667 },
  ge: { lat: 41.6833333333333, lng: 44.833333 },
  de: { lat: 52.5166666666667, lng: 13.4 },
  gh: { lat: 5.55, lng: -0.216667 },
  gi: { lat: 36.1333333333333, lng: -5.35 },
  gr: { lat: 37.9833333333333, lng: 23.733333 },
  gl: { lat: 64.1833333333333, lng: -51.75 },
  gd: { lat: 12.05, lng: -61.75 },
  gu: { lat: 13.4666666666667, lng: 144.733333 },
  gt: { lat: 14.6166666666667, lng: -90.516667 },
  gg: { lat: 49.45, lng: -2.533333 },
  gn: { lat: 9.5, lng: -13.7 },
  gw: { lat: 11.85, lng: -15.583333 },
  gy: { lat: 6.8, lng: -58.15 },
  ht: { lat: 18.5333333333333, lng: -72.333333 },
  va: { lat: 41.9, lng: 12.45 },
  hn: { lat: 14.1, lng: -87.216667 },
  hu: { lat: 47.5, lng: 19.083333 },
  is: { lat: 64.15, lng: -21.95 },
  in: { lat: 28.6, lng: 77.2 },
  id: { lat: -6.16666666666667, lng: 106.816667 },
  ir: { lat: 35.7, lng: 51.416667 },
  iq: { lat: 33.3333333333333, lng: 44.4 },
  ie: { lat: 53.3166666666667, lng: -6.233333 },
  im: { lat: 54.15, lng: -4.483333 },
  il: { lat: 31.7666666666667, lng: 35.233333 },
  it: { lat: 41.9, lng: 12.483333 },
  jm: { lat: 18, lng: -76.8 },
  jp: { lat: 35.6833333333333, lng: 139.75 },
  je: { lat: 49.1833333333333, lng: -2.1 },
  jo: { lat: 31.95, lng: 35.933333 },
  kz: { lat: 51.1666666666667, lng: 71.416667 },
  ke: { lat: -1.28333333333333, lng: 36.816667 },
  ki: { lat: -0.883333333333333, lng: 169.533333 },
  kp: { lat: 39.0166666666667, lng: 125.75 },
  kr: { lat: 37.55, lng: 126.983333 },
  ko: { lat: 42.6666666666667, lng: 21.166667 },
  kw: { lat: 29.3666666666667, lng: 47.966667 },
  kg: { lat: 42.8666666666667, lng: 74.6 },
  la: { lat: 17.9666666666667, lng: 102.6 },
  lv: { lat: 56.95, lng: 24.1 },
  lb: { lat: 33.8666666666667, lng: 35.5 },
  ls: { lat: -29.3166666666667, lng: 27.483333 },
  lr: { lat: 6.3, lng: -10.8 },
  ly: { lat: 32.8833333333333, lng: 13.166667 },
  li: { lat: 47.1333333333333, lng: 9.516667 },
  lt: { lat: 54.6833333333333, lng: 25.316667 },
  lu: { lat: 49.6, lng: 6.116667 },
  mk: { lat: 42, lng: 21.433333 },
  mg: { lat: -18.9166666666667, lng: 47.516667 },
  mw: { lat: -13.9666666666667, lng: 33.783333 },
  my: { lat: 3.16666666666667, lng: 101.7 },
  mv: { lat: 4.16666666666667, lng: 73.5 },
  ml: { lat: 12.65, lng: -8 },
  mt: { lat: 35.8833333333333, lng: 14.5 },
  mh: { lat: 7.1, lng: 171.383333 },
  mr: { lat: 18.0666666666667, lng: -15.966667 },
  mu: { lat: -20.15, lng: 57.483333 },
  mx: { lat: 19.4333333333333, lng: -99.133333 },
  fm: { lat: 6.91666666666667, lng: 158.15 },
  md: { lat: 47, lng: 28.85 },
  mc: { lat: 43.7333333333333, lng: 7.416667 },
  mn: { lat: 47.9166666666667, lng: 106.916667 },
  me: { lat: 42.4333333333333, lng: 19.266667 },
  ms: { lat: 16.7, lng: -62.216667 },
  ma: { lat: 34.0166666666667, lng: -6.816667 },
  mz: { lat: -25.95, lng: 32.583333 },
  na: { lat: -22.5666666666667, lng: 17.083333 },
  np: { lat: 27.7166666666667, lng: 85.316667 },
  nl: { lat: 52.35, lng: 4.916667 },
  nc: { lat: -22.2666666666667, lng: 166.45 },
  nz: { lat: -41.3, lng: 174.783333 },
  ni: { lat: 12.1333333333333, lng: -86.25 },
  ne: { lat: 13.5166666666667, lng: 2.116667 },
  ng: { lat: 9.08333333333333, lng: 7.533333 },
  nu: { lat: -19.0166666666667, lng: -169.916667 },
  nf: { lat: -29.05, lng: 167.966667 },
  mp: { lat: 15.2, lng: 145.75 },
  no: { lat: 59.9166666666667, lng: 10.75 },
  om: { lat: 23.6166666666667, lng: 58.583333 },
  pk: { lat: 33.6833333333333, lng: 73.05 },
  pw: { lat: 7.48333333333333, lng: 134.633333 },
  pa: { lat: 8.96666666666667, lng: -79.533333 },
  pg: { lat: -9.45, lng: 147.183333 },
  py: { lat: -25.2666666666667, lng: -57.666667 },
  pe: { lat: -12.05, lng: -77.05 },
  ph: { lat: 14.6, lng: 120.966667 },
  pn: { lat: -25.0666666666667, lng: -130.083333 },
  pl: { lat: 52.25, lng: 21 },
  pt: { lat: 38.7166666666667, lng: -9.133333 },
  pr: { lat: 18.4666666666667, lng: -66.116667 },
  qa: { lat: 25.2833333333333, lng: 51.533333 },
  ro: { lat: 44.4333333333333, lng: 26.1 },
  ru: { lat: 55.75, lng: 37.6 },
  rw: { lat: -1.95, lng: 30.05 },
  bl: { lat: 17.8833333333333, lng: -62.85 },
  sh: { lat: -15.9333333333333, lng: -5.716667 },
  kn: { lat: 17.3, lng: -62.716667 },
  lc: { lat: 14, lng: -61 },
  pm: { lat: 46.7666666666667, lng: -56.183333 },
  vc: { lat: 13.1333333333333, lng: -61.216667 },
  ws: { lat: -13.8166666666667, lng: -171.766667 },
  sm: { lat: 43.9333333333333, lng: 12.416667 },
  st: { lat: 0.333333333333333, lng: 6.733333 },
  sa: { lat: 24.65, lng: 46.7 },
  sn: { lat: 14.7333333333333, lng: -17.633333 },
  rs: { lat: 44.8333333333333, lng: 20.5 },
  sc: { lat: -4.61666666666667, lng: 55.45 },
  sl: { lat: 8.48333333333333, lng: -13.233333 },
  sg: { lat: 1.28333333333333, lng: 103.85 },
  sx: { lat: 18.0333333333333, lng: -63.05 },
  sk: { lat: 48.15, lng: 17.116667 },
  si: { lat: 46.05, lng: 14.516667 },
  sb: { lat: -9.43333333333333, lng: 159.95 },
  so: { lat: 2.06666666666667, lng: 45.333333 },
  za: { lat: -25.7, lng: 28.216667 },
  ss: { lat: 4.85, lng: 31.616667 },
  es: { lat: 40.4, lng: -3.683333 },
  lk: { lat: 6.93333333333333, lng: 79.85 },
  sd: { lat: 15.6, lng: 32.533333 },
  sr: { lat: 5.86666666666667, lng: -55.166667 },
  sj: { lat: 78.2166666666667, lng: 15.633333 },
  sz: { lat: -26.3166666666667, lng: 31.133333 },
  se: { lat: 59.3333333333333, lng: 18.05 },
  ch: { lat: 46.9166666666667, lng: 7.466667 },
  sy: { lat: 33.5, lng: 36.3 },
  tw: { lat: 25.0333333333333, lng: 121.516667 },
  tj: { lat: 38.55, lng: 68.766667 },
  tz: { lat: -6.8, lng: 39.283333 },
  th: { lat: 13.75, lng: 100.516667 },
  tl: { lat: -8.56666666666667, lng: 125.6 },
  tg: { lat: 6.11666666666667, lng: 1.216667 },
  tkl: { lat: -9.16666666666667, lng: -171.833333 },
  to: { lat: -21.1333333333333, lng: -175.2 },
  tt: { lat: 10.65, lng: -61.516667 },
  tn: { lat: 36.8, lng: 10.183333 },
  tr: { lat: 39.9333333333333, lng: 32.866667 },
  tm: { lat: 37.95, lng: 58.383333 },
  tc: { lat: 21.4666666666667, lng: -71.133333 },
  tv: { lat: -8.51666666666667, lng: 179.216667 },
  ug: { lat: 0.313611, lng: 32.581111 },
  ua: { lat: 50.4333333333333, lng: 30.516667 },
  ae: { lat: 25.276987, lng: 55.296249 },
  gb: { lat: 51.5, lng: -0.083333 },
  us: { lat: 38.895110, lng: -77.036366 },
  vi: { lat: 18.35, lng: -64.933333 },
  uy: { lat: -34.9, lng: -56.191667 },
  uz: { lat: 41.3166666666667, lng: 69.25 },
  vu: { lat: -17.7333333333333, lng: 168.316667 },
  ve: { lat: 10.4833333333333, lng: -66.866667 },
  vn: { lat: 21.0333333333333, lng: 105.85 },
  wf: { lat: -17.75, lng: 168.3 },
  ye: { lat: 15.35, lng: 44.2 },
  zm: { lat: -15.4166666666667, lng: 28.283333 },
  zw: { lat: -17.8166666666667, lng: 31.033333 }
}

export const protoCountries = {
  lv: { lat: 56.945614, lng: 24.120870 },
  nl: { lat: 52.3650144, lng: 4.892851 },
  at: { lat: 48.2244617, lng: 16.326472 },
  be: { lat: 50.8610222, lng: 4.384314 },
  de: { lat: 52.5446, lng: 13.35 },
  fr: { lat: 48.8540899, lng: 2.325747 },
  ie: { lat: 53.3129170, lng: -6.3308734 },
  lt: { lat: 54.6584053, lng: 25.2288244 },
  uk: { lat: 51.42561, lng: -0.128015 },
  us_akst: { lat: 61.218056, lng: -149.900284 },
  us_cstn: { lat: 41.8781136, lng: -87.6297982 },
  us_csts: { lat: 34.7303688, lng: -86.5861037 },
  us_estn: { lat: 40.712776, lng: -74.005974 },
  us_ests: { lat: 38.907192, lng: -77.036873 },
  us_hi: { lat: 21.3098845, lng: -157.8581401 },
  us_mst: { lat: 39.739235, lng: -104.990250 },
  us_pst: { lat: 34.052235, lng: -118.243683 }
}

function randomInRange (min, max) {
  return Math.random() * (max - min) + min
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
