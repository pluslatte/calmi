use crate::activitypub::types::enums::ObjectOrString;
use crate::activitypub::types::object::person::Person;
use crate::config::Config;
use crate::domain::user::User;

pub fn build_person(config: &Config, user: &User) -> Person {
    Person {
        context: Some(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
            "https://w3id.org/security/v1".to_string(),
        ]),
        id: format!("{}/users/{}", config.base_url, user.username),
        r#type: "Person".to_string(),
        name: Some(user.name.clone()),
        inbox: Some(Box::new(ObjectOrString::Str(format!(
            "{}/users/{}/inbox",
            config.base_url, user.username
        )))),
        outbox: Some(Box::new(ObjectOrString::Str(format!(
            "{}/users/{}/outbox",
            config.base_url, user.username
        )))),
    }
}
