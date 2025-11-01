use crate::activitypub::types::enums::{ObjectOrStringOrLink, SingleOrMultiple};
use crate::activitypub::types::object::person::Person;
use crate::config::Config;
use crate::domain::user::User;

pub fn build_person(config: &Config, user: &User) -> Person {
    Person {
        context: Some(SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
            "https://w3id.org/security/v1".to_string(),
        ])),
        id: Some(format!("{}/users/{}", config.base_url, user.username)),
        r#type: Some("Person".to_string()),
        name: Some(user.name.clone()),
        inbox: Some(Box::new(ObjectOrStringOrLink::Str(format!(
            "{}/users/{}/inbox",
            config.base_url, user.username
        )))),
        outbox: Some(Box::new(ObjectOrStringOrLink::Str(format!(
            "{}/users/{}/outbox",
            config.base_url, user.username
        )))),
    }
}
