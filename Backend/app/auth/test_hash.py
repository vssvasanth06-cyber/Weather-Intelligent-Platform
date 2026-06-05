from app.auth.hashing import (
    hash_password,
    verify_password
)

password = "weather123"

hashed = hash_password(password)

print("Original:", password)
print("Hash:", hashed)

result = verify_password(
    password,
    hashed
)

print("Verified:", result)