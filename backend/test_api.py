import requests
import json

url = "http://localhost:8000/chat"
headers = {"Content-Type": "application/json"}
data = {"message": "Hello! What is AI?"}

try:
    response = requests.post(url, headers=headers, json=data, timeout=60)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
