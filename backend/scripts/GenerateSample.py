import json
import random
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
ANIMAL_MAPPING_PATH = DATA_DIR / "animal_mapping.json"
SENSOR_DATA_PATH = DATA_DIR / "sensor_data.json"

with open(ANIMAL_MAPPING_PATH) as f:
    mapping = json.load(f)

animal_ids = list(mapping.values())

location = {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "zone": "farm_1",
}

start_time = datetime(2026, 4, 17, 10, 0, 0)
data = []

for animal in animal_ids:
    current_time = start_time

    for _ in range(20):
        is_abnormal = random.random() < 0.2

        if is_abnormal:
            physiology = {
                "temperature": round(random.uniform(39.5, 41.5), 1),
                "heartRate": random.randint(100, 140),
                "respiratoryRate": random.randint(30, 50),
                "bloodOxygen": random.randint(80, 90),
            }
            behavior = {
                "motion": False,
                "steps": random.randint(0, 20),
                "lyingDown": True,
            }
        else:
            physiology = {
                "temperature": round(random.uniform(37.5, 39.0), 1),
                "heartRate": random.randint(60, 100),
                "respiratoryRate": random.randint(15, 30),
                "bloodOxygen": random.randint(95, 100),
            }
            behavior = {
                "motion": True,
                "steps": random.randint(50, 300),
                "lyingDown": False,
            }

        data.append({
            "animalId": animal,
            "physiology": physiology,
            "behavior": behavior,
            "environment": {
                "ambientTemperature": random.randint(25, 40),
                "humidity": random.randint(40, 80),
                "aqi": random.randint(30, 150),
            },
            "location": location,
            "device": {
                "batteryLevel": random.randint(20, 100),
                "signalStrength": random.randint(-90, -50),
            },
            "timestamp": current_time.isoformat() + "Z",
        })

        current_time += timedelta(minutes=5)

    # Intentionally append 3 invalid payloads for negative testing
    if len(animal_ids) > 0:
        sample_animal_id = animal_ids[0]
        # 1. Missing animalId
        data.append({
            "physiology": {
                "temperature": 38.5,
                "heartRate": 80,
                "respiratoryRate": 20,
                "bloodOxygen": 98,
            },
            "behavior": {
                "motion": True,
            },
            "environment": {
                "ambientTemperature": 25,
                "humidity": 50,
                "aqi": 50,
            },
            "timestamp": start_time.isoformat() + "Z",
        })
        # 2. String value for temperature
        data.append({
            "animalId": sample_animal_id,
            "physiology": {
                "temperature": "hot",
                "heartRate": 80,
                "respiratoryRate": 20,
                "bloodOxygen": 98,
            },
            "behavior": {
                "motion": True,
            },
            "environment": {
                "ambientTemperature": 25,
                "humidity": 50,
                "aqi": 50,
            },
            "timestamp": start_time.isoformat() + "Z",
        })
        # 3. Invalid negative heart rate
        data.append({
            "animalId": sample_animal_id,
            "physiology": {
                "temperature": 38.5,
                "heartRate": -50,
                "respiratoryRate": 20,
                "bloodOxygen": 98,
            },
            "behavior": {
                "motion": True,
            },
            "environment": {
                "ambientTemperature": 25,
                "humidity": 50,
                "aqi": 50,
            },
            "timestamp": start_time.isoformat() + "Z",
        })

DATA_DIR.mkdir(exist_ok=True)
with open(SENSOR_DATA_PATH, "w") as f:
    json.dump(data, f, indent=2)

print(f"Dataset generated: {SENSOR_DATA_PATH}")
