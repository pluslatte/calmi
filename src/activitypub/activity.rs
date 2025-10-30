use crate::activitypub::types::{
    ActivityExtended, Create, Note, ObjectBased, ObjectExtended, ObjectOrString, OrderedCollection,
};
use crate::config::Config;
use crate::domain::post::Post;

pub fn build_note(post: &Post) -> Note {
    Note {
        context: None,
        id: post.id.clone(),
        r#type: "Note".to_string(),
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
        id: activity_id,
        r#type: "Create".to_string(),
        actor: Some(Box::new(ObjectOrString::Str(post.author_id.clone()))),
        object: Some(Box::new(ObjectOrString::Object(ObjectBased::Object(
            ObjectExtended::Note(note),
        )))),
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
        id: format!("{}/users/{}/outbox", config.base_url, username),
        r#type: "OrderedCollection".to_string(),
        total_items: Some(posts.len()),
        ordered_items: Some(
            activities
                .iter()
                .map(|activity| {
                    ObjectOrString::Object(ObjectBased::Activity(ActivityExtended::Create(
                        activity.clone(),
                    )))
                })
                .collect(),
        ),
    }
}
