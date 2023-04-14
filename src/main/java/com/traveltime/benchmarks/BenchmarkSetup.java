package com.traveltime.benchmarks;

import com.traveltime.sdk.auth.TravelTimeCredentials;
import com.traveltime.sdk.dto.common.Coordinates;
import com.traveltime.sdk.dto.requests.proto.Country;
import com.traveltime.sdk.dto.requests.proto.Transportation;
import lombok.val;

import java.net.URI;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class BenchmarkSetup {

    public static final String appId;
    public static final String apiKey;
    public static final Country country;
    public static final Transportation mode;
    public static final Integer travelTime;
    public static final URI apiUri;
    public static final String[] destinationCounts;
    public static final String[] jmhJvmArgs;
    public static final long seed;

    static {
        val requiredEnvVars = Set.of(
                "APP_ID",
                "API_KEY",
                "COUNTRY",
                "TRANSPORT_MODE",
                "TRAVEL_TIME",
                "API_URI"
        );

        val nulls = requiredEnvVars
                .stream()
                .filter(key -> System.getenv(key) == null)
                .collect(Collectors.joining(", "));

        if (!nulls.isEmpty()) {
            throw new RuntimeException("Could not start benchmark. The following required environment variables were not set: " + nulls);
        }

        val destinationCountStringOrNull = System.getenv("DESTINATION_COUNTS");

        if (destinationCountStringOrNull == null) {
            destinationCounts = new String[]{"10000", "20000", "40000", "100000"};
        } else {
            try {
                destinationCounts = destinationCountStringOrNull.split(",");
                Arrays.stream(destinationCounts).forEach(str -> {
                    assert (Integer.parseInt(str) > 0);
                });
            } catch (Throwable e) {
                throw new RuntimeException("Could not start benchmark. Unable to parse environment variable DESTINATION_COUNTS " +
                        "as an array of positive integers. Variable value was: " + destinationCountStringOrNull +
                        " Expected a comma-separated list, for example: 10000,20000,40000,100000", e);
            }
        }

        val jmhJvmArgsStringOrNull = System.getenv("JMH_JVM_ARGS");

        if (jmhJvmArgsStringOrNull != null) {
            jmhJvmArgs = jmhJvmArgsStringOrNull.split(",");
        } else {
            jmhJvmArgs = new String[]{};
        }

        val seedOrNull = System.getenv("SEED");
        if (seedOrNull != null) {
            try {
                seed = Long.parseLong(seedOrNull);
            } catch (Throwable e) {
                throw new RuntimeException("Could not start benchmark. Unable to parse environment variable SEED " +
                        "as long value. Variable value was: " + seedOrNull);
            }
        } else {
            seed = System.currentTimeMillis();
        }

        appId = System.getenv("APP_ID");
        apiKey = System.getenv("API_KEY");
        country = Country.valueOf(System.getenv("COUNTRY"));
        mode = Transportation.valueOf(System.getenv("TRANSPORT_MODE"));
        travelTime = Integer.valueOf(System.getenv("TRAVEL_TIME"));
        apiUri = URI.create(System.getenv("API_URI"));
    }

    public static TravelTimeCredentials credentials = new TravelTimeCredentials(
            appId,
            apiKey
    );

    public static Map<Country, Coordinates> countryCapitalCoordinates = Map.of(
            Country.NETHERLANDS, new Coordinates(52.3650144, 4.892851),
            Country.AUSTRIA, new Coordinates(48.2244617, 16.326472),
            Country.BELGIUM, new Coordinates(50.8610222, 4.384314),
            Country.GERMANY, new Coordinates(52.5446, 13.35),
            Country.FRANCE, new Coordinates(48.8540899, 2.325747),
            Country.IRELAND, new Coordinates(53.3129170, -6.3308734),
            Country.LITHUANIA, new Coordinates(54.6584053, 25.2288244),
            Country.UNITED_KINGDOM, new Coordinates(51.509865, -0.118092)
    );
}
