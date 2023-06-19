FROM golang:1.18-alpine as builder

WORKDIR /app

ENV CGO_ENABLED 0
RUN go install go.k6.io/xk6/cmd/xk6@latest

# Add here all extenstions
RUN xk6 build \
    --with github.com/traveltime-dev/xk6-protobuf@latest

FROM alpine

COPY --from=builder /app/k6 /bin/
COPY /scripts /scripts/
COPY /proto /proto/

CMD ["k6", "run"]

