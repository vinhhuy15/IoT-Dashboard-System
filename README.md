<p align="center">
  <img src="logo.png" alt="Smart City Dashboard" width="180">
</p>

<h1 align="center">Smart City Dashboard</h1>

<p align="center">
  <strong>Real-time Smart City Monitoring & Control Platform</strong>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#system-architecture">Architecture</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#project-structure">Project Structure</a> ·
  <a href="#report">Report</a> ·
  <a href="#authors">Authors</a>
</p>

---

## Overview

Smart City Dashboard is an IoT project that simulates a smart city management system, consisting of embedded hardware (ESP32) running on the Wokwi simulator and a real-time web monitoring application. The system collects data from multiple sensors, stores it via Firebase Realtime Database, and displays it on a web dashboard with device control, Face ID authentication, and an AI chatbot assistant.

This project was developed as a final assignment for the IoT course at **Ho Chi Minh City University of Technology and Education (HCMUTE)**.

## Features

### Real-time Monitoring
- Temperature and humidity tracking (DHT22)
- Water level monitoring with flood risk alerts (SAFE / WARNING / HIGH FLOOD)
- Real-time parking slot counter
- Air quality index (AQI) and light intensity measurement
- Sensor trend charts (Chart.js) with a rolling window of the last 12 samples

### Urban Infrastructure Control
- Toggle street lights and drainage water pump from the dashboard
- AUTO/MANUAL mode for each device:
  - **Street Light AUTO**: turns on automatically when light intensity < 40%
  - **Water Pump AUTO**: turns on automatically when water level >= 70%
- Activity logs stored on Firebase

### Authentication & Access Control
- Face ID login using face-api.js (TinyFaceDetector + FaceRecognition)
- Traditional login via Firebase Authentication (email/password)
- Admin-only controls: only authenticated users can toggle devices and switch modes

### AI Chatbot Assistant
- Built-in chatbot powered by Groq API (LLaMA 3.1 70B Versatile)
- Context-aware responses based on real-time sensor data
- Handles both dashboard-related queries and general conversation
- Quick suggestion chips for common queries

### User Interface
- Responsive design supporting desktop, tablet, and mobile
- Neo-brutalism style with a warm color palette
- Visual alerts via pulse animation on anomalies

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Wokwi Simulator (ESP32)                  │
│  ┌─────────┐ ┌────────┐ ┌─────────┐ ┌──────┐ ┌──────────┐  │
│  │  DHT22  │ │Pot (x3)│ │Btn (x2) │ │ LED  │ │   Relay  │  │
│  │Temp/Hum │ │Water/  │ │Park In/ │ │Street│ │Water Pump│  │
│  │         │ │Air/Light│ │Park Out │ │Light │ │          │  │
│  └────┬────┘ └───┬────┘ └────┬────┘ └──┬───┘ └────┬─────┘  │
│       └──────────┴───────────┴─────────┴──────────┘         │
│                          ESP32 GPIO                          │
└────────────────────────────┬────────────────────────────────┘
                             │ WiFi
                             ▼
              ┌──────────────────────────┐
              │  Firebase Realtime DB    │
              │  ┌────────────────────┐  │
              │  │ smartcity/sensors  │  │
              │  │ smartcity/devices  │  │
              │  │ smartcity/modes    │  │
              │  │ smartcity/logs     │  │
              │  └────────────────────┘  │
              └────────────┬─────────────┘
                           │ WebSocket (onValue)
                           ▼
              ┌──────────────────────────┐
              │    Web Dashboard         │
              │  ┌────────────────────┐  │
              │  │  Sensor Cards      │  │
              │  │  Chart.js Graphs   │  │
              │  │  Device Controls   │  │
              │  │  Face ID Auth      │  │
              │  │  AI Chatbot (Groq) │  │
              │  └────────────────────┘  │
              └──────────────────────────┘
```

## Tech Stack

| Component | Technology |
|---|---|
| Microcontroller | ESP32 (esp32doit-devkit-v1) |
| IDE / Framework | PlatformIO + Arduino |
| Hardware Simulation | Wokwi |
| Sensors | DHT22, Potentiometer (ADC), Push Button |
| Actuators | LED, Relay Module |
| Database | Firebase Realtime Database |
| Authentication | Firebase Auth, face-api.js (TinyFaceDetector, FaceLandmark68, FaceRecognition) |
| AI Chatbot | Groq API - LLaMA 3.1 70B Versatile |
| Charts | Chart.js |
| Frontend | HTML5, CSS3, JavaScript (ES Modules) |
| Fonts | Inter, Space Grotesk, Anton (Google Fonts) |

## Project Structure

```
project-iot-final/
├── index.html                    # Main dashboard page
├── script.js                     # Frontend logic (Firebase, Face ID, AI, Charts)
├── styles.css                    # Stylesheet (neo-brutalism theme)
├── logo.png                      # Project logo
├── diagram.json                  # Wokwi circuit diagram
├── wokwi.toml                    # Wokwi Simulator configuration
├── models/                       # Face ID models (face-api.js)
│   ├── face-api.min.js
│   ├── tiny_face_detector_model-*
│   ├── face_landmark_68_model-*
│   └── face_recognition_model-*
├── IOT_WOKWI/                    # ESP32 firmware
│   ├── platformio.ini            # PlatformIO configuration
│   └── src/
│       └── main.cpp              # ESP32 embedded code
├── report.pdf                      # Project report (term paper)
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (optional, for running a local server)
- [PlatformIO CLI](https://platformio.org/install/cli) (for building ESP32 firmware)
- A [Firebase](https://firebase.google.com/) account (pre-configured in the project)
- A [Groq](https://console.groq.com/) API key (pre-configured in the project)

### 1. Run the Hardware Simulation (Wokwi)

Open the project in [Wokwi for VS Code](https://wokwi.com/docs/vscode/getting-started) or import `diagram.json` + `wokwi.toml` on [wokwi.com](https://wokwi.com/).

Wokwi will automatically compile the firmware from `IOT_WOKWI/` and run the ESP32 simulation with all sensors, LED, and relay.

### 2. Run the Web Dashboard

**Quickest way** - use Live Server (VS Code):

```bash
# Clone the repository
git clone https://github.com/<your-username>/project-iot-final.git
cd project-iot-final

# Open index.html with Live Server or any HTTP server
# (The dashboard uses ES Modules and must be served over HTTP — do not open via file://)
```

Or use Python:

```bash
python -m http.server 8080
# Visit http://localhost:8080
```

### 3. Build ESP32 Firmware (Optional)

```bash
cd IOT_WOKWI
pio run
```

The firmware binary will be built at `IOT_WOKWI/.pio/build/esp32doit-devkit-v1/firmware.bin`.

## Firebase Configuration

The project uses Firebase Realtime Database with the following data structure:

```
smartcity/
├── sensors/
│   ├── temperature        # float - Temperature (°C)
│   ├── humidity           # float - Humidity (%)
│   ├── parking            # int   - Available parking slots
│   ├── water_level_pct    # int   - Water level (%)
│   ├── air_quality_idx    # int   - Air quality index
│   └── light_level_pct    # int   - Light intensity (%)
├── devices/
│   ├── street_light       # string - "ON" | "OFF"
│   └── water_pump         # string - "ON" | "OFF"
├── modes/
│   ├── street_light_auto  # bool - true: AUTO, false: MANUAL
│   └── pump_auto          # bool - true: AUTO, false: MANUAL
└── logs/
    └── <push_id>          # string - Activity log entry
```

## Demo Account

To access all features (device control, mode switching), you need to log in:

- **Face ID**: Register your face after logging in with traditional credentials
- **Email/Password**: Use a Firebase Authentication account

## Report

The full project report (term paper) is available here:

[View Report (PDF)](report.pdf)

## Authors

| Name | Student ID | Role |
|---|---|---|
| **Giang Vinh Huy** | 23119146 | ESP32 Firmware, Dashboard Frontend |
| **Nguyen Quang Nhon** | 23119184 | Firebase, AI Chatbot, Face ID |

**Ho Chi Minh City University of Technology and Education (HCMUTE)** - Faculty of Information Technology

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
