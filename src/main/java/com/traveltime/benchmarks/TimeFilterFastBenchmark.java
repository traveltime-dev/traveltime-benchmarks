package com.traveltime.benchmarks;

import com.traveltime.sdk.TravelTimeSDK;
import com.traveltime.sdk.dto.common.Coordinates;
import com.traveltime.sdk.dto.requests.TimeFilterFastProtoRequest;
import com.traveltime.sdk.dto.requests.proto.Country;
import com.traveltime.sdk.dto.requests.proto.OneToMany;
import com.traveltime.sdk.dto.requests.proto.Transportation;
import lombok.val;
import okhttp3.HttpUrl;
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.infra.Blackhole;
import org.openjdk.jmh.runner.Runner;
import org.openjdk.jmh.runner.RunnerException;
import org.openjdk.jmh.runner.options.Options;
import org.openjdk.jmh.runner.options.OptionsBuilder;

import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.Random;

import static com.traveltime.benchmarks.BenchmarkSetup.*;

public class TimeFilterFastBenchmark {

    public static void main(String[] args) throws RunnerException {
        new BenchmarkSetup(); // Instantiating this validates whether all environment variables have been set
        UriValidation.validateBenchmarkSetup();
        Options options = new OptionsBuilder()
                .include(TimeFilterFastBenchmark.class.getSimpleName())
                .forks(1)
                .jvmArgs(jmhJvmArgs)
                .warmupForks(1)
                .measurementIterations(10)
                .mode(Mode.AverageTime)
                .timeUnit(TimeUnit.MILLISECONDS)
                .param("destinationCount", destinationCounts)
                .build();
        new Runner(options).run();
    }

    /**
     * Initializes and closes an instance of the Sdk.
     */
    @State(Scope.Group)
    public static class Sdk {
        public TravelTimeSDK sdk;

        @Setup(Level.Iteration)
        public void setup() {
            sdk = TravelTimeSDK.builder().baseProtoUri(apiUri).credentials(credentials).build();
        }

        @TearDown(Level.Iteration)
        public void tearDown() {
            sdk.close();
        }
    }

    /**
     * Generates requests for timing the performance of a TimeFilterFast endpoint
     */
    @State(Scope.Benchmark)
    public static class ValidRequests {
        @Param({"0"}) // Always overridden by .param("destinationCount", destinationCounts) in the options builder
        public int destinationCount;

        public TimeFilterFastProtoRequest[] requests;

        private static int invocationId = 0;

        @Setup(Level.Invocation)
        public void setUpInvocation() {
            val random = new Random(seed + invocationId);
            invocationId += 1;

            requests = new TimeFilterFastProtoRequest[requestsPerJmhInvocation];

            for (int i = 0; i < requestsPerJmhInvocation; i += 1) {
                val origin = Utils.randomizeCoordinates(random, countryCapitalCoordinates.get(country));

                OneToMany oneToMany = new OneToMany(
                        origin,
                        Utils.coordinatesAroundOrigin(random, origin, destinationCount),
                        mode,
                        travelTime,
                        country
                );
                requests[i] = new TimeFilterFastProtoRequest(oneToMany, "cor#" + destinationCount);
            }
        }
    }

    @State(Scope.Benchmark)
    public static class InvalidRequests {
        @Param({"0"}) // Always overridden by .param("destinationCount", destinationCounts) in the options builder
        public int destinationCount;

        public TimeFilterFastProtoRequest[] requests;

        @Setup(Level.Invocation)
        public void setUpInvocation() {
            requests = new TimeFilterFastProtoRequest[requestsPerJmhInvocation];

            for (int i = 0; i < requestsPerJmhInvocation; i += 1) {
                val destinations = Stream
                        .generate(() -> new Coordinates(0.01, 0.01))
                        .limit(destinationCount)
                        .collect(Collectors.toList());

                OneToMany invalidOneToMany = new OneToMany(
                        new Coordinates(0.0, 0.0),
                        destinations,
                        Transportation.DRIVING_FERRY,
                        1,
                        Country.UNITED_KINGDOM
                );
                requests[i] = new TimeFilterFastProtoRequest(invalidOneToMany, "inv#" + destinationCount);
            }
        }
    }


    /**
     * Serializes and sends a request to the {@link BenchmarkSetup#apiUri} endpoint
     */
    @Benchmark
    @Group("timeRequests")
    public void sendProto(Sdk sdkSetup, ValidRequests requestSetup, Blackhole blackhole) {
        if (useBatch) {
            for (int i = 0; i < requestsPerJmhInvocation; i += 1) {
                blackhole.consume(sdkSetup.sdk.sendProtoBatched(requestSetup.requests[i]));
            }
        } else {
            for (int i = 0; i < requestsPerJmhInvocation; i += 1) {
                blackhole.consume(sdkSetup.sdk.sendProto(requestSetup.requests[i]));
            }
        }
    }

    /**
     * Measures the time taken to serialize a request, which depends on the machine running the benchmark
     */
    @Benchmark
    public void serialize(ValidRequests requestSetup, Blackhole blackhole) {
        for (int i = 0; i < requestsPerJmhInvocation; i += 1) {
            blackhole.consume(requestSetup.requests[i].createRequest(Objects.requireNonNull(HttpUrl.get(apiUri)), credentials));
        }
    }

    /**
     * By sending an invalid request which is of the same size as a valid one,
     * we can measure the approximate latency from the machine which is running the benchmark
     */
    @Benchmark
    @Group("checkLatency")
    public void checkLatency(Sdk sdkSetup, InvalidRequests invalidRequestSetup, Blackhole blackhole) {
        if (useBatch) {
            for (int i = 0; i < requestsPerJmhInvocation; i += 1) {
                blackhole.consume(sdkSetup.sdk.sendProtoBatched(invalidRequestSetup.requests[i]));
            }
        } else {
            for (int i = 0; i < requestsPerJmhInvocation; i += 1) {
                blackhole.consume(sdkSetup.sdk.sendProto(invalidRequestSetup.requests[i]));
            }
        }
    }
}
