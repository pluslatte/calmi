use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::{Actor, ObjectProperty};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-undo
/// Undo extends Activity
/// Indicates that the actor is undoing the object.
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Undo {
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
    fn deserialize_minimal_undo() {
        let json = r#"{
            "id": "http://example.org/undo/1",
            "type": "Undo"
        }"#;
        let undo: Result<Undo, _> = serde_json::from_str(json);
        assert!(undo.is_ok());
        let u = undo.unwrap();
        assert_eq!(u.id, Some("http://example.org/undo/1".to_string()));
        assert_eq!(u.r#type, Some("Undo".to_string()));
        assert!(u.actor.is_none());
        assert!(u.object.is_none());
    }

    #[test]
    fn deserialize_undo_with_all_fields() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/undo/2",
            "type": "Undo",
            "actor": "http://example.org/person/1",
            "object": "http://example.org/follow/1"
        }"#;
        let undo: Result<Undo, _> = serde_json::from_str(json);
        assert!(undo.is_ok());
        let u = undo.unwrap();
        assert_eq!(u.id, Some("http://example.org/undo/2".to_string()));
        assert_eq!(u.r#type, Some("Undo".to_string()));
        assert!(u.actor.is_some());
        assert!(u.object.is_some());
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(actor))) =
            u.actor.as_deref()
        {
            assert_eq!(actor, "http://example.org/person/1");
        } else {
            panic!("Expected single string actor");
        }
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(object))) =
            u.object.as_deref()
        {
            assert_eq!(object, "http://example.org/follow/1");
        } else {
            panic!("Expected single string object");
        }
    }

    #[test]
    fn serialize_undo() {
        let undo = Undo {
            context: None,
            id: Some("http://example.org/undo/1".to_string()),
            r#type: Some("Undo".to_string()),
            actor: None,
            object: None,
        };
        let json = serde_json::to_string(&undo).unwrap();
        let expected = r#"{"id":"http://example.org/undo/1","type":"Undo"}"#;
        assert_eq!(json, expected);
    }

    #[test]
    fn serialize_undo_with_none_fields() {
        let undo = Undo {
            context: None,
            id: Some("http://example.org/undo/1".to_string()),
            r#type: Some("Undo".to_string()),
            actor: None,
            object: None,
        };
        let json = serde_json::to_string(&undo).unwrap();
        assert!(!json.contains("actor"));
        assert!(!json.contains("object"));
    }

    #[test]
    fn deserialize_undo_with_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/undo/1",
            "type": "Undo"
        }"#;
        let undo: Result<Undo, _> = serde_json::from_str(json);
        assert!(undo.is_ok());
        let u = undo.unwrap();
        assert!(u.context.is_some());
        if let Some(SingleOrMultiple::Single(ctx)) = &u.context {
            assert_eq!(ctx, "https://www.w3.org/ns/activitystreams");
        } else {
            panic!("Expected single context");
        }
    }
}
