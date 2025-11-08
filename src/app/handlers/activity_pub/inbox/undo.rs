pub mod activity_id_only;
pub mod announce;
pub mod follow;
pub mod like;

use calmi_activity_streams::types::enums::{
    ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple,
};
use calmi_activity_streams::types::object::undo::Undo;
use calmi_activity_streams::types::properties::{Actor, ObjectProperty};

pub struct UndoFollowActivityData {
    pub follower_id: String,
    pub followee_username: String,
    pub activity_id: Option<String>,
}

pub struct UndoLikeActivityData {
    pub actor_id: String,
    pub target: NoteReference,
    pub activity_id: Option<String>,
}

pub struct UndoAnnounceActivityData {
    pub actor_id: String,
    pub target: NoteReference,
    pub activity_id: Option<String>,
}

pub enum UndoActivityData {
    Follow(UndoFollowActivityData),
    Like(UndoLikeActivityData),
    Announce(UndoAnnounceActivityData),
    ActivityIdOnly {
        actor_id: String,
        activity_id: String,
    },
}

pub struct NoteReference {
    pub author_username: String,
    pub note_id: i64,
}

pub fn parse_undo(
    undo: Undo,
    base_url: &str,
    target_username: &str,
) -> Result<UndoActivityData, String> {
    let actor = undo
        .actor
        .as_ref()
        .ok_or_else(|| "Missing actor".to_string())?
        .as_ref();

    let actor_id = extract_actor_id(actor)?;

    let object = undo
        .object
        .ok_or_else(|| "Missing object in Undo activity".to_string())?;

    parse_undo_object(*object, base_url, target_username, actor_id)
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

fn parse_undo_object(
    object: ObjectProperty,
    base_url: &str,
    target_username: &str,
    actor_id: String,
) -> Result<UndoActivityData, String> {
    match object {
        SingleOrMultiple::Single(value) => match value {
            ObjectOrLinkOrStringUrl::Str(id) => Ok(UndoActivityData::ActivityIdOnly {
                actor_id,
                activity_id: id,
            }),
            ObjectOrLinkOrStringUrl::Link(link) => {
                let id = link
                    .href
                    .clone()
                    .ok_or_else(|| "Undo link missing href".to_string())?;
                Ok(UndoActivityData::ActivityIdOnly {
                    actor_id,
                    activity_id: id,
                })
            }
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                ObjectBased::Follow(follow) => {
                    let followee_username =
                        extract_follow_target_username(&follow, base_url, target_username)?;
                    Ok(UndoActivityData::Follow(UndoFollowActivityData {
                        follower_id: actor_id,
                        followee_username,
                        activity_id: follow.id,
                    }))
                }
                ObjectBased::Like(like) => {
                    let object_prop = like
                        .object
                        .as_ref()
                        .ok_or_else(|| "Undo Like missing object".to_string())?;
                    let target = extract_note_reference(object_prop, base_url)?;
                    Ok(UndoActivityData::Like(UndoLikeActivityData {
                        actor_id,
                        target,
                        activity_id: like.id,
                    }))
                }
                ObjectBased::Announce(announce) => {
                    let object_prop = announce
                        .object
                        .as_ref()
                        .ok_or_else(|| "Undo Announce missing object".to_string())?;
                    let target = extract_note_reference(object_prop, base_url)?;
                    Ok(UndoActivityData::Announce(UndoAnnounceActivityData {
                        actor_id,
                        target,
                        activity_id: announce.id,
                    }))
                }
                ObjectBased::Activity(activity) => {
                    parse_activity_based_undo(activity, base_url, target_username, actor_id)
                }
                ObjectBased::Object(object) => {
                    if let Some(id) = object.id.clone() {
                        Ok(UndoActivityData::ActivityIdOnly {
                            actor_id,
                            activity_id: id,
                        })
                    } else {
                        Err("Undo embedded object missing id".to_string())
                    }
                }
                _ => Err("Unsupported undo embedded object".to_string()),
            },
        },
        SingleOrMultiple::Multiple(_) => Err("Multiple undo objects are not supported".to_string()),
    }
}

fn parse_activity_based_undo(
    activity: calmi_activity_streams::types::object::activity::Activity,
    base_url: &str,
    target_username: &str,
    actor_id: String,
) -> Result<UndoActivityData, String> {
    let activity_type = activity
        .r#type
        .clone()
        .ok_or_else(|| "Activity missing type".to_string())?;
    match activity_type.as_str() {
        "Follow" => Ok(UndoActivityData::Follow(UndoFollowActivityData {
            follower_id: actor_id,
            followee_username: target_username.to_string(),
            activity_id: activity.id,
        })),
        "Like" => {
            let target_object = activity
                .object
                .ok_or_else(|| "Undo Like missing object".to_string())?;
            let target = extract_note_reference(target_object.as_ref(), base_url)?;
            Ok(UndoActivityData::Like(UndoLikeActivityData {
                actor_id,
                target,
                activity_id: activity.id,
            }))
        }
        "Announce" => {
            let target_object = activity
                .object
                .ok_or_else(|| "Undo Announce missing object".to_string())?;
            let target = extract_note_reference(target_object.as_ref(), base_url)?;
            Ok(UndoActivityData::Announce(UndoAnnounceActivityData {
                actor_id,
                target,
                activity_id: activity.id,
            }))
        }
        other => Err(format!("Unsupported undo activity type: {}", other)),
    }
}

fn extract_follow_target_username(
    follow: &calmi_activity_streams::types::object::follow::Follow,
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

fn extract_note_reference(
    object: &ObjectProperty,
    base_url: &str,
) -> Result<NoteReference, String> {
    let value = match object {
        SingleOrMultiple::Single(v) => v,
        SingleOrMultiple::Multiple(_) => {
            return Err("Multiple objects not supported for note reference".to_string());
        }
    };

    let url = match value {
        ObjectOrLinkOrStringUrl::Str(s) => s.clone(),
        ObjectOrLinkOrStringUrl::Link(link) => link
            .href
            .clone()
            .ok_or_else(|| "Link object missing href".to_string())?,
        ObjectOrLinkOrStringUrl::Object(obj) => match obj {
            ObjectBased::Note(note) => note
                .id
                .clone()
                .ok_or_else(|| "Note object missing id".to_string())?,
            ObjectBased::Activity(activity) => activity
                .object
                .as_deref()
                .and_then(|inner| match inner {
                    SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(s)) => Some(s.clone()),
                    SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Link(link)) => {
                        link.href.clone()
                    }
                    _ => None,
                })
                .ok_or_else(|| "Unable to extract object from Activity".to_string())?,
            ObjectBased::Object(object) => object
                .id
                .clone()
                .ok_or_else(|| "Object missing id".to_string())?,
            _ => {
                return Err("Unsupported embedded object for note reference".to_string());
            }
        },
    };

    parse_note_url(&url, base_url)
}

fn parse_note_url(url: &str, base_url: &str) -> Result<NoteReference, String> {
    let normalized_base = base_url.trim_end_matches('/');
    let expected_prefix = format!("{}/users/", normalized_base);
    let without_base = url
        .strip_prefix(&expected_prefix)
        .ok_or_else(|| format!("Object is not a local note: {}", url))?;

    let mut segments = without_base.split('/');
    let username = segments
        .next()
        .ok_or_else(|| "Missing username segment".to_string())?;
    let notes_segment = segments
        .next()
        .ok_or_else(|| "Missing notes segment".to_string())?;
    if notes_segment != "notes" {
        return Err("Unexpected path segment, expected 'notes'".to_string());
    }
    let note_id_segment = segments
        .next()
        .ok_or_else(|| "Missing note id".to_string())?;

    let note_id = note_id_segment
        .parse::<i64>()
        .map_err(|_| "Note id is not a valid integer".to_string())?;

    Ok(NoteReference {
        author_username: username.to_string(),
        note_id,
    })
}
