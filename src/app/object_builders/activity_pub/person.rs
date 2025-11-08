use crate::config::Config;
use crate::domain::entities;
use calmi_activity_streams::types::{
    enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple},
    object::person::Person,
};

pub fn build_person(config: &Config, user: &entities::users::Model) -> Person {
    Person {
        context: Some(SingleOrMultiple::Multiple(vec![
            "https://www.w3.org/ns/activitystreams".to_string(),
            "https://w3id.org/security/v1".to_string(),
        ])),
        id: Some(endpoint_uri(&config.base_url, user)),
        r#type: Some("Person".to_string()),
        name: Some(user.display_name.clone()),
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

pub fn endpoint_uri_template() -> &'static str {
    "/users/{username}"
}

fn endpoint_uri(base_url: &str, user: &entities::users::Model) -> String {
    format!("{}/users/{}", base_url, user.username)
}
