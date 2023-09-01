import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.3/index.js';

export let commonOptions = {
    stages: [
        {duration: '1m', target: 5}, //5 virtual users over 1 minutes
        {duration: '3m', target: 10}, //10 virtual users over 3 minutes
        {duration: '10s', target: 0},
    ]
};

export function summaryFormatter(data) {
    // removing default metrics
    delete data.metrics['http_req_duration']
    delete data.metrics['http_req_sending']
    delete data.metrics['http_req_receiving']
    delete data.metrics['http_req_blocked']
    delete data.metrics[`http_req_duration{expected_response:true}`]
    delete data.metrics['http_req_waiting']
    delete data.metrics['http_reqs']
    delete data.metrics['iteration_duration']
    delete data.metrics['iterations']
    delete data.metrics['vus']
    delete data.metrics['http_req_connecting']
    delete data.metrics['http_req_failed']
    delete data.metrics['http_req_tls_handshaking']

    data = destinations.reduce((curData, curDestinations) => {
        return reportPerDestination(curData, curDestinations)
    }, data)

    return {
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    }
}

function reportPerDestination(data, destinations) {
    data.metrics[`http_req_sending(${destinations} destinations)`] = data.metrics[`http_req_sending{scenario:sending_${destinations}_destinations}`]
    delete data.metrics[`http_req_sending{scenario:sending_${destinations}_destinations}`]
    data.metrics[`http_req_receiving(${destinations} destinations)`] = data.metrics[`http_req_receiving{scenario:sending_${destinations}_destinations}`]
    delete data.metrics[`http_req_receiving{scenario:sending_${destinations}_destinations}`]
    data.metrics[`http_req_duration(${destinations} destinations)`] = data.metrics[`http_req_duration{scenario:sending_${destinations}_destinations}`]
    delete data.metrics[`http_req_duration{scenario:sending_${destinations}_destinations}`]
    return data
}

export const destinations = (__ENV.DESTINATIONS || '50, 100, 150')
    .split(',')
    .map((curDestinations) => parseInt(curDestinations))

const scenarios = destinations.reduce((accumulator, currentDestinations) => {
    accumulator[`sending_${currentDestinations}_destinations`] = {
        executor: 'constant-vus',
        duration: '3m',
        env: {SCENARIO_DESTINATIONS: currentDestinations.toString()},

        vus: 1,
        startTime: '10s',
        gracefulStop: '10s',
    }
    return accumulator
}, {})

export const configs = {
    scenarios: scenarios,
    summaryTrendStats: ['avg', 'min', 'max', 'p(90)', 'p(95)'],

    thresholds: {
        // Intentionally empty. I'll define bogus thresholds (to generate the sub-metrics) below.
    }
}

export function setThresholdsForScenarios(options) {
    for (let key in options.scenarios) {
        options.thresholds[`http_req_duration{scenario:${key}}`] = ['max>=0'];
        options.thresholds[`http_req_receiving{scenario:${key}}`] = ['max>=0'];
        options.thresholds[`http_req_sending{scenario:${key}}`] = ['max>=0'];
    }
};

const countries = `GS,-54.283333,-36.5
                     TF,-49.35,70.216667
                     PS,31.7666666666667,35.233333
                     AX,60.116667,19.9
                     NR,-0.5477,166.920867
                     MF,18.0731,-63.0822
                     TK,-9.166667,-171.833333
                     EH,27.153611,-13.203333
                     AF,34.5166666666667,69.183333
                     AL,41.3166666666667,19.816667
                     DZ,36.75,3.05
                     AS,-14.2666666666667,-170.7
                     AD,42.5,1.516667
                     AO,-8.83333333333333,13.216667
                     AI,18.2166666666667,-63.05
                     AG,17.1166666666667,-61.85
                     AR,-34.5833333333333,-58.666667
                     AM,40.1666666666667,44.5
                     AW,12.5166666666667,-70.033333
                     AU,-35.2666666666667,149.133333
                     AT,48.2,16.366667
                     AZ,40.3833333333333,49.866667
                     BS,25.0833333333333,-77.35
                     BH,26.2333333333333,50.566667
                     BD,23.7166666666667,90.4
                     BB,13.1,-59.616667
                     BY,53.9,27.566667
                     BE,50.8333333333333,4.333333
                     BZ,17.25,-88.766667
                     BJ,6.48333333333333,2.616667
                     BM,32.2833333333333,-64.783333
                     BT,27.4666666666667,89.633333
                     BO,-16.5,-68.15
                     BA,43.8666666666667,18.416667
                     BW,-24.6333333333333,25.9
                     BR,-15.7833333333333,-47.916667
                     VG,18.4166666666667,-64.616667
                     BN,4.88333333333333,114.933333
                     BG,42.6833333333333,23.316667
                     BF,12.3666666666667,-1.516667
                     MM,16.8,96.15
                     BI,-3.36666666666667,29.35
                     KH,11.55,104.916667
                     CM,3.86666666666667,11.516667
                     CA,45.4166666666667,-75.7
                     CV,14.9166666666667,-23.516667
                     KY,19.3,-81.383333
                     CF,4.36666666666667,18.583333
                     TD,12.1,15.033333
                     CL,-33.45,-70.666667
                     CN,39.9166666666667,116.383333
                     CX,-10.4166666666667,105.716667
                     CC,-12.1666666666667,96.833333
                     CO,4.6,-74.083333
                     KM,-11.7,43.233333
                     CD,-4.31666666666667,15.3
                     CG,-4.25,15.283333
                     CK,-21.2,-159.766667
                     CR,9.93333333333333,-84.083333
                     CI,6.81666666666667,-5.266667
                     HR,45.8,16
                     CU,23.1166666666667,-82.35
                     CW,12.1,-68.916667
                     CY,35.1666666666667,33.366667
                     CZ,50.0833333333333,14.466667
                     DK,55.6666666666667,12.583333
                     DJ,11.5833333333333,43.15
                     DM,15.3,-61.4
                     DO,18.4666666666667,-69.9
                     EC,-0.216666666666667,-78.5
                     EG,30.05,31.25
                     SV,13.7,-89.2
                     GQ,3.75,8.783333
                     ER,15.3333333333333,38.933333
                     EE,59.4333333333333,24.716667
                     ET,9.03333333333333,38.7
                     FK,-51.7,-57.85
                     FO,62,-6.766667
                     FJ,-18.1333333333333,178.416667
                     FI,60.1666666666667,24.933333
                     FR,48.8666666666667,2.333333
                     PF,-17.5333333333333,-149.566667
                     GA,0.383333333333333,9.45
                     GM,13.45,-16.566667
                     GE,41.6833333333333,44.833333
                     DE,52.5166666666667,13.4
                     GH,5.55,-0.216667
                     GI,36.1333333333333,-5.35
                     GR,37.9833333333333,23.733333
                     GL,64.1833333333333,-51.75
                     GD,12.05,-61.75
                     GU,13.4666666666667,144.733333
                     GT,14.6166666666667,-90.516667
                     GG,49.45,-2.533333
                     GN,9.5,-13.7
                     GW,11.85,-15.583333
                     GY,6.8,-58.15
                     HT,18.5333333333333,-72.333333
                     VA,41.9,12.45
                     HN,14.1,-87.216667
                     HU,47.5,19.083333
                     IS,64.15,-21.95
                     IN,28.6,77.2
                     ID,-6.16666666666667,106.816667
                     IR,35.7,51.416667
                     IQ,33.3333333333333,44.4
                     IE,53.3166666666667,-6.233333
                     IM,54.15,-4.483333
                     IL,31.7666666666667,35.233333
                     IT,41.9,12.483333
                     JM,18,-76.8
                     JP,35.6833333333333,139.75
                     JE,49.1833333333333,-2.1
                     JO,31.95,35.933333
                     KZ,51.1666666666667,71.416667
                     KE,-1.28333333333333,36.816667
                     KI,-0.883333333333333,169.533333
                     KP,39.0166666666667,125.75
                     KR,37.55,126.983333
                     KO,42.6666666666667,21.166667
                     KW,29.3666666666667,47.966667
                     KG,42.8666666666667,74.6
                     LA,17.9666666666667,102.6
                     LV,56.95,24.1
                     LB,33.8666666666667,35.5
                     LS,-29.3166666666667,27.483333
                     LR,6.3,-10.8
                     LY,32.8833333333333,13.166667
                     LI,47.1333333333333,9.516667
                     LT,54.6833333333333,25.316667
                     LU,49.6,6.116667
                     MK,42,21.433333
                     MG,-18.9166666666667,47.516667
                     MW,-13.9666666666667,33.783333
                     MY,3.16666666666667,101.7
                     MV,4.16666666666667,73.5
                     ML,12.65,-8
                     MT,35.8833333333333,14.5
                     MH,7.1,171.383333
                     MR,18.0666666666667,-15.966667
                     MU,-20.15,57.483333
                     MX,19.4333333333333,-99.133333
                     FM,6.91666666666667,158.15
                     MD,47,28.85
                     MC,43.7333333333333,7.416667
                     MN,47.9166666666667,106.916667
                     ME,42.4333333333333,19.266667
                     MS,16.7,-62.216667
                     MA,34.0166666666667,-6.816667
                     MZ,-25.95,32.583333
                     NA,-22.5666666666667,17.083333
                     NP,27.7166666666667,85.316667
                     NL,52.35,4.916667
                     NC,-22.2666666666667,166.45
                     NZ,-41.3,174.783333
                     NI,12.1333333333333,-86.25
                     NE,13.5166666666667,2.116667
                     NG,9.08333333333333,7.533333
                     NU,-19.0166666666667,-169.916667
                     NF,-29.05,167.966667
                     MP,15.2,145.75
                     NO,59.9166666666667,10.75
                     OM,23.6166666666667,58.583333
                     PK,33.6833333333333,73.05
                     PW,7.48333333333333,134.633333
                     PA,8.96666666666667,-79.533333
                     PG,-9.45,147.183333
                     PY,-25.2666666666667,-57.666667
                     PE,-12.05,-77.05
                     PH,14.6,120.966667
                     PN,-25.0666666666667,-130.083333
                     PL,52.25,21
                     PT,38.7166666666667,-9.133333
                     PR,18.4666666666667,-66.116667
                     QA,25.2833333333333,51.533333
                     RO,44.4333333333333,26.1
                     RU,55.75,37.6
                     RW,-1.95,30.05
                     BL,17.8833333333333,-62.85
                     SH,-15.9333333333333,-5.716667
                     KN,17.3,-62.716667
                     LC,14,-61
                     PM,46.7666666666667,-56.183333
                     VC,13.1333333333333,-61.216667
                     WS,-13.8166666666667,-171.766667
                     SM,43.9333333333333,12.416667
                     ST,0.333333333333333,6.733333
                     SA,24.65,46.7
                     SN,14.7333333333333,-17.633333
                     RS,44.8333333333333,20.5
                     SC,-4.61666666666667,55.45
                     SL,8.48333333333333,-13.233333
                     SG,1.28333333333333,103.85
                     SX,18.0166666666667,-63.033333
                     SK,48.15,17.116667
                     SI,46.05,14.516667
                     SB,-9.43333333333333,159.95
                     SO,2.06666666666667,45.333333
                     ZA,-25.7,28.216667
                     SS,4.85,31.616667
                     ES,40.4,-3.683333
                     LK,6.91666666666667,79.833333
                     SD,15.6,32.533333
                     SR,5.83333333333333,-55.166667
                     SJ,78.2166666666667,15.633333
                     SZ,-26.3166666666667,31.133333
                     SE,59.3333333333333,18.05
                     CH,46.9166666666667,7.466667
                     SY,33.5,36.3
                     TW,25.0333333333333,121.516667
                     TJ,38.55,68.766667
                     TZ,-6.8,39.283333
                     TH,13.75,100.516667
                     TL,-8.58333333333333,125.6
                     TG,6.11666666666667,1.216667
                     TO,-21.1333333333333,-175.2
                     TT,10.65,-61.516667
                     TN,36.8,10.183333
                     TR,39.9333333333333,32.866667
                     TM,37.95,58.383333
                     TC,21.4666666666667,-71.133333
                     TV,-8.51666666666667,179.216667
                     UG,0.316666666666667,32.55
                     UA,50.4333333333333,30.516667
                     AE,24.4666666666667,54.366667
                     GB,51.5,-0.083333
                     US,38.883333,-77
                     UY,-34.85,-56.166667
                     UZ,41.3166666666667,69.25
                     VU,-17.7333333333333,168.316667
                     VE,10.4833333333333,-66.866667
                     VN,21.0333333333333,105.85
                     VI,18.35,-64.933333
                     WF,-13.95,-171.933333
                     YE,15.35,44.2
                     ZM,-15.4166666666667,28.283333
                     ZW,-17.8166666666667,31.033333
                     UM,38.883333,-77
                     AQ,0,0
                     NULL,35.183333,33.366667
                     HK,0,0
                     HM,0,0
                     IO,-7.3,72.4
                     MO,0,0
`;

export function getCapitalCoordinates(countryCode) {
  const lines = countryData.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const columns = lines[i].split(',');
    const currentCountryCode = columns[0].trim();
    if (currentCountryCode === countryCode) {
      const latitude = parseFloat(columns[1]);
      const longitude = parseFloat(columns[2]);
      return { latitude, longitude };
    }
  }
  return null; // Country code not found
}

export const protoCountries = {
    'lv': {lat: 56.945614, lng: 24.120870},
    'nl': {lat: 52.3650144, lng: 4.892851},
    'at': {lat: 48.2244617, lng: 16.326472},
    'be': {lat: 50.8610222, lng: 4.384314},
    'de': {lat: 52.5446, lng: 13.35},
    'fr': {lat: 48.8540899, lng: 2.325747},
    'ie': {lat: 53.3129170, lng: -6.3308734},
    'lt': {lat: 54.6584053, lng: 25.2288244},
    'uk': {lat: 51.42561, lng: -0.128015},
    'us_akst': {lat: 61.218056, lng: -149.900284},
    'us_cstn': {lat: 41.8781136, lng: -87.6297982},
    'us_csts': {lat: 34.7303688, lng: -86.5861037},
    'us_estn': {lat: 40.712776, lng: -74.005974},
    'us_ests': {lat: 38.907192, lng: -77.036873},
    'us_hi': {lat: 21.3098845, lng: -157.8581401},
    'us_mst': {lat: 39.739235, lng: -104.990250},
    'us_pst': {lat: 34.052235, lng: -118.243683}
};

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function generateRandomCoordinate(lat, lng, diff) {
    return {
        lat: randomInRange(lat - diff, lat + diff),
        lng: randomInRange(lng - diff, lng + diff),
    };
}

export function generateDestinations(numCoordinates, departure, diff) {
    return Array.from({length: numCoordinates}, () =>
        generateRandomCoordinate(departure.lat, departure.lng, diff)
    );
}

export function destinationDeltas(departure, destinations) {
    return destinations.flatMap((destination) =>
        [encodeFixedPoint(departure.lat, destination.lat), encodeFixedPoint(departure.lng, destination.lng)]
    );
}

function encodeFixedPoint(sourcePoint, targetPoint) {
    return Math.round((targetPoint - sourcePoint) * (10 ** 5));
}

