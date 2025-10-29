use serde::{Deserialize, Serialize};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-object
/// Base type for most ActivityStreams objects
/// Properties: attachment, attributedTo, audience, content, context, name, endTime,
///            generator, icon, image, inReplyTo, location, preview, published, replies,
///            startTime, summary, tag, updated, url, to, bto, cc, bcc, mediaType, id, type
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Object {
    #[serde(rename = "@context", skip_serializing_if = "Option::is_none")]
    pub context: Option<Vec<String>>,
    pub id: String,
    pub r#type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cc: Option<Vec<String>>,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-activity
/// Extends: Object
/// Properties: actor, object, target, result, origin, instrument
///            + Inherits all properties from Object
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
    #[serde(flatten)]
    pub object: Object,
    pub actor: String,
    pub published: String,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-create
/// Indicates that the actor has created the object
/// Extends: Activity
/// Properties: Inherits all properties from Activity (which includes Object properties)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Create {
    #[serde(flatten)]
    pub activity: Activity,
    pub object: Note,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
/// Represents a short written work typically less than a single paragraph in length
/// Extends: Object
/// Properties: Inherits all properties from Object
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    #[serde(flatten)]
    pub object: Object,
    pub content: String,
    pub attributed_to: String,
    pub published: String,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#actor-types
/// Actor types (Person, Service, Application, etc.)
/// Extends: Object
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Actor {
    #[serde(flatten)]
    pub object: Object,
    pub preferred_username: String,
    pub name: String,
    pub summary: String,
    pub inbox: String,
    pub outbox: String,
}

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-orderedcollection
/// Extends: Collection
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderedCollection {
    #[serde(rename = "@context")]
    pub context: String,
    pub id: String,
    pub r#type: String,
    pub total_items: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub first: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ordered_items: Option<Vec<Create>>,
}

#[derive(Debug, Deserialize)]
pub struct InboxActivity {
    #[serde(rename = "type")]
    pub activity_type: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoteRequest {
    pub r#type: String,
    pub object: CreateNoteObject,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoteObject {
    pub r#type: String,
    pub content: String,
    #[serde(default)]
    pub to: Vec<String>,
    #[serde(default)]
    pub cc: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct WebFingerQuery {
    pub resource: String,
}

#[derive(Debug, Serialize)]
pub struct WebFingerResponse {
    pub subject: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub links: Option<Vec<WebFingerLink>>,
}

#[derive(Debug, Serialize)]
pub struct WebFingerLink {
    pub rel: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub href: Option<String>,
}
