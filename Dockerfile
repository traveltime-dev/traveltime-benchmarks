FROM golang:1.24-alpine as builder

WORKDIR /app

ENV CGO_ENABLED 0
RUN apk --no-cache add git=~2
RUN go install go.k6.io/xk6/cmd/xk6@latest

# Add here all extenstions
RUN xk6 build \
    --with github.com/traveltime-dev/xk6-protobuf@latest \
    --with github.com/grafana/xk6-output-prometheus-remote@latest

FROM alpine

COPY --from=builder /app/k6 /bin/
COPY *.proto /
COPY /scripts /scripts/
COPY /locations /locations/
COPY /precomputed /precomputed/
