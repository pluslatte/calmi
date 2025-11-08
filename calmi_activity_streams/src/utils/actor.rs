use crate::types::{
    enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple},
    properties::Actor,
};

use std::fmt;
pub struct ActorError(pub String);
impl fmt::Display for ActorError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl Actor {
    pub fn extract_id(&self) -> Result<String, ActorError> {
        match self {
            SingleOrMultiple::Single(obj_or_link) => match obj_or_link {
                ObjectOrLinkOrStringUrl::Str(id) => Ok(id.clone()),
                ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                    crate::types::enums::ObjectBased::Person(person) => person
                        .id
                        .clone()
                        .ok_or_else(|| ActorError("Person has no id".to_string())),
                    _ => Err(ActorError("Unsupported actor object type".to_string())),
                },
                ObjectOrLinkOrStringUrl::Link(link) => link
                    .href
                    .clone()
                    .ok_or_else(|| ActorError("Link has no href".to_string())),
            },
            SingleOrMultiple::Multiple(_) => {
                Err(ActorError("Multiple actors not supported".to_string()))
            }
        }
    }
}
