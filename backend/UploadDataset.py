import json
import requests

# Your API endpoint
URL = "http://localhost:5000/api/sensor"

# Load generated dataset
with open("sensor_data.json", "r") as f:
    data = json.load(f)

# Send each record
for record in data:
    response = requests.post(URL, json=record)
    
    if response.status_code == 200 or response.status_code == 201:
        print(f"Inserted: {record['animalId']}")
    else:
        print(f"Error: {response.text}")

print("Upload complete")