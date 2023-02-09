package com.traveltime.benchmarks;

import com.traveltime.sdk.TravelTimeSDK;
import com.traveltime.sdk.dto.requests.TimeFilterFastProtoRequest;
import com.traveltime.sdk.dto.requests.proto.OneToMany;
import lombok.val;
import static com.traveltime.benchmarks.BenchmarkSetup.*;


public class UriValidation {
    public static void validateBenchmarkSetup(){
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
}
