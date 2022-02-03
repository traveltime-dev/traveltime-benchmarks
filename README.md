# TravelTime Benchmarks

This repository hosts benchmarks for measuring the performance TravelTime endpoints.

Note: this requires a valid API key, which you can obtain at: TODO

# Factors we have limited control over

* Network latency
  * For services such as TimeFilterFast, where processing itself is expected to take 30-100ms depending on the request size, network latency can make up the lion's share of the response time.
  * TODO note about data center locations? 
* What machine is running the benchmark
  * The client machine is responsible for request serialization, which can take as little as 3ms on a production-grade server, but much longer if running on a developer's laptop. 