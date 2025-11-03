use super::note;
use crate::domain::entities;
use calmi_activity_streams::types::{
    enums::{ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple},
    object::create::Create,
};

pub fn build_create_activity(post: &entities::note::Model) -> Create {
    let note = note::build_note(post);
    let activity_id = format!("{}/activity", post.id);

    Create {
        context: Some(SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
        ])),
        id: Some(activity_id),
        r#type: Some("Create".to_string()),
        actor: Some(Box::new(SingleOrMultiple::Single(
            ObjectOrLinkOrStringUrl::Str(post.author_id.clone()),
        ))),
        object: Some(Box::new(SingleOrMultiple::Single(
            ObjectOrLinkOrStringUrl::Object(ObjectBased::Note(note)),
        ))),
    }
}
