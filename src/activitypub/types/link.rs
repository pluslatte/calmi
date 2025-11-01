use serde::{Deserialize, Serialize};

use crate::activitypub::properties::{Context, Href, MediaType, Name, Rel, Type};

/// https://www.w3.org/TR/activitystreams-core/#link
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Link {
    #[serde(rename = "@context", skip_serializing_if = "Option::is_none")]
    pub context: Option<Box<Context>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<Type>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub href: Option<Href>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub rel: Option<Rel>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_type: Option<MediaType>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<Name>,
}
