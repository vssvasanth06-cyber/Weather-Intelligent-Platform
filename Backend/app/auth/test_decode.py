from jose import jwt

token = input("Paste JWT Token: ")

SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"

payload = jwt.decode(
    token,
    SECRET_KEY,
    algorithms=[ALGORITHM]
)

print(payload)