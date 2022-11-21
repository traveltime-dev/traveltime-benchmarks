package com.traveltime.benchmarks;

import com.traveltime.sdk.TravelTimeSDK;
import com.traveltime.sdk.dto.requests.TimeFilterFastProtoRequest;
import com.traveltime.sdk.dto.requests.proto.OneToMany;
import lombok.val;
import java.util.List;

import static com.traveltime.benchmarks.BenchmarkSetup.*;


public class BenchmarkSetupValidation {
    public static final List<String> validURIs = List.of("https://proto.api.traveltimeapp.com/api/v2/");
    public static void validateBenchmarkSetup(){
        validateAPIUri(apiUri.toString());
        TravelTimeSDK sdk = TravelTimeSDK.builder().baseProtoUri(apiUri).credentials(credentials).build();
        val origin = Utils.randomizeCoordinates(countryCapitalCoordinates.get(country));
        OneToMany oneToMany = new OneToMany(
                origin,
                Utils.coordinatesAroundOrigin(origin, destinationCounts.length),
                mode,
                travelTime,
                country
        );
        TimeFilterFastProtoRequest request = new TimeFilterFastProtoRequest(oneToMany);
        val response = sdk.sendProtoBatched(request);
        if(response.isLeft()) throw new RuntimeException("ERROR MESSAGE: " + response.getLeft().getMessage() + "\n" +
        "This may be caused by incorrect API credentials, or unsupported transport mode.");
    }

    public static void validateAPIUri(String uri){
        if(!validURIs.contains(uri)) throw new RuntimeException("ERROR MESSAGE: Invalid API URI. Valid URIs: "
                + validURIs + ". Received: " + uri);
    }
}
