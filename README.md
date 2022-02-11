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

## Optional environment variables

```
DESTINATION_COUNTS="10000,20000,40000,100000"  # Destination counts that may better reflect your use case than the defaults. A comma-separated list of positive integers. 
JMH_JVM_ARGS="-Xms2G,-Xmx4G"                   # JVM arguments to be passed to JMH. A comma-separated list. 
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

# Benchmark results

Benchmarks were run on AWS EC2 instances in eu-west.

```
c5n.2xlarge
8 vCPUs, 3.4 GHz, 21 GiB RAM, Up to 25 Gigabit network speed
Benchmark                             (destinationCount)  Mode  Cnt    Score    Error  Units
TimeFilterFastBenchmark.checkLatency               10000  avgt    5   47.543 ±  7.012  ms/op
TimeFilterFastBenchmark.checkLatency               20000  avgt    5   44.701 ±  5.339  ms/op
TimeFilterFastBenchmark.checkLatency               40000  avgt    5   45.359 ±  3.424  ms/op
TimeFilterFastBenchmark.checkLatency              100000  avgt    5   67.062 ±  4.673  ms/op
TimeFilterFastBenchmark.serialize                  10000  avgt    5    0.636 ±  0.003  ms/op
TimeFilterFastBenchmark.serialize                  20000  avgt    5    1.272 ±  0.006  ms/op
TimeFilterFastBenchmark.serialize                  40000  avgt    5    2.601 ±  0.006  ms/op
TimeFilterFastBenchmark.serialize                 100000  avgt    5    6.734 ±  0.251  ms/op
TimeFilterFastBenchmark.timeRequests               10000  avgt    5   87.908 ± 10.412  ms/op
TimeFilterFastBenchmark.timeRequests               20000  avgt    5   83.851 ± 10.130  ms/op
TimeFilterFastBenchmark.timeRequests               40000  avgt    5   87.682 ±  8.819  ms/op
TimeFilterFastBenchmark.timeRequests              100000  avgt    5  115.754 ± 16.069  ms/op
--------------------------------------------------------------------------------------------

t2.medium
2 vCPUs, 2.3 GHz, 4 GiB RAM, Low to Moderate network speed
Benchmark                             (destinationCount)  Mode  Cnt    Score    Error  Units
TimeFilterFastBenchmark.checkLatency               10000  avgt    5   50.076 ± 10.579  ms/op
TimeFilterFastBenchmark.checkLatency               20000  avgt    5   47.603 ±  5.577  ms/op
TimeFilterFastBenchmark.checkLatency               40000  avgt    5   48.313 ±  3.549  ms/op
TimeFilterFastBenchmark.checkLatency              100000  avgt    5   72.175 ±  3.862  ms/op
TimeFilterFastBenchmark.serialize                  10000  avgt    5    0.790 ±  0.016  ms/op
TimeFilterFastBenchmark.serialize                  20000  avgt    5    1.552 ±  0.012  ms/op
TimeFilterFastBenchmark.serialize                  40000  avgt    5    3.148 ±  0.109  ms/op
TimeFilterFastBenchmark.serialize                 100000  avgt    5   15.831 ±  8.079  ms/op
TimeFilterFastBenchmark.timeRequests               10000  avgt    5   90.907 ± 10.932  ms/op
TimeFilterFastBenchmark.timeRequests               20000  avgt    5   86.973 ±  5.859  ms/op
TimeFilterFastBenchmark.timeRequests               40000  avgt    5   89.497 ±  4.431  ms/op
TimeFilterFastBenchmark.timeRequests              100000  avgt    5  123.611 ± 13.583  ms/op
```

## Benchmarking with much larger requests

We have also run benchmarks with larger than normal requests, up to 700000 destinations

These benchmarks showcase the importance of a good connection and enough processing power on the client machine. 
While the t2.medium does well with up to 100k locations, for larger requests a difference can be felt both due to 
longer serialization times, and due to higher latency caused by differing network performance. 

```
t2.medium
2 vCPUs, 2.3 GHz, 4 GiB RAM, Low to Moderate network speed
Benchmark                             (destinationCount)  Mode  Cnt    Score     Error  Units
TimeFilterFastBenchmark.checkLatency              100000  avgt    5   72.738 ±   7.532  ms/op
TimeFilterFastBenchmark.checkLatency              400000  avgt    5  190.184 ±  67.759  ms/op
TimeFilterFastBenchmark.checkLatency              700000  avgt    5  343.568 ± 106.900  ms/op
TimeFilterFastBenchmark.serialize                 100000  avgt    5   16.889 ±   4.358  ms/op
TimeFilterFastBenchmark.serialize                 400000  avgt    5   90.387 ±  21.120  ms/op
TimeFilterFastBenchmark.serialize                 700000  avgt    5  154.947 ±  79.560  ms/op
TimeFilterFastBenchmark.timeRequests              100000  avgt    5  124.502 ±   9.961  ms/op
TimeFilterFastBenchmark.timeRequests              400000  avgt    5  327.972 ± 111.286  ms/op
TimeFilterFastBenchmark.timeRequests              700000  avgt    5  601.618 ±  66.526  ms/op
---------------------------------------------------------------------------------------------

m6i.xlarge
4 vCPUs, 3.5 GHz, 16 GiB RAM, Up to 12.5 Gigabit network speed
Benchmark                             (destinationCount)  Mode  Cnt    Score    Error  Units
TimeFilterFastBenchmark.checkLatency              100000  avgt    5   67.771 ±  9.204  ms/op
TimeFilterFastBenchmark.checkLatency              400000  avgt    5   99.550 ±  4.517  ms/op
TimeFilterFastBenchmark.checkLatency              700000  avgt    5  137.907 ± 81.035  ms/op
TimeFilterFastBenchmark.serialize                 100000  avgt    5    6.844 ±  0.150  ms/op
TimeFilterFastBenchmark.serialize                 400000  avgt    5   47.294 ± 47.925  ms/op
TimeFilterFastBenchmark.serialize                 700000  avgt    5   86.528 ± 47.754  ms/op
TimeFilterFastBenchmark.timeRequests              100000  avgt    5  118.018 ±  5.581  ms/op
TimeFilterFastBenchmark.timeRequests              400000  avgt    5  192.824 ± 16.830  ms/op
TimeFilterFastBenchmark.timeRequests              700000  avgt    5  302.783 ± 77.979  ms/op
--------------------------------------------------------------------------------------------

c5n.2xlarge
8 vCPUs, 3.4 GHz, 21 GiB RAM, Up to 25 Gigabit network speed
Benchmark                             (destinationCount)  Mode  Cnt    Score     Error  Units
TimeFilterFastBenchmark.checkLatency              100000  avgt    5   67.394 ±   5.074  ms/op
TimeFilterFastBenchmark.checkLatency              400000  avgt    5  108.782 ± 116.869  ms/op
TimeFilterFastBenchmark.checkLatency              700000  avgt    5  136.060 ±  14.760  ms/op
TimeFilterFastBenchmark.serialize                 100000  avgt    5    6.741 ±   0.278  ms/op
TimeFilterFastBenchmark.serialize                 400000  avgt    5   47.969 ±  52.474  ms/op
TimeFilterFastBenchmark.serialize                 700000  avgt    5   75.530 ±  33.004  ms/op
TimeFilterFastBenchmark.timeRequests              100000  avgt    5  116.218 ±   7.508  ms/op
TimeFilterFastBenchmark.timeRequests              400000  avgt    5  183.861 ±  21.956  ms/op
TimeFilterFastBenchmark.timeRequests              700000  avgt    5  274.720 ±  86.813  ms/op
```

# Tips

## Testing different scenarios

Different benchmarking profiles can be defined in `com.traveltime.benchmarks.TimeFilterFastBenchmark`. 

A new docker image with modified benchmarks can be built by running `./build.sh`, which you can then run as described in the `Usage` section above.

## Factors we have limited control over

* Network latency
  * For services such as TimeFilterFast, where processing itself is expected to take 30-100ms depending on the request size, network latency can make up the lion's share of the response time.
* What machine is running the benchmark
  * The client machine is responsible for request serialization, which can take as little as 1ms on a production-grade server, but much longer if running on a developer's laptop. 