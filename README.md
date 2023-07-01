# traveltime-benchmarks

This repository hosts benchmarks for measuring the performance of the TravelTime endpoints. Find out more at https://traveltime.com/

# Gain access

First, obtain an App ID and an API key from https://docs.traveltime.com/api/overview/getting-keys

You will need to email sales@traveltime.com or book a demo at https://traveltime.com/book-demo to gain access to TimeFilterFast(Proto).

### Running K6 Tests with Docker

The simplest way to run these benchmarks is to use docker:

```bash 
docker run 
    -e APP_ID={APP_ID}
    -e API_KEY={API_KEY}
    -e DESTINATIONS="1000,5000,10000,25000,100000" // optional
    -e HOST=proto.api.traveltimeapp.com // optional
    -e TRANSPORTATION=driving+ferry // optional
    -e COUNTRY=uk // optional
    -e TRAVEL_TIME=7200 // optional
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/{benchmark-file}.js
```

### Metrics:

All used metrics are described here:
https://k6.io/docs/using-k6/metrics/

* http_req_duration - Total time for the request (how long did the remote server take to process the request and respond, without the initial DNS lookup/connection times)
* http_req_sending - Time spent sending data to the remote host
* http_req_receiving - Time spent receiving response data from the remote host

### Supported countries, transport modes
Countries:
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
Modes:
```
pt
driving+ferry
cycling+ferry
walking+ferry
```

### Running locally:

Install [K6](https://k6.io/docs/get-started/installation/)

#### Running json requests:
```bash
k6 run -e APP_ID={APP_ID} -e API_KEY={API_KEY} -e HOST={HOST} scripts/{benchmark-file}.js
```

### Running proto benchmarks

1. Export path: ```bash export PATH=$(go env GOPATH)/bin:$PATH ```
2. Install xk6: ```bash go install go.k6.io/xk6/cmd/xk6@latest ```
3. Build: ```bash xk6 build --with github.com/traveltime-dev/xk6-protobuf@latest ```
4. Run: ```bash ./k6 run -e APP_ID={APP_ID} -e API_KEY={API_KEY} -e HOST={HOST} scripts/{proto-benchmark-file}.js```

### Benchmark results:

```
t2.medium
2 vCPUs, 2.3 GHz, 4 GiB RAM, Low to Moderate network speed

  checks....................................: 100.00% ✓ 1628   ✗ 0  
  data_received.............................: 44 MB   136 kB/s
  data_sent.................................: 82 MB   257 kB/s
✓ http_req_duration(10000 destinations).....: avg=172.66ms min=138.54ms max=256.05ms p(90)=198.56ms p(95)=210.49ms
✓ http_req_duration(100000 destinations)....: avg=234.59ms min=203.12ms max=300.75ms p(90)=257.02ms p(95)=279.58ms
✓ http_req_duration(25000 destinations).....: avg=194.7ms  min=161.1ms  max=288.05ms p(90)=232.02ms p(95)=242.05ms
✓ http_req_duration(5000 destinations)......: avg=170.71ms min=129.8ms  max=243.75ms p(90)=195.18ms p(95)=207.66ms
✓ http_req_receiving(10000 destinations)....: avg=2.72ms   min=98.06µs  max=32.23ms  p(90)=5.94ms   p(95)=19.12ms 
✓ http_req_receiving(100000 destinations)...: avg=7.34ms   min=424.64µs max=51.96ms  p(90)=14.41ms  p(95)=24.98ms 
✓ http_req_receiving(25000 destinations)....: avg=8.17ms   min=152.56µs max=80.11ms  p(90)=23.09ms  p(95)=46.15ms 
✓ http_req_receiving(5000 destinations).....: avg=3.08ms   min=75.76µs  max=70.64ms  p(90)=13.7ms   p(95)=20.17ms 
✓ http_req_sending(10000 destinations)......: avg=1.19ms   min=144.5µs  max=23.15ms  p(90)=3.51ms   p(95)=6.38ms  
✓ http_req_sending(100000 destinations).....: avg=45.98ms  min=42.91ms  max=63.48ms  p(90)=54.15ms  p(95)=57.37ms 
✓ http_req_sending(25000 destinations)......: avg=15.25ms  min=11.19ms  max=57.39ms  p(90)=21.06ms  p(95)=22.85ms 
✓ http_req_sending(5000 destinations).......: avg=702.06µs min=163.23µs max=27.65ms  p(90)=433.48µs p(95)=4.14ms  

m6i.xlarge
4 vCPUs, 3.5 GHz, 16 GiB RAM, Up to 12.5 Gigabit network speed

  checks....................................: 100.00% ✓ 1756   ✗ 0  
  data_received.............................: 51 MB   157 kB/s
  data_sent.................................: 96 MB   298 kB/s
✓ http_req_duration(10000 destinations).....: avg=167.28ms min=136.7ms  max=286.89ms p(90)=179.34ms p(95)=187.72ms
✓ http_req_duration(100000 destinations)....: avg=224.92ms min=200.23ms max=336.37ms p(90)=253.82ms p(95)=271.77ms
✓ http_req_duration(25000 destinations).....: avg=191.41ms min=152.33ms max=267.06ms p(90)=217.06ms p(95)=239.51ms
✓ http_req_duration(5000 destinations)......: avg=167.3ms  min=137.71ms max=376.6ms  p(90)=180.37ms p(95)=186.33ms
✓ http_req_receiving(10000 destinations)....: avg=1.29ms   min=117.9µs  max=20.42ms  p(90)=1.95ms   p(95)=3.71ms  
✓ http_req_receiving(100000 destinations)...: avg=6.58ms   min=3.95ms   max=32.25ms  p(90)=9.03ms   p(95)=14.04ms 
✓ http_req_receiving(25000 destinations)....: avg=7.62ms   min=137.34µs max=76.98ms  p(90)=10.53ms  p(95)=44.92ms 
✓ http_req_receiving(5000 destinations).....: avg=227.48µs min=54.42µs  max=25.04ms  p(90)=128.9µs  p(95)=554.96µs
✓ http_req_sending(10000 destinations)......: avg=188.3µs  min=118.36µs max=3.73ms   p(90)=203.7µs  p(95)=227.62µs
✓ http_req_sending(100000 destinations).....: avg=43.76ms  min=42.45ms  max=48.43ms  p(90)=45.24ms  p(95)=47.91ms 
✓ http_req_sending(25000 destinations)......: avg=11.92ms  min=11.39ms  max=24.34ms  p(90)=12.12ms  p(95)=12.51ms 
✓ http_req_sending(5000 destinations).......: avg=161.55µs min=92.66µs  max=548.16µs p(90)=196.87µs p(95)=223.44µs
```

