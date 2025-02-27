# traveltime-benchmarks

This repository hosts benchmarks for measuring the performance of the TravelTime endpoints. Find out more at https://traveltime.com/

# Gain access

First, obtain an App ID and an API key from https://docs.traveltime.com/api/overview/getting-keys

You will need to email sales@traveltime.com or book a demo at https://traveltime.com/book-demo to gain access to TimeFilterFast(Proto).

### Running K6 Tests with Docker

The simplest way to run these benchmarks is to use docker:

#### time-map

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com // OR -e FULL_URL='http://api-dev.traveltimeapp.com/v4/time-map' ; if provided fully overrides HOST/endpoint, mutually exclusive with HOST
    -e LOCATION='GB/London' //optional
    -e TRANSPORTATION='driving+ferry' //optional
    -e TRAVEL_TIME=7200 //optional
    -e DATE_TIME=2024-10-14T07:10:45.535Z //optional, departure/arrival time in ISO 8601 format. Default - current time
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e UNIQUE_REQUESTS=100 //optional int, the number of unique requests that should be generated
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/time-map.js
```

#### time-map-fast

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com // OR -e FULL_URL='http://api-dev.traveltimeapp.com/v4/time-map-fast' ; if provided fully overrides HOST/endpoint, mutually exclusive with HOST
    -e LOCATION='GB/London' //optional
    -e TRANSPORTATION='driving+ferry' //optional
    -e TRAVEL_TIME=7200 //optional
    -e LEVEL_OF_DETAILS=2 // optional
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e ARRIVAL_TIME_PERIOD='weekday_morning' //optional
    -e UNIQUE_REQUESTS=100 //optional int, the number of unique requests that should be generated
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/time-map-fast.js
```

#### distance-map

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com // OR -e FULL_URL='http://api-dev.traveltimeapp.com/v4/distance-map' ; if provided fully overrides HOST/endpoint, mutually exclusive with HOST
    -e LOCATION='GB/London' //optional
    -e TRANSPORTATION='driving+ferry' //optional
    -e TRAVEL_DISTANCE=2000 //optional
    -e DATE_TIME=2024-10-14T07:10:45.535Z //optional, departure/arrival time in ISO 8601 format. Default - current time
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e UNIQUE_REQUESTS=100 //optional int, the number of unique requests that should be generated
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/distance-map.js
```

#### time-filter

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com // OR -e FULL_URL='http://api-dev.traveltimeapp.com/v4/time-filter' ; if provided fully overrides HOST/endpoint, mutually exclusive with HOST
    -e LOCATION='GB/London' //optional
    -e TRANSPORTATION='driving+ferry' //optional
    -e TRAVEL_TIME=7200 //optional
    -e DATE_TIME=2024-10-14T07:10:45.535Z //optional, departure/arrival time in ISO 8601 format. Default - current time
    -e DESTINATIONS=50 // optional
    -e RANGE=600 //optional
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e UNIQUE_REQUESTS=100 //optional int, the number of unique requests that should be generated
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/time-filter.js
```

#### time-filter-fast

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com // OR -e FULL_URL='http://api-dev.traveltimeapp.com/v4/time-filter/fast' ; if provided fully overrides HOST/endpoint, mutually exclusive with HOST
    -e LOCATION='GB/London' //optional
    -e TRANSPORTATION='driving+ferry' //optional
    -e TRAVEL_TIME=7200 //optional
    -e ARRIVAL_TIME_PERIOD='weekday_morning' //optional
    -e DESTINATIONS=50 // optional
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e UNIQUE_REQUESTS=100 //optional int, the number of unique requests that should be generated
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/time-filter-fast.js
```

#### routes

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com // OR -e FULL_URL='http://api-dev.traveltimeapp.com/v4/routes' ; if provided fully overrides HOST/endpoint, mutually exclusive with HOST
    -e LOCATION='GB/London' //optional
    -e TRANSPORTATION='driving+ferry' //optional
    -e DATE_TIME=2024-10-14T07:10:45.535Z //optional, departure/arrival time in ISO 8601 format. Default - current time
    -e RPM=60 // optional
    -e USE_SHARC = true // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e UNIQUE_REQUESTS=100 //optional int, the number of unique requests that should be generated
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/routes.js
```

#### time-filter-proto

```bash
docker run 
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e DESTINATIONS=50 // optional
    -e MANY_TO_ONE // optional
    -e HOST=proto.api.traveltimeapp.com 
    -e TRANSPORTATION=driving+ferry // optional
    -e LOCATION='UK/London' // optional
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e TRAVEL_TIME=7200 // optional
    -e UNIQUE_REQUESTS=100 //optional int, the number of unique requests that should be generated
    -e DISABLE_DECODING="true" // optional flag, skips proto response decoding if set to "true"
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/time-filter-proto.js
```

#### geocoding-search

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com // OR -e FULL_URL='http://api-dev.traveltimeapp.com/v4/geocoding/search' ; if provided fully overrides HOST/endpoint, mutually exclusive with HOST
    -e QUERY='Parliament square' //optional
    -e WITHIN_COUNTRY='gb' //optional, only return the results that are within the specified country
    -e LIMIT=50 //optional, limits amount of results returned to specified number (1 to 50)
    -e FORCE_ADD_POSTCODE='true' //optional, forcefully adds postcode to search response. Only works if Switzerland as CH is specified as the value of the within.country parameter.
    -e FORMAT_NAME='true' //optional, format the name field to a well formatted address
    -e FORMAT_EXCLUDE_COUNTRY='true' //optional, exclude the country from the formatted name field (used only if format.name is equal true).
    -e BOUNDS='54.16243,4.04297,71.18316,31.81641' //optional, limit the results to a bounding box
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/geocoding-search.js
```

#### geocoding-reverse

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com // OR -e FULL_URL='http://api-dev.traveltimeapp.com/v4/geocoding/reverse' ; if provided fully overrides HOST/endpoint, mutually exclusive with HOST
    -e LAT='51.4952113' //optional, latitude
    -e LNG='-0.183122' //optional, longitude
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/geocoding-reverse.js
```

### Running K6 Tests Locally

Install [K6](https://k6.io/docs/get-started/installation/)

```bash 
k6 run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    ...other ENV (-e) vars...
    scripts/{benchmark-file}.js
```

### Metrics:

All used metrics are described here:
https://k6.io/docs/using-k6/metrics/

* http_req_duration - Total time for the request (how long did the remote server take to process the request and respond, without the initial DNS lookup/connection times)
* http_req_sending - Time spent sending data to the remote host
* http_req_receiving - Time spent receiving response data from the remote host

### Supported Countries

- Supported locations for normal requests are listed in the `locations/locations_data.csv` file.
- Supported locations for proto requests are listed in the `locations/proto_locations_data.csv` file.

If you want to add a new location, simply append the csv files. 

**NOTE 1:** When adding a new proto location, please specify the ISO2 country code in the beginning, like it's done everywhere else. It's neccessary for the request. Example: 'GB/London'.

**NOTE 2:** Proto requests support a much more limited amount of countries.

To see a list of all supported countries, send [map-info](https://docs.traveltime.com/api/reference/map-info) request ([Postman](https://docs.traveltime.com/api/start/postman-collection#)) to https://api.traveltimeapp.com

### Transport modes
#### time-map, time-map-fast, time-filter, routes
```
pt
cycling
driving
driving+train
public_transport
walking
coach
bus
train
ferry
driving+ferry
cycling+ferry
```

#### time-filter-proto
```
pt
driving+ferry
cycling+ferry
walking+ferry
```

### Running proto benchmarks locally

1. Install xk6: `go install go.k6.io/xk6/cmd/xk6@latest `
2. Export path: `export PATH=$(go env GOPATH)/bin:$PATH`
3. Build: `xk6 build --with github.com/traveltime-dev/xk6-protobuf@latest  --with github.com/grafana/xk6-output-prometheus-remote@latest`
4. Run: ` ./k6 run -e APP_ID={APP_ID} -e API_KEY={API_KEY} -e HOST={HOST} scripts/{proto-benchmark-file}.js`

### Benchmark results:

---

#### t2.medium (2 vCPUs, 2.3 GHz, 4 GiB RAM, Low to Moderate network speed)

#### 5000 destinations

```
  checks.................: 100.00% ✓ 1628   ✗ 0  
  data_received..........: 44 MB   136 kB/s
  data_sent..............: 82 MB   257 kB/s
✓ http_req_duration......: avg=170.71ms min=129.8ms  max=243.75ms p(90)=195.18ms p(95)=207.66ms
✓ http_req_receiving.....: avg=3.08ms   min=75.76µs  max=70.64ms  p(95)=20.17ms 
✓ http_req_sending.......: avg=702.06µs min=163.23µs max=27.65ms  p(90)=433.48µs p(95)=4.14ms  
```

#### 10000 destinations
```
  checks................: 100.00% ✓ 1628   ✗ 0  
  data_received.........: 44 MB   136 kB/s
  data_sent.............: 82 MB   257 kB/s
✓ http_req_duration.....: avg=172.66ms min=138.54ms max=256.05ms p(90)=198.56ms p(95)=210.49ms
✓ http_req_receiving....: avg=2.72ms   min=98.06µs  max=32.23ms  p(90)=5.94ms   p(95)=19.12ms 
✓ http_req_sending......: avg=1.19ms   min=144.5µs  max=23.15ms  p(90)=3.51ms   p(95)=6.38ms  
```

#### 25000 destinations

```
  checks................: 100.00% ✓ 1628   ✗ 0  
  data_received.........: 44 MB   136 kB/s
  data_sent.............: 82 MB   257 kB/s
✓ http_req_duration.....: avg=194.7ms  min=161.1ms  max=288.05ms p(90)=232.02ms p(95)=242.05ms
✓ http_req_receiving....: avg=8.17ms   min=152.56µs max=80.11ms  p(90)=23.09ms  p(95)=46.15ms 
✓ http_req_sending......: avg=15.25ms  min=11.19ms  max=57.39ms  p(90)=21.06ms  p(95)=22.85ms 
```

#### 100000 destinations

```
  checks...............: 100.00% ✓ 1628   ✗ 0  
  data_received........: 44 MB   136 kB/s
  data_sent............: 82 MB   257 kB/s
✓ http_req_duration....: avg=234.59ms min=203.12ms max=300.75ms p(90)=257.02ms p(95)=279.58ms
✓ http_req_receiving...: avg=7.34ms   min=424.64µs max=51.96ms  p(90)=14.41ms  p(95)=24.98ms 
✓ http_req_sending.....: avg=45.98ms  min=42.91ms  max=63.48ms  p(90)=54.15ms  p(95)=57.37ms 
```

---

#### m6i.xlarge (4 vCPUs, 3.5 GHz, 16 GiB RAM, Up to 12.5 Gigabit network speed)

#### 5000 destinations

```
  checks.................: 100.00% ✓ 1756   ✗ 0  
  data_received..........: 51 MB   157 kB/s
  data_sent..............: 96 MB   298 kB/s
✓ http_req_duration......: avg=167.3ms  min=137.71ms max=376.6ms  p(90)=180.37ms p(95)=186.33ms
✓ http_req_receiving.....: avg=227.48µs min=54.42µs  max=25.04ms  p(90)=128.9µs  p(95)=554.96µs
✓ http_req_sending.......: avg=161.55µs min=92.66µs  max=548.16µs p(90)=196.87µs p(95)=223.44µs
```

#### 10000 destinations

```

  checks................: 100.00% ✓ 1756   ✗ 0  
  data_received.........: 51 MB   157 kB/s
  data_sent.............: 96 MB   298 kB/s
✓ http_req_duration.....: avg=167.28ms min=136.7ms  max=286.89ms p(90)=179.34ms p(95)=187.72ms
✓ http_req_receiving....: avg=1.29ms   min=117.9µs  max=20.42ms  p(90)=1.95ms   p(95)=3.71ms  
✓ http_req_sending......: avg=188.3µs  min=118.36µs max=3.73ms   p(90)=203.7µs  p(95)=227.62µs
```

#### 25000 destinations

```
  checks................: 100.00% ✓ 1756   ✗ 0  
  data_received.........: 51 MB   157 kB/s
  data_sent.............: 96 MB   298 kB/s
✓ http_req_duration.....: avg=191.41ms min=152.33ms max=267.06ms p(90)=217.06ms p(95)=239.51ms
✓ http_req_receiving....: avg=7.62ms   min=137.34µs max=76.98ms  p(90)=10.53ms  p(95)=44.92ms 
✓ http_req_sending......: avg=11.92ms  min=11.39ms  max=24.34ms  p(90)=12.12ms  p(95)=12.51ms 
```

#### 100000 destinations

```
  checks...............: 100.00% ✓ 1756   ✗ 0  
  data_received........: 51 MB   157 kB/s
  data_sent............: 96 MB   298 kB/s
✓ http_req_duration....: avg=224.92ms min=200.23ms max=336.37ms p(90)=253.82ms p(95)=271.77ms
✓ http_req_receiving...: avg=6.58ms   min=3.95ms   max=32.25ms  p(90)=9.03ms   p(95)=14.04ms 
✓ http_req_sending.....: avg=43.76ms  min=42.45ms  max=48.43ms  p(90)=45.24ms  p(95)=47.91ms 
```

---
