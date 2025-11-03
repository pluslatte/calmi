use crate::domain::entities;
use calmi_activity_streams::types::{
    enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple},
    object::note::Note,
};

pub fn build_note(note: &entities::note::Model) -> Note {
    Note {
        context: SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
        ])
        .into(),
        id: Some(note.id.clone()),
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
            ObjectOrLinkOrStringUrl::Str(note.author_id.clone()),
        ))),
        content: Some(note.content.clone()),
        published: Some(note.created_at.and_utc().to_rfc3339()),
    }
}
