#!/bin/sh

DOCKER_BUILDKIT=1 docker build -f docker/Dockerfile -t igeolise/traveltime-benchmarks:latest .