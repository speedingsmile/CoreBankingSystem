FROM golang:latest

WORKDIR /app

COPY go.mod ./
# COPY go.sum ./ # go.sum doesn't exist yet

RUN go mod download

COPY . .

RUN go build -o /core-banking-system ./cmd/server

EXPOSE 8080

CMD [ "/core-banking-system" ]
