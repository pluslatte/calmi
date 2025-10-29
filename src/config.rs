#[derive(Clone)]
pub struct Config {
    pub domain: String,
    pub base_url: String,
}

impl Config {
    pub fn new(domain: String) -> Self {
        let base_url = format!("https://{}", domain);
        Self { domain, base_url }
    }
}

impl Default for Config {
    fn default() -> Self {
        Self::new("example.com".to_string())
    }
}
