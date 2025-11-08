use calmi_activity_streams::types::object::follow::Follow;

use crate::app::object_receivers::activity_pub::inbox::{
    extract_actor_id,
    types::{ActivityHandlerError, FollowActivityData},
};

pub async fn handle_follow(
    follow: Follow,
    base_url: &str,
    target_username: &str,
) -> Result<FollowActivityData, ActivityHandlerError> {
    let actor = follow
        .actor
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing actor".to_string()))?
        .as_ref();

    let actor_id = extract_actor_id(actor)?;

    let followee_username = extract_follow_target_username(&follow, base_url, target_username)?;
    if let Some(activity_id) = follow.id {
        Ok(FollowActivityData {
            follower_id: actor_id,
            followee_username,
            activity_id,
        })
    } else {
        Err(ActivityHandlerError(
            "Follow activity missing id".to_string(),
        ))
    }
}

pub fn extract_follow_target_username(
    follow: &Follow,
    base_url: &str,
    fallback_username: &str,
) -> Result<String, ActivityHandlerError> {
    if let Some(object) = follow.object.as_deref() {
        resolve_username_from_object_property(object, base_url, fallback_username)
    } else {
        Ok(fallback_username.to_string())
    }
}

fn resolve_username_from_object_property(
    object: &calmi_activity_streams::types::properties::ObjectProperty,
    base_url: &str,
    expected_username: &str,
) -> Result<String, ActivityHandlerError> {
    use calmi_activity_streams::types::enums::{
        ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple,
    };

    match object {
        SingleOrMultiple::Single(value) => match value {
            ObjectOrLinkOrStringUrl::Str(s) => {
                parse_username_reference(s, base_url, expected_username)
            }
            ObjectOrLinkOrStringUrl::Link(link) => {
                let href = link.href.clone().ok_or_else(|| {
                    ActivityHandlerError("Follow object link missing href".to_string())
                })?;
                parse_username_reference(&href, base_url, expected_username)
            }
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                ObjectBased::Person(person) => {
                    if let Some(id) = &person.id {
                        parse_username_reference(id, base_url, expected_username)
                    } else {
                        Err(ActivityHandlerError(
                            "Person object missing id for follow".to_string(),
                        ))
                    }
                }
                _ => Err(ActivityHandlerError(
                    "Unsupported follow object reference".to_string(),
                )),
            },
        },
        SingleOrMultiple::Multiple(_) => Err(ActivityHandlerError(
            "Multiple follow targets are not supported".to_string(),
        )),
    }
}

fn parse_username_reference(
    reference: &str,
    base_url: &str,
    expected_username: &str,
) -> Result<String, ActivityHandlerError> {
    if let Some(username) = parse_username_from_acct(reference) {
        if username == expected_username {
            return Ok(username);
        }
        return Err(ActivityHandlerError(format!(
            "Follow target username mismatch: expected {}, found {}",
            expected_username, username
        )));
    }

    if let Some(username) = parse_username_from_user_url(reference, base_url) {
        if username == expected_username {
            return Ok(username);
        }
        return Err(ActivityHandlerError(format!(
            "Follow target username mismatch: expected {}, found {}",
            expected_username, username
        )));
    }

    if reference == expected_username {
        return Ok(reference.to_string());
    }

    Err(ActivityHandlerError(format!(
        "Unsupported follow object reference: {}",
        reference
    )))
}

fn parse_username_from_acct(reference: &str) -> Option<String> {
    reference
        .strip_prefix("acct:")
        .and_then(|acct| acct.split('@').next())
        .map(|username| username.to_string())
}

fn parse_username_from_user_url(reference: &str, base_url: &str) -> Option<String> {
    let expected_prefix = format!("{}/users/", base_url.trim_end_matches('/'));
    if let Some(rest) = reference.strip_prefix(&expected_prefix) {
        return rest.split('/').next().map(|username| username.to_string());
    }
    None
}
