use serde::{Deserialize, Serialize};

use crate::types::link::Link;
use crate::types::object::Object;
use crate::types::object::activity::Activity;
use crate::types::object::collection::Collection;
use crate::types::object::create::Create;
use crate::types::object::note::Note;
use crate::types::object::ordered_collection::OrderedCollection;
use crate::types::object::person::Person;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum SingleOrMultiple<T> {
    Single(T),
    Multiple(Vec<T>),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum ObjectOrLinkOrStringUrl {
    Object(ObjectBased),
    Link(Link),
    Str(String),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum ObjectOrStringUrl {
    Object(ObjectBased),
    Str(String),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum LinkOrStringUrl {
    Link(Link),
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
