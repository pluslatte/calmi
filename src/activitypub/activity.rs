use crate::activitypub::types::{CreateActivity, Note, OutboxCollection};
use crate::config::Config;
use crate::domain::post::Post;

pub fn build_note(post: &Post) -> Note {
    Note {
        context: None,
        id: post.id.clone(),
        r#type: "Note".to_string(),
        content: post.content.clone(),
        published: post.published.clone(),
        attributed_to: post.author_id.clone(),
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
    }
}

pub fn build_create_activity(post: &Post) -> CreateActivity {
    let note = build_note(post);
    let activity_id = format!("{}/activity", post.id);

    CreateActivity {
        context: None,
        id: activity_id,
        r#type: "Create".to_string(),
        actor: post.author_id.clone(),
        published: post.published.clone(),
        to: post.to.clone(),
        cc: if post.cc.is_empty() {
            None
        } else {
            Some(post.cc.clone())
        },
        object: note,
    }
}

pub fn build_outbox_collection(
    config: &Config,
    username: &str,
    posts: &[Post],
) -> OutboxCollection {
    let activities: Vec<CreateActivity> = posts.iter().map(build_create_activity).collect();

    OutboxCollection {
        context: "https://www.w3.org/ns/activitystreams".to_string(),
        id: format!("{}/users/{}/outbox", config.base_url, username),
        r#type: "OrderedCollection".to_string(),
        total_items: posts.len() as u32,
        first: None,
        last: None,
        ordered_items: Some(activities),
    }
}
