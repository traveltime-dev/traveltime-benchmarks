FROM golang:1.20-alpine as builder

WORKDIR /app

ENV CGO_ENABLED 0
RUN go install go.k6.io/xk6/cmd/xk6@latest

# Add here all extensions
RUN xk6 build \
    --with github.com/traveltime-dev/xk6-protobuf@latest \
    --with github.com/grafana/xk6-output-prometheus-remote@latest

FROM alpine

COPY --from=builder /app/k6 /bin/
COPY /scripts /scripts/
COPY /proto /proto/
COPY /locations /locations/
COPY /precomputed /precomputed/
