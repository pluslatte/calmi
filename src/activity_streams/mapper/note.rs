use crate::domain::entities;
use calmi_activity_streams::types::{
    enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple},
    object::note::Note,
};

pub fn build_note(post: &entities::note::Model) -> Note {
    Note {
        context: SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
        ])
        .into(),
        id: Some(post.id.clone()),
        r#type: Some("Note".to_string()),
        to: if post.to.is_empty() {
            None
        } else {
            Some(Box::new(SingleOrMultiple::Multiple(
                post.to
                    .iter()
                    .map(|s| ObjectOrLinkOrStringUrl::Str(s.clone()))
                    .collect(),
            )))
        },
        attributed_to: Some(Box::new(SingleOrMultiple::Single(
            ObjectOrLinkOrStringUrl::Str(post.author_id.clone()),
        ))),
        content: Some(post.content.clone()),
        published: Some(post.created_at.and_utc().to_rfc3339()),
    }
}
