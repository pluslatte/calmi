use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::{Actor, ObjectProperty};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-like
/// Like extends Activity
/// Indicates that the actor likes, recommends, or endorses the object.
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Like {
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
    fn deserialize_minimal_like() {
        let json = r#"{
            "id": "http://example.org/like/1",
            "type": "Like"
        }"#;
        let like: Result<Like, _> = serde_json::from_str(json);
        assert!(like.is_ok());
        let l = like.unwrap();
        assert_eq!(l.id, Some("http://example.org/like/1".to_string()));
        assert_eq!(l.r#type, Some("Like".to_string()));
        assert!(l.actor.is_none());
        assert!(l.object.is_none());
    }

    #[test]
    fn deserialize_like_with_all_fields() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/like/2",
            "type": "Like",
            "actor": "http://example.org/person/1",
            "object": "http://example.org/note/1"
        }"#;
        let like: Result<Like, _> = serde_json::from_str(json);
        assert!(like.is_ok());
        let l = like.unwrap();
        assert_eq!(l.id, Some("http://example.org/like/2".to_string()));
        assert_eq!(l.r#type, Some("Like".to_string()));
        assert!(l.actor.is_some());
        assert!(l.object.is_some());
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(actor))) =
            l.actor.as_deref()
        {
            assert_eq!(actor, "http://example.org/person/1");
        } else {
            panic!("Expected single string actor");
        }
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(object))) =
            l.object.as_deref()
        {
            assert_eq!(object, "http://example.org/note/1");
        } else {
            panic!("Expected single string object");
        }
    }

    #[test]
    fn serialize_like() {
        let like = Like {
            context: None,
            id: Some("http://example.org/like/1".to_string()),
            r#type: Some("Like".to_string()),
            actor: None,
            object: None,
        };
        let json = serde_json::to_string(&like).unwrap();
        let expected = r#"{"id":"http://example.org/like/1","type":"Like"}"#;
        assert_eq!(json, expected);
    }

    #[test]
    fn serialize_like_with_none_fields() {
        let like = Like {
            context: None,
            id: Some("http://example.org/like/1".to_string()),
            r#type: Some("Like".to_string()),
            actor: None,
            object: None,
        };
        let json = serde_json::to_string(&like).unwrap();
        assert!(!json.contains("actor"));
        assert!(!json.contains("object"));
    }

    #[test]
    fn deserialize_like_with_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/like/1",
            "type": "Like"
        }"#;
        let like: Result<Like, _> = serde_json::from_str(json);
        assert!(like.is_ok());
        let l = like.unwrap();
        assert!(l.context.is_some());
        if let Some(SingleOrMultiple::Single(ctx)) = &l.context {
            assert_eq!(ctx, "https://www.w3.org/ns/activitystreams");
        } else {
            panic!("Expected single context");
        }
    }
}
