use crate::activitypub::types::{
    ActivityExtended, ActivityPubObject, ApObjectOrString, Create, Note, ObjectExtended,
    OrderedCollection,
};
use crate::config::Config;
use crate::domain::post::Post;

pub fn build_note(post: &Post) -> Note {
    Note {
        context: None,
        id: Some(post.id.clone()),
        r#type: Some("Note".to_string()),
        to: if post.to.is_empty() {
            None
        } else {
            Some(post.to.clone())
        },
        attributed_to: Some(post.author_id.clone()),
        content: Some(post.content.clone()),
        published: Some(post.published.clone()),
    }
}

pub fn build_create_activity(post: &Post) -> Create {
    let note = build_note(post);
    let activity_id = format!("{}/activity", post.id);

    Create {
        context: None,
        id: Some(activity_id),
        r#type: Some("Create".to_string()),
        actor: Some(Box::new(ApObjectOrString::Str(post.author_id.clone()))),
        object: Some(Box::new(ApObjectOrString::Object(
            ActivityPubObject::Object(ObjectExtended::Note(note)),
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
        context: Some(vec!["https://www.w3.org/ns/activitystreams".to_string()]),
        id: Some(format!("{}/users/{}/outbox", config.base_url, username)),
        r#type: Some("OrderedCollection".to_string()),
        total_items: Some(posts.len()),
        ordered_items: Some(
            activities
                .iter()
                .map(|activity| {
                    ApObjectOrString::Object(ActivityPubObject::Activity(ActivityExtended::Create(
                        activity.clone(),
                    )))
                })
                .collect(),
        ),
    }
}
