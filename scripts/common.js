export let mapEndpointOptions = {
    stages: [{
            duration: '1m',
            target: 5
        }, //5 virtual users over 1 minutes
        {
            duration: '3m',
            target: 10
        }, //10 virtual users over 3 minutes
        {
            duration: '10s',
            target: 0
        },
    ],
    summaryTrendStats: ['avg', 'min', 'max', 'p(90)', 'p(95)'],
    thresholds: {
        'http_req_duration': ['max>=0'],
        'http_req_receiving': ['max>=0'],
        'http_req_sending': ['max>=0'],
    }
};

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

export const timeFilterOptions = {
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

export const countries = {
  'GS': { lat: -54.283333, lng: -36.5 },
  'TF': { lat: -49.35, lng: 70.216667 },
  'PS': { lat: 31.7666666666667, lng: 35.233333 },
  'AX': { lat: 60.116667, lng: 19.9 },
  'NR': { lat: -0.5477, lng: 166.920867 },
  'MF': { lat: 18.0731, lng: -63.0822 },
  'TK': { lat: -9.166667, lng: -171.833333 },
  'EH': { lat: 27.153611, lng: -13.203333 },
  'AF': { lat: 34.5166666666667, lng: 69.183333 },
  'AL': { lat: 41.3166666666667, lng: 19.816667 },
  'DZ': { lat: 36.75, lng: 3.05 },
  'AS': { lat: -14.2666666666667, lng: -170.7 },
  'AD': { lat: 42.5, lng: 1.516667 },
  'AO': { lat: -8.83333333333333, lng: 13.216667 },
  'AI': { lat: 18.2166666666667, lng: -63.05 },
  'AG': { lat: 17.1166666666667, lng: -61.85 },
  'AR': { lat: -34.5833333333333, lng: -58.666667 },
  'AM': { lat: 40.1666666666667, lng: 44.5 },
  'AW': { lat: 12.5166666666667, lng: -70.033333 },
  'AU': { lat: -35.2666666666667, lng: 149.133333 },
  'AT': { lat: 48.2, lng: 16.366667 },
  'AZ': { lat: 40.3833333333333, lng: 49.866667 },
  'BS': { lat: 25.0833333333333, lng: -77.35 },
  'BH': { lat: 26.2333333333333, lng: 50.566667 },
  'BD': { lat: 23.7166666666667, lng: 90.4 },
  'BB': { lat: 13.1, lng: -59.616667 },
  'BY': { lat: 53.9, lng: 27.566667 },
  'BE': { lat: 50.8333333333333, lng: 4.333333 },
  'BZ': { lat: 17.25, lng: -88.766667 },
  'BJ': { lat: 6.48333333333333, lng: 2.616667 },
  'BM': { lat: 32.2833333333333, lng: -64.783333 },
  'BT': { lat: 27.4666666666667, lng: 89.633333 },
  'BO': { lat: -16.5, lng: -68.15 },
  'BA': { lat: 43.8666666666667, lng: 18.416667 },
  'BW': { lat: -24.6333333333333, lng: 25.9 },
  'BR': { lat: -15.7833333333333, lng: -47.916667 },
  'VG': { lat: 18.4166666666667, lng: -64.616667 },
  'BN': { lat: 4.88333333333333, lng: 114.933333 },
  'BG': { lat: 42.6833333333333, lng: 23.316667 },
  'BF': { lat: 12.3666666666667, lng: -1.516667 },
  'MM': { lat: 16.8, lng: 96.15 },
  'BI': { lat: -3.36666666666667, lng: 29.35 },
  'KH': { lat: 11.55, lng: 104.916667 },
  'CM': { lat: 3.86666666666667, lng: 11.516667 },
  'CA': { lat: 45.4166666666667, lng: -75.7 },
  'CV': { lat: 14.9166666666667, lng: -23.516667 },
  'KY': { lat: 19.3, lng: -81.383333 },
  'CF': { lat: 4.36666666666667, lng: 18.583333 },
  'TD': { lat: 12.1, lng: 15.033333 },
  'CL': { lat: -33.45, lng: -70.666667 },
  'CN': { lat: 39.9166666666667, lng: 116.383333 },
  'CX': { lat: -10.4166666666667, lng: 105.716667 },
  'CC': { lat: -12.1666666666667, lng: 96.833333 },
  'CO': { lat: 4.6, lng: -74.083333 },
  'KM': { lat: -11.7, lng: 43.233333 },
  'CD': { lat: -4.31666666666667, lng: 15.3 },
  'CG': { lat: -4.25, lng: 15.283333 },
  'CK': { lat: -21.2, lng: -159.766667 },
  'CR': { lat: 9.93333333333333, lng: -84.083333 },
  'CI': { lat: 6.81666666666667, lng: -5.266667 },
  'HR': { lat: 45.8, lng: 16 },
  'CU': { lat: 23.1166666666667, lng: -82.35 },
  'CW': { lat: 12.1, lng: -68.916667 },
  'CY': { lat: 35.1666666666667, lng: 33.366667 },
  'CZ': { lat: 50.0833333333333, lng: 14.466667 },
  'DK': { lat: 55.6666666666667, lng: 12.583333 },
  'DJ': { lat: 11.5833333333333, lng: 43.15 },
  'DM': { lat: 15.3, lng: -61.4 },
  'DO': { lat: 18.4666666666667, lng: -69.9 },
  'EC': { lat: -0.216666666666667, lng: -78.5 },
  'EG': { lat: 30.05, lng: 31.25 },
  'SV': { lat: 13.7, lng: -89.2 },
  'GQ': { lat: 3.75, lng: 8.783333 },
  'ER': { lat: 15.3333333333333, lng: 38.933333 },
  'EE': { lat: 59.4333333333333, lng: 24.716667 },
  'ET': { lat: 9.03333333333333, lng: 38.7 },
  'FK': { lat: -51.7, lng: -57.85 },
  'FO': { lat: 62, lng: -6.766667 },
  'FJ': { lat: -18.1333333333333, lng: 178.416667 },
  'FI': { lat: 60.1666666666667, lng: 24.933333 },
  'FR': { lat: 48.8666666666667, lng: 2.333333 },
  'PF': { lat: -17.5333333333333, lng: -149.566667 },
  'GA': { lat: 0.383333333333333, lng: 9.45 },
  'GM': { lat: 13.45, lng: -16.566667 },
  'GE': { lat: 41.6833333333333, lng: 44.833333 },
  'DE': { lat: 52.5166666666667, lng: 13.4 },
  'GH': { lat: 5.55, lng: -0.216667 },
  'GI': { lat: 36.1333333333333, lng: -5.35 },
  'GR': { lat: 37.9833333333333, lng: 23.733333 },
  'GL': { lat: 64.1833333333333, lng: -51.75 },
  'GD': { lat: 12.05, lng: -61.75 },
  'GU': { lat: 13.4666666666667, lng: 144.733333 },
  'GT': { lat: 14.6166666666667, lng: -90.516667 },
  'GG': { lat: 49.45, lng: -2.533333 },
  'GN': { lat: 9.5, lng: -13.7 },
  'GW': { lat: 11.85, lng: -15.583333 },
  'GY': { lat: 6.8, lng: -58.15 },
  'HT': { lat: 18.5333333333333, lng: -72.333333 },
  'VA': { lat: 41.9, lng: 12.45 },
  'HN': { lat: 14.1, lng: -87.216667 },
  'HU': { lat: 47.5, lng: 19.083333 },
  'IS': { lat: 64.15, lng: -21.95 },
  'IN': { lat: 28.6, lng: 77.2 },
  'ID': { lat: -6.16666666666667, lng: 106.816667 },
  'IR': { lat: 35.7, lng: 51.416667 },
  'IQ': { lat: 33.3333333333333, lng: 44.4 },
  'IE': { lat: 53.3166666666667, lng: -6.233333 },
  'IM': { lat: 54.15, lng: -4.483333 },
  'IL': { lat: 31.7666666666667, lng: 35.233333 },
  'IT': { lat: 41.9, lng: 12.483333 },
  'JM': { lat: 18, lng: -76.8 },
  'JP': { lat: 35.6833333333333, lng: 139.75 },
  'JE': { lat: 49.1833333333333, lng: -2.1 },
  'JO': { lat: 31.95, lng: 35.933333 },
  'KZ': { lat: 51.1666666666667, lng: 71.416667 },
  'KE': { lat: -1.28333333333333, lng: 36.816667 },
  'KI': { lat: -0.883333333333333, lng: 169.533333 },
  'KP': { lat: 39.0166666666667, lng: 125.75 },
  'KR': { lat: 37.55, lng: 126.983333 },
  'KO': { lat: 42.6666666666667, lng: 21.166667 },
  'KW': { lat: 29.3666666666667, lng: 47.966667 },
  'KG': { lat: 42.8666666666667, lng: 74.6 },
  'LA': { lat: 17.9666666666667, lng: 102.6 },
  'LV': { lat: 56.95, lng: 24.1 },
  'LB': { lat: 33.8666666666667, lng: 35.5 },
  'LS': { lat: -29.3166666666667, lng: 27.483333 },
  'LR': { lat: 6.3, lng: -10.8 },
  'LY': { lat: 32.8833333333333, lng: 13.166667 },
  'LI': { lat: 47.1333333333333, lng: 9.516667 },
  'LT': { lat: 54.6833333333333, lng: 25.316667 },
  'LU': { lat: 49.6, lng: 6.116667 },
  'MK': { lat: 42, lng: 21.433333 },
  'MG': { lat: -18.9166666666667, lng: 47.516667 },
  'MW': { lat: -13.9666666666667, lng: 33.783333 },
  'MY': { lat: 3.16666666666667, lng: 101.7 },
  'MV': { lat: 4.16666666666667, lng: 73.5 },
  'ML': { lat: 12.65, lng: -8 },
  'MT': { lat: 35.8833333333333, lng: 14.5 },
  'MH': { lat: 7.1, lng: 171.383333 },
  'MR': { lat: 18.0666666666667, lng: -15.966667 },
  'MU': { lat: -20.15, lng: 57.483333 },
  'MX': { lat: 19.4333333333333, lng: -99.133333 },
  'FM': { lat: 6.91666666666667, lng: 158.15 },
  'MD': { lat: 47, lng: 28.85 },
  'MC': { lat: 43.7333333333333, lng: 7.416667 },
  'MN': { lat: 47.9166666666667, lng: 106.916667 },
  'ME': { lat: 42.4333333333333, lng: 19.266667 },
  'MS': { lat: 16.7, lng: -62.216667 },
  'MA': { lat: 34.0166666666667, lng: -6.816667 },
  'MZ': { lat: -25.95, lng: 32.583333 },
  'NA': { lat: -22.5666666666667, lng: 17.083333 },
  'NP': { lat: 27.7166666666667, lng: 85.316667 },
  'NL': { lat: 52.35, lng: 4.916667 },
  'NC': { lat: -22.2666666666667, lng: 166.45 },
  'NZ': { lat: -41.3, lng: 174.783333 },
  'NI': { lat: 12.1333333333333, lng: -86.25 },
  'NE': { lat: 13.5166666666667, lng: 2.116667 },
  'NG': { lat: 9.08333333333333, lng: 7.533333 },
  'NU': { lat: -19.0166666666667, lng: -169.916667 },
  'NF': { lat: -29.05, lng: 167.966667 },
  'MP': { lat: 15.2, lng: 145.75 },
  'NO': { lat: 59.9166666666667, lng: 10.75 },
  'OM': { lat: 23.6166666666667, lng: 58.583333 },
  'PK': { lat: 33.6833333333333, lng: 73.05 },
  'PW': { lat: 7.48333333333333, lng: 134.633333 },
  'PA': { lat: 8.96666666666667, lng: -79.533333 },
  'PG': { lat: -9.45, lng: 147.183333 },
  'PY': { lat: -25.2666666666667, lng: -57.666667 },
  'PE': { lat: -12.05, lng: -77.05 },
  'PH': { lat: 14.6, lng: 120.966667 },
  'PN': { lat: -25.0666666666667, lng: -130.083333 },
  'PL': { lat: 52.25, lng: 21 },
  'PT': { lat: 38.7166666666667, lng: -9.133333 },
  'PR': { lat: 18.4666666666667, lng: -66.116667 },
  'QA': { lat: 25.2833333333333, lng: 51.533333 },
  'RO': { lat: 44.4333333333333, lng: 26.1 },
  'RU': { lat: 55.75, lng: 37.6 },
  'RW': { lat: -1.95, lng: 30.05 },
  'BL': { lat: 17.8833333333333, lng: -62.85 },
  'SH': { lat: -15.9333333333333, lng: -5.716667 },
  'KN': { lat: 17.3, lng: -62.716667 },
  'LC': { lat: 14, lng: -61 },
  'PM': { lat: 46.7666666666667, lng: -56.183333 },
  'VC': { lat: 13.1333333333333, lng: -61.216667 },
  'WS': { lat: -13.8166666666667, lng: -171.766667 },
  'SM': { lat: 43.9333333333333, lng: 12.416667 },
  'ST': { lat: 0.333333333333333, lng: 6.733333 },
  'SA': { lat: 24.65, lng: 46.7 },
  'SN': { lat: 14.7333333333333, lng: -17.633333 },
  'RS': { lat: 44.8333333333333, lng: 20.5 },
  'SC': { lat: -4.61666666666667, lng: 55.45 },
  'SL': { lat: 8.48333333333333, lng: -13.233333 },
  'SG': { lat: 1.28333333333333, lng: 103.85 },
  'SX': { lat: 18.0333333333333, lng: -63.05 },
  'SK': { lat: 48.15, lng: 17.116667 },
  'SI': { lat: 46.05, lng: 14.516667 },
  'SB': { lat: -9.43333333333333, lng: 159.95 },
  'SO': { lat: 2.06666666666667, lng: 45.333333 },
  'ZA': { lat: -25.7, lng: 28.216667 },
  'SS': { lat: 4.85, lng: 31.616667 },
  'ES': { lat: 40.4, lng: -3.683333 },
  'LK': { lat: 6.93333333333333, lng: 79.85 },
  'SD': { lat: 15.6, lng: 32.533333 },
  'SR': { lat: 5.86666666666667, lng: -55.166667 },
  'SJ': { lat: 78.2166666666667, lng: 15.633333 },
  'SZ': { lat: -26.3166666666667, lng: 31.133333 },
  'SE': { lat: 59.3333333333333, lng: 18.05 },
  'CH': { lat: 46.9166666666667, lng: 7.466667 },
  'SY': { lat: 33.5, lng: 36.3 },
  'TW': { lat: 25.0333333333333, lng: 121.516667 },
  'TJ': { lat: 38.55, lng: 68.766667 },
  'TZ': { lat: -6.8, lng: 39.283333 },
  'TH': { lat: 13.75, lng: 100.516667 },
  'TL': { lat: -8.56666666666667, lng: 125.6 },
  'TG': { lat: 6.11666666666667, lng: 1.216667 },
  'TKL': { lat: -9.16666666666667, lng: -171.833333 },
  'TO': { lat: -21.1333333333333, lng: -175.2 },
  'TT': { lat: 10.65, lng: -61.516667 },
  'TN': { lat: 36.8, lng: 10.183333 },
  'TR': { lat: 39.9333333333333, lng: 32.866667 },
  'TM': { lat: 37.95, lng: 58.383333 },
  'TC': { lat: 21.4666666666667, lng: -71.133333 },
  'TV': { lat: -8.51666666666667, lng: 179.216667 },
  'UG': { lat: 0.313611, lng: 32.581111 },
  'UA': { lat: 50.4333333333333, lng: 30.516667 },
  'AE': { lat: 25.276987, lng: 55.296249 },
  'GB': { lat: 51.5, lng: -0.083333 },
  'US': { lat: 38.895110, lng: -77.036366 },
  'VI': { lat: 18.35, lng: -64.933333 },
  'UY': { lat: -34.9, lng: -56.191667 },
  'UZ': { lat: 41.3166666666667, lng: 69.25 },
  'VU': { lat: -17.7333333333333, lng: 168.316667 },
  'VA': { lat: 41.9, lng: 12.45 },
  'VE': { lat: 10.4833333333333, lng: -66.866667 },
  'VN': { lat: 21.0333333333333, lng: 105.85 },
  'WF': { lat: -17.75, lng: 168.3 },
  'EH': { lat: 27.153611, lng: -13.203333 },
  'YE': { lat: 15.35, lng: 44.2 },
  'ZM': { lat: -15.4166666666667, lng: 28.283333 },
  'ZW': { lat: -17.8166666666667, lng: 31.033333 }
};

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

