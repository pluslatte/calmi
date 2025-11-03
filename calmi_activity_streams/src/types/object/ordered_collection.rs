use calmi_macros::object_based;
use serde::{Deserialize, Serialize};

use crate::types::properties::{OrderedItems, TotalItems};

/// https://www.w3.org/TR/activitystreams-vocabulary/#dfn-orderedcollection
/// OrderedCollection extends Collection
/// Collection extends Object
#[object_based]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OrderedCollection {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_items: Option<TotalItems>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub ordered_items: Option<OrderedItems>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple};

    #[test]
    fn deserialize_minimal_ordered_collection() {
        let json = r#"{
            "id": "http://example.org/ordered_collection/1",
            "type": "OrderedCollection"
        }"#;
        let ordered_collection: Result<OrderedCollection, _> = serde_json::from_str(json);
        assert!(ordered_collection.is_ok());
        let oc = ordered_collection.unwrap();
        assert_eq!(
            oc.id,
            Some("http://example.org/ordered_collection/1".to_string())
        );
        assert_eq!(oc.r#type, Some("OrderedCollection".to_string()));
        assert!(oc.total_items.is_none());
        assert!(oc.ordered_items.is_none());
    }

    #[test]
    fn deserialize_ordered_collection_with_all_fields() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/ordered_collection/2",
            "type": "OrderedCollection",
            "totalItems": 2,
            "orderedItems": [
                "http://example.org/note/1",
                "http://example.org/note/2"
            ]
        }"#;
        let ordered_collection: Result<OrderedCollection, _> = serde_json::from_str(json);
        assert!(ordered_collection.is_ok());
        let oc = ordered_collection.unwrap();
        assert_eq!(
            oc.id,
            Some("http://example.org/ordered_collection/2".to_string())
        );
        assert_eq!(oc.r#type, Some("OrderedCollection".to_string()));
        assert_eq!(oc.total_items, Some(2));
        assert!(oc.ordered_items.is_some());
        if let Some(items) = &oc.ordered_items {
            assert_eq!(items.len(), 2);
            if let ObjectOrLinkOrStringUrl::Str(item0) = &items[0] {
                assert_eq!(item0, "http://example.org/note/1");
            } else {
                panic!("Expected string item");
            }
            if let ObjectOrLinkOrStringUrl::Str(item1) = &items[1] {
                assert_eq!(item1, "http://example.org/note/2");
            } else {
                panic!("Expected string item");
            }
        }
    }

    #[test]
    fn serialize_ordered_collection() {
        let ordered_collection = OrderedCollection {
            context: None,
            id: Some("http://example.org/ordered_collection/1".to_string()),
            r#type: Some("OrderedCollection".to_string()),
            total_items: Some(1),
            ordered_items: Some(vec![ObjectOrLinkOrStringUrl::Str(
                "http://example.org/note/1".to_string(),
            )]),
        };
        let json = serde_json::to_string(&ordered_collection).unwrap();
        assert!(json.contains(r#""id":"http://example.org/ordered_collection/1""#));
        assert!(json.contains(r#""type":"OrderedCollection""#));
        assert!(json.contains(r#""totalItems":1"#));
        assert!(json.contains(r#""orderedItems":["http://example.org/note/1"]"#));
    }

    #[test]
    fn serialize_ordered_collection_with_none_fields() {
        let ordered_collection = OrderedCollection {
            context: None,
            id: Some("http://example.org/ordered_collection/1".to_string()),
            r#type: Some("OrderedCollection".to_string()),
            total_items: None,
            ordered_items: None,
        };
        let json = serde_json::to_string(&ordered_collection).unwrap();
        assert!(!json.contains("totalItems"));
        assert!(!json.contains("orderedItems"));
    }

    #[test]
    fn deserialize_ordered_collection_with_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "id": "http://example.org/ordered_collection/1",
            "type": "OrderedCollection"
        }"#;
        let ordered_collection: Result<OrderedCollection, _> = serde_json::from_str(json);
        assert!(ordered_collection.is_ok());
        let oc = ordered_collection.unwrap();
        assert!(oc.context.is_some());
        if let Some(SingleOrMultiple::Single(ctx)) = &oc.context {
            assert_eq!(ctx, "https://www.w3.org/ns/activitystreams");
        } else {
            panic!("Expected single context");
        }
    }
}
