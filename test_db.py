import requests
import json
from pymongo import MongoClient

# Test registration
print("=" * 60)
print("TESTING REGISTRATION")
print("=" * 60)

response = requests.post('http://localhost:5000/api/auth/register', 
    json={'fullName': 'Bob Wilson', 'email': 'bob@test.com', 'password': 'Test1234!'})

print(f'Register Status Code: {response.status_code}')
user_data = response.json()
print("Backend Response:")
print(json.dumps(user_data, indent=2))

print("\n" + "=" * 60)
print("CHECKING MONGODB DATABASE")
print("=" * 60)

# Check MongoDB directly
client = MongoClient('mongodb://localhost:27017')
db = client['flight']

users = list(db.users.find({}, {'_id': 1, 'email': 1, 'name': 1}))
print(f'\nTotal users in database: {len(users)}\n')
for user in users:
    print(f'ID: {user["_id"]}')
    print(f'  Email: {user.get("email", "*** NO EMAIL FIELD ***")}')
    print(f'  Name: {user.get("name", "*** NO NAME FIELD ***")}')
    print()

print("=" * 60)
