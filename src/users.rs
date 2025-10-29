use crate::types::Note;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

pub struct UserInfo {
    pub username: String,
    pub name: String,
    pub summary: String,
}

pub type PostStore = Arc<Mutex<HashMap<String, Vec<Note>>>>;

pub fn create_post_store() -> PostStore {
    Arc::new(Mutex::new(HashMap::new()))
}

pub fn user_exists(username: &str) -> bool {
    matches!(username, "alice" | "bob" | "carol")
}

pub fn get_user_info(username: &str) -> Option<UserInfo> {
    match username {
        "alice" => Some(UserInfo {
            username: "alice".to_string(),
            name: "Alice".to_string(),
            summary: "Hello! I'm Alice.".to_string(),
        }),
        "bob" => Some(UserInfo {
            username: "bob".to_string(),
            name: "Bob".to_string(),
            summary: "Bob here, nice to meet you.".to_string(),
        }),
        "carol" => Some(UserInfo {
            username: "carol".to_string(),
            name: "Carol".to_string(),
            summary: "Carol's account.".to_string(),
        }),
        _ => None,
    }
}

pub fn add_post(store: &PostStore, username: &str, note: Note) {
    let mut posts = store.lock().unwrap();
    posts
        .entry(username.to_string())
        .or_insert_with(Vec::new)
        .push(note);
}

pub fn get_posts(store: &PostStore, username: &str) -> Vec<Note> {
    let posts = store.lock().unwrap();
    posts.get(username).cloned().unwrap_or_default()
}

pub fn get_post_by_id(store: &PostStore, username: &str, post_id: &str) -> Option<Note> {
    let posts = store.lock().unwrap();
    posts
        .get(username)?
        .iter()
        .find(|note| note.id == post_id)
        .cloned()
}
