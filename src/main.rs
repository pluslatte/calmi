use axum::{Json, Router, extract::Query, http::StatusCode, routing};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", routing::get(|| async { "Hello, World!" }))
        .route("/.well-known/webfinger", routing::get(webfinger));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(Debug, Deserialize)]
struct WebFingerQuery {
    resource: String,
    #[serde(default)]
    rel: Vec<String>,
}

#[derive(Debug, Serialize)]
struct WebFingerResponse {
    subject: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    aliases: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    properties: Option<HashMap<String, Option<String>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    links: Option<Vec<Link>>,
}

#[derive(Debug, Serialize)]
struct Link {
    rel: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    r#type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    href: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    titles: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    properties: Option<HashMap<String, Option<String>>>,
}

async fn webfinger(
    Query(params): Query<WebFingerQuery>,
) -> Result<Json<WebFingerResponse>, StatusCode> {
    if params.resource.is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    if params.resource == "acct:alice@example.com" {
        let mut links = vec![
            Link {
                rel: "http://webfinger.net/rel/profile-page".to_string(),
                r#type: Some("text/html".to_string()),
                href: Some("https://example.com/~alice/".to_string()),
                titles: None,
                properties: None,
            },
            Link {
                rel: "self".to_string(),
                r#type: Some("application/activity+json".to_string()),
                href: Some("https://example.com/users/alice".to_string()),
                titles: None,
                properties: None,
            },
        ];

        if !params.rel.is_empty() {
            links.retain(|link| params.rel.contains(&link.rel));
        }

        let response = WebFingerResponse {
            subject: params.resource.clone(),
            aliases: Some(vec!["https://example.com/~alice/".to_string()]),
            properties: None,
            links: if links.is_empty() { None } else { Some(links) },
        };

        Ok(Json(response))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}
