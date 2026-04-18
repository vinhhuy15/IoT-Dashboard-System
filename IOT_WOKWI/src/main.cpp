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

void handleParking();
void updateSensors();
void controlDevices();

void setup() {
  pinMode(BTN_IN_PIN, INPUT_PULLUP);
  pinMode(BTN_OUT_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  
  dht.setup(DHT_PIN, DHTesp::DHT22);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.signer.test_mode = true; 

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
 
  handleParking();

  if (Firebase.ready()) {
    unsigned long currentMillis = millis();

    
    if (currentMillis - prevMillisSensors >= intervalSensors) {
      prevMillisSensors = currentMillis;
      updateSensors();
    }

    
    if (currentMillis - prevMillisControl >= intervalControl) {
      prevMillisControl = currentMillis;
      controlDevices();
    }
  }
}

void handleParking() {
  bool currentBtnIn = digitalRead(BTN_IN_PIN);
  bool currentBtnOut = digitalRead(BTN_OUT_PIN);

  
  if (currentBtnIn == LOW && lastBtnInState == HIGH && parkingSlots > 0) {
    parkingSlots--;
    Firebase.RTDB.setInt(&fbdo, "smartcity/sensors/parking", parkingSlots);
  }

 
  if (currentBtnOut == LOW && lastBtnOutState == HIGH && parkingSlots < 50) {
    parkingSlots++;
    Firebase.RTDB.setInt(&fbdo, "smartcity/sensors/parking", parkingSlots);
  }

  lastBtnInState = currentBtnIn;
  lastBtnOutState = currentBtnOut;
}

void updateSensors() {
  TempAndHumidity data = dht.getTempAndHumidity();
  if (dht.getStatus() == DHTesp::ERROR_NONE) {
    Firebase.RTDB.setFloat(&fbdo, "smartcity/sensors/temperature", data.temperature);
    Firebase.RTDB.setFloat(&fbdo, "smartcity/sensors/humidity", data.humidity);
  }
}

void controlDevices() {
  if (Firebase.RTDB.getString(&fbdo, "smartcity/devices/street_light")) {
    digitalWrite(LED_PIN, fbdo.stringData() == "ON" ? HIGH : LOW);
  }

  if (Firebase.RTDB.getString(&fbdo, "smartcity/devices/water_pump")) {
    digitalWrite(RELAY_PIN, fbdo.stringData() == "ON" ? HIGH : LOW);
  }
}