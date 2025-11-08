use crate::domain::entities::users::Model as User;
use crate::domain::repositories::{NoteAnnouncesRepository, NotesRepository};
use axum::http::StatusCode;
use calmi_activity_streams::types::enums::{
    ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple,
};
use calmi_activity_streams::types::object::announce::Announce;
use calmi_activity_streams::types::properties::{Actor, ObjectProperty};

pub async fn handle<T: NotesRepository + NoteAnnouncesRepository>(
    announce: Announce,
    base_url: &str,
    username: &str,
    inbox_owner: &User,
    storage: &T,
) -> Result<StatusCode, StatusCode> {
    let data = match parse_announce_activity(&announce, base_url) {
        Ok(data) => data,
        Err(err) => {
            eprintln!("Failed to handle Announce activity: {}", err);
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    if data.target.author_username != username {
        eprintln!(
            "Announce target mismatch: expected {}, received {}",
            username, data.target.author_username
        );
        return Err(StatusCode::BAD_REQUEST);
    }

    let note = match storage
        .find_note_by_id(data.target.note_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    {
        Some(note) => note,
        None => {
            eprintln!(
                "Received Announce for unknown note id {}",
                data.target.note_id
            );
            return Ok(StatusCode::ACCEPTED);
        }
    };

    if note.author_id != inbox_owner.id {
        eprintln!(
            "Announce target note author mismatch: expected {}, found {}",
            inbox_owner.id, note.author_id
        );
        return Err(StatusCode::BAD_REQUEST);
    }

    if let Err(err) = storage
        .add_announce(note.id, &data.actor_id, &data.activity_id)
        .await
    {
        eprintln!("Failed to persist announce: {}", err);
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    println!(
        "Announce recorded: {} boosted note {}",
        data.actor_id, note.id
    );
    Ok(StatusCode::ACCEPTED)
}

struct AnnounceActivityData {
    actor_id: String,
    target: NoteReference,
    activity_id: String,
}

struct NoteReference {
    author_username: String,
    note_id: i64,
}

fn parse_announce_activity(
    announce: &Announce,
    base_url: &str,
) -> Result<AnnounceActivityData, String> {
    let actor = announce
        .actor
        .as_ref()
        .ok_or_else(|| "Missing actor".to_string())?
        .as_ref();
    let actor_id = extract_actor_id(actor)?;

    let object = announce
        .object
        .as_ref()
        .ok_or_else(|| "Missing object in Announce activity".to_string())?;

    let target = extract_note_reference(object.as_ref(), base_url)?;

    if let Some(activity_id) = announce.id.clone() {
        Ok(AnnounceActivityData {
            actor_id,
            target,
            activity_id,
        })
    } else {
        Err("Announce activity missing id".to_string())
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
