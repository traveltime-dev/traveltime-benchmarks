# syntax=docker/dockerfile:experimental
FROM maven:3-openjdk-11

ADD src/ /src
ADD pom.xml /
RUN --mount=type=cache,target=/root/.m2 mvn install

ADD docker/entrypoint.sh /
RUN chmod +x ./entrypoint.sh
ENTRYPOINT /entrypoint.sh
