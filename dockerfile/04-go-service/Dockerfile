FROM golang:1.23 AS build
WORKDIR /src
ARG VERSION=dev
COPY go.mod .
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath \
    -ldflags "-s -w -X main.version=${VERSION}" \
    -o /app .

FROM scratch
COPY --from=build /app /app
USER 65532:65532 
EXPOSE 8080
HEALTHCHECK --interval=10s CMD ["/app", "-healthcheck"]
ENTRYPOINT ["/app"]

