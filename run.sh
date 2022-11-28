#!/bin/sh

mvn package shade:shade

APP_ID=a3ff3e03 \
API_KEY=9b970660145eb6ba0cc831c183a2401c \
API_URI=http://proto.dev.traveltimeapp.com/api/v2/ \
COUNTRY=NETHERLANDS \
TRANSPORT_MODE=DRIVING \
TRAVEL_TIME=7200 \
java -jar target/traveltime-benchmarks-1.0-SNAPSHOT.jar