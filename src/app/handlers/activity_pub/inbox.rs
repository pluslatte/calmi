use crate::app::object_receivers;
use crate::app::state::AppState;
use crate::app::types::InboxActivity;
use crate::domain::repositories::{
    FollowRepository, NoteAnnounceRepository, NoteLikeRepository, NoteRepository, UserRepository,
};
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

pub async fn post(
    Path(username): Path<String>,
    State(state): State<AppState>,
    Json(activity): Json<InboxActivity>,
) -> Result<StatusCode, StatusCode> {
    let storage = &state.storage;
    let user_repository: &dyn UserRepository = storage;
    let note_repository: &dyn NoteRepository = storage;
    let follow_repository: &dyn FollowRepository = storage;
    let like_repository: &dyn NoteLikeRepository = storage;
    let announce_repository: &dyn NoteAnnounceRepository = storage;

    let inbox_owner = user_repository
        .find_by_username(&username)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    println!("Received activity for {}: {:?}", username, activity);

    let base_url = state.config.base_url.clone();

    match activity {
        InboxActivity::Follow(follow) => {
            match object_receivers::activity_pub::inbox::handle_follow(follow, &base_url, &username)
                .await
            {
                Ok(data) => {
                    if data.followee_username != username {
                        eprintln!(
                            "Follow target mismatch: expected {}, received {}",
                            username, data.followee_username
                        );
                        return Err(StatusCode::BAD_REQUEST);
                    }

                    if let Err(err) = follow_repository
                        .add_follow(
                            inbox_owner.id,
                            &data.follower_id,
                            data.activity_id.as_deref(),
                        )
                        .await
                    {
                        eprintln!("Failed to persist follow: {}", err);
                        return Err(StatusCode::INTERNAL_SERVER_ERROR);
                    }

                    println!(
                        "Follow recorded: {} now follows {}",
                        data.follower_id, data.followee_username
                    );
                    Ok(StatusCode::ACCEPTED)
                }
                Err(e) => {
                    eprintln!("Failed to handle Follow activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
        InboxActivity::Like(like) => {
            match object_receivers::activity_pub::inbox::handle_like(like, &base_url).await {
                Ok(data) => {
                    if data.target.author_username != username {
                        eprintln!(
                            "Like target mismatch: expected {}, received {}",
                            username, data.target.author_username
                        );
                        return Err(StatusCode::BAD_REQUEST);
                    }

                    let note = match note_repository
                        .find_by_id(data.target.note_id)
                        .await
                        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
                    {
                        Some(note) => note,
                        None => {
                            eprintln!("Received Like for unknown note id {}", data.target.note_id);
                            return Ok(StatusCode::ACCEPTED);
                        }
                    };

                    if note.author_id != inbox_owner.id {
                        eprintln!(
                            "Like target note author mismatch: expected {}, found id {}",
                            inbox_owner.id, note.author_id
                        );
                        return Err(StatusCode::BAD_REQUEST);
                    }

                    if let Err(err) = like_repository
                        .add_like(note.id, &data.actor_id, data.activity_id.as_deref())
                        .await
                    {
                        eprintln!("Failed to persist like: {}", err);
                        return Err(StatusCode::INTERNAL_SERVER_ERROR);
                    }

                    println!("Like recorded: {} liked note {}", data.actor_id, note.id);
                    Ok(StatusCode::ACCEPTED)
                }
                Err(e) => {
                    eprintln!("Failed to handle Like activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
        InboxActivity::Announce(announce) => {
            match object_receivers::activity_pub::inbox::handle_announce(announce, &base_url).await
            {
                Ok(data) => {
                    if data.target.author_username != username {
                        eprintln!(
                            "Announce target mismatch: expected {}, received {}",
                            username, data.target.author_username
                        );
                        return Err(StatusCode::BAD_REQUEST);
                    }

                    let note = match note_repository
                        .find_by_id(data.target.note_id)
                        .await
                        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
                    {
                        Some(note) => note,
                        None => {
                            eprintln!(
                                "Received Announce for unknown note id {}",
                                data.target.note_id
                            );
                            return Ok(StatusCode::ACCEPTED);
                        }
                    };

                    if note.author_id != inbox_owner.id {
                        eprintln!(
                            "Announce target note author mismatch: expected {}, found {}",
                            inbox_owner.id, note.author_id
                        );
                        return Err(StatusCode::BAD_REQUEST);
                    }

                    if let Err(err) = announce_repository
                        .add_announce(note.id, &data.actor_id, data.activity_id.as_deref())
                        .await
                    {
                        eprintln!("Failed to persist announce: {}", err);
                        return Err(StatusCode::INTERNAL_SERVER_ERROR);
                    }

                    println!(
                        "Announce recorded: {} boosted note {}",
                        data.actor_id, note.id
                    );
                    Ok(StatusCode::ACCEPTED)
                }
                Err(e) => {
                    eprintln!("Failed to handle Announce activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
        InboxActivity::Undo(undo) => {
            match object_receivers::activity_pub::inbox::handle_undo(undo, &base_url, &username)
                .await
            {
                Ok(data) => {
                    use object_receivers::activity_pub::inbox::UndoActivityData;

                    match data {
                        UndoActivityData::Follow(follow_data) => {
                            if follow_data.followee_username != username {
                                eprintln!(
                                    "Undo Follow target mismatch: expected {}, received {}",
                                    username, follow_data.followee_username
                                );
                                return Err(StatusCode::BAD_REQUEST);
                            }

                            let mut removed = 0;
                            if let Some(activity_id) = follow_data.activity_id.as_deref() {
                                removed = follow_repository
                                    .remove_follow_by_activity_id(activity_id)
                                    .await
                                    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                            }

                            if removed == 0 {
                                follow_repository
                                    .remove_follow(inbox_owner.id, &follow_data.follower_id)
                                    .await
                                    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                            }

                            println!(
                                "Undo Follow processed for actor {}",
                                follow_data.follower_id
                            );
                        }
                        UndoActivityData::Like(like_data) => {
                            if like_data.target.author_username != username {
                                eprintln!(
                                    "Undo Like target mismatch: expected {}, received {}",
                                    username, like_data.target.author_username
                                );
                                return Err(StatusCode::BAD_REQUEST);
                            }

                            if let Some(note) = note_repository
                                .find_by_id(like_data.target.note_id)
                                .await
                                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
                            {
                                if note.author_id != inbox_owner.id {
                                    eprintln!(
                                        "Undo Like note author mismatch: expected {}, found {}",
                                        inbox_owner.id, note.author_id
                                    );
                                    return Err(StatusCode::BAD_REQUEST);
                                }

                                let mut removed = 0;
                                if let Some(activity_id) = like_data.activity_id.as_deref() {
                                    removed = like_repository
                                        .remove_like_by_activity_id(activity_id)
                                        .await
                                        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                                }

                                if removed == 0 {
                                    like_repository
                                        .remove_like(note.id, &like_data.actor_id)
                                        .await
                                        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                                }
                            } else {
                                eprintln!(
                                    "Undo Like references unknown note {}",
                                    like_data.target.note_id
                                );
                            }
                        }
                        UndoActivityData::Announce(announce_data) => {
                            if announce_data.target.author_username != username {
                                eprintln!(
                                    "Undo Announce target mismatch: expected {}, received {}",
                                    username, announce_data.target.author_username
                                );
                                return Err(StatusCode::BAD_REQUEST);
                            }

                            if let Some(note) = note_repository
                                .find_by_id(announce_data.target.note_id)
                                .await
                                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
                            {
                                if note.author_id != inbox_owner.id {
                                    eprintln!(
                                        "Undo Announce note author mismatch: expected {}, found {}",
                                        inbox_owner.id, note.author_id
                                    );
                                    return Err(StatusCode::BAD_REQUEST);
                                }

                                let mut removed = 0;
                                if let Some(activity_id) = announce_data.activity_id.as_deref() {
                                    removed = announce_repository
                                        .remove_announce_by_activity_id(activity_id)
                                        .await
                                        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                                }

                                if removed == 0 {
                                    announce_repository
                                        .remove_announce(note.id, &announce_data.actor_id)
                                        .await
                                        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                                }
                            } else {
                                eprintln!(
                                    "Undo Announce references unknown note {}",
                                    announce_data.target.note_id
                                );
                            }
                        }
                        UndoActivityData::ActivityIdOnly {
                            actor_id,
                            activity_id,
                        } => {
                            let mut removed_total = 0;
                            removed_total += follow_repository
                                .remove_follow_by_activity_id(&activity_id)
                                .await
                                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                            removed_total += like_repository
                                .remove_like_by_activity_id(&activity_id)
                                .await
                                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                            removed_total += announce_repository
                                .remove_announce_by_activity_id(&activity_id)
                                .await
                                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

                            if removed_total == 0 {
                                eprintln!(
                                    "Undo ActivityIdOnly could not find local record for id {} from actor {}",
                                    activity_id, actor_id
                                );
                            }
                        }
                    }

                    Ok(StatusCode::ACCEPTED)
                }
                Err(e) => {
                    eprintln!("Failed to handle Undo activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
        InboxActivity::Create(create) => {
            match object_receivers::activity_pub::inbox::handle_create(create, &username).await {
                Ok(data) => {
                    println!(
                        "Create activity: actor={}, object_type={}, object_id={:?}, activity_id={:?}",
                        data.actor_id, data.object_type, data.object_id, data.activity_id
                    );
                    Ok(StatusCode::ACCEPTED)
                }
                Err(e) => {
                    eprintln!("Failed to handle Create activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
        InboxActivity::Accept(accept) => {
            match object_receivers::activity_pub::inbox::handle_accept(accept, &username).await {
                Ok(_) => {
                    println!("Accept activity processed");
                    Ok(StatusCode::ACCEPTED)
                }
                Err(e) => {
                    eprintln!("Failed to handle Accept activity: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        }
    }
}
