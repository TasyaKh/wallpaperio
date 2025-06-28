FROM golang:1.24-alpine as builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/wallpaperio/main.go
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/server .

CMD ["./server"] 