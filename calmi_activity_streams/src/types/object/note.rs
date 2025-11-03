use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::{AttributedTo, Content, Published, To};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
/// Note extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to: Option<Box<To>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<Content>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub attributed_to: Option<Box<AttributedTo>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub published: Option<Published>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple};

    #[test]
    fn deserialize_minimal_note() {
        let json = r#"{
            "id": "http://example.org/note/1",
            "type": "Note"
        }"#;
        let note: Result<Note, _> = serde_json::from_str(json);
        assert!(note.is_ok());
        let n = note.unwrap();
        assert_eq!(n.id, Some("http://example.org/note/1".to_string()));
        assert_eq!(n.r#type, Some("Note".to_string()));
        assert!(n.to.is_none());
        assert!(n.content.is_none());
        assert!(n.attributed_to.is_none());
        assert!(n.published.is_none());
    }

    #[test]
    fn deserialize_note_with_all_fields() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/note/2",
            "type": "Note",
            "to": "http://example.org/person/1",
            "content": "Hello world",
            "attributedTo": "http://example.org/person/2",
            "published": "2014-08-21T12:34:56Z"
        }"#;
        let note: Result<Note, _> = serde_json::from_str(json);
        assert!(note.is_ok());
        let n = note.unwrap();
        assert_eq!(n.id, Some("http://example.org/note/2".to_string()));
        assert_eq!(n.r#type, Some("Note".to_string()));
        assert!(n.to.is_some());
        assert_eq!(n.content, Some("Hello world".to_string()));
        assert!(n.attributed_to.is_some());
        assert_eq!(n.published, Some("2014-08-21T12:34:56Z".to_string()));
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(to))) = n.to.as_deref() {
            assert_eq!(to, "http://example.org/person/1");
        } else {
            panic!("Expected single string to");
        }
        if let Some(SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(attributed_to))) =
            n.attributed_to.as_deref()
        {
            assert_eq!(attributed_to, "http://example.org/person/2");
        } else {
            panic!("Expected single string attributedTo");
        }
    }

    #[test]
    fn serialize_note() {
        let note = Note {
            context: None,
            id: Some("http://example.org/note/1".to_string()),
            r#type: Some("Note".to_string()),
            to: None,
            content: Some("Test content".to_string()),
            attributed_to: None,
            published: Some("2023-01-01T00:00:00Z".to_string()),
        };
        let json = serde_json::to_string(&note).unwrap();
        assert!(json.contains(r#""id":"http://example.org/note/1""#));
        assert!(json.contains(r#""type":"Note""#));
        assert!(json.contains(r#""content":"Test content""#));
        assert!(json.contains(r#""published":"2023-01-01T00:00:00Z""#));
        assert!(!json.contains("to"));
        assert!(!json.contains("attributedTo"));
    }

    #[test]
    fn serialize_note_with_none_fields() {
        let note = Note {
            context: None,
            id: Some("http://example.org/note/1".to_string()),
            r#type: Some("Note".to_string()),
            to: None,
            content: None,
            attributed_to: None,
            published: None,
        };
        let json = serde_json::to_string(&note).unwrap();
        assert!(!json.contains("to"));
        assert!(!json.contains("content"));
        assert!(!json.contains("attributedTo"));
        assert!(!json.contains("published"));
    }

    #[test]
    fn deserialize_note_with_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/note/1",
            "type": "Note"
        }"#;
        let note: Result<Note, _> = serde_json::from_str(json);
        assert!(note.is_ok());
        let n = note.unwrap();
        assert!(n.context.is_some());
        if let Some(SingleOrMultiple::Single(ctx)) = &n.context {
            assert_eq!(ctx, "https://www.w3.org/ns/activitystreams");
        } else {
            panic!("Expected single context");
        }
    }
}
