#!/bin/sh

mvn package shade:shade

APP_ID={{YOUR_APP_ID}} \
API_KEY={{YOUR_API_KEY}} \
API_URI=https://proto.api.traveltimeapp.com/api/v2/ \
COUNTRY=UNITED_KINGDOM \
TRANSPORT_MODE=DRIVING_FERRY \
TRAVEL_TIME=7200 \
java -jar target/traveltime-benchmarks-1.0-SNAPSHOT.jar