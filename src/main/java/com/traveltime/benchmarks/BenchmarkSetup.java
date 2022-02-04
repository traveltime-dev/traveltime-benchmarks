package com.traveltime.benchmarks;

import com.traveltime.sdk.auth.TravelTimeCredentials;
import com.traveltime.sdk.dto.common.Coordinates;
import com.traveltime.sdk.dto.requests.proto.Country;
import com.traveltime.sdk.dto.requests.proto.Transportation;
import lombok.val;

import java.net.URI;
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
            Country.NETHERLANDS, new Coordinates(51.509865, -0.118092),
            Country.AUSTRIA, new Coordinates(54.684487, 25.291455),
            Country.BELGIUM, new Coordinates(52.357956, 4.867070),
            Country.GERMANY, new Coordinates(52.5446, 13.35),
            Country.FRANCE, new Coordinates(48.2244617, 16.326472),
            Country.IRELAND, new Coordinates(48.8540899, 2.325747),
            Country.LITHUANIA, new Coordinates(50.8610222, 4.384314),
            Country.UNITED_KINGDOM, new Coordinates(56.92887900, 24.053981415)
    );
}
