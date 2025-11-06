use calmi_activity_streams::types::object::accept::Accept;
use calmi_activity_streams::types::object::announce::Announce;
use calmi_activity_streams::types::object::create::Create;
use calmi_activity_streams::types::object::follow::Follow;
use calmi_activity_streams::types::object::like::Like;
use calmi_activity_streams::types::object::undo::Undo;

pub fn endpoint_uri_template() -> &'static str {
    "/users/{username}/inbox"
}

use std::fmt;
pub struct ActivityHandlerError(pub String);
impl fmt::Display for ActivityHandlerError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

pub struct FollowActivityData {
    pub follower_id: String,
    pub followee_username: String,
    pub activity_id: String,
}

pub struct UndoFollowActivityData {
    pub follower_id: String,
    pub followee_username: String,
    pub activity_id: Option<String>,
}

pub struct CreateActivityData {
    pub actor_id: String,
    pub object_type: String,
    pub object_id: Option<String>,
    pub activity_id: Option<String>,
}

pub struct NoteReference {
    pub author_username: String,
    pub note_id: i64,
}

pub struct LikeActivityData {
    pub actor_id: String,
    pub target: NoteReference,
    pub activity_id: String,
}

pub struct AnnounceActivityData {
    pub actor_id: String,
    pub target: NoteReference,
    pub activity_id: String,
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

pub async fn handle_undo(
    undo: Undo,
    base_url: &str,
    target_username: &str,
) -> Result<UndoActivityData, ActivityHandlerError> {
    let actor = undo
        .actor
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing actor".to_string()))?
        .as_ref();

    let actor_id = extract_actor_id(actor)?;

    let object = undo
        .object
        .ok_or_else(|| ActivityHandlerError("Missing object in Undo activity".to_string()))?;

    parse_undo_object(*object, base_url, target_username, actor_id)
}

pub async fn handle_create(
    create: Create,
    _target_username: &str,
) -> Result<CreateActivityData, ActivityHandlerError> {
    let actor = create
        .actor
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing actor".to_string()))?
        .as_ref();

    let actor_id = extract_actor_id(actor)?;

    let object = create
        .object
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing object in Create activity".to_string()))?;

    let (object_type, object_id) = extract_object_info(object.as_ref())?;
    let activity_id = create.id.clone();

    Ok(CreateActivityData {
        actor_id,
        object_type,
        object_id,
        activity_id,
    })
}

pub async fn handle_accept(
    _accept: Accept,
    _target_username: &str,
) -> Result<(), ActivityHandlerError> {
    Ok(())
}

pub async fn handle_like(
    like: Like,
    base_url: &str,
) -> Result<LikeActivityData, ActivityHandlerError> {
    let actor = like
        .actor
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing actor".to_string()))?
        .as_ref();
    let actor_id = extract_actor_id(actor)?;

    let object = like
        .object
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing object in Like activity".to_string()))?;

    let target = extract_note_reference(object.as_ref(), base_url)?;

    if let Some(activity_id) = like.id {
        Ok(LikeActivityData {
            actor_id,
            target,
            activity_id,
        })
    } else {
        Err(ActivityHandlerError("Like activity missing id".to_string()))
    }
}

pub async fn handle_announce(
    announce: Announce,
    base_url: &str,
) -> Result<AnnounceActivityData, ActivityHandlerError> {
    let actor = announce
        .actor
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing actor".to_string()))?
        .as_ref();
    let actor_id = extract_actor_id(actor)?;

    let object = announce
        .object
        .as_ref()
        .ok_or_else(|| ActivityHandlerError("Missing object in Announce activity".to_string()))?;

    let target = extract_note_reference(object.as_ref(), base_url)?;

    if let Some(activity_id) = announce.id {
        Ok(AnnounceActivityData {
            actor_id,
            target,
            activity_id,
        })
    } else {
        Err(ActivityHandlerError(
            "Announce activity missing id".to_string(),
        ))
    }
}

fn extract_actor_id(
    actor: &calmi_activity_streams::types::properties::Actor,
) -> Result<String, ActivityHandlerError> {
    use calmi_activity_streams::types::enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple};

    match actor {
        SingleOrMultiple::Single(obj_or_link) => match obj_or_link {
            ObjectOrLinkOrStringUrl::Str(id) => Ok(id.clone()),
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                calmi_activity_streams::types::enums::ObjectBased::Person(person) => person
                    .id
                    .clone()
                    .ok_or_else(|| ActivityHandlerError("Person has no id".to_string())),
                _ => Err(ActivityHandlerError(
                    "Unsupported actor object type".to_string(),
                )),
            },
            ObjectOrLinkOrStringUrl::Link(link) => link
                .href
                .clone()
                .ok_or_else(|| ActivityHandlerError("Link has no href".to_string())),
        },
        SingleOrMultiple::Multiple(_) => Err(ActivityHandlerError(
            "Multiple actors not supported".to_string(),
        )),
    }
}

fn extract_object_info(
    object: &calmi_activity_streams::types::properties::ObjectProperty,
) -> Result<(String, Option<String>), ActivityHandlerError> {
    use calmi_activity_streams::types::enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple};

    match object {
        SingleOrMultiple::Single(obj_or_link_or_str) => match obj_or_link_or_str {
            ObjectOrLinkOrStringUrl::Str(id) => Ok(("Unknown".to_string(), Some(id.clone()))),
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                calmi_activity_streams::types::enums::ObjectBased::Note(note) => {
                    Ok(("Note".to_string(), note.id.clone()))
                }
                calmi_activity_streams::types::enums::ObjectBased::Object(object) => Ok((
                    object.r#type.clone().unwrap_or("Object".to_string()),
                    object.id.clone(),
                )),
                _ => Ok(("Unknown".to_string(), None)),
            },
            ObjectOrLinkOrStringUrl::Link(_link) => Ok(("Link".to_string(), None)),
        },
        SingleOrMultiple::Multiple(_) => Err(ActivityHandlerError(
            "Multiple objects not supported".to_string(),
        )),
    }
}

fn extract_follow_target_username(
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

fn extract_note_reference(
    object: &calmi_activity_streams::types::properties::ObjectProperty,
    base_url: &str,
) -> Result<NoteReference, ActivityHandlerError> {
    use calmi_activity_streams::types::enums::{
        ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple,
    };

    let value = match object {
        SingleOrMultiple::Single(v) => v,
        SingleOrMultiple::Multiple(_) => {
            return Err(ActivityHandlerError(
                "Multiple objects not supported for note reference".to_string(),
            ));
        }
    };

    let url = match value {
        ObjectOrLinkOrStringUrl::Str(s) => s.clone(),
        ObjectOrLinkOrStringUrl::Link(link) => link
            .href
            .clone()
            .ok_or_else(|| ActivityHandlerError("Link object missing href".to_string()))?,
        ObjectOrLinkOrStringUrl::Object(obj) => match obj {
            ObjectBased::Note(note) => note
                .id
                .clone()
                .ok_or_else(|| ActivityHandlerError("Note object missing id".to_string()))?,
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
                .ok_or_else(|| {
                    ActivityHandlerError("Unable to extract object from Activity".to_string())
                })?,
            ObjectBased::Object(object) => object
                .id
                .clone()
                .ok_or_else(|| ActivityHandlerError("Object missing id".to_string()))?,
            _ => {
                return Err(ActivityHandlerError(
                    "Unsupported embedded object for note reference".to_string(),
                ));
            }
        },
    };

    parse_note_url(&url, base_url)
}

fn parse_note_url(url: &str, base_url: &str) -> Result<NoteReference, ActivityHandlerError> {
    let normalized_base = base_url.trim_end_matches('/');
    let expected_prefix = format!("{}/users/", normalized_base);
    let without_base = url
        .strip_prefix(&expected_prefix)
        .ok_or_else(|| ActivityHandlerError(format!("Object is not a local note: {}", url)))?;

    let mut segments = without_base.split('/');
    let username = segments
        .next()
        .ok_or_else(|| ActivityHandlerError("Missing username segment".to_string()))?;
    let notes_segment = segments
        .next()
        .ok_or_else(|| ActivityHandlerError("Missing notes segment".to_string()))?;
    if notes_segment != "notes" {
        return Err(ActivityHandlerError(
            "Unexpected path segment, expected 'notes'".to_string(),
        ));
    }
    let note_id_segment = segments
        .next()
        .ok_or_else(|| ActivityHandlerError("Missing note id".to_string()))?;

    let note_id = note_id_segment
        .parse::<i64>()
        .map_err(|_| ActivityHandlerError("Note id is not a valid integer".to_string()))?;

    Ok(NoteReference {
        author_username: username.to_string(),
        note_id,
    })
}

fn parse_undo_object(
    object: calmi_activity_streams::types::properties::ObjectProperty,
    base_url: &str,
    target_username: &str,
    actor_id: String,
) -> Result<UndoActivityData, ActivityHandlerError> {
    use calmi_activity_streams::types::enums::{
        ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple,
    };

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
                    .ok_or_else(|| ActivityHandlerError("Undo link missing href".to_string()))?;
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
                    let object_prop = like.object.as_ref().ok_or_else(|| {
                        ActivityHandlerError("Undo Like missing object".to_string())
                    })?;
                    let target = extract_note_reference(object_prop, base_url)?;
                    Ok(UndoActivityData::Like(UndoLikeActivityData {
                        actor_id,
                        target,
                        activity_id: like.id,
                    }))
                }
                ObjectBased::Announce(announce) => {
                    let object_prop = announce.object.as_ref().ok_or_else(|| {
                        ActivityHandlerError("Undo Announce missing object".to_string())
                    })?;
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
                        Err(ActivityHandlerError(
                            "Undo embedded object missing id".to_string(),
                        ))
                    }
                }
                _ => Err(ActivityHandlerError(
                    "Unsupported undo embedded object".to_string(),
                )),
            },
        },
        SingleOrMultiple::Multiple(_) => Err(ActivityHandlerError(
            "Multiple undo objects are not supported".to_string(),
        )),
    }
}

fn parse_activity_based_undo(
    activity: calmi_activity_streams::types::object::activity::Activity,
    base_url: &str,
    target_username: &str,
    actor_id: String,
) -> Result<UndoActivityData, ActivityHandlerError> {
    let activity_type = activity
        .r#type
        .clone()
        .ok_or_else(|| ActivityHandlerError("Activity missing type".to_string()))?;
    match activity_type.as_str() {
        "Follow" => Ok(UndoActivityData::Follow(UndoFollowActivityData {
            follower_id: actor_id,
            followee_username: target_username.to_string(),
            activity_id: activity.id,
        })),
        "Like" => {
            let target_object = activity
                .object
                .ok_or_else(|| ActivityHandlerError("Undo Like missing object".to_string()))?;
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
                .ok_or_else(|| ActivityHandlerError("Undo Announce missing object".to_string()))?;
            let target = extract_note_reference(target_object.as_ref(), base_url)?;
            Ok(UndoActivityData::Announce(UndoAnnounceActivityData {
                actor_id,
                target,
                activity_id: activity.id,
            }))
        }
        other => Err(ActivityHandlerError(format!(
            "Unsupported undo activity type: {}",
            other
        ))),
    }
}
