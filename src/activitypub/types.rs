use serde::{Deserialize, Serialize};

/// Common fields for all ActivityPub objects
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ActivityPubBase {
    #[serde(rename = "@context", skip_serializing_if = "Option::is_none")]
    pub context: Option<Vec<String>>,

    /// https://www.w3.org/TR/activitypub/#obj-id
    /// ActivityPub specification requires `id` property
    /// `id` is a globally unique identifier for the object
    pub id: String,

    /// https://www.w3.org/TR/activitypub/#obj-id
    /// ActivityPub specification requires `type` property
    /// `type` indicates the type of the object
    #[serde(rename = "type")]
    pub r#type: String,
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
    Object(ObjectExtended),
    Activity(ActivityExtended),
    Collection(CollectionExtended),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum ObjectExtended {
    Object(Object),
    Person(Person),
    Note(Note),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum ActivityExtended {
    Activity(Activity),
    Create(Create),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum CollectionExtended {
    Collection(Collection),
    OrderedCollection(OrderedCollection),
}

/// https://www.w3.org/TR/activitystreams-core/#object
/// - All properties are optional
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Object {
    #[serde(flatten)]
    pub base: ActivityPubBase,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-person
/// Person extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Person {
    #[serde(flatten)]
    pub base: ActivityPubBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub inbox: Option<Box<ObjectOrString>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub outbox: Option<Box<ObjectOrString>>,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
/// Note extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    #[serde(flatten)]
    pub base: ActivityPubBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<Vec<String>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub attributed_to: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub published: Option<String>,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-activity
/// Activity extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
    #[serde(flatten)]
    pub base: ActivityPubBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor: Option<Box<ObjectOrString>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub object: Option<Box<ObjectExtended>>,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-create
/// Create extends Activity
/// Activity extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Create {
    #[serde(flatten)]
    pub base: ActivityPubBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor: Option<Box<ObjectOrString>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub object: Option<Box<ObjectOrString>>,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-collection
/// Collection extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
    #[serde(flatten)]
    pub base: ActivityPubBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_items: Option<usize>,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-orderedcollection
/// OrderedCollection extends Collection
/// Collection extends Object
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OrderedCollection {
    #[serde(flatten)]
    pub base: ActivityPubBase,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_items: Option<usize>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub ordered_items: Option<Vec<ObjectOrString>>,
}
