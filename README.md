# traveltime-benchmarks

### Running K6 Tests with Docker

The simplest way to run these benchmarks is to use docker-compose:

```bash 
docker-compose up
```

### Metrics:

https://k6.io/docs/using-k6/metrics/

### Running locally:

Install [K6](https://k6.io/docs/get-started/installation/)

#### Running json requests:
```bash
k6 run -e APP_ID={APP_ID} -e API_KEY={API_KEY} -e HOST={HOST} {benchmark-file}.js
```

### Running proto benchmarks

1. Export path: ```bash export PATH=$(go env GOPATH)/bin:$PATH ```
2. Install xk6: ```bash go install go.k6.io/xk6/cmd/xk6@latest ```
3. Build: ```bash xk6 build --with github.com/traveltime-dev/xk6-protobuf@latest ```
4. Run: ```bash ./k6 run -e APP_ID={APP_ID} -e API_KEY={API_KEY} -e HOST={HOST} {proto-benchmark-file}.js```
