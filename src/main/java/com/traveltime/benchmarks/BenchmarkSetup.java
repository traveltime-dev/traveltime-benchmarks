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

        appId = System.getenv("APP_ID");
        apiKey = System.getenv("API_KEY");
        country = BenchmarkCountry.valueOf(System.getenv("COUNTRY"));
        mode = Transportation.Modes.valueOf(System.getenv("TRANSPORT_MODE"));
        travelTime = Integer.valueOf(System.getenv("TRAVEL_TIME"));
        apiUri = URI.create(System.getenv("API_URI"));
    }

    public static TravelTimeCredentials credentials = new TravelTimeCredentials(
            appId,
            apiKey
    );

    public static Map<BenchmarkCountry, Coordinates> countryCapitalCoordinates = Map.ofEntries(
            Map.entry(BenchmarkCountry.LATVIA, new Coordinates(56.945614, 24.120870)),
            Map.entry(BenchmarkCountry.NETHERLANDS, new Coordinates(52.3650144, 4.892851)),
            Map.entry(BenchmarkCountry.AUSTRIA, new Coordinates(48.2244617, 16.326472)),
            Map.entry(BenchmarkCountry.BELGIUM, new Coordinates(50.8610222, 4.384314)),
            Map.entry(BenchmarkCountry.GERMANY, new Coordinates(52.5446, 13.35)),
            Map.entry(BenchmarkCountry.FRANCE, new Coordinates(48.8540899, 2.325747)),
            Map.entry(BenchmarkCountry.IRELAND, new Coordinates(53.3129170, -6.3308734)),
            Map.entry(BenchmarkCountry.LITHUANIA, new Coordinates(54.6584053, 25.2288244)),
            Map.entry(BenchmarkCountry.UNITED_KINGDOM, new Coordinates(51.509865, -0.118092)),
            Map.entry(BenchmarkCountry.US_AKST, new Coordinates(58.3828637319633, -134.3625809419491)),
            Map.entry(BenchmarkCountry.US_CSTN, new Coordinates(39.78784887726749, -89.65091863127024)),
            Map.entry(BenchmarkCountry.US_CSTS, new Coordinates(32.35525548750887, -86.27556325535791)),
            Map.entry(BenchmarkCountry.US_ESTN, new Coordinates(41.769080365485756, -72.64558301495967)),
            Map.entry(BenchmarkCountry.US_ESTS, new Coordinates(30.44908690400848, -84.27745526420318)),
            Map.entry(BenchmarkCountry.US_HI, new Coordinates(21.27013682953827, -157.79422361634383)),
            Map.entry(BenchmarkCountry.US_MST, new Coordinates(33.45373209658149, -112.06599948928424)),
            Map.entry(BenchmarkCountry.US_PST, new Coordinates(38.56092857524395, -121.47175160988444))
    );
}
