use axum::{
    Json, Router,
    extract::{Path, Query},
    http::StatusCode,
    routing,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

const DOMAIN: &str = "example.com";

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", routing::get(|| async { "ActivityPub Server" }))
        .route("/.well-known/webfinger", routing::get(webfinger))
        .route("/users/{username}", routing::get(actor_handler))
        .route("/users/{username}/inbox", routing::post(inbox_handler))
        .route("/users/{username}/outbox", routing::get(outbox_handler));

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

    let username = extract_username(&params.resource)?;

    if !user_exists(&username) {
        return Err(StatusCode::NOT_FOUND);
    }

    let mut links = vec![
        Link {
            rel: "http://webfinger.net/rel/profile-page".to_string(),
            r#type: Some("text/html".to_string()),
            href: Some(format!("https://{}/~{}/", DOMAIN, username)),
            titles: None,
            properties: None,
        },
        Link {
            rel: "self".to_string(),
            r#type: Some("application/activity+json".to_string()),
            href: Some(format!("https://{}/users/{}", DOMAIN, username)),
            titles: None,
            properties: None,
        },
    ];

    if !params.rel.is_empty() {
        links.retain(|link| params.rel.contains(&link.rel));
    }

    let response = WebFingerResponse {
        subject: params.resource.clone(),
        aliases: Some(vec![format!("https://{}/~{}/", DOMAIN, username)]),
        properties: None,
        links: if links.is_empty() { None } else { Some(links) },
    };

    Ok(Json(response))
}

fn extract_username(resource: &str) -> Result<String, StatusCode> {
    if let Some(acct_part) = resource.strip_prefix("acct:")
        && let Some((username, domain)) = acct_part.split_once('@')
        && domain == DOMAIN
    {
        return Ok(username.to_string());
    }
    Err(StatusCode::BAD_REQUEST)
}

fn user_exists(username: &str) -> bool {
    matches!(username, "alice" | "bob" | "carol")
}

fn get_user_info(username: &str) -> Option<UserInfo> {
    match username {
        "alice" => Some(UserInfo {
            username: "alice".to_string(),
            name: "Alice".to_string(),
            summary: "Hello! I'm Alice.".to_string(),
        }),
        "bob" => Some(UserInfo {
            username: "bob".to_string(),
            name: "Bob".to_string(),
            summary: "Bob here, nice to meet you.".to_string(),
        }),
        "carol" => Some(UserInfo {
            username: "carol".to_string(),
            name: "Carol".to_string(),
            summary: "Carol's account.".to_string(),
        }),
        _ => None,
    }
}

struct UserInfo {
    username: String,
    name: String,
    summary: String,
}

#[derive(Debug, Serialize)]
struct ActorObject {
    #[serde(rename = "@context")]
    context: Vec<String>,
    id: String,
    r#type: String,
    #[serde(rename = "preferredUsername")]
    preferred_username: String,
    name: String,
    summary: String,
    inbox: String,
    outbox: String,
}

async fn actor_handler(Path(username): Path<String>) -> Result<Json<ActorObject>, StatusCode> {
    let user = get_user_info(&username).ok_or(StatusCode::NOT_FOUND)?;

    let actor = ActorObject {
        context: vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
            "https://w3id.org/security/v1".to_string(),
        ],
        id: format!("https://{}/users/{}", DOMAIN, username),
        r#type: "Person".to_string(),
        preferred_username: user.username.clone(),
        name: user.name,
        summary: user.summary,
        inbox: format!("https://{}/users/{}/inbox", DOMAIN, username),
        outbox: format!("https://{}/users/{}/outbox", DOMAIN, username),
    };

    Ok(Json(actor))
}

#[derive(Debug, Deserialize)]
struct InboxActivity {
    #[serde(rename = "type")]
    #[allow(dead_code)]
    activity_type: String,
}

async fn inbox_handler(
    Path(username): Path<String>,
    Json(activity): Json<InboxActivity>,
) -> Result<StatusCode, StatusCode> {
    if !user_exists(&username) {
        return Err(StatusCode::NOT_FOUND);
    }

    println!("Received activity for {}: {:?}", username, activity);

    Ok(StatusCode::ACCEPTED)
}

#[derive(Debug, Serialize)]
struct OutboxCollection {
    #[serde(rename = "@context")]
    context: String,
    id: String,
    r#type: String,
    #[serde(rename = "totalItems")]
    total_items: u32,
}

async fn outbox_handler(
    Path(username): Path<String>,
) -> Result<Json<OutboxCollection>, StatusCode> {
    if !user_exists(&username) {
        return Err(StatusCode::NOT_FOUND);
    }

    let outbox = OutboxCollection {
        context: "https://www.w3.org/ns/activitystreams".to_string(),
        id: format!("https://{}/users/{}/outbox", DOMAIN, username),
        r#type: "OrderedCollection".to_string(),
        total_items: 0,
    };

    Ok(Json(outbox))
}
