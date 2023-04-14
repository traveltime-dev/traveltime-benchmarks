package com.traveltime.benchmarks;

import com.traveltime.sdk.dto.common.Coordinates;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.Random;

public class Utils {

    private static final double latBound = 0.1;
    private static final double lngBound = 0.2;

    public static double randomDelta(Random random, double bound) {
        return (random.nextDouble() * 2 * bound) - bound;
    }

    public static Coordinates randomizeCoordinates(Random random, Coordinates coordinates) {
        return new Coordinates(
                coordinates.getLat() + randomDelta(random, latBound),
                coordinates.getLng() + randomDelta(random, lngBound)
        );
    }

    public static List<Coordinates> coordinatesAroundOrigin(Random random, Coordinates origin, int location_count) {
        return Stream
                .generate(() -> randomizeCoordinates(random, origin))
                .limit(location_count)
                .collect(Collectors.toList());
    }
}
