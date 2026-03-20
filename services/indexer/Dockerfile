FROM rust:1.95-bookworm AS build
WORKDIR /src

COPY services/indexer/Cargo.toml ./services/indexer/Cargo.toml
RUN mkdir -p services/indexer/src && printf 'fn main() {}\n' > services/indexer/src/main.rs && printf '' > services/indexer/src/lib.rs
WORKDIR /src/services/indexer
RUN cargo build --release || true

WORKDIR /src
COPY services/indexer ./services/indexer
WORKDIR /src/services/indexer
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /src/services/indexer/target/release/covenant-indexer /app/covenant-indexer
EXPOSE 8080
CMD ["/app/covenant-indexer"]
