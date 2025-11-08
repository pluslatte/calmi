use std::fmt;
pub struct ActivityHandlerError(pub String);
impl fmt::Display for ActivityHandlerError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

pub struct FollowActivityData {
    pub follower_id: String,
    pub followee_username: String,
    pub activity_id: String,
}

pub struct UndoFollowActivityData {
    pub follower_id: String,
    pub followee_username: String,
    pub activity_id: Option<String>,
}

pub struct CreateActivityData {
    pub actor_id: String,
    pub object_type: String,
    pub object_id: Option<String>,
    pub activity_id: Option<String>,
}

pub struct NoteReference {
    pub author_username: String,
    pub note_id: i64,
}

pub struct LikeActivityData {
    pub actor_id: String,
    pub target: NoteReference,
    pub activity_id: String,
}

pub struct AnnounceActivityData {
    pub actor_id: String,
    pub target: NoteReference,
    pub activity_id: String,
}

pub struct UndoLikeActivityData {
    pub actor_id: String,
    pub target: NoteReference,
    pub activity_id: Option<String>,
}

pub struct UndoAnnounceActivityData {
    pub actor_id: String,
    pub target: NoteReference,
    pub activity_id: Option<String>,
}

pub enum UndoActivityData {
    Follow(UndoFollowActivityData),
    Like(UndoLikeActivityData),
    Announce(UndoAnnounceActivityData),
    ActivityIdOnly {
        actor_id: String,
        activity_id: String,
    },
}
