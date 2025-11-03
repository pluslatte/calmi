use super::note;
use crate::domain::entities;
use calmi_activity_streams::types::{
    enums::{ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple},
    object::create::Create,
};

pub fn build_create_activity(base_url: &str, note: &entities::note::Model) -> Create {
    let note_object = note::build_note(base_url, note);
    let activity_id = endpoint_uri(base_url, note);

    Create {
        context: Some(SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
        ])),
        id: Some(activity_id),
        r#type: Some("Create".to_string()),
        actor: Some(Box::new(SingleOrMultiple::Single(
            ObjectOrLinkOrStringUrl::Str(note.author_id.clone()),
        ))),
        object: Some(Box::new(SingleOrMultiple::Single(
            ObjectOrLinkOrStringUrl::Object(ObjectBased::Note(note_object)),
        ))),
    }
}

pub fn endpoint_uri_template() -> &'static str {
    "/users/{username}/notes/{id}/activity"
}

fn endpoint_uri(base_url: &str, note: &entities::note::Model) -> String {
    format!(
        "{}/users/{}/notes/{}/activity",
        base_url, note.author_id, note.id
    )
}
