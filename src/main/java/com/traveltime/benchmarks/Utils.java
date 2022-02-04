package com.traveltime.benchmarks;

import com.traveltime.sdk.dto.common.Coordinates;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Utils {

    private static final double latBound = 0.1;
    private static final double lngBound = 0.2;

    public static double randomDelta(double bound) {
        return Math.random() * 2 * bound - bound;
    }

    public static Coordinates randomizeCoordinates(Coordinates coordinates) {
        return new Coordinates(
                coordinates.getLat() + randomDelta(latBound),
                coordinates.getLng() + randomDelta(lngBound)
        );
    }

    public static List<Coordinates> coordinatesAroundOrigin(Coordinates origin, int location_count) {
        return Stream
                .generate(() -> randomizeCoordinates(origin))
                .limit(location_count)
                .collect(Collectors.toList());
    }
}
