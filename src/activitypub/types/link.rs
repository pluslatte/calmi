use serde::{Deserialize, Serialize};

use crate::activitypub::properties::{Context, Href, MediaType, Name, Rel, Type};

/// https://www.w3.org/TR/activitystreams-core/#link
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Link {
    #[serde(rename = "@context", skip_serializing_if = "Option::is_none")]
    pub context: Option<Box<Context>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<Type>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub href: Option<Href>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub rel: Option<Rel>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub media_type: Option<MediaType>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<Name>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::activitypub::types::enums::{ObjectOrLinkOrStringUrl, SingleOrMultiple};

    #[test]
    fn deserialize_minimal_link() {
        let json = r#"{
            "type": "Link",
            "href": "http://example.org/abc"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert_eq!(l.r#type, Some("Link".to_string()));
                assert_eq!(l.href, Some("http://example.org/abc".to_string()));
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_link_type_only() {
        let json = r#"{
            "type": "Link"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert_eq!(l.r#type, Some("Link".to_string()));
                assert!(l.href.is_none());
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_link_href_only() {
        let json = r#"{
            "href": "http://example.org/page"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert!(l.r#type.is_none());
                assert_eq!(l.href, Some("http://example.org/page".to_string()));
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_empty_link() {
        let json = r#"{}"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        assert!(link.is_ok());
        let l = link.unwrap();
        assert!(l.context.is_none());
        assert!(l.r#type.is_none());
        assert!(l.href.is_none());
        assert!(l.rel.is_none());
        assert!(l.media_type.is_none());
        assert!(l.name.is_none());
    }

    #[test]
    fn deserialize_link_with_single_context() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Link",
            "href": "http://example.org/abc"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert!(l.context.is_some());
                if let Some(ctx) = &l.context {
                    if let SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(ref s)) = **ctx {
                        assert_eq!(s, "https://www.w3.org/ns/activitystreams");
                    } else {
                        panic!("Expected single string context");
                    }
                }
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_link_with_multiple_contexts() {
        let json = r#"{
            "@context": [
                "https://www.w3.org/ns/activitystreams",
                "https://w3id.org/security/v1"
            ],
            "type": "Link",
            "href": "http://example.org/abc"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert!(l.context.is_some());
                if let Some(ref ctx) = l.context {
                    match **ctx {
                        SingleOrMultiple::Multiple(ref ctxs) => {
                            assert_eq!(ctxs.len(), 2);
                            if let ObjectOrLinkOrStringUrl::Str(ref s0) = ctxs[0] {
                                assert_eq!(s0, "https://www.w3.org/ns/activitystreams");
                            } else {
                                panic!("Expected string context");
                            }
                            if let ObjectOrLinkOrStringUrl::Str(ref s1) = ctxs[1] {
                                assert_eq!(s1, "https://w3id.org/security/v1");
                            } else {
                                panic!("Expected string context");
                            }
                        }
                        _ => panic!("Expected multiple contexts"),
                    }
                }
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_link_with_rel() {
        let json = r#"{
            "type": "Link",
            "href": "http://example.org/abc",
            "rel": "canonical"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert!(l.rel.is_some());
                if let Some(SingleOrMultiple::Single(ref rel)) = l.rel {
                    assert_eq!(rel, "canonical");
                } else {
                    panic!("Expected single rel value");
                }
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_link_with_multiple_rel() {
        let json = r#"{
            "type": "Link",
            "href": "http://example.org/abc",
            "hreflang": "en",
            "mediaType": "text/html",
            "name": "Preview",
            "rel": ["canonical", "preview"]
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert!(l.rel.is_some());
                if let Some(SingleOrMultiple::Multiple(ref rels)) = l.rel {
                    assert_eq!(rels.len(), 2);
                    assert_eq!(rels[0], "canonical");
                    assert_eq!(rels[1], "preview");
                } else {
                    panic!("Expected multiple rel values");
                }
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_link_with_media_type() {
        let json = r#"{
            "type": "Link",
            "href": "http://example.org/abc",
            "mediaType": "text/html"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert_eq!(l.media_type, Some("text/html".to_string()));
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_link_with_name() {
        let json = r#"{
            "type": "Link",
            "href": "http://example.org/abc",
            "name": "An example link"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert_eq!(l.name, Some("An example link".to_string()));
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_link_with_all_properties() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Link",
            "href": "http://example.org/abc",
            "hreflang": "en",
            "mediaType": "text/html",
            "name": "An example link",
            "rel": ["canonical", "preview"]
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert!(l.context.is_some());
                assert_eq!(l.r#type, Some("Link".to_string()));
                assert_eq!(l.href, Some("http://example.org/abc".to_string()));
                assert_eq!(l.media_type, Some("text/html".to_string()));
                assert_eq!(l.name, Some("An example link".to_string()));
                assert!(l.rel.is_some());
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_mention_link() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "summary": "Mention of Joe by Carrie in her note",
            "type": "Mention",
            "href": "http://example.org/joe",
            "name": "Joe"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert_eq!(l.r#type, Some("Mention".to_string()));
                assert_eq!(l.href, Some("http://example.org/joe".to_string()));
                assert_eq!(l.name, Some("Joe".to_string()));
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_link_from_activitypub_spec_example() {
        let json = r#"{
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Link",
            "href": "http://example.org/abc",
            "hreflang": "en",
            "mediaType": "text/html",
            "name": "An example link"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert_eq!(l.r#type, Some("Link".to_string()));
                assert_eq!(l.href, Some("http://example.org/abc".to_string()));
                if let Some(ref ctx) = l.context {
                    if let SingleOrMultiple::Single(ObjectOrLinkOrStringUrl::Str(ref s)) = **ctx {
                        assert_eq!(s, "https://www.w3.org/ns/activitystreams");
                    } else {
                        panic!("Expected single string context");
                    }
                }
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }

    #[test]
    fn deserialize_link_with_unknown_properties() {
        let json = r#"{
            "type": "Link",
            "href": "http://example.org/abc",
            "unknownProperty": "should be ignored",
            "anotherUnknown": 123
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        assert!(link.is_ok());
        let l = link.unwrap();
        assert_eq!(l.href, Some("http://example.org/abc".to_string()));
    }

    #[test]
    fn deserialize_link_with_different_type() {
        let json = r#"{
            "type": "CustomLinkType",
            "href": "http://example.org/custom"
        }"#;
        let link: Result<Link, _> = serde_json::from_str(json);
        match &link {
            Ok(l) => {
                assert_eq!(l.r#type, Some("CustomLinkType".to_string()));
                assert_eq!(l.href, Some("http://example.org/custom".to_string()));
            }
            Err(e) => panic!("Failure: {}", e),
        }
    }
}
