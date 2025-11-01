#![allow(dead_code)]
use crate::activitypub::types::enums::{
    LinkOrStringUrl, ObjectOrLinkOrStringUrl, ObjectOrStringUrl, SingleOrMultiple,
};
/// https://www.w3.org/TR/activitystreams-vocabulary/#properties
/// ActivityStreams 2.0 Properties
use serde::{Deserialize, Serialize};

/// Provides the globally unique identifier for an Object or Link
/// URI: @id
/// Domain: Object | Link
/// Range: anyURI
/// Functional: True
pub type Id = String;

/// Identifies the Object or Link type. Multiple values may be specified.
/// URI: @type
/// Domain: Object | Link
/// Range: anyURI
pub type Type = String;

/// Describes one or more entities that either performed or are expected to perform the activity.
/// URI: https://www.w3.org/ns/activitystreams#actor
/// Domain: Activity
/// Range: Object | Link
/// Subproperty Of: attributedTo
pub type Actor = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies a resource attached or related to an object that potentially requires special handling.
/// URI: https://www.w3.org/ns/activitystreams#attachment
/// Domain: Object
/// Range: Object | Link
pub type Attachment = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies one or more entities to which this object is attributed.
/// URI: https://www.w3.org/ns/activitystreams#attributedTo
/// Domain: Link | Object
/// Range: Link | Object
pub type AttributedTo = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies one or more entities that represent the total population of entities for which the object can considered to be relevant.
/// URI: https://www.w3.org/ns/activitystreams#audience
/// Domain: Object
/// Range: Object | Link
pub type Audience = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies one or more Objects that are part of the private secondary audience of this Object.
/// URI: https://www.w3.org/ns/activitystreams#bcc
/// Domain: Object
/// Range: Object | Link
pub type Bcc = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies an Object that is part of the private primary audience of this Object.
/// URI: https://www.w3.org/ns/activitystreams#bto
/// Domain: Object
/// Range: Object | Link
pub type Bto = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies an Object that is part of the public secondary audience of this Object.
/// URI: https://www.w3.org/ns/activitystreams#cc
/// Domain: Object
/// Range: Object | Link
pub type Cc = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies the context within which the object exists or an activity was performed.
/// URI: https://www.w3.org/ns/activitystreams#context
/// Domain: Object
/// Range: Object | Link
pub type Context = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// In a paged Collection, indicates the page that contains the most recently updated member items.
/// URI: https://www.w3.org/ns/activitystreams#current
/// Domain: Collection
/// Range: CollectionPage | Link
/// Functional: True
pub type Current = LinkOrStringUrl;

/// In a paged Collection, indicates the furthest preceeding page of items in the collection.
/// URI: https://www.w3.org/ns/activitystreams#first
/// Domain: Collection
/// Range: CollectionPage | Link
/// Functional: True
pub type First = LinkOrStringUrl;

/// Identifies the entity (e.g. an application) that generated the object.
/// URI: https://www.w3.org/ns/activitystreams#generator
/// Domain: Object
/// Range: Object | Link
pub type Generator = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Indicates an entity that describes an icon for this object.
/// URI: https://www.w3.org/ns/activitystreams#icon
/// Domain: Object
/// Range: Image | Link
pub type Icon = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Indicates an entity that describes an image for this object.
/// URI: https://www.w3.org/ns/activitystreams#image
/// Domain: Object
/// Range: Image | Link
pub type Image = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Indicates one or more entities for which this object is considered a response.
/// URI: https://www.w3.org/ns/activitystreams#inReplyTo
/// Domain: Object
/// Range: Object | Link
pub type InReplyTo = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies one or more objects used (or to be used) in the completion of an Activity.
/// URI: https://www.w3.org/ns/activitystreams#instrument
/// Domain: Activity
/// Range: Object | Link
pub type Instrument = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// In a paged Collection, indicates the furthest proceeding page of the collection.
/// URI: https://www.w3.org/ns/activitystreams#last
/// Domain: Collection
/// Range: CollectionPage | Link
/// Functional: True
pub type Last = LinkOrStringUrl;

/// Indicates one or more physical or logical locations associated with the object.
/// URI: https://www.w3.org/ns/activitystreams#location
/// Domain: Object
/// Range: Object | Link
pub type Location = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies the items contained in a collection.
/// URI: https://www.w3.org/ns/activitystreams#items
/// Domain: Collection
/// Range: Object | Link | Ordered List of [Object | Link]
pub type Items = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies the items contained in an ordered collection.
pub type OrderedItems = Vec<ObjectOrLinkOrStringUrl>;

/// Identifies an exclusive option for a Question.
/// URI: https://www.w3.org/ns/activitystreams#oneOf
/// Domain: Question
/// Range: Object | Link
pub type OneOf = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies an inclusive option for a Question.
/// URI: https://www.w3.org/ns/activitystreams#anyOf
/// Domain: Question
/// Range: Object | Link
pub type AnyOf = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Indicates that a question has been closed, and answers are no longer accepted.
/// URI: https://www.w3.org/ns/activitystreams#closed
/// Domain: Question
/// Range: Object | Link | xsd:dateTime | xsd:boolean
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum Closed {
    Object(ObjectOrLinkOrStringUrl),
    DateTime(String),
    Boolean(bool),
}

/// Describes an indirect object of the activity from which the activity is directed.
/// URI: https://www.w3.org/ns/activitystreams#origin
/// Domain: Activity
/// Range: Object | Link
pub type Origin = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// In a paged Collection, indicates the next page of items.
/// URI: https://www.w3.org/ns/activitystreams#next
/// Domain: CollectionPage
/// Range: CollectionPage | Link
/// Functional: True
pub type Next = LinkOrStringUrl;

/// When used within an Activity, describes the direct object of the activity.
/// URI: https://www.w3.org/ns/activitystreams#object
/// Domain: Activity | Relationship
/// Range: Object | Link
pub type ObjectProperty = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// In a paged Collection, identifies the previous page of items.
/// URI: https://www.w3.org/ns/activitystreams#prev
/// Domain: CollectionPage
/// Range: CollectionPage | Link
/// Functional: True
pub type Prev = LinkOrStringUrl;

/// Identifies an entity that provides a preview of this object.
/// URI: https://www.w3.org/ns/activitystreams#preview
/// Domain: Link | Object
/// Range: Link | Object
pub type Preview = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Describes the result of the activity.
/// URI: https://www.w3.org/ns/activitystreams#result
/// Domain: Activity
/// Range: Object | Link
pub type Result = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies a Collection containing objects considered to be responses to this object.
/// URI: https://www.w3.org/ns/activitystreams#replies
/// Domain: Object
/// Range: Collection
/// Functional: True
pub type Replies = ObjectOrStringUrl;

/// One or more "tags" that have been associated with an objects.
/// URI: https://www.w3.org/ns/activitystreams#tag
/// Domain: Object
/// Range: Object | Link
pub type Tag = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Describes the indirect object, or target, of the activity.
/// URI: https://www.w3.org/ns/activitystreams#target
/// Domain: Activity
/// Range: Object | Link
pub type Target = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies an entity considered to be part of the public primary audience of an Object
/// URI: https://www.w3.org/ns/activitystreams#to
/// Domain: Object
/// Range: Object | Link
pub type To = SingleOrMultiple<ObjectOrLinkOrStringUrl>;

/// Identifies one or more links to representations of the object
/// URI: https://www.w3.org/ns/activitystreams#url
/// Domain: Object
/// Range: xsd:anyURI | Link
pub type Url = SingleOrMultiple<LinkOrStringUrl>;

/// Indicates the accuracy of position coordinates on a Place objects.
/// URI: https://www.w3.org/ns/activitystreams#accuracy
/// Domain: Place
/// Range: xsd:float [>= 0.0f, <= 100.0f]
/// Functional: True
pub type Accuracy = f32;

/// Indicates the altitude of a place.
/// URI: https://www.w3.org/ns/activitystreams#altitude
/// Domain: Object
/// Range: xsd:float
/// Functional: True
pub type Altitude = f32;

/// The content or textual representation of the Object encoded as a JSON string.
/// URI: https://www.w3.org/ns/activitystreams#content
/// Domain: Object
/// Range: xsd:string | rdf:langString
pub type Content = String;

/// A simple, human-readable, plain-text name for the object.
/// URI: https://www.w3.org/ns/activitystreams#name
/// Domain: Object | Link
/// Range: xsd:string | rdf:langString
pub type Name = String;

/// When the object describes a time-bound resource, the duration property indicates the object's approximate duration.
/// URI: https://www.w3.org/ns/activitystreams#duration
/// Domain: Object
/// Range: xsd:duration
/// Functional: True
pub type Duration = String;

/// On a Link, specifies a hint as to the rendering height in device-independent pixels of the linked resource.
/// URI: https://www.w3.org/ns/activitystreams#height
/// Domain: Link
/// Range: xsd:nonNegativeInteger
/// Functional: True
pub type Height = usize;

/// The target resource pointed to by a Link.
/// URI: https://www.w3.org/ns/activitystreams#href
/// Domain: Link
/// Range: xsd:anyURI
/// Functional: True
pub type Href = String;

/// Hints as to the language used by the target resource.
/// URI: https://www.w3.org/ns/activitystreams#hreflang
/// Domain: Link
/// Range: [BCP47] Language Tag
/// Functional: True
pub type Hreflang = String;

/// Identifies the Collection to which a CollectionPage objects items belong.
/// URI: https://www.w3.org/ns/activitystreams#partOf
/// Domain: CollectionPage
/// Range: Link | Collection
/// Functional: True
pub type PartOf = LinkOrStringUrl;

/// The latitude of a place
/// URI: https://www.w3.org/ns/activitystreams#latitude
/// Domain: Place
/// Range: xsd:float
/// Functional: True
pub type Latitude = f32;

/// The longitude of a place
/// URI: https://www.w3.org/ns/activitystreams#longitude
/// Domain: Place
/// Range: xsd:float
/// Functional: True
pub type Longitude = f32;

/// When used on a Link, identifies the MIME media type of the referenced resource.
/// URI: https://www.w3.org/ns/activitystreams#mediaType
/// Domain: Link | Object
/// Range: MIME Media Type
/// Functional: True
pub type MediaType = String;

/// The date and time describing the actual or expected ending time of the object.
/// URI: https://www.w3.org/ns/activitystreams#endTime
/// Domain: Object
/// Range: xsd:dateTime
/// Functional: True
pub type EndTime = String;

/// The date and time at which the object was published
/// URI: https://www.w3.org/ns/activitystreams#published
/// Domain: Object
/// Range: xsd:dateTime
/// Functional: True
pub type Published = String;

/// The date and time describing the actual or expected starting time of the object.
/// URI: https://www.w3.org/ns/activitystreams#startTime
/// Domain: Object
/// Range: xsd:dateTime
/// Functional: True
pub type StartTime = String;

/// The radius from the given latitude and longitude for a Place.
/// URI: https://www.w3.org/ns/activitystreams#radius
/// Domain: Place
/// Range: xsd:float [>= 0.0f]
/// Functional: True
pub type Radius = f32;

/// A link relation associated with a Link.
/// URI: https://www.w3.org/ns/activitystreams#rel
/// Domain: Link
/// Range: [RFC5988] or [HTML5] Link Relation
pub type Rel = SingleOrMultiple<String>;

/// A non-negative integer value identifying the relative position within the logical view of a strictly ordered collection.
/// URI: https://www.w3.org/ns/activitystreams#startIndex
/// Domain: OrderedCollectionPage
/// Range: xsd:nonNegativeInteger
/// Functional: True
pub type StartIndex = usize;

/// A natural language summarization of the object encoded as HTML.
/// URI: https://www.w3.org/ns/activitystreams#summary
/// Domain: Object
/// Range: xsd:string | rdf:langString
pub type Summary = String;

/// A non-negative integer specifying the total number of objects contained by the logical view of the collection.
/// URI: https://www.w3.org/ns/activitystreams#totalItems
/// Domain: Collection
/// Range: xsd:nonNegativeInteger
/// Functional: True
pub type TotalItems = usize;

/// Specifies the measurement units for the radius and altitude properties on a Place object.
/// URI: https://www.w3.org/ns/activitystreams#units
/// Domain: Place
/// Range: "cm" | "feet" | "inches" | "km" | "m" | "miles" | xsd:anyURI
/// Functional: True
pub type Units = String;

/// The date and time at which the object was updated
/// URI: https://www.w3.org/ns/activitystreams#updated
/// Domain: Object
/// Range: xsd:dateTime
/// Functional: True
pub type Updated = String;

/// On a Link, specifies a hint as to the rendering width in device-independent pixels of the linked resource.
/// URI: https://www.w3.org/ns/activitystreams#width
/// Domain: Link
/// Range: xsd:nonNegativeInteger
/// Functional: True
pub type Width = usize;

/// On a Relationship object, the subject property identifies one of the connected individuals.
/// URI: https://www.w3.org/ns/activitystreams#subject
/// Domain: Relationship
/// Range: Link | Object
/// Functional: True
pub type Subject = ObjectOrLinkOrStringUrl;

/// On a Relationship object, the relationship property identifies the kind of relationship that exists between subject and object.
/// URI: https://www.w3.org/ns/activitystreams#relationship
/// Domain: Relationship
/// Range: Object
pub type Relationship = SingleOrMultiple<ObjectOrStringUrl>;

/// On a Profile object, the describes property identifies the object described by the Profile.
/// URI: https://www.w3.org/ns/activitystreams#describes
/// Domain: Profile
/// Range: Object
/// Functional: True
pub type Describes = ObjectOrStringUrl;

/// On a Tombstone object, the formerType property identifies the type of the object that was deleted.
/// URI: https://www.w3.org/ns/activitystreams#formerType
/// Domain: Tombstone
/// Range: Object
/// Functional: False
pub type FormerType = SingleOrMultiple<String>;

/// On a Tombstone object, the deleted property is a timestamp for when the object was deleted.
/// URI: https://www.w3.org/ns/activitystreams#deleted
/// Domain: Tombstone
/// Range: xsd:dateTime
/// Functional: True
pub type Deleted = String;
