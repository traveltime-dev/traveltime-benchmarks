package com.traveltime.benchmarks;

import com.traveltime.sdk.auth.TravelTimeCredentials;
import com.traveltime.sdk.dto.common.Coordinates;
import com.traveltime.sdk.dto.requests.proto.Country;

import java.net.URI;
import java.util.Map;

public class SdkSetup {

    static final String APP_ID = System.getenv("APP_ID");
    static final String API_KEY = System.getenv("API_KEY");

    static final URI PROTO_API = URI.create("http://proto.api.traveltimeapp.com/api/v2/");

    public static TravelTimeCredentials credentials = new TravelTimeCredentials(
            APP_ID,
            API_KEY
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
