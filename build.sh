#!/bin/sh

DOCKER_BUILDKIT=0 docker build -f docker/Dockerfile -t igeolise/traveltime-benchmarks:latest .