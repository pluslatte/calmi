use crate::domain::entities::users::Model as User;
use crate::domain::repositories::FollowsRepository;
use axum::http::StatusCode;
use calmi_activity_streams::types::enums::{
    ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple,
};
use calmi_activity_streams::types::object::follow::Follow;
use calmi_activity_streams::types::properties::{Actor, ObjectProperty};

pub async fn handle<T: FollowsRepository>(
    follow: Follow,
    base_url: &str,
    username: &str,
    inbox_owner: &User,
    storage: &T,
) -> Result<StatusCode, StatusCode> {
    let data = match parse_follow_activity(&follow, base_url, username) {
        Ok(data) => data,
        Err(err) => {
            eprintln!("Failed to handle Follow activity: {}", err);
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    if data.followee_username != username {
        eprintln!(
            "Follow target mismatch: expected {}, received {}",
            username, data.followee_username
        );
        return Err(StatusCode::BAD_REQUEST);
    }

    if let Err(err) = storage
        .add_follow(inbox_owner.id, &data.follower_id, &data.activity_id)
        .await
    {
        eprintln!("Failed to persist follow: {}", err);
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    println!(
        "Follow recorded: {} now follows {}",
        data.follower_id, data.followee_username
    );
    Ok(StatusCode::ACCEPTED)
}

struct FollowActivityData {
    follower_id: String,
    followee_username: String,
    activity_id: String,
}

fn parse_follow_activity(
    follow: &Follow,
    base_url: &str,
    target_username: &str,
) -> Result<FollowActivityData, String> {
    let actor = follow
        .actor
        .as_ref()
        .ok_or_else(|| "Missing actor".to_string())?
        .as_ref();

    let actor_id = extract_actor_id(actor)?;

    let followee_username = extract_follow_target_username(follow, base_url, target_username)?;
    if let Some(activity_id) = follow.id.clone() {
        Ok(FollowActivityData {
            follower_id: actor_id,
            followee_username,
            activity_id,
        })
    } else {
        Err("Follow activity missing id".to_string())
    }
}

fn extract_actor_id(actor: &Actor) -> Result<String, String> {
    match actor {
        SingleOrMultiple::Single(value) => match value {
            ObjectOrLinkOrStringUrl::Str(id) => Ok(id.clone()),
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                ObjectBased::Person(person) => person
                    .id
                    .clone()
                    .ok_or_else(|| "Person has no id".to_string()),
                _ => Err("Unsupported actor object type".to_string()),
            },
            ObjectOrLinkOrStringUrl::Link(link) => link
                .href
                .clone()
                .ok_or_else(|| "Link has no href".to_string()),
        },
        SingleOrMultiple::Multiple(_) => Err("Multiple actors not supported".to_string()),
    }
}

fn extract_follow_target_username(
    follow: &Follow,
    base_url: &str,
    fallback_username: &str,
) -> Result<String, String> {
    if let Some(object) = follow.object.as_deref() {
        resolve_username_from_object_property(object, base_url, fallback_username)
    } else {
        Ok(fallback_username.to_string())
    }
}

fn resolve_username_from_object_property(
    object: &ObjectProperty,
    base_url: &str,
    expected_username: &str,
) -> Result<String, String> {
    match object {
        SingleOrMultiple::Single(value) => match value {
            ObjectOrLinkOrStringUrl::Str(s) => {
                parse_username_reference(s, base_url, expected_username)
            }
            ObjectOrLinkOrStringUrl::Link(link) => {
                let href = link
                    .href
                    .clone()
                    .ok_or_else(|| "Follow object link missing href".to_string())?;
                parse_username_reference(&href, base_url, expected_username)
            }
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                ObjectBased::Person(person) => {
                    if let Some(id) = &person.id {
                        parse_username_reference(id, base_url, expected_username)
                    } else {
                        Err("Person object missing id for follow".to_string())
                    }
                }
                _ => Err("Unsupported follow object reference".to_string()),
            },
        },
        SingleOrMultiple::Multiple(_) => {
            Err("Multiple follow targets are not supported".to_string())
        }
    }
}

fn parse_username_reference(
    reference: &str,
    base_url: &str,
    expected_username: &str,
) -> Result<String, String> {
    if let Some(username) = parse_username_from_acct(reference) {
        if username == expected_username {
            return Ok(username);
        }
        return Err(format!(
            "Follow target username mismatch: expected {}, found {}",
            expected_username, username
        ));
    }

    if let Some(username) = parse_username_from_user_url(reference, base_url) {
        if username == expected_username {
            return Ok(username);
        }
        return Err(format!(
            "Follow target username mismatch: expected {}, found {}",
            expected_username, username
        ));
    }

    if reference == expected_username {
        return Ok(reference.to_string());
    }

    Err(format!(
        "Unsupported follow object reference: {}",
        reference
    ))
}

fn parse_username_from_acct(reference: &str) -> Option<String> {
    reference
        .strip_prefix("acct:")
        .and_then(|acct| acct.split('@').next())
        .map(|username| username.to_string())
}

fn parse_username_from_user_url(reference: &str, base_url: &str) -> Option<String> {
    let expected_prefix = format!("{}/users/", base_url.trim_end_matches('/'));
    reference
        .strip_prefix(&expected_prefix)
        .and_then(|rest| rest.split('/').next())
        .map(|username| username.to_string())
}
