import json
from pathlib import Path

import requests

BASE_URL = "http://localhost:5000/api/sensor"
FILE_PATH = Path(__file__).resolve().parents[1] / "data" / "sensor_data.json"

MAX_RETRIES = 3
TIMEOUT = 5

print("Loading dataset...")

with open(FILE_PATH, "r") as f:
    data = json.load(f)

total = len(data)
print(f"Loaded {total} records\n")

success = 0
fail = 0

print("Uploading to backend...\n")

for i, record in enumerate(data, start=1):
    retries = 0

    while retries < MAX_RETRIES:
        try:
            response = requests.post(BASE_URL, json=record, timeout=TIMEOUT)

            if response.status_code in [200, 201]:
                success += 1
                print(f"[{i}/{total}] Uploaded")
                break

            retries += 1
            print(f"[{i}] Retry {retries} - Status: {response.status_code}")

        except requests.exceptions.RequestException as error:
            retries += 1
            print(f"[{i}] Retry {retries} - Error: {error}")

    if retries == MAX_RETRIES:
        fail += 1
        print(f"[{i}] Failed after {MAX_RETRIES} retries\n")

print("\nUpload Summary:")
print(f"Success: {success}")
print(f"Failed: {fail}")
