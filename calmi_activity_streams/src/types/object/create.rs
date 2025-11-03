use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::{Actor, ObjectProperty};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-create
/// Create extends Activity
/// Activity extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Create {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor: Option<Box<Actor>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub object: Option<Box<ObjectProperty>>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple};

    #[test]
    fn deserialize_minimal_create() {
        let json = r#"{
            "id": "http://example.org/create/1",
            "type": "Create"
        }"#;
        let create: Result<Create, _> = serde_json::from_str(json);
        assert!(create.is_ok());
        let c = create.unwrap();
        assert_eq!(c.id, Some("http://example.org/create/1".to_string()));
        assert_eq!(c.r#type, Some("Create".to_string()));
        assert!(c.actor.is_none());
        assert!(c.object.is_none());
    }

    #[test]
    fn deserialize_create_with_all_fields() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/create/2",
            "type": "Create",
            "actor": "http://example.org/person/1",
            "object": "http://example.org/note/1"
        }"#;
        let create: Result<Create, _> = serde_json::from_str(json);
        assert!(create.is_ok());
        let c = create.unwrap();
        assert_eq!(c.id, Some("http://example.org/create/2".to_string()));
        assert_eq!(c.r#type, Some("Create".to_string()));
        assert!(c.actor.is_some());
        assert!(c.object.is_some());
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(actor))) =
            c.actor.as_deref()
        {
            assert_eq!(actor, "http://example.org/person/1");
        } else {
            panic!("Expected single string actor");
        }
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(object))) =
            c.object.as_deref()
        {
            assert_eq!(object, "http://example.org/note/1");
        } else {
            panic!("Expected single string object");
        }
    }

    #[test]
    fn serialize_create() {
        let create = Create {
            context: None,
            id: Some("http://example.org/create/1".to_string()),
            r#type: Some("Create".to_string()),
            actor: None,
            object: None,
        };
        let json = serde_json::to_string(&create).unwrap();
        let expected = r#"{"id":"http://example.org/create/1","type":"Create"}"#;
        assert_eq!(json, expected);
    }

    #[test]
    fn serialize_create_with_none_fields() {
        let create = Create {
            context: None,
            id: Some("http://example.org/create/1".to_string()),
            r#type: Some("Create".to_string()),
            actor: None,
            object: None,
        };
        let json = serde_json::to_string(&create).unwrap();
        assert!(!json.contains("actor"));
        assert!(!json.contains("object"));
    }

    #[test]
    fn deserialize_create_with_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/create/1",
            "type": "Create"
        }"#;
        let create: Result<Create, _> = serde_json::from_str(json);
        assert!(create.is_ok());
        let c = create.unwrap();
        assert!(c.context.is_some());
        if let Some(SingleOrMultiple::Single(ctx)) = &c.context {
            assert_eq!(ctx, "https://www.w3.org/ns/activitystreams");
        } else {
            panic!("Expected single context");
        }
    }
}
