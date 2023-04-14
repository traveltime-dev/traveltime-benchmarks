#!/bin/sh

mvn package shade:shade

java -jar target/traveltime-benchmarks-1.0-SNAPSHOT.jar
printf "USED ARGUMENTS:\nCOUNTRY=$COUNTRY\nTRANSPORT MODE=$TRANSPORT_MODE\nTRAVEL TIME=$TRAVEL_TIME\n"