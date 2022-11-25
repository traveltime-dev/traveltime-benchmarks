# syntax=docker/dockerfile:experimental
FROM maven:3-openjdk-11 AS build
COPY src /usr/src/app/src
COPY pom.xml /usr/src/app
RUN mvn -f /usr/src/app/pom.xml package shade:shade


FROM gcr.io/distroless/java
COPY --from=build /usr/src/app/target/traveltime-benchmarks-1.0-SNAPSHOT.jar /usr/app/traveltime-benchmarks-1.0-SNAPSHOT.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/usr/app/traveltime-benchmarks-1.0-SNAPSHOT.jar"]