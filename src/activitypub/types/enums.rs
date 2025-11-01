use serde::{Deserialize, Serialize};

use crate::activitypub::types::object::Object;
use crate::activitypub::types::object::activity::Activity;
use crate::activitypub::types::object::collection::Collection;
use crate::activitypub::types::object::create::Create;
use crate::activitypub::types::object::note::Note;
use crate::activitypub::types::object::ordered_collection::OrderedCollection;
use crate::activitypub::types::object::person::Person;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum OneOrMany {
    Single(String),
    Multiple(Vec<String>),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum ObjectOrString {
    Object(ObjectBased),
    Str(String),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum ObjectBased {
    Object(Object),
    Person(Person),
    Note(Note),
    Activity(Activity),
    Create(Create),
    Collection(Collection),
    OrderedCollection(OrderedCollection),
}
