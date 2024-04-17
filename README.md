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
    -e HOST=api.traveltimeapp.com //optional
    -e COUNTRY=gb //optional
    -e COORDINATES=-8,13 // optional, this will overwrite COUNTRY env var
    -e TRANSPORTATION='driving+ferry' //optional
    -e TRAVEL_TIME=7200 //optional
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e UNIQUE_REQUESTS=2 // optional, percentage of requests that should be unique
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/time-map.js
```

#### time-map-fast

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com //optional
    -e COUNTRY=gb //optional
    -e COORDINATES=-8,13 // optional, this will overwrite COUNTRY env var
    -e TRANSPORTATION='driving+ferry' //optional
    -e TRAVEL_TIME=7200 //optional
    -e LEVEL_OF_DETAILS=2 // optional
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e ARRIVAL_TIME_PERIOD='weekday_morning' //optional
    -e UNIQUE_REQUESTS=2 // optional, percentage of requests that should be unique
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/time-map.js
```

#### time-filter

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com //optional
    -e COUNTRY=gb //optional
    -e COORDINATES=-8,13 // optional, this will overwrite COUNTRY env var
    -e TRANSPORTATION='driving+ferry' //optional
    -e TRAVEL_TIME=7200 //optional
    -e DESTINATIONS=50 // optional
    -e RANGE=600 //optional
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e UNIQUE_REQUESTS=2 // optional, percentage of requests that should be unique
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/time-filter.js
```

#### routes

```bash
docker run
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e HOST=api.traveltimeapp.com //optional
    -e COUNTRY=gb //optional
    -e COORDINATES=-8,13 // optional, this will overwrite COUNTRY env var
    -e TRANSPORTATION='driving+ferry' //optional
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e UNIQUE_REQUESTS=2 // optional, percentage of requests that should be unique
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/routes.js
```

#### time-filter-proto

```bash
docker run 
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e DESTINATIONS=50 // optional
    -e MANY_TO_ONE // optional
    -e HOST=proto.api.traveltimeapp.com // optional
    -e TRANSPORTATION=driving+ferry // optional
    -e COORDINATES=-8,13 // optional, this will overwrite COUNTRY env var
    -e COUNTRY=uk // optional, but mandatory if COORDINATES are specified
    -e RPM=60 // optional
    -e TEST_DURATION=3 //optional, benchmark duration in minutes (not including warmup)
    -e TRAVEL_TIME=7200 // optional
    -e UNIQUE_REQUESTS=2 // optional, percentage of requests that should be unique
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/time-filter-proto.js
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

To see a list of all supported countries, send **map-info** **GET** request ([Postman](https://docs.traveltime.com/api/start/postman-collection#)) to:
- https://api.traveltimeapp.com

### Supported Countries for Proto
```
lv
nl
at
be
de
fr
ie
lt
uk
us_akst
us_cstn
us_csts
us_estn
us_ests
us_hi
us_mst
us_pst
```

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

### Benchmark results example:

```
          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

     execution: local
        script: ./scripts/time-filter.js
        output: -

     scenarios: (100.00%) 1 scenario, 3000 max VUs, 3m15s max duration (incl. graceful stop):
              * mainScenario: 1.00 iterations/s for 3m0s (maxVUs: 100-3000, startTime: 5s, gracefulStop: 10s)

     ✓ status is 200
     ✓ response body is not empty

     █ setup

     checks...............: 100.00% ✓ 360    ✗ 0    
     data_received........: 1.1 MB  6.2 kB/s
     data_sent............: 1.0 MB  5.5 kB/s
   ✓ http_req_duration....: avg=340.49ms min=239.51ms max=619.23ms p(90)=436.24ms p(95)=473.31ms
   ✓ http_req_receiving...: avg=622.6µs  min=50.53µs  max=2.63ms   p(90)=1.69ms   p(95)=1.94ms  
   ✓ http_req_sending.....: avg=293.7µs  min=101.74µs max=798.2µs  p(90)=490.6µs  p(95)=527.14µs

running (3m05.0s), 0000/0100 VUs, 180 complete and 0 interrupted iterations
mainScenario ✓ [======================================] 0000/0100 VUs  3m0s  1.00 iters/s
```

