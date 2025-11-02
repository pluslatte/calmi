use crate::activitypub;
use crate::activitypub::types::{
    enums::{ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple},
    object::{create::Create, ordered_collection::OrderedCollection},
};
use crate::config::Config;
use crate::domain::entities;

pub fn build_note(post: &entities::note::Model) -> activitypub::types::object::note::Note {
    activitypub::types::object::note::Note {
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
        published: Some(post.published.clone()),
    }
}

pub fn build_create_activity(post: &entities::note::Model) -> Create {
    let note = build_note(post);
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

pub fn build_outbox_collection(
    config: &Config,
    username: &str,
    posts: &[Post],
) -> OrderedCollection {
    let activities: Vec<Create> = posts.iter().map(build_create_activity).collect();

    OrderedCollection {
        context: Some(SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
        ])),
        id: Some(format!("{}/users/{}/outbox", config.base_url, username)),
        r#type: Some("OrderedCollection".to_string()),
        total_items: Some(posts.len()),
        ordered_items: Some(
            activities
                .iter()
                .map(|activity| {
                    ObjectOrLinkOrStringUrl::Object(ObjectBased::Create(activity.clone()))
                })
                .collect(),
        ),
    }
}
