from sqlalchemy.orm import Session

from app.services.audit_service import log_action
from app.services.security_service import log_security_event

from app.database.models import User, Role

from app.auth.hashing import (
    hash_password,
    verify_password
)

from app.auth.jwt_handler import create_access_token


def register_user(
    username: str,
    email: str,
    password: str,
    role: str,
    db: Session
):

    existing_user = db.query(User).filter(
        User.username == username
    ).first()

    if existing_user:
        return {
            "message": "Username already exists"
        }

    existing_email = db.query(User).filter(
        User.email == email
    ).first()

    if existing_email:
        return {
            "message": "Email already exists"
        }

    selected_role = db.query(Role).filter(
        Role.role_name == role
    ).first()

    if not selected_role:
        return {
            "message": "Invalid role selected"
        }

    new_user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role_id=selected_role.id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_action(
        username=username,
        action="REGISTER",
        db=db
    )

    return {
        "message": "User registered successfully"
    }


def login_user(
    username: str,
    password: str,
    db: Session
):

    user = db.query(User).filter(
        User.username == username
    ).first()

    # Invalid Username
    if not user:

        log_security_event(
            event_type="FAILED_LOGIN",
            severity="HIGH",
            description=f"Invalid username: {username}",
            db=db
        )

        return {
            "message": "Invalid username"
        }

    # Account Locked Check
    if user.is_locked == 1:

        log_security_event(
            event_type="ACCOUNT_LOCKED",
            severity="CRITICAL",
            description=f"Locked account access attempt: {username}",
            db=db
        )

        return {
            "message": "Account Locked"
        }

    # Wrong Password
    if not verify_password(
        password,
        user.password_hash
    ):

        user.failed_attempts += 1

        if user.failed_attempts >= 5:

            user.is_locked = 1

            log_security_event(
                event_type="ACCOUNT_LOCKED",
                severity="CRITICAL",
                description=f"User locked: {username}",
                db=db
            )

        log_security_event(
            event_type="FAILED_LOGIN",
            severity="HIGH",
            description=f"Wrong password for user: {username}",
            db=db
        )

        db.commit()

        return {
            "message": "Invalid password"
        }

    # Successful Login
    user.failed_attempts = 0

    db.commit()

    token = create_access_token(
        {
            "sub": user.username,
            "role": user.role.role_name
        }
    )

    log_action(
        username=username,
        action="LOGIN",
        db=db
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role.role_name
    }