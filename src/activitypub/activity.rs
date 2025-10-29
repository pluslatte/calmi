use crate::activitypub::types::{
    Activity, ActivityBase, CreateActivity, NoteObject, Object, ObjectBase, OrderedCollection,
};
use crate::config::Config;
use crate::domain::post::Post;

pub fn build_note(post: &Post) -> NoteObject {
    NoteObject {
        base: ObjectBase {
            context: None,
            id: post.id.clone(),
            r#type: "Note".to_string(),
            to: if post.to.is_empty() {
                None
            } else {
                Some(post.to.clone())
            },
            cc: if post.cc.is_empty() {
                None
            } else {
                Some(post.cc.clone())
            },
        },
        content: post.content.clone(),
        attributed_to: post.author_id.clone(),
        published: post.published.clone(),
    }
}

pub fn build_create_activity(post: &Post) -> Activity {
    let note = build_note(post);
    let activity_id = format!("{}/activity", post.id);

    Activity::Create(CreateActivity {
        activity: ActivityBase {
            object: ObjectBase {
                context: None,
                id: activity_id,
                r#type: "Create".to_string(),
                to: Some(post.to.clone()),
                cc: if post.cc.is_empty() {
                    None
                } else {
                    Some(post.cc.clone())
                },
            },
            actor: post.author_id.clone(),
            published: post.published.clone(),
        },
        object: Object::Note(note),
    })
}

pub fn build_outbox_collection(
    config: &Config,
    username: &str,
    posts: &[Post],
) -> OrderedCollection {
    let activities: Vec<Activity> = posts.iter().map(build_create_activity).collect();

    OrderedCollection {
        context: "https://www.w3.org/ns/activitystreams".to_string(),
        id: format!("{}/users/{}/outbox", config.base_url, username),
        r#type: "OrderedCollection".to_string(),
        total_items: posts.len() as u32,
        first: None,
        last: None,
        ordered_items: Some(activities),
    }
}
