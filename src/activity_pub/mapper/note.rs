use crate::domain::entities;
use calmi_activity_streams::types::{
    enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple},
    object::note::Note,
};

pub fn build_note(
    base_url: &str,
    note: &entities::note::Model,
    author: &entities::user::Model,
) -> Note {
    Note {
        context: SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
        ])
        .into(),
        id: Some(endpoint_uri(base_url, note, author)),
        r#type: Some("Note".to_string()),
        to: if note.to.is_empty() {
            None
        } else {
            Some(Box::new(SingleOrMultiple::Multiple(
                note.to
                    .iter()
                    .map(|s| ObjectOrLinkOrStringUrl::Str(s.clone()))
                    .collect(),
            )))
        },
        attributed_to: Some(Box::new(SingleOrMultiple::Single(
            ObjectOrLinkOrStringUrl::Str(format!("{}/users/{}", base_url, author.username)),
        ))),
        content: Some(note.content.clone()),
        published: Some(note.created_at.and_utc().to_rfc3339()),
    }
}

pub fn endpoint_uri_template() -> &'static str {
    "/users/{username}/notes/{id}"
}

fn endpoint_uri(
    base_url: &str,
    note: &entities::note::Model,
    author: &entities::user::Model,
) -> String {
    format!("{}/users/{}/notes/{}", base_url, author.username, note.id)
}
