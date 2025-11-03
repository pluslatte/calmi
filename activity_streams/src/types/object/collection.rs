use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::TotalItems;

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-collection
/// Collection extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Collection {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_items: Option<TotalItems>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::enums::SingleOrMultiple;

    #[test]
    fn deserialize_minimal_collection() {
        let json = r#"{
            "id": "http://example.org/collection/1",
            "type": "Collection"
        }"#;
        let collection: Result<Collection, _> = serde_json::from_str(json);
        assert!(collection.is_ok());
        let c = collection.unwrap();
        assert_eq!(c.id, Some("http://example.org/collection/1".to_string()));
        assert_eq!(c.r#type, Some("Collection".to_string()));
        assert!(c.total_items.is_none());
    }

    #[test]
    fn deserialize_collection_with_all_fields() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/collection/2",
            "type": "Collection",
            "totalItems": 10
        }"#;
        let collection: Result<Collection, _> = serde_json::from_str(json);
        assert!(collection.is_ok());
        let c = collection.unwrap();
        assert_eq!(c.id, Some("http://example.org/collection/2".to_string()));
        assert_eq!(c.r#type, Some("Collection".to_string()));
        assert_eq!(c.total_items, Some(10));
    }

    #[test]
    fn serialize_collection() {
        let collection = Collection {
            context: None,
            id: Some("http://example.org/collection/1".to_string()),
            r#type: Some("Collection".to_string()),
            total_items: Some(5),
        };
        let json = serde_json::to_string(&collection).unwrap();
        let expected =
            r#"{"id":"http://example.org/collection/1","type":"Collection","totalItems":5}"#;
        assert_eq!(json, expected);
    }

    #[test]
    fn serialize_collection_with_none_fields() {
        let collection = Collection {
            context: None,
            id: Some("http://example.org/collection/1".to_string()),
            r#type: Some("Collection".to_string()),
            total_items: None,
        };
        let json = serde_json::to_string(&collection).unwrap();
        assert!(!json.contains("totalItems"));
    }

    #[test]
    fn deserialize_collection_with_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/collection/1",
            "type": "Collection"
        }"#;
        let collection: Result<Collection, _> = serde_json::from_str(json);
        assert!(collection.is_ok());
        let c = collection.unwrap();
        assert!(c.context.is_some());
        if let Some(SingleOrMultiple::Single(ctx)) = &c.context {
            assert_eq!(ctx, "https://www.w3.org/ns/activitystreams");
        } else {
            panic!("Expected single context");
        }
    }
}
