# Stage 1: Build Angular frontend
FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npx ng build --configuration production

# Stage 2: Build Go backend
FROM golang:1.25-alpine AS backend
WORKDIR /app
COPY backend/ ./
COPY --from=frontend /app/dist/frontend/browser ./web/dist
RUN go mod download
RUN go build -o server ./cmd/server

# Stage 3: Runtime
FROM alpine:3.20
WORKDIR /app
COPY --from=backend /app/server .
COPY --from=backend /app/web ./web
EXPOSE 8080
CMD ["./server"]
