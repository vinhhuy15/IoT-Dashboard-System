#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "DHTesp.h"

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define API_KEY "AIzaSyC4U6PA-b08ARNxZuy5OOU9gFMsa-gGCKw"
#define DATABASE_URL "iot-smartcity-full-default-rtdb.asia-southeast1.firebasedatabase.app"

#define DHT_PIN 15
#define BTN_IN_PIN 12
#define BTN_OUT_PIN 14
#define LED_PIN 2
#define RELAY_PIN 4
#define WATER_LEVEL_PIN 34
#define AIR_QUALITY_PIN 35
#define LIGHT_LEVEL_PIN 32

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
DHTesp dht;

unsigned long prevMillisSensors = 0;
unsigned long prevMillisControl = 0;
const long intervalSensors = 5000;
const long intervalControl = 1000;

int parkingSlots = 50;
bool lastBtnInState = HIGH;
bool lastBtnOutState = HIGH;
int waterLevelPct = 0;
int airQualityIdx = 0;
int lightLevelPct = 0;

void handleParking();
void updateSensors();
void controlDevices();
int readPercent(int pin);
bool readModeValue(const String &path, bool fallback);

void setup()
{
  pinMode(BTN_IN_PIN, INPUT_PULLUP);
  pinMode(BTN_OUT_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);

  dht.setup(DHT_PIN, DHTesp::DHT22);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
  }

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.signer.test_mode = true;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Firebase.RTDB.setInt(&fbdo, "smartcity/sensors/parking", parkingSlots);
  Firebase.RTDB.setString(&fbdo, "smartcity/devices/street_light", "OFF");
  Firebase.RTDB.setString(&fbdo, "smartcity/devices/water_pump", "OFF");
  Firebase.RTDB.setBool(&fbdo, "smartcity/modes/street_light_auto", true);
  Firebase.RTDB.setBool(&fbdo, "smartcity/modes/pump_auto", true);
}

void loop()
{

  handleParking();

  if (Firebase.ready())
  {
    unsigned long currentMillis = millis();

    if (currentMillis - prevMillisSensors >= intervalSensors)
    {
      prevMillisSensors = currentMillis;
      updateSensors();
    }

    if (currentMillis - prevMillisControl >= intervalControl)
    {
      prevMillisControl = currentMillis;
      controlDevices();
    }
  }
}

void handleParking()
{
  bool currentBtnIn = digitalRead(BTN_IN_PIN);
  bool currentBtnOut = digitalRead(BTN_OUT_PIN);

  if (currentBtnIn == LOW && lastBtnInState == HIGH && parkingSlots > 0)
  {
    parkingSlots--;
    Firebase.RTDB.setInt(&fbdo, "smartcity/sensors/parking", parkingSlots);
  }

  if (currentBtnOut == LOW && lastBtnOutState == HIGH && parkingSlots < 50)
  {
    parkingSlots++;
    Firebase.RTDB.setInt(&fbdo, "smartcity/sensors/parking", parkingSlots);
  }

  lastBtnInState = currentBtnIn;
  lastBtnOutState = currentBtnOut;
}

void updateSensors()
{
  TempAndHumidity data = dht.getTempAndHumidity();

  waterLevelPct = readPercent(WATER_LEVEL_PIN);
  airQualityIdx = readPercent(AIR_QUALITY_PIN);
  lightLevelPct = readPercent(LIGHT_LEVEL_PIN);

  if (dht.getStatus() == DHTesp::ERROR_NONE)
  {
    Firebase.RTDB.setFloat(&fbdo, "smartcity/sensors/temperature", data.temperature);
    Firebase.RTDB.setFloat(&fbdo, "smartcity/sensors/humidity", data.humidity);
  }

  Firebase.RTDB.setInt(&fbdo, "smartcity/sensors/water_level_pct", waterLevelPct);
  Firebase.RTDB.setInt(&fbdo, "smartcity/sensors/air_quality_idx", airQualityIdx);
  Firebase.RTDB.setInt(&fbdo, "smartcity/sensors/light_level_pct", lightLevelPct);
}

void controlDevices()
{
  bool streetLightAuto = readModeValue("smartcity/modes/street_light_auto", true);
  bool pumpAuto = readModeValue("smartcity/modes/pump_auto", true);

  if (streetLightAuto)
  {
    String nextStreetState = lightLevelPct < 40 ? "ON" : "OFF";
    Firebase.RTDB.setString(&fbdo, "smartcity/devices/street_light", nextStreetState);
    digitalWrite(LED_PIN, nextStreetState == "ON" ? HIGH : LOW);
  }
  else if (Firebase.RTDB.getString(&fbdo, "smartcity/devices/street_light"))
  {
    digitalWrite(LED_PIN, fbdo.stringData() == "ON" ? HIGH : LOW);
  }

  if (pumpAuto)
  {
    String nextPumpState = waterLevelPct >= 70 ? "ON" : "OFF";
    Firebase.RTDB.setString(&fbdo, "smartcity/devices/water_pump", nextPumpState);
    digitalWrite(RELAY_PIN, nextPumpState == "ON" ? HIGH : LOW);
  }
  else if (Firebase.RTDB.getString(&fbdo, "smartcity/devices/water_pump"))
  {
    digitalWrite(RELAY_PIN, fbdo.stringData() == "ON" ? HIGH : LOW);
  }
}

int readPercent(int pin)
{
  int rawValue = analogRead(pin);
  int pct = map(rawValue, 0, 4095, 0, 100);
  if (pct < 0)
    return 0;
  if (pct > 100)
    return 100;
  return pct;
}

bool readModeValue(const String &path, bool fallback)
{
  if (Firebase.RTDB.getBool(&fbdo, path))
  {
    return fbdo.boolData();
  }

  if (Firebase.RTDB.getString(&fbdo, path))
  {
    String value = fbdo.stringData();
    value.toLowerCase();
    return value == "true" || value == "1" || value == "on";
  }

  return fallback;
}