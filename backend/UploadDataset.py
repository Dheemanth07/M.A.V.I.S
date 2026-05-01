import json
import requests
import time

BASE_URL = "http://localhost:5000/api/sensor"
FILE_PATH = "sensor_data.json"

MAX_RETRIES = 3
TIMEOUT = 5  # seconds

print("📂 Loading dataset...")

with open(FILE_PATH, "r") as f:
    data = json.load(f)

total = len(data)
print(f"📊 Loaded {total} records\n")

success = 0
fail = 0

print("🚀 Uploading to backend...\n")

for i, record in enumerate(data, start=1):
    retries = 0

    while retries < MAX_RETRIES:
        try:
            response = requests.post(BASE_URL, json=record, timeout=TIMEOUT)

            if response.status_code in [200, 201]:
                success += 1
                print(f"✅ [{i}/{total}] Uploaded")
                break
            else:
                retries += 1
                print(f"⚠️ [{i}] Retry {retries} - Status: {response.status_code}")

        except requests.exceptions.RequestException as e:
            retries += 1
            print(f"⚠️ [{i}] Retry {retries} - Error: {e}")

    if retries == MAX_RETRIES:
        fail += 1
        print(f"❌ [{i}] Failed after {MAX_RETRIES} retries\n")

    # Simulate real-time ingestion (optional)
    # time.sleep(0.1)

print("\n📊 Upload Summary:")
print(f"✅ Success: {success}")
print(f"❌ Failed: {fail}")