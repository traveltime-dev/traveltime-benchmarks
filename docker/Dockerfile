# syntax=docker/dockerfile:experimental
FROM maven:3-openjdk-11 AS build
COPY src /usr/src/app/src
COPY pom.xml /usr/src/app
COPY docker/entrypoint.sh /usr/src/app/entrypoint.sh
RUN mvn -f /usr/src/app/pom.xml package shade:shade


FROM openjdk:11-jre-slim
COPY --from=build /usr/src/app/target/traveltime-benchmarks-1.0-SNAPSHOT.jar /usr/app/traveltime-benchmarks-1.0-SNAPSHOT.jar
COPY --from=build /usr/src/app/entrypoint.sh /usr/app/entrypoint.sh
ENTRYPOINT ["/bin/sh", "/usr/app/entrypoint.sh"]
