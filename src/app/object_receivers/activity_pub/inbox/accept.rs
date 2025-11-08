use calmi_activity_streams::types::object::accept::Accept;

use crate::app::object_receivers::activity_pub::inbox::types::ActivityHandlerError;

pub async fn handle_accept(
    _accept: Accept,
    _target_username: &str,
) -> Result<(), ActivityHandlerError> {
    Ok(())
}
