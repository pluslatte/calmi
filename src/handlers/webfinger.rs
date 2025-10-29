use axum::{Json, extract::Query, http::StatusCode};

use crate::types::{Link, WebFingerQuery, WebFingerResponse};
use crate::users;

const DOMAIN: &str = "example.com";

pub async fn webfinger(
    Query(params): Query<WebFingerQuery>,
) -> Result<Json<WebFingerResponse>, StatusCode> {
    if params.resource.is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let username = extract_username(&params.resource)?;

    if !users::user_exists(&username) {
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
