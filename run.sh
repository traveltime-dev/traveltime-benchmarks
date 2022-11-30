#!/bin/sh

mvn package shade:shade

APP_ID=$APP_ID \
API_KEY=$API_KEY \
API_URI=$API_URI \
COUNTRY=$COUNTRY \
TRANSPORT_MODE=$TRANSPORT_MODE \
TRAVEL_TIME=$TRAVEL_TIME \
java -jar target/traveltime-benchmarks-1.0-SNAPSHOT.jar

