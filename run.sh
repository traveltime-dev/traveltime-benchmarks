#!/bin/sh

mvn package shade:shade
$APP_ID \
$API_KEY \
$API_URI \
$COUNTRY \
$TRANSPORT_MODE \
$TRAVEL_TIME \
$DESTINATION_COUNTS \
$JMH_JVM_ARGS
java -jar target/traveltime-benchmarks-1.0-SNAPSHOT.jar

