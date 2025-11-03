use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::Name;

use super::super::enums::ObjectOrLinkOrStringUrl;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-person
/// Person extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Person {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<Name>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub inbox: Option<Box<ObjectOrLinkOrStringUrl>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub outbox: Option<Box<ObjectOrLinkOrStringUrl>>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple};

    #[test]
    fn deserialize_minimal_person() {
        let json = r#"{
            "id": "http://example.org/person/1",
            "type": "Person"
        }"#;
        let person: Result<Person, _> = serde_json::from_str(json);
        assert!(person.is_ok());
        let p = person.unwrap();
        assert_eq!(p.id, Some("http://example.org/person/1".to_string()));
        assert_eq!(p.r#type, Some("Person".to_string()));
        assert!(p.name.is_none());
        assert!(p.inbox.is_none());
        assert!(p.outbox.is_none());
    }

    #[test]
    fn deserialize_person_with_all_fields() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/person/2",
            "type": "Person",
            "name": "John Doe",
            "inbox": "http://example.org/person/2/inbox",
            "outbox": "http://example.org/person/2/outbox"
        }"#;
        let person: Result<Person, _> = serde_json::from_str(json);
        assert!(person.is_ok());
        let p = person.unwrap();
        assert_eq!(p.id, Some("http://example.org/person/2".to_string()));
        assert_eq!(p.r#type, Some("Person".to_string()));
        assert_eq!(p.name, Some("John Doe".to_string()));
        assert!(p.inbox.is_some());
        assert!(p.outbox.is_some());
        if let Some(ObjectOrLinkOrStringUrl::Str(inbox)) = p.inbox.as_deref() {
            assert_eq!(inbox, "http://example.org/person/2/inbox");
        } else {
            panic!("Expected string inbox");
        }
        if let Some(ObjectOrLinkOrStringUrl::Str(outbox)) = p.outbox.as_deref() {
            assert_eq!(outbox, "http://example.org/person/2/outbox");
        } else {
            panic!("Expected string outbox");
        }
    }

    #[test]
    fn serialize_person() {
        let person = Person {
            context: None,
            id: Some("http://example.org/person/1".to_string()),
            r#type: Some("Person".to_string()),
            name: Some("Jane Doe".to_string()),
            inbox: Some(Box::new(ObjectOrLinkOrStringUrl::Str(
                "http://example.org/inbox".to_string(),
            ))),
            outbox: Some(Box::new(ObjectOrLinkOrStringUrl::Str(
                "http://example.org/outbox".to_string(),
            ))),
        };
        let json = serde_json::to_string(&person).unwrap();
        assert!(json.contains(r#""id":"http://example.org/person/1""#));
        assert!(json.contains(r#""type":"Person""#));
        assert!(json.contains(r#""name":"Jane Doe""#));
        assert!(json.contains(r#""inbox":"http://example.org/inbox""#));
        assert!(json.contains(r#""outbox":"http://example.org/outbox""#));
    }

    #[test]
    fn serialize_person_with_none_fields() {
        let person = Person {
            context: None,
            id: Some("http://example.org/person/1".to_string()),
            r#type: Some("Person".to_string()),
            name: None,
            inbox: None,
            outbox: None,
        };
        let json = serde_json::to_string(&person).unwrap();
        assert!(!json.contains("name"));
        assert!(!json.contains("inbox"));
        assert!(!json.contains("outbox"));
    }

    #[test]
    fn deserialize_person_with_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/person/1",
            "type": "Person"
        }"#;
        let person: Result<Person, _> = serde_json::from_str(json);
        assert!(person.is_ok());
        let p = person.unwrap();
        assert!(p.context.is_some());
        if let Some(SingleOrMultiple::Single(ctx)) = &p.context {
            assert_eq!(ctx, "https://www.w3.org/ns/activitystreams");
        } else {
            panic!("Expected single context");
        }
    }
}
