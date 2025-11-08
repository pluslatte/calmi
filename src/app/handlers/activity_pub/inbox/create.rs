use axum::http::StatusCode;
use calmi_activity_streams::types::enums::{
    ObjectBased, ObjectOrLinkOrStringUrl, SingleOrMultiple,
};
use calmi_activity_streams::types::object::create::Create;
use calmi_activity_streams::types::properties::{Actor, ObjectProperty};

pub async fn handle(create: Create, _username: &str) -> Result<StatusCode, StatusCode> {
    match parse_create_activity(&create) {
        Ok(data) => {
            println!(
                "Create activity: actor={}, object_type={}, object_id={:?}, activity_id={:?}",
                data.actor_id, data.object_type, data.object_id, data.activity_id
            );
            Ok(StatusCode::ACCEPTED)
        }
        Err(err) => {
            eprintln!("Failed to handle Create activity: {}", err);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}

struct CreateActivityData {
    actor_id: String,
    object_type: String,
    object_id: Option<String>,
    activity_id: Option<String>,
}

fn parse_create_activity(create: &Create) -> Result<CreateActivityData, String> {
    let actor = create
        .actor
        .as_ref()
        .ok_or_else(|| "Missing actor".to_string())?
        .as_ref();

    let actor_id = extract_actor_id(actor)?;

    let object = create
        .object
        .as_ref()
        .ok_or_else(|| "Missing object in Create activity".to_string())?;

    let (object_type, object_id) = extract_object_info(object.as_ref())?;
    let activity_id = create.id.clone();

    Ok(CreateActivityData {
        actor_id,
        object_type,
        object_id,
        activity_id,
    })
}

fn extract_actor_id(actor: &Actor) -> Result<String, String> {
    match actor {
        SingleOrMultiple::Single(value) => match value {
            ObjectOrLinkOrStringUrl::Str(id) => Ok(id.clone()),
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                ObjectBased::Person(person) => person
                    .id
                    .clone()
                    .ok_or_else(|| "Person has no id".to_string()),
                _ => Err("Unsupported actor object type".to_string()),
            },
            ObjectOrLinkOrStringUrl::Link(link) => link
                .href
                .clone()
                .ok_or_else(|| "Link has no href".to_string()),
        },
        SingleOrMultiple::Multiple(_) => Err("Multiple actors not supported".to_string()),
    }
}

fn extract_object_info(object: &ObjectProperty) -> Result<(String, Option<String>), String> {
    match object {
        SingleOrMultiple::Single(value) => match value {
            ObjectOrLinkOrStringUrl::Str(id) => Ok(("Unknown".to_string(), Some(id.clone()))),
            ObjectOrLinkOrStringUrl::Object(obj) => match obj {
                ObjectBased::Note(note) => Ok(("Note".to_string(), note.id.clone())),
                ObjectBased::Object(object) => Ok((
                    object
                        .r#type
                        .clone()
                        .unwrap_or_else(|| "Object".to_string()),
                    object.id.clone(),
                )),
                _ => Ok(("Unknown".to_string(), None)),
            },
            ObjectOrLinkOrStringUrl::Link(_link) => Ok(("Link".to_string(), None)),
        },
        SingleOrMultiple::Multiple(_) => Err("Multiple objects not supported".to_string()),
    }
}
