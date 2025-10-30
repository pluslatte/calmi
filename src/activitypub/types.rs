use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum ObjectOrString {
    Object(ObjectBased),
    Str(String),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ObjectBased {
    Object(ObjectExtended),
    Activity(ActivityExtended),
    Collection(CollectionExtended),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ObjectExtended {
    Object(Object),
    Person(Person),
    Note(Note),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ActivityExtended {
    Activity(Activity),
    Create(Create),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum CollectionExtended {
    Collection(Collection),
    OrderedCollection(OrderedCollection),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Object {
    #[serde(rename = "@context")]
    pub context: Option<Vec<String>>,
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub r#type: Option<String>,
    pub to: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Person {
    #[serde(rename = "@context")]
    pub context: Option<Vec<String>>,
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub r#type: Option<String>,
    pub name: Option<String>,
    pub inbox: Option<Box<ObjectOrString>>,
    pub outbox: Option<Box<ObjectOrString>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    #[serde(rename = "@context")]
    pub context: Option<Vec<String>>,
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub r#type: Option<String>,
    pub to: Option<Vec<String>>,
    pub content: Option<String>,
    pub attributed_to: Option<String>,
    pub published: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
    #[serde(rename = "@context")]
    pub context: Option<Vec<String>>,
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub r#type: Option<String>,
    pub actor: Option<Box<ObjectOrString>>,
    pub object: Option<Box<ObjectExtended>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Create {
    #[serde(rename = "@context")]
    pub context: Option<Vec<String>>,
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub r#type: Option<String>,
    pub actor: Option<Box<ObjectOrString>>,
    pub object: Option<Box<ObjectOrString>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
    #[serde(rename = "@context")]
    pub context: Option<Vec<String>>,
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub r#type: Option<String>,
    pub total_items: Option<usize>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OrderedCollection {
    #[serde(rename = "@context")]
    pub context: Option<Vec<String>>,
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub r#type: Option<String>,
    pub total_items: Option<usize>,
    pub ordered_items: Option<Vec<ObjectOrString>>,
}
