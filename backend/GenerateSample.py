import random
import json
from datetime import datetime, timedelta

# Animals list
with open("animal_mapping.json") as f:
    mapping = json.load(f)

animal_ids = list(mapping.values())

# Base location
location = {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "zone": "farm_1"
}

# Start time
start_time = datetime(2026, 4, 17, 10, 0, 0)

data = []

for animal in animal_ids:
    current_time = start_time

    for i in range(20):  # 20 records per animal
        
        # Decide normal or abnormal
        is_abnormal = random.random() < 0.2  # 20% abnormal

        if is_abnormal:
            physiology = {
                "temperature": round(random.uniform(39.5, 41.5), 1),
                "heartRate": random.randint(100, 140),
                "respiratoryRate": random.randint(30, 50),
                "bloodOxygen": random.randint(80, 90)
            }
            behavior = {
                "motion": False,
                "steps": random.randint(0, 20),
                "lyingDown": True
            }
        else:
            physiology = {
                "temperature": round(random.uniform(37.5, 39.0), 1),
                "heartRate": random.randint(60, 100),
                "respiratoryRate": random.randint(15, 30),
                "bloodOxygen": random.randint(95, 100)
            }
            behavior = {
                "motion": True,
                "steps": random.randint(50, 300),
                "lyingDown": False
            }

        record = {
            "animalId": animal,
            "physiology": physiology,
            "behavior": behavior,
            "environment": {
                "ambientTemperature": random.randint(25, 40),
                "humidity": random.randint(40, 80),
                "aqi": random.randint(30, 150)
            },
            "location": location,
            "device": {
                "batteryLevel": random.randint(20, 100),
                "signalStrength": random.randint(-90, -50)
            },
            "timestamp": (current_time).isoformat() + "Z"
        }

        data.append(record)

        # Increase time by 5 minutes
        current_time += timedelta(minutes=5)

# Save to file
with open("sensor_data.json", "w") as f:
    json.dump(data, f, indent=2)

print("Dataset generated: sensor_data.json")