use std::sync::Arc;

use axum::{extract::State, routing::get, Json, Router};
use serde::Serialize;
use tower_http::cors::CorsLayer;

use crate::model::{BaseEventRecord, IndexerSnapshot};

#[derive(Clone)]
pub struct AppState {
    pub chain_id: u64,
    pub rpc_url: String,
    pub confirmations: u64,
    pub events: Arc<Vec<BaseEventRecord>>,
}

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/healthz", get(healthz))
        .route("/stats/summary", get(summary))
        .route("/events", get(events))
        .layer(CorsLayer::permissive())
        .with_state(state)
}

#[derive(Serialize)]
struct HealthzResponse {
    ok: bool,
    chain_id: u64,
    rpc_url: String,
    confirmations: u64,
    latest_block: u64,
    indexed_events: usize,
}

async fn healthz(State(state): State<AppState>) -> Json<HealthzResponse> {
    let latest_block = state.events.iter().map(|event| event.block_number).max().unwrap_or(0);

    Json(HealthzResponse {
        ok: true,
        chain_id: state.chain_id,
        rpc_url: state.rpc_url.clone(),
        confirmations: state.confirmations,
        latest_block,
        indexed_events: state.events.len(),
    })
}

async fn summary(State(state): State<AppState>) -> Json<IndexerSnapshot> {
    let latest_block = state.events.iter().map(|event| event.block_number).max().unwrap_or(0);
    Json(IndexerSnapshot {
        chain_id: state.chain_id,
        latest_block,
        indexed_events: state.events.len(),
    })
}

async fn events(State(state): State<AppState>) -> Json<Vec<BaseEventRecord>> {
    Json(state.events.as_ref().clone())
}
