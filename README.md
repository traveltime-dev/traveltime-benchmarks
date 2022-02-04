# TravelTime Benchmarks

This repository hosts benchmarks for measuring the performance of the TravelTime TimeFilterFast endpoint. Find out more at https://traveltime.com/

# Gain access

First, obtain an App ID and an API key from https://docs.traveltime.com/api/overview/getting-keys 

You will need to email sales@traveltime.com or book a demo at https://traveltime.com/book-demo to gain access to TimeFilterFast.  

# Usage

With docker:

```
docker run \
-e APP_ID={{YOUR_APP_ID}} \
-e API_KEY={{YOUR_API_KEY}} \
-e API_URI=https://proto.api.traveltimeapp.com/api/v2/ \
-e COUNTRY=UNITED_KINGDOM \
-e TRANSPORT_MODE=DRIVING_FERRY \
-e TRAVEL_TIME=7200 \
-ti igeolise/traveltime-benchmarks:latest
```

Or with maven, make sure JAVA_HOME points to JDK11:

```
APP_ID={{YOUR_APP_ID}} \
API_KEY={{YOUR_API_KEY}} \
API_URI=https://proto.api.traveltimeapp.com/api/v2/ \
COUNTRY=UNITED_KINGDOM \
TRANSPORT_MODE=DRIVING_FERRY \
TRAVEL_TIME=7200 \
mvn clean install exec:exec
```

## Supported countries, transport modes, and travel times
Countries:
```
UNITED_KINGDOM 
NETHERLANDS
AUSTRIA
BELGIUM
GERMANY
FRANCE
IRELAND
LITHUANIA
```
Modes:
```
DRIVING_FERRY
PUBLIC_TRANSPORT
WALKING_FERRY
CYCLING_FERRY
```

Maximum travel time is currently 7200 (2 hours).

# Tips

## Testing different scenarios

Different benchmarking profiles can be defined in `com.traveltime.benchmarks.TimeFilterFastBenchmark`, different destination counts can be found in `com.traveltime.benchmarks.TimeFilterFastBenchmark.ValidRequest.destinationCount`. 

A new docker image with modified benchmarks can be built by running `./build.sh`, which you can then run as described in the `Usage` section above.

## Factors we have limited control over

* Network latency
  * For services such as TimeFilterFast, where processing itself is expected to take 30-100ms depending on the request size, network latency can make up the lion's share of the response time.
* What machine is running the benchmark
  * The client machine is responsible for request serialization, which can take as little as 1ms on a production-grade server, but much longer if running on a developer's laptop. 