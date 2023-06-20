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
    -e DESTINATIONS={DESTINATIONS} // optional
    -e HOST={HOST} // optional
    -e TRANSPORTATION={TRANSPORTATION} // optional
    -e COUNTRY={COUNTRY} // optional
    -e TRAVEL_TIME={TRAVEL_TIME} // optional
    -ti igeolise/traveltime-k6-benchmarks:latest k6 run scripts/{benchmark-file}.js
```

### Metrics:

All used metrics are described here:
https://k6.io/docs/using-k6/metrics/

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
