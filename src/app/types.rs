use calmi_activity_streams::types::object::accept::Accept;
use calmi_activity_streams::types::object::announce::Announce;
use calmi_activity_streams::types::object::create::Create;
use calmi_activity_streams::types::object::follow::Follow;
use calmi_activity_streams::types::object::like::Like;
use calmi_activity_streams::types::object::undo::Undo;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum InboxActivity {
    Follow(Follow),
    Accept(Accept),
    Undo(Undo),
    Create(Create),
    Like(Like),
    Announce(Announce),
}
