"""
ESP32 Simulator — sends realistic sensor data to the backend every 3 seconds.
Run this when the ESP32 is not connected to test the live dashboard.

Usage:  python simulate_sensor.py
"""
import time
import math
import random
import urllib.request
import json

URL = "http://localhost:8000/sensor/upload"
DEVICE_ID = "WTH001"
INTERVAL = 3  # seconds between readings

t = 0  # time counter for smooth wave simulation

def send(payload: dict):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status
    except Exception as e:
        print(f"  [ERROR] {e}")
        return None

print("=" * 50)
print("  ESP32 Sensor Simulator")
print(f"  Sending to: {URL}")
print(f"  Device ID : {DEVICE_ID}")
print(f"  Interval  : {INTERVAL}s")
print("=" * 50)
print()

while True:
    t += 1

    # Simulate realistic sensor values with gentle variation
    temperature    = round(27.0 + 5 * math.sin(t * 0.15) + random.uniform(-0.3, 0.3), 2)
    humidity       = round(60.0 + 15 * math.sin(t * 0.08) + random.uniform(-1, 1), 2)
    pressure       = round(1013.0 + 3 * math.sin(t * 0.05) + random.uniform(-0.2, 0.2), 2)
    rainfall       = round(max(0, 0.5 * math.sin(t * 0.3) + random.uniform(0, 0.4)), 2)
    wind_speed     = round(max(0, 2.5 + 2 * math.sin(t * 0.2) + random.uniform(-0.5, 0.5)), 2)
    light_intensity= round(max(0, 45000 + 30000 * math.sin(t * 0.1) + random.uniform(-1000, 1000)), 0)

    payload = {
        "device_id"      : DEVICE_ID,
        "temperature"    : temperature,
        "humidity"       : humidity,
        "pressure"       : pressure,
        "rainfall"       : rainfall,
        "wind_speed"     : wind_speed,
        "light_intensity": light_intensity,
    }

    status = send(payload)

    print(
        f"[{time.strftime('%H:%M:%S')}]  "
        f"T:{temperature}°C  "
        f"H:{humidity}%  "
        f"P:{pressure}hPa  "
        f"R:{rainfall}mm  "
        f"W:{wind_speed}m/s  "
        f"L:{int(light_intensity)}lux  "
        f"→ HTTP {status}"
    )

    time.sleep(INTERVAL)
