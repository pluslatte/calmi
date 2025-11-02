use crate::activitypub::types::enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple};
use crate::activitypub::types::object::person::Person;
use crate::config::Config;
use crate::domain::entities;

pub fn build_person(config: &Config, user: &entities::user::Model) -> Person {
    Person {
        context: Some(SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
            "https://w3id.org/security/v1".to_string(),
        ])),
        id: Some(format!("{}/users/{}", config.base_url, user.username)),
        r#type: Some("Person".to_string()),
        name: Some(user.name.clone()),
        inbox: Some(Box::new(ObjectOrLinkOrStringUrl::Str(format!(
            "{}/users/{}/inbox",
            config.base_url, user.username
        )))),
        outbox: Some(Box::new(ObjectOrLinkOrStringUrl::Str(format!(
            "{}/users/{}/outbox",
            config.base_url, user.username
        )))),
    }
}
