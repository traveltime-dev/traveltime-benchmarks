package com.traveltime.benchmarks;

import com.traveltime.sdk.TravelTimeSDK;
import com.traveltime.sdk.dto.common.Coordinates;
import com.traveltime.sdk.dto.requests.TimeFilterFastProtoRequest;
import com.traveltime.sdk.dto.requests.proto.Country;
import com.traveltime.sdk.dto.requests.proto.OneToMany;
import com.traveltime.sdk.dto.requests.proto.Transportation;
import lombok.val;
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.infra.Blackhole;
import org.openjdk.jmh.runner.Runner;
import org.openjdk.jmh.runner.RunnerException;
import org.openjdk.jmh.runner.options.Options;
import org.openjdk.jmh.runner.options.OptionsBuilder;

import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class TimeFilterFastBenchmark {

    public static void main(String[] args) throws RunnerException {
        Options options = new OptionsBuilder()
                .include(TimeFilterFastBenchmark.class.getSimpleName())
                .forks(1)
                .jvmArgs("-Xms2G", "-Xmx8G")
                .warmupForks(2)
                .measurementIterations(5)
                .mode(Mode.AverageTime)
                .timeUnit(TimeUnit.MILLISECONDS)
                .build();
        new Runner(options).run();
    }

    private static final Country country = Country.valueOf(System.getenv("COUNTRY"));
    private static final Transportation mode = Transportation.valueOf(System.getenv("TRANSPORT_MODE"));
    private static final Integer travelTime = Integer.valueOf(System.getenv("TRAVEL_TIME"));

    /**
     * Initializes and closes an instance of the Sdk.
     */
    @State(Scope.Group)
    public static class Sdk {
        public TravelTimeSDK sdk;

        @Setup(Level.Iteration)
        public void setup() {
            sdk = TravelTimeSDK.builder().baseProtoUri(SdkSetup.PROTO_API).credentials(SdkSetup.credentials).build();
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
    public static class ValidRequest {
        @Param({"10000", "20000", "40000", "100000"})
        public int destinationCount;

        public TimeFilterFastProtoRequest request;

        @Setup(Level.Invocation)
        public void setUpInvocation() {

            val origin = Utils.randomizeCoordinates(SdkSetup.countryCapitalCoordinates.get(country));

            OneToMany oneToMany = new OneToMany(
                    origin,
                    Utils.coordinatesAroundOrigin(origin, destinationCount),
                    mode,
                    travelTime,
                    country
            );
            request = new TimeFilterFastProtoRequest(oneToMany);
        }
    }

    @State(Scope.Benchmark)
    public static class InvalidRequest {
        @Param({"10000", "20000", "40000", "100000"})
        public int destinationCount;

        public TimeFilterFastProtoRequest request;

        @Setup(Level.Invocation)
        public void setUpInvocation() {
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
            request = new TimeFilterFastProtoRequest(invalidOneToMany);
        }
    }


    /**
     * Serializes and sends a request to the {@link com.traveltime.benchmarks.SdkSetup#PROTO_API} endpoint
     */
    @Benchmark
    @Group("timeRequests")
    public void sendProto(Sdk sdkSetup, ValidRequest requestSetup, Blackhole blackhole) {
        blackhole.consume(sdkSetup.sdk.sendProtoBatched(requestSetup.request));
    }

    /**
     * Measures the time taken to serialize a request, which depends on the machine running the benchmark
     */
    @Benchmark
    public void serialize(ValidRequest requestSetup, Blackhole blackhole) {
        blackhole.consume(requestSetup.request.createRequest(SdkSetup.PROTO_API, SdkSetup.credentials));
    }

    /**
     * By sending an invalid request which is of the same size as a valid one,
     * we can measure the approximate latency from the machine which is running the benchmark
     */
    @Benchmark
    @Group("checkLatency")
    public void checkLatency(Sdk sdkSetup, InvalidRequest invalidRequestSetup) {
        val response = sdkSetup.sdk.sendProtoBatched(invalidRequestSetup.request);

        assert (response.isLeft());
    }
}
