use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::{Actor, ObjectProperty};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-accept
/// Accept extends Activity
/// Indicates that the actor accepts the object.
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Accept {
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
    fn deserialize_minimal_accept() {
        let json = r#"{
            "id": "http://example.org/accept/1",
            "type": "Accept"
        }"#;
        let accept: Result<Accept, _> = serde_json::from_str(json);
        assert!(accept.is_ok());
        let a = accept.unwrap();
        assert_eq!(a.id, Some("http://example.org/accept/1".to_string()));
        assert_eq!(a.r#type, Some("Accept".to_string()));
        assert!(a.actor.is_none());
        assert!(a.object.is_none());
    }

    #[test]
    fn deserialize_accept_with_all_fields() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/accept/2",
            "type": "Accept",
            "actor": "http://example.org/person/1",
            "object": "http://example.org/note/1"
        }"#;
        let accept: Result<Accept, _> = serde_json::from_str(json);
        assert!(accept.is_ok());
        let a = accept.unwrap();
        assert_eq!(a.id, Some("http://example.org/accept/2".to_string()));
        assert_eq!(a.r#type, Some("Accept".to_string()));
        assert!(a.actor.is_some());
        assert!(a.object.is_some());
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(actor))) =
            a.actor.as_deref()
        {
            assert_eq!(actor, "http://example.org/person/1");
        } else {
            panic!("Expected single string actor");
        }
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(object))) =
            a.object.as_deref()
        {
            assert_eq!(object, "http://example.org/note/1");
        } else {
            panic!("Expected single string object");
        }
    }

    #[test]
    fn serialize_accept() {
        let accept = Accept {
            context: None,
            id: Some("http://example.org/accept/1".to_string()),
            r#type: Some("Accept".to_string()),
            actor: None,
            object: None,
        };
        let json = serde_json::to_string(&accept).unwrap();
        let expected = r#"{"id":"http://example.org/accept/1","type":"Accept"}"#;
        assert_eq!(json, expected);
    }

    #[test]
    fn serialize_accept_with_none_fields() {
        let accept = Accept {
            context: None,
            id: Some("http://example.org/accept/1".to_string()),
            r#type: Some("Accept".to_string()),
            actor: None,
            object: None,
        };
        let json = serde_json::to_string(&accept).unwrap();
        assert!(!json.contains("actor"));
        assert!(!json.contains("object"));
    }

    #[test]
    fn deserialize_accept_with_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/accept/1",
            "type": "Accept"
        }"#;
        let accept: Result<Accept, _> = serde_json::from_str(json);
        assert!(accept.is_ok());
        let a = accept.unwrap();
        assert!(a.context.is_some());
        if let Some(SingleOrMultiple::Single(ctx)) = &a.context {
            assert_eq!(ctx, "https://www.w3.org/ns/activitystreams");
        } else {
            panic!("Expected single context");
        }
    }
}
