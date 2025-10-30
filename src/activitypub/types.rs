use serde::{Deserialize, Serialize};

/// Macro to define ActivityPub object types with common fields
macro_rules! define_activitypub_object {
    (
        $(#[$meta:meta])*
        $vis:vis struct $name:ident {
            $($field_name:ident : $field_type:ty),* $(,)?
        }
    ) => {
        $(#[$meta])*
        #[derive(Serialize, Deserialize, Debug, Clone)]
        #[serde(rename_all = "camelCase")]
        $vis struct $name {
            #[serde(rename = "@context", skip_serializing_if = "Option::is_none")]
            pub context: Option<Vec<String>>,

            #[doc = "https://www.w3.org/TR/activitypub/#obj-id"]
            #[doc = "ActivityPub specification requires `id` property"]
            #[doc = "`id` is a globally unique identifier for the object"]
            pub id: String,

            #[doc = "https://www.w3.org/TR/activitypub/#obj-id"]
            #[doc = "ActivityPub specification requires `type` property"]
            #[doc = "`type` indicates the type of the object"]
            #[serde(rename = "type")]
            pub r#type: String,

            $(
                #[serde(skip_serializing_if = "Option::is_none")]
                pub $field_name: $field_type,
            )*
        }
    };
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

define_activitypub_object! {
    /// https://www.w3.org/TR/activitystreams-core/#object
    /// - All properties are optional
    pub struct Object {}
}

define_activitypub_object! {
    /// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-person
    /// Person extends Object
    pub struct Person {
        name: Option<String>,
        inbox: Option<Box<ObjectOrString>>,
        outbox: Option<Box<ObjectOrString>>
    }
}

define_activitypub_object! {
    /// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
    /// Note extends Object
    pub struct Note {
        to: Option<Vec<String>>,
        content: Option<String>,
        attributed_to: Option<String>,
        published: Option<String>
    }
}

define_activitypub_object! {
    /// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-activity
    /// Activity extends Object
    pub struct Activity {
        actor: Option<Box<ObjectOrString>>,
        object: Option<Box<ObjectExtended>>
    }
}

define_activitypub_object! {
    /// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-create
    /// Create extends Activity
    /// Activity extends Object
    pub struct Create {
        actor: Option<Box<ObjectOrString>>,
        object: Option<Box<ObjectOrString>>
    }
}

define_activitypub_object! {
    /// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-collection
    /// Collection extends Object
    pub struct Collection {
        total_items: Option<usize>
    }
}

define_activitypub_object! {
    /// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-orderedcollection
    /// OrderedCollection extends Collection
    /// Collection extends Object
    pub struct OrderedCollection {
        total_items: Option<usize>,
        ordered_items: Option<Vec<ObjectOrString>>
    }
}
