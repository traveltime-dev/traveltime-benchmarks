# TravelTime Benchmarks

This repository hosts benchmarks for measuring the performance TravelTime endpoints.

# Usage

First, obtain an App ID and an API key from: TODO.

`
APP_ID={{YOUR_APP_ID}} API_KEY={{YOUR_API_KEY}} mvn clean install exec:exec
`

Or with docker:

`docker run -e APP_ID={{YOUR_APP_ID}} API_KEY={{YOUR_API_KEY}} -ti igeolise/traveltime-benchmarks:latest`

## Supported countries and transport modes:
Countries:
`nl at be de fr ie lt uk`
Modes:
`pt walking+ferry cycling+ferry driving+ferry`
# Factors we have limited control over

* Network latency
  * For services such as TimeFilterFast, where processing itself is expected to take 30-100ms depending on the request size, network latency can make up the lion's share of the response time.
* What machine is running the benchmark
  * The client machine is responsible for request serialization, which can take as little as 1ms on a production-grade server, but much longer if running on a developer's laptop. 