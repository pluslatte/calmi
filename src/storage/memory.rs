use crate::domain::{post::*, user::*};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct MemoryStorage {
    users: Arc<Mutex<HashMap<String, User>>>,
    posts: Arc<Mutex<HashMap<String, Vec<Post>>>>,
}

impl MemoryStorage {
    pub fn new() -> Self {
        let mut users = HashMap::new();

        users.insert(
            "alice".to_string(),
            User::new(
                "alice".to_string(),
                "Alice".to_string(),
                "Hello! I'm Alice.".to_string(),
            ),
        );
        users.insert(
            "bob".to_string(),
            User::new(
                "bob".to_string(),
                "Bob".to_string(),
                "Bob here, nice to meet you.".to_string(),
            ),
        );
        users.insert(
            "carol".to_string(),
            User::new(
                "carol".to_string(),
                "Carol".to_string(),
                "Carol's account.".to_string(),
            ),
        );

        Self {
            users: Arc::new(Mutex::new(users)),
            posts: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl UserRepository for MemoryStorage {
    fn find_by_username(&self, username: &str) -> Option<User> {
        let users = self.users.lock().unwrap();
        users.get(username).cloned()
    }

    fn exists(&self, username: &str) -> bool {
        let users = self.users.lock().unwrap();
        users.contains_key(username)
    }
}

impl PostRepository for MemoryStorage {
    fn save(&self, username: &str, post: Post) {
        let mut posts = self.posts.lock().unwrap();
        posts.entry(username.to_string()).or_default().push(post);
    }

    fn find_by_username(&self, username: &str) -> Vec<Post> {
        let posts = self.posts.lock().unwrap();
        posts.get(username).cloned().unwrap_or_default()
    }

    fn find_by_id(&self, username: &str, post_id: &str) -> Option<Post> {
        let posts = self.posts.lock().unwrap();
        posts
            .get(username)?
            .iter()
            .find(|post| post.id == post_id)
            .cloned()
    }
}

impl Default for MemoryStorage {
    fn default() -> Self {
        Self::new()
    }
}
