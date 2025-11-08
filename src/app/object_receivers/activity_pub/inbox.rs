pub mod accept;
pub mod announce;
pub mod create;
pub mod follow;
pub mod like;
pub mod types;
pub mod undo;

use crate::app::object_receivers::activity_pub::inbox::types::{
    ActivityHandlerError, NoteReference,
};

pub fn endpoint_uri_template() -> &'static str {
    "/users/{username}/inbox"
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
