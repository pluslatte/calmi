use super::create;
use crate::config::Config;
use crate::domain::entities;
use calmi_activity_streams::types::{
    enums::{ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple},
    object::{create::Create, ordered_collection::OrderedCollection},
};

/// **Outbox** is an OrderedCollection.
/// https://www.w3.org/TR/activitypub/#outbox
/// This server implementation uses Create activities as the items in the outbox.
pub fn build_outbox(
    config: &Config,
    author: &entities::user::Model,
    notes: &[entities::note::Model],
) -> OrderedCollection {
    let activities: Vec<Create> = notes
        .iter()
        .map(|note| create::build_create_activity(&config.base_url, note, author))
        .collect();

    OrderedCollection {
        context: Some(SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
        ])),
        id: Some(endpoint_uri(&config.base_url, author)),
        r#type: Some("OrderedCollection".to_string()),
        total_items: Some(notes.len()),
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

pub fn endpoint_uri_template() -> &'static str {
    "/users/{username}/outbox"
}

fn endpoint_uri(base_url: &str, author: &entities::user::Model) -> String {
    format!("{}/users/{}/outbox", base_url, author.username)
}
