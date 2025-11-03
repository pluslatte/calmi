use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::{Actor, ObjectProperty};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-follow
/// Follow extends Activity
/// Indicates that the actor is "following" the object.
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Follow {
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
    fn deserialize_minimal_follow() {
        let json = r#"{
            "id": "http://example.org/follow/1",
            "type": "Follow"
        }"#;
        let follow: Result<Follow, _> = serde_json::from_str(json);
        assert!(follow.is_ok());
        let f = follow.unwrap();
        assert_eq!(f.id, Some("http://example.org/follow/1".to_string()));
        assert_eq!(f.r#type, Some("Follow".to_string()));
        assert!(f.actor.is_none());
        assert!(f.object.is_none());
    }

    #[test]
    fn deserialize_follow_with_all_fields() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/follow/2",
            "type": "Follow",
            "actor": "http://example.org/person/1",
            "object": "http://example.org/person/2"
        }"#;
        let follow: Result<Follow, _> = serde_json::from_str(json);
        assert!(follow.is_ok());
        let f = follow.unwrap();
        assert_eq!(f.id, Some("http://example.org/follow/2".to_string()));
        assert_eq!(f.r#type, Some("Follow".to_string()));
        assert!(f.actor.is_some());
        assert!(f.object.is_some());
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(actor))) =
            f.actor.as_deref()
        {
            assert_eq!(actor, "http://example.org/person/1");
        } else {
            panic!("Expected single string actor");
        }
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(object))) =
            f.object.as_deref()
        {
            assert_eq!(object, "http://example.org/person/2");
        } else {
            panic!("Expected single string object");
        }
    }

    #[test]
    fn serialize_follow() {
        let follow = Follow {
            context: None,
            id: Some("http://example.org/follow/1".to_string()),
            r#type: Some("Follow".to_string()),
            actor: None,
            object: None,
        };
        let json = serde_json::to_string(&follow).unwrap();
        let expected = r#"{"id":"http://example.org/follow/1","type":"Follow"}"#;
        assert_eq!(json, expected);
    }

    #[test]
    fn serialize_follow_with_none_fields() {
        let follow = Follow {
            context: None,
            id: Some("http://example.org/follow/1".to_string()),
            r#type: Some("Follow".to_string()),
            actor: None,
            object: None,
        };
        let json = serde_json::to_string(&follow).unwrap();
        assert!(!json.contains("actor"));
        assert!(!json.contains("object"));
    }

    #[test]
    fn deserialize_follow_with_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/follow/1",
            "type": "Follow"
        }"#;
        let follow: Result<Follow, _> = serde_json::from_str(json);
        assert!(follow.is_ok());
        let f = follow.unwrap();
        assert!(f.context.is_some());
        if let Some(SingleOrMultiple::Single(ctx)) = &f.context {
            assert_eq!(ctx, "https://www.w3.org/ns/activitystreams");
        } else {
            panic!("Expected single context");
        }
    }
}
