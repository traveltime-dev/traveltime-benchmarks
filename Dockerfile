FROM golang:1.25-alpine3.23 as builder

WORKDIR /app

ENV CGO_ENABLED 0
RUN apk --no-cache add git=~2
# Pin xk6 to v1.3.7 (last release that defaults to k6 v1). xk6 v1.4+ defaults to
# go.k6.io/k6/v2, which conflicts with extensions still on the v1 module path
# (xk6-protobuf, xk6-output-prometheus-remote).
RUN go install go.k6.io/xk6/cmd/xk6@v1.3.7

# Add here all extenstions
# xk6-protobuf pinned to the EncodeBase64 commit; back to @latest once merged.
RUN xk6 build \
    --with github.com/traveltime-dev/xk6-protobuf@994ebb737e9dfed3809fbc85ec95a06eda4b237d \
    --with github.com/grafana/xk6-output-prometheus-remote@latest

FROM alpine

COPY --from=builder /app/k6 /bin/
COPY *.proto /
COPY /scripts /scripts/
COPY /locations /locations/
COPY /precomputed /precomputed/
