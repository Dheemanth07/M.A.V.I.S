import json
from pathlib import Path

import requests

BASE_URL = "http://localhost:5000/api/animals"
DATA_DIR = Path(__file__).resolve().parents[1] / "data"
ANIMAL_IDS_PATH = DATA_DIR / "animal_ids.json"
ANIMAL_MAPPING_PATH = DATA_DIR / "animal_mapping.json"

animals = [
    {
        "name": "Dog 1",
        "species": "Dog",
        "breed": "Labrador",
        "age": 3,
        "weight": 22,
        "location": {"lat": 12.9716, "lng": 77.5946},
    },
    {
        "name": "Dog 2",
        "species": "Dog",
        "breed": "German Shepherd",
        "age": 5,
        "weight": 30,
        "location": {"lat": 12.9720, "lng": 77.5950},
    },
    {
        "name": "Cat 1",
        "species": "Cat",
        "breed": "Persian",
        "age": 2,
        "weight": 4,
        "location": {"lat": 12.9700, "lng": 77.5930},
    },
    {
        "name": "Cat 2",
        "species": "Cat",
        "breed": "Siamese",
        "age": 4,
        "weight": 5,
        "location": {"lat": 12.9695, "lng": 77.5925},
    },
]

created_animals = []

print("Seeding animals...\n")

for animal in animals:
    try:
        response = requests.post(BASE_URL, json=animal, timeout=10)

        if response.status_code in [200, 201]:
            response_body = response.json()
            animal_data = response_body.get("data", response_body)

            print(f"Created: {animal_data.get('name')} | ID: {animal_data.get('_id')}")

            created_animals.append({
                "name": animal_data.get("name"),
                "id": animal_data.get("_id"),
            })
        else:
            print(f"Failed ({animal['name']}): {response.status_code}")
            print(response.text)

    except requests.exceptions.RequestException as error:
        print(f"Error for {animal['name']}: {error}")

DATA_DIR.mkdir(exist_ok=True)
with open(ANIMAL_IDS_PATH, "w") as f:
    json.dump(created_animals, f, indent=2)

print(f"\nSaved animal IDs to {ANIMAL_IDS_PATH}")

mapping = {animal["name"].lower().replace(" ", "_"): animal["id"] for animal in created_animals}

with open(ANIMAL_MAPPING_PATH, "w") as f:
    json.dump(mapping, f, indent=2)

print(f"Saved mapping to {ANIMAL_MAPPING_PATH}")
