import requests
import json

BASE_URL = "http://localhost:5000/api/animals"

# More realistic + schema-aligned data
animals = [
    {
        "name": "Dog 1",
        "species": "Dog",
        "breed": "Labrador",
        "age": 3,
        "weight": 22,
        "location": {"lat": 12.9716, "lng": 77.5946}
    },
    {
        "name": "Dog 2",
        "species": "Dog",
        "breed": "German Shepherd",
        "age": 5,
        "weight": 30,
        "location": {"lat": 12.9720, "lng": 77.5950}
    },
    {
        "name": "Cat 1",
        "species": "Cat",
        "breed": "Persian",
        "age": 2,
        "weight": 4,
        "location": {"lat": 12.9700, "lng": 77.5930}
    },
    {
        "name": "Cat 2",
        "species": "Cat",
        "breed": "Siamese",
        "age": 4,
        "weight": 5,
        "location": {"lat": 12.9695, "lng": 77.5925}
    }
]

created_animals = []

print("🚀 Seeding animals...\n")

for animal in animals:
    try:
        response = requests.post(BASE_URL, json=animal)

        if response.status_code in [200, 201]:
            data = response.json()

            print(f"✅ Created: {data.get('name')} | ID: {data.get('_id')}")

            created_animals.append({
                "name": data.get("name"),
                "id": data.get("_id")
            })
        else:
            print(f"❌ Failed ({animal['name']}): {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"⚠️ Error for {animal['name']}: {e}")

# Save IDs for sensor simulation
with open("animal_ids.json", "w") as f:
    json.dump(created_animals, f, indent=2)

print("\n📁 Saved animal IDs to animal_ids.json")

# Also create quick lookup mapping (VERY USEFUL)
mapping = {a["name"].lower().replace(" ", "_"): a["id"] for a in created_animals}

with open("animal_mapping.json", "w") as f:
    json.dump(mapping, f, indent=2)

print("📁 Saved mapping to animal_mapping.json")