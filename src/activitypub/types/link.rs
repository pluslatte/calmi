use serde::{Deserialize, Serialize};

use crate::activitypub::types::enums::SingleOrMultiple;

/// https://www.w3.org/TR/activitystreams-core/#link
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Link {
    #[serde(rename = "@context", skip_serializing_if = "Option::is_none")]
    pub context: Option<SingleOrMultiple<String>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub href: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub rel: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_type: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
}
