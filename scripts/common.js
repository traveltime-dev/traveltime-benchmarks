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

const countryData = `CountryName,CapitalName,CapitalLatitude,CapitalLongitude,CountryCode,ContinentName,
                     Somaliland,Hargeisa,9.562389,44.0770134,NULL,Africa,
                     South Georgia and South Sandwich Islands,King Edward Point,-54.2832502,-36.493735,GS,Antarctica,
                     French Southern and Antarctic Lands,Port-aux-Français,-49.3496422,70.218004,TF,Antarctica,
                     Palestine,Jerusalem,31.855584,35.2263871,PS,Asia,
                     Aland Islands,Mariehamn,60.0970945,19.9348339,AX,Europe,
                     Nauru,Yaren,-0.5466856999999999,166.9210913,NR,Australia,
                     Saint Martin,Marigot,18.0675189,-63.0824656,MF,North America,
                     Tokelau,Atafu,-8.5545115,-172.4955714,TK,Australia,
                     Western Sahara,El-Aaiún,27.1500384,-13.1990758,EH,Africa,
                     Afghanistan,Kabul,34.5553494,69.207486,AF,Asia,
                     Albania,Tirana,41.3275459,19.8186982,AL,Europe,
                     Algeria,Algiers,36.753768,3.0587561,DZ,Africa,
                     American Samoa,Pago Pago,-14.2756319,-170.7020359,AS,Australia,
                     Andorra,Andorra la Vella,42.50631740000001,1.5218355,AD,Europe,
                     Angola,Luanda,-8.8146556,13.2301756,AO,Africa,
                     Anguilla,The Valley,18.2148129,-63.0574406,AI,North America,
                     Antigua and Barbuda,Saint John's,17.1274104,-61.84677199999999,AG,North America,
                     Argentina,Buenos Aires,-34.6036844,-58.3815591,AR,South America,
                     Armenia,Yerevan,40.1872023,44.515209,AM,Europe,
                     Aruba,Oranjestad,12.5092044,-70.0086306,AW,North America,
                     Australia,Canberra,-35.2809368,149.1300092,AU,Australia,
                     Austria,Vienna,48.2081743,16.3738189,AT,Europe,
                     Azerbaijan,Baku,40.40926169999999,49.8670924,AZ,Europe,
                     Bahamas,Nassau,25.0443312,-77.3503609,BS,North America,
                     Bahrain,Manama,26.2235305,50.5875935,BH,Asia,
                     Bangladesh,Dhaka,23.810332,90.4125181,BD,Asia,
                     Barbados,Bridgetown,13.1059816,-59.61317409999999,BB,North America,
                     Belarus,Minsk,53.9006011,27.558972,BY,Europe,
                     Belgium,Brussels,50.8503396,4.3517103,BE,Europe,
                     Belize,Belmopan,17.2510114,-88.7590201,BZ,Central America,
                     Benin,Porto-Novo,6.4968574,2.6288523,BJ,Africa,
                     Bermuda,Hamilton,32.2945837,-64.7858887,BM,North America,
                     Bhutan,Thimphu,27.4712216,89.6339041,BT,Asia,
                     Bolivia,La Paz,-16.489689,-68.11929359999999,BO,South America,
                     Bosnia and Herzegovina,Sarajevo,43.8562586,18.4130763,BA,Europe,
                     Botswana,Gaborone,-24.6282079,25.9231471,BW,Africa,
                     Brazil,Brasilia,-15.826691,-47.92182039999999,BR,South America,
                     British Virgin Islands,Road Town,18.4286115,-64.6184657,VG,North America,
                     Brunei Darussalam,Bandar Seri Begawan,4.903052199999999,114.939821,BN,Asia,
                     Bulgaria,Sofia,42.6977082,23.3218675,BG,Europe,
                     Burkina Faso,Ouagadougou,12.3714277,-1.5196603,BF,Africa,
                     Myanmar,Rangoon,16.840939,96.173526,MM,Asia,
                     Burundi,Bujumbura,-3.361378,29.3598782,BI,Africa,
                     Cambodia,Phnom Penh,11.5563738,104.9282099,KH,Asia,
                     Cameroon,Yaounde,3.8480325,11.5020752,CM,Africa,
                     Canada,Ottawa,45.4210824,-75.6998251,CA,Central America,
                     Cape Verde,Praia,14.93305,-23.5133267,CV,Africa,
                     Cayman Islands,George Town,19.2869323,-81.3674389,KY,North America,
                     Central African Republic,Bangui,4.3946735,18.5581899,CF,Africa,
                     Chad,N'Djamena,12.1348457,15.0557415,TD,Africa,
                     Chile,Santiago,-33.4488897,-70.6692655,CL,South America,
                     China,Beijing,39.90419989999999,116.4073963,CN,Asia,
                     Christmas Island,The Settlement,-10.447525,105.690449,CX,Australia,
                     Cocos Islands,West Island,-12.1450486,96.82170169999999,CC,Australia,
                     Colombia,Bogota,4.710988599999999,-74.072092,CO,South America,
                     Comoros,Moroni,-11.7172157,43.2473146,KM,Africa,
                     Democratic Republic of the Congo,Kinshasa,-4.4419311,15.2662931,CD,Africa,
                     Republic of Congo,Brazzaville,-4.2633597,15.2428853,CG,Africa,
                     Cook Islands,Avarua,-21.2129007,-159.7823059,CK,Australia,
                     Costa Rica,San Jose,9.9280694,-84.0907246,CR,Central America,
                     Cote d'Ivoire,Yamoussoukro,6.827622799999999,-5.2893433,CI,Africa,
                     Croatia,Zagreb,45.8150108,15.9819189,HR,Europe,
                     Cuba,Havana,23.1135925,-82.3665956,CU,North America,
                     Curaçao,Willemstad,12.1224221,-68.8824233,CW,North America,
                     Cyprus,Nicosia,35.1855659,33.38227639999999,CY,Europe,
                     Czech Republic,Prague,50.0755381,14.4378005,CZ,Europe,
                     Denmark,Copenhagen,55.6760968,12.5683372,DK,Europe,
                     Djibouti,Djibouti,11.825138,42.590275,DJ,Africa,
                     Dominica,Roseau,15.3091676,-61.37935539999999,DM,North America,
                     Dominican Republic,Santo Domingo,18.4860575,-69.93121169999999,DO,North America,
                     Ecuador,Quito,-0.1806532,-78.4678382,EC,South America,
                     Egypt,Cairo,30.0444196,31.2357116,EG,Africa,
                     El Salvador,San Salvador,13.6929403,-89.2181911,SV,Central America,
                     Equatorial Guinea,Malabo,3.7549606,8.7821344,GQ,Africa,
                     Eritrea,Asmara,15.3228767,38.9250517,ER,Africa,
                     Estonia,Tallinn,59.43696079999999,24.7535747,EE,Europe,
                     Ethiopia,Addis Ababa,8.9806034,38.7577605,ET,Africa,
                     Falkland Islands,Stanley,-51.6977129,-57.85166269999999,FK,South America,
                     Faroe Islands,Torshavn,62.01072479999999,-6.7740852,FO,Europe,
                     Fiji,Suva,-18.1405049,178.4232507,FJ,Australia,
                     Finland,Helsinki,60.16985569999999,24.9383791,FI,Europe,
                     France,Paris,48.856614,2.3522219,FR,Europe,
                     French Polynesia,Papeete,-17.5324608,-149.5677151,PF,Australia,
                     Gabon,Libreville,0.4161976,9.4672676,GA,Africa,
                     The Gambia,Banjul,13.4548761,-16.5790323,GM,Africa,
                     Georgia,Tbilisi,41.7151377,44.827096,GE,Europe,
                     Germany,Berlin,52.52000659999999,13.404954,DE,Europe,
                     Ghana,Accra,5.6037168,-0.1869644,GH,Africa,
                     Gibraltar,Gibraltar,36.140751,-5.353585,GI,Europe,
                     Greece,Athens,37.9838096,23.7275388,GR,Europe,
                     Greenland,Nuuk,64.18140989999999,-51.6941381,GL,Central America,
                     Grenada,Saint George's,12.0560975,-61.7487996,GD,North America,
                     Guam,Hagatna,13.4762824,144.7502228,GU,Australia,
                     Guatemala,Guatemala City,14.6349149,-90.5068824,GT,Central America,
                     Guernsey,Saint Peter Port,49.4541677,-2.5497069,GG,Europe,
                     Guinea,Conakry,9.641185499999999,-13.5784012,GN,Africa,
                     Guinea-Bissau,Bissau,11.803749,-15.180413,GW,Africa,
                     Guyana,Georgetown,6.8012793,-58.1551255,GY,South America,
                     Haiti,Port-au-Prince,18.594395,-72.3074326,HT,North America,
                     Vatican City,Vatican City,41.902916,12.453389,VA,Europe,
                     Honduras,Tegucigalpa,14.065049,-87.1715002,HN,Central America,
                     Hungary,Budapest,47.497912,19.040235,HU,Europe,
                     Iceland,Reykjavik,64.146582,-21.9426354,IS,Europe,
                     India,New Delhi,28.6139391,77.2090212,IN,Asia,
                     Indonesia,Jakarta,-6.2087634,106.845599,ID,Asia,
                     Iran,Tehran,35.6891975,51.3889736,IR,Asia,
                     Iraq,Baghdad,33.315241,44.3660671,IQ,Asia,
                     Ireland,Dublin,53.3498053,-6.2603097,IE,Europe,
                     Isle of Man,Douglas,54.1523372,-4.4861228,IM,Europe,
                     Israel,Jerusalem,31.768319,35.21371,IL,Asia,
                     Italy,Rome,41.9027835,12.4963655,IT,Europe,
                     Jamaica,Kingston,18.0178743,-76.8099041,JM,North America,
                     Japan,Tokyo,35.6761919,139.6503106,JP,Asia,
                     Jersey,Saint Helier,49.1805019,-2.103233,JE,Europe,
                     Jordan,Amman,31.9539494,35.910635,JO,Asia,
                     Kazakhstan,Astana,51.16052269999999,71.4703558,KZ,Asia,
                     Kenya,Nairobi,-1.2920659,36.8219462,KE,Africa,
                     Kiribati,Tarawa,1.4518171,172.9716617,KI,Australia,
                     North Korea,Pyongyang,39.0392193,125.7625241,KP,Asia,
                     South Korea,Seoul,37.566535,126.9779692,KR,Asia,
                     Kosovo,Pristina,42.6629138,21.1655028,XK,Europe,
                     Kuwait,Kuwait City,29.375859,47.9774052,KW,Asia,
                     Kyrgyzstan,Bishkek,42.8746212,74.5697617,KG,Asia,
                     Laos,Vientiane,17.9757058,102.6331035,LA,Asia,
                     Latvia,Riga,56.9496487,24.1051865,LV,Europe,
                     Lebanon,Beirut,33.8937913,35.5017767,LB,Asia,
                     Lesotho,Maseru,-29.3150767,27.4869229,LS,Africa,
                     Liberia,Monrovia,6.3156068,-10.8073698,LR,Africa,
                     Libya,Tripoli,32.8872094,13.1913383,LY,Africa,
                     Liechtenstein,Vaduz,47.1410303,9.5209277,LI,Europe,
                     Lithuania,Vilnius,54.6871555,25.2796514,LT,Europe,
                     Luxembourg,Luxembourg,49.815273,6.129582999999999,LU,Europe,
                     Macedonia,Skopje,41.9981294,21.4254355,MK,Europe,
                     Madagascar,Antananarivo,-18.8791902,47.5079055,MG,Africa,
                     Malawi,Lilongwe,-13.9626121,33.7741195,MW,Africa,
                     Malaysia,Kuala Lumpur,3.139003,101.686855,MY,Asia,
                     Maldives,Male,4.1754959,73.5093474,MV,Asia,
                     Mali,Bamako,12.6392316,-8.0028892,ML,Africa,
                     Malta,Valletta,35.8989085,14.5145528,MT,Europe,
                     Marshall Islands,Majuro,7.066667,171.266667,MH,Australia,
                     Mauritania,Nouakchott,18.0735299,-15.9582372,MR,Africa,
                     Mauritius,Port Louis,-20.1608912,57.5012222,MU,Africa,
                     Mexico,Mexico City,19.4326077,-99.133208,MX,Central America,
                     Federated States of Micronesia,Palikir,6.9147118,158.1610274,FM,Australia,
                     Moldova,Chisinau,47.0104529,28.8638102,MD,Europe,
                     Monaco,Monaco,43.73841760000001,7.424615799999999,MC,Europe,
                     Mongolia,Ulaanbaatar,47.88639879999999,106.9057439,MN,Asia,
                     Montenegro,Podgorica,42.4304196,19.2593642,ME,Europe,
                     Montserrat,Plymouth,16.706523,-62.21573799999999,MS,North America,
                     Morocco,Rabat,33.9715904,-6.8498129,MA,Africa,
                     Mozambique,Maputo,-25.969248,32.5731746,MZ,Africa,
                     Namibia,Windhoek,-22.5608807,17.0657549,NA,Africa,
                     Nepal,Kathmandu,27.7172453,85.3239605,NP,Asia,
                     Netherlands,Amsterdam,52.3675734,4.9041389,NL,Europe,
                     New Caledonia,Noumea,-22.2734912,166.4480887,NC,Australia,
                     New Zealand,Wellington,-41.2923814,174.7787463,NZ,Australia,
                     Nicaragua,Managua,12.1149926,-86.2361744,NI,Central America,
                     Niger,Niamey,13.5115963,2.1253854,NE,Africa,
                     Nigeria,Abuja,9.0764785,7.398574,NG,Africa,
                     Niue,Alofi,-19.0470335,-169.916883,NU,Australia,
                     Norfolk Island,Kingston,-29.0563937,167.959588,NF,Australia,
                     Northern Mariana Islands,Saipan,15.1850483,145.7467259,MP,Australia,
                     Norway,Oslo,59.9138688,10.7522454,NO,Europe,
                     Oman,Muscat,23.5880307,58.3828717,OM,Asia,
                     Pakistan,Islamabad,33.6844202,73.04788479999999,PK,Asia,
                     Palau,Melekeok,7.515028599999999,134.5972518,PW,Australia,
                     Panama,Panama City,8.9823792,-79.51986959999999,PA,Central America,
                     Papua New Guinea,Port Moresby,-9.443800399999999,147.1802671,PG,Australia,
                     Paraguay,Asuncion,-25.2637399,-57.57592599999999,PY,South America,
                     Peru,Lima,-12.0463731,-77.042754,PE,South America,
                     Philippines,Manila,14.5995124,120.9842195,PH,Asia,
                     Pitcairn Islands,Adamstown,-25.0662897,-130.1004636,PN,Australia,
                     Poland,Warsaw,52.2296756,21.0122287,PL,Europe,
                     Portugal,Lisbon,38.7222524,-9.1393366,PT,Europe,
                     Puerto Rico,San Juan,18.4655394,-66.1057355,PR,North America,
                     Qatar,Doha,25.2854473,51.53103979999999,QA,Asia,
                     Romania,Bucharest,44.4267674,26.1025384,RO,Europe,
                     Russia,Moscow,55.755826,37.6172999,RU,Europe,
                     Rwanda,Kigali,-1.9440727,30.0618851,RW,Africa,
                     Saint Barthelemy,Gustavia,17.8964345,-62.85220099999999,BL,North America,
                     Saint Helena,Jamestown,-15.9286343,-5.7151749,SH,Africa,
                     Saint Kitts and Nevis,Basseterre,17.3026058,-62.7176924,KN,North America,
                     Saint Lucia,Castries,14.0101094,-60.98746869999999,LC,North America,
                     Saint Pierre and Miquelon,Saint-Pierre,46.7834549,-56.1712772,PM,Central America,
                     Saint Vincent and the Grenadines,Kingstown,13.1600249,-61.2248157,VC,Central America,
                     Samoa,Apia,-13.8506958,-171.7513551,WS,Australia,
                     San Marino,San Marino,43.9305658,12.44379,SM,Europe,
                     Sao Tome and Principe,Sao Tome,0.18636,6.613080999999999,ST,Africa,
                     Saudi Arabia,Riyadh,24.7135517,46.6752957,SA,Asia,
                     Senegal,Dakar,14.716677,-17.4676861,SN,Africa,
                     Serbia,Belgrade,44.8125449,20.4612299,RS,Europe,
                     Seychelles,Victoria,-4.619143,55.4513149,SC,Africa,
                     Sierra Leone,Freetown,8.4656765,-13.2317225,SL,Africa,
                     Singapore,Singapore,1.352083,103.819836,SG,Asia,
                     Sint Maarten,Philipsburg,18.0295839,-63.04713709999999,SX,North America,
                     Slovakia,Bratislava,48.1485965,17.1077478,SK,Europe,
                     Slovenia,Ljubljana,46.0569465,14.5057515,SI,Europe,
                     Solomon Islands,Honiara,-9.4456381,159.9728999,SB,Australia,
                     Somalia,Mogadishu,2.0469343,45.3181623,SO,Africa,
                     South Africa,Pretoria,-25.7478676,28.2292712,ZA,Africa,
                     South Sudan,Juba,4.859363,31.57125,SS,Africa,
                     Spain,Madrid,40.4167754,-3.7037902,ES,Europe,
                     Sri Lanka,Colombo,6.9270786,79.861243,LK,Asia,
                     Sudan,Khartoum,15.5006544,32.5598994,SD,Africa,
                     Suriname,Paramaribo,5.8520355,-55.2038278,SR,South America,
                     Svalbard,Longyearbyen,78.22317220000001,15.6267229,SJ,Europe,
                     Swaziland,Mbabane,-26.3054482,31.1366715,SZ,Africa,
                     Sweden,Stockholm,59.32932349999999,18.0685808,SE,Europe,
                     Switzerland,Bern,46.9479739,7.4474468,CH,Europe,
                     Syria,Damascus,33.5138073,36.2765279,SY,Asia,
                     Taiwan,Taipei,25.0329694,121.5654177,TW,Asia,
                     Tajikistan,Dushanbe,38.5597722,68.7870384,TJ,Asia,
                     Tanzania,Dar es Salaam,-6.792354,39.2083284,TZ,Africa,
                     Thailand,Bangkok,13.7563309,100.5017651,TH,Asia,
                     Timor-Leste,Dili,-8.5568557,125.5603143,TL,Asia,
                     Togo,Lome,6.1256261,1.2254183,TG,Africa,
                     Tonga,Nuku'alofa,-21.1393418,-175.204947,TO,Australia,
                     Trinidad and Tobago,Port of Spain,10.6603196,-61.5085625,TT,North America,
                     Tunisia,Tunis,36.8064948,10.1815316,TN,Africa,
                     Turkey,Ankara,39.9333635,32.8597419,TR,Europe,
                     Turkmenistan,Ashgabat,37.9600766,58.32606289999999,TM,Asia,
                     Turks and Caicos Islands,Grand Turk,21.4674584,-71.13891009999999,TC,North America,
                     Tuvalu,Funafuti,-8.5211471,179.1961926,TV,Australia,
                     Uganda,Kampala,0.3475964,32.5825197,UG,Africa,
                     Ukraine,Kyiv,50.4501,30.5234,UA,Europe,
                     United Arab Emirates,Abu Dhabi,24.453884,54.3773438,AE,Asia,
                     United Kingdom,London,51.5073509,-0.1277583,GB,Europe,
                     United States,Washington D.C.,38.9071923,-77.0368707,US,Central America,
                     Uruguay,Montevideo,-34.9011127,-56.16453139999999,UY,South America,
                     Uzbekistan,Tashkent,41.2994958,69.2400734,UZ,Asia,
                     Vanuatu,Port-Vila,-17.7332512,168.3273245,VU,Australia,
                     Venezuela,Caracas,10.4805937,-66.90360629999999,VE,South America,
                     Vietnam,Hanoi,21.0277644,105.8341598,VN,Asia,
                     US Virgin Islands,Charlotte Amalie,18.3419004,-64.9307007,VI,North America,
                     Wallis and Futuna,Mata-Utu,-13.2825091,-176.1764475,WF,Australia,
                     Yemen,Sanaa,15.3694451,44.1910066,YE,Asia,
                     Zambia,Lusaka,-15.3875259,28.3228165,ZM,Africa,
                     Zimbabwe,Harare,-17.8216288,31.0492259,ZW,Africa,
                     US Minor Outlying Islands,Washington D.C.,19.2823192,166.647047,UM,Australia,
                     Antarctica,N/A,-75.250973,-0.071389,AQ,Antarctica,
                     Northern Cyprus,North Nicosia,35.1925267,33.3598366,NULL,Europe,
                     Hong Kong,N/A,22.3193039,114.1693611,HK,Asia,
                     Heard Island and McDonald Islands,N/A,-53.08181,73.50415799999999,HM,Antarctica,
                     British Indian Ocean Territory,Diego Garcia,-7.319500499999999,72.42285559999999,IO,Africa,
                     Macau,N/A,22.198745,113.543873,MO,Asia,
`;

export function getCapitalCoordinates(countryCode) {
  const lines = countryData.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',');
    const currentCountryCode = columns[4];
    if (currentCountryCode === countryCode) {
      const latitude = parseFloat(columns[2]);
      const longitude = parseFloat(columns[3]);
      return { latitude, longitude };
    }
  }
  return null; // Country code not found
}

export const countries = {
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

