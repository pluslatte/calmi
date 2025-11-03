use super::create;
use crate::config::Config;
use crate::domain::entities;
use calmi_activity_streams::types::{
    enums::{ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple},
    object::{create::Create, ordered_collection::OrderedCollection},
};

pub fn build_outbox_collection(
    config: &Config,
    username: &str,
    notes: &[entities::note::Model],
) -> OrderedCollection {
    let activities: Vec<Create> = notes.iter().map(create::build_create_activity).collect();

    OrderedCollection {
        context: Some(SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
        ])),
        id: Some(format!("{}/users/{}/outbox", config.base_url, username)),
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
