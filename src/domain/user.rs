#[derive(Debug, Clone)]
pub struct User {
    pub username: String,
    pub name: String,
}

impl User {
    pub fn new(username: String, name: String) -> Self {
        Self { username, name }
    }
}

pub trait UserRepository {
    fn find_by_username(&self, username: &str) -> Option<User>;
    fn exists(&self, username: &str) -> bool;
}
