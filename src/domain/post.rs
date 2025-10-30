#[derive(Debug, Clone)]
pub struct Post {
    pub id: String,
    pub content: String,
    pub published: String,
    pub author_id: String,
    pub to: Vec<String>,
}

impl Post {
    pub fn new(
        id: String,
        content: String,
        published: String,
        author_id: String,
        to: Vec<String>,
    ) -> Self {
        Self {
            id,
            content,
            published,
            author_id,
            to,
        }
    }
}

pub trait PostRepository {
    fn save(&self, username: &str, post: Post);
    fn find_by_username(&self, username: &str) -> Vec<Post>;
    fn find_by_id(&self, username: &str, post_id: &str) -> Option<Post>;
}
