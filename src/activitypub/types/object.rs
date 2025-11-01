pub mod activity;
pub mod collection;
pub mod create;
pub mod note;
pub mod ordered_collection;
pub mod person;

use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

/// https://www.w3.org/TR/activitystreams-core/#object
/// - All properties are optional
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Object {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deserialize_minimal_object() {
        let json = r#"{
            "id": "http://example.org/object/1",
            "type": "Object"
        }"#;
        let object: Result<Object, _> = serde_json::from_str(json);
        match &object {
            Ok(obj) => {
                assert_eq!(obj.id, "http://example.org/object/1");
                assert_eq!(obj.r#type, "Object");
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_object_with_id_and_type() {
        let json = r#"{
            "id": "http://example.org/foo",
            "type": "Note"
        }"#;
        let object: Result<Object, _> = serde_json::from_str(json);
        match &object {
            Ok(obj) => {
                assert_eq!(obj.id, "http://example.org/foo");
                assert_eq!(obj.r#type, "Note");
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_object_with_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/foo",
            "type": "Object"
        }"#;
        let object: Result<Object, _> = serde_json::from_str(json);
        match &object {
            Ok(obj) => {
                assert!(obj.context.is_some());
                assert_eq!(obj.id, "http://example.org/foo");
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_object_with_a_lot_of_context() {
        let json = r#"{
            "@context": [
                "https://www.w3.org/ns/activitystreams",
                "https://w3id.org/security/v1"
            ],
            "id": "http://example.org/foo",
            "type": "Object"
        }"#;
        let object: Result<Object, _> = serde_json::from_str(json);
        match &object {
            Ok(obj) => {
                assert!(obj.context.is_some());
                assert_eq!(obj.context.as_ref().unwrap().len(), 2);
                assert_eq!(obj.id, "http://example.org/foo");
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_object_from_activitypub_spec_example() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/foo",
            "type": "Note",
            "name": "My favourite stew recipe",
            "attributedTo": {
                "id": "http://joe.website.example/",
                "type": "Person",
                "name": "Joe Smith"
            },
            "published": "2014-08-21T12:34:56Z"
        }"#;
        let object: Result<Object, _> = serde_json::from_str(json);
        match &object {
            Ok(obj) => {
                assert_eq!(obj.id, "http://example.org/foo");
                assert_eq!(obj.r#type, "Note");
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }
}
