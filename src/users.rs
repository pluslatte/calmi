pub struct UserInfo {
    pub username: String,
    pub name: String,
    pub summary: String,
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
