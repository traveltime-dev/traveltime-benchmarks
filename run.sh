#!/bin/sh

mvn package shade:shade

java -jar target/traveltime-benchmarks-1.0-SNAPSHOT.jar