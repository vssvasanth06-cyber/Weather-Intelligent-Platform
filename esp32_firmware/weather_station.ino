/*
 * ============================================================
 *  Off-Grid IoT Weather Station — ESP32 Firmware
 *  Sensors: DHT22 | BMP280 | Rain | LDR | Anemometer
 *  Sends data to Weather Intelligence Platform via HTTP POST
 * ============================================================
 *
 *  Libraries required (install via Arduino Library Manager):
 *    - DHT sensor library (Adafruit)
 *    - Adafruit BMP280 Library
 *    - ArduinoJson (v6)
 *    - WiFi (built-in ESP32)
 *    - HTTPClient (built-in ESP32)
 *
 *  Wiring:
 *    DHT22         → GPIO 4
 *    BMP280        → I2C  SDA=GPIO 21, SCL=GPIO 22
 *    Rain Sensor   → ADC  GPIO 34  (analog out)
 *    LDR Sensor    → ADC  GPIO 35  (analog out)
 *    Anemometer    → GPIO 27  (reed-switch / hall effect pulse)
 * ============================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>

// ──────────────────────────────────────────
//  CONFIGURATION — Edit these values
// ──────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Your PC's local IP on the same WiFi network
// Run "ipconfig" on Windows → look for IPv4 Address
const char* SERVER_IP   = "192.168.1.100";
const int   SERVER_PORT = 8000;
const char* DEVICE_ID   = "WTH001";

// Upload interval (milliseconds)
const unsigned long UPLOAD_INTERVAL_MS = 10000;  // 10 seconds

// ──────────────────────────────────────────
//  PIN DEFINITIONS
// ──────────────────────────────────────────
#define DHT_PIN          4
#define DHT_TYPE         DHT22

#define RAIN_SENSOR_PIN  34
#define LDR_PIN          35
#define WIND_SPEED_PIN   27

// ──────────────────────────────────────────
//  GLOBALS
// ──────────────────────────────────────────
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_BMP280 bmp;

volatile unsigned long windPulseCount = 0;
unsigned long lastUploadTime = 0;

// Wind speed ISR — counts anemometer pulses
void IRAM_ATTR windPulseISR() {
    windPulseCount++;
}

// ──────────────────────────────────────────
//  WIFI CONNECTION
// ──────────────────────────────────────────
void connectWiFi() {
    Serial.printf("\n[WiFi] Connecting to %s", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\n[WiFi] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    } else {
        Serial.println("\n[WiFi] Failed to connect. Will retry...");
    }
}

// ──────────────────────────────────────────
//  SENSOR READINGS
// ──────────────────────────────────────────

float readTemperature() {
    float t = dht.readTemperature();
    if (isnan(t)) {
        Serial.println("[DHT22] Temperature read failed");
        return 0.0;
    }
    return t;
}

float readHumidity() {
    float h = dht.readHumidity();
    if (isnan(h)) {
        Serial.println("[DHT22] Humidity read failed");
        return 0.0;
    }
    return h;
}

float readPressure() {
    return bmp.readPressure() / 100.0F;  // Pa → hPa
}

float readRainfall() {
    // Rain sensor: higher ADC = dry, lower ADC = wet/rain
    int raw = analogRead(RAIN_SENSOR_PIN);
    // ADC range 0-4095 on ESP32 (12-bit)
    // Invert: 0 = dry (4095), 100 = full rain (0)
    float rainfall = ((4095.0 - raw) / 4095.0) * 100.0;
    return rainfall;
}

float readLightIntensity() {
    int raw = analogRead(LDR_PIN);
    // Map ADC value to approximate lux (0-100000)
    // LDR: higher ADC = more light
    float lux = (raw / 4095.0) * 100000.0;
    return lux;
}

float readWindSpeed() {
    // Capture pulse count over the last interval
    // Anemometer typically: 1 rotation = 2 pulses
    // Wind speed (m/s) = (pulses / 2) * circumference / time
    // Using a standard mini anemometer with 0.333 m/s per Hz
    unsigned long pulses = windPulseCount;
    windPulseCount = 0;  // Reset after reading

    float intervalSec = UPLOAD_INTERVAL_MS / 1000.0;
    float rotations = pulses / 2.0;           // 2 pulses per rotation
    float rps = rotations / intervalSec;       // rotations per second
    float windSpeed = rps * 0.333 * 2.0 * PI * 0.045;  // m/s (radius ~4.5cm)

    return windSpeed;
}

// ──────────────────────────────────────────
//  HTTP UPLOAD
// ──────────────────────────────────────────
void uploadSensorData(
    float temperature,
    float humidity,
    float pressure,
    float rainfall,
    float wind_speed,
    float light_intensity
) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[HTTP] Not connected to WiFi, skipping upload");
        connectWiFi();
        return;
    }

    HTTPClient http;
    String url = String("http://") + SERVER_IP + ":" + SERVER_PORT + "/sensor/upload";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    // Build JSON payload
    StaticJsonDocument<256> doc;
    doc["device_id"]       = DEVICE_ID;
    doc["temperature"]     = temperature;
    doc["humidity"]        = humidity;
    doc["pressure"]        = pressure;
    doc["rainfall"]        = rainfall;
    doc["wind_speed"]      = wind_speed;
    doc["light_intensity"] = light_intensity;

    String payload;
    serializeJson(doc, payload);

    int httpCode = http.POST(payload);

    if (httpCode == 200) {
        Serial.printf("[HTTP] Upload OK (%d)\n", httpCode);
    } else {
        Serial.printf("[HTTP] Upload failed, code: %d\n", httpCode);
    }

    http.end();
}

// ──────────────────────────────────────────
//  SETUP
// ──────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("===========================================");
    Serial.println("  Weather Intelligence Platform — ESP32   ");
    Serial.println("===========================================");

    // Init DHT22
    dht.begin();
    Serial.println("[DHT22] Initialized");

    // Init BMP280
    if (!bmp.begin(0x76)) {
        Serial.println("[BMP280] Sensor not found at 0x76, trying 0x77...");
        if (!bmp.begin(0x77)) {
            Serial.println("[BMP280] Not found! Check wiring.");
        }
    } else {
        Serial.println("[BMP280] Initialized");
    }
    bmp.setSampling(
        Adafruit_BMP280::MODE_NORMAL,
        Adafruit_BMP280::SAMPLING_X2,
        Adafruit_BMP280::SAMPLING_X16,
        Adafruit_BMP280::FILTER_X16,
        Adafruit_BMP280::STANDBY_MS_500
    );

    // Init ADC pins
    pinMode(RAIN_SENSOR_PIN, INPUT);
    pinMode(LDR_PIN, INPUT);

    // Anemometer interrupt
    pinMode(WIND_SPEED_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(WIND_SPEED_PIN), windPulseISR, FALLING);

    // Connect WiFi
    connectWiFi();

    Serial.println("[System] Setup complete. Starting sensor loop...\n");
}

// ──────────────────────────────────────────
//  MAIN LOOP
// ──────────────────────────────────────────
void loop() {
    unsigned long now = millis();

    if (now - lastUploadTime >= UPLOAD_INTERVAL_MS) {
        lastUploadTime = now;

        // Read all sensors
        float temperature    = readTemperature();
        float humidity       = readHumidity();
        float pressure       = readPressure();
        float rainfall       = readRainfall();
        float light          = readLightIntensity();
        float wind_speed     = readWindSpeed();

        // Serial monitor output (like a real serial monitor)
        Serial.println("─────────────────────────────────────────");
        Serial.printf("  Temperature  : %.2f °C\n",    temperature);
        Serial.printf("  Humidity     : %.2f %%\n",    humidity);
        Serial.printf("  Pressure     : %.2f hPa\n",   pressure);
        Serial.printf("  Rainfall     : %.2f mm\n",    rainfall);
        Serial.printf("  Wind Speed   : %.2f m/s\n",   wind_speed);
        Serial.printf("  Light        : %.0f lux\n",   light);
        Serial.println("─────────────────────────────────────────");

        // Upload to backend
        uploadSensorData(
            temperature,
            humidity,
            pressure,
            rainfall,
            wind_speed,
            light
        );
    }

    delay(100);
}
