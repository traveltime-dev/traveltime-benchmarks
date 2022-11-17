package com.traveltime.benchmarks;

import com.traveltime.sdk.TravelTimeSDK;
import com.traveltime.sdk.dto.requests.TimeFilterFastProtoRequest;
import com.traveltime.sdk.dto.requests.proto.OneToMany;
import lombok.val;
import static com.traveltime.benchmarks.BenchmarkSetup.*;


public class UriValidation {

    public static void correctApiUri(){
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
        if(sdk.sendProtoBatched(request).isLeft()) throw new RuntimeException("ERROR: API may be down, or API " +
                "credentials and uri are incorrect. Please check, if API_KEY, API_URI, APP_ID are correct.");
    }

}
