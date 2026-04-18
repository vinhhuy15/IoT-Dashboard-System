import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js';

const firebaseConfig = {
    apiKey: 'AIzaSyC4U6PA-b08ARNxZuy5OOU9gFMsa-gGCKw',
    authDomain: 'iot-smartcity-full.firebaseapp.com',
    databaseURL: 'https://iot-smartcity-full-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'iot-smartcity-full',
    storageBucket: 'iot-smartcity-full.firebasestorage.app',
    messagingSenderId: '989917606860',
    appId: '1:989917606860:web:464984fddcdc1e7b0c2369',
    measurementId: 'G-LMQ5TXWQ18'
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
const database = getDatabase(app);
const rootRef = ref(database, 'smartcity');
const connectedRef = ref(database, '.info/connected');

const elements = {
    connectionStatus: document.getElementById('connectionStatus'),
    temperatureValue: document.getElementById('temperatureValue'),
    humidityValue: document.getElementById('humidityValue'),
    parkingValue: document.getElementById('parkingValue'),
    parkingStatus: document.getElementById('parkingStatus'),
    streetLightState: document.getElementById('streetLightState'),
    waterPumpState: document.getElementById('waterPumpState'),
    streetLightMeta: document.getElementById('streetLightMeta'),
    waterPumpMeta: document.getElementById('waterPumpMeta'),
    overviewText: document.getElementById('overviewText'),
    lastUpdateText: document.getElementById('lastUpdateText'),
    logTemperature: document.getElementById('logTemperature'),
    logHumidity: document.getElementById('logHumidity'),
    logParking: document.getElementById('logParking'),
    logDevices: document.getElementById('logDevices')
};

function formatNumber(value, digits = 1) {
    if (value === null || value === undefined || value === '') {
        return '--';
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return String(value);
    }

    return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(digits);
}

function setDeviceState(element, metaElement, value, label) {
    const normalized = String(value ?? '--').toUpperCase();
    const isOn = normalized === 'ON' || normalized === '1' || normalized === 'TRUE';
    const isOff = normalized === 'OFF' || normalized === '0' || normalized === 'FALSE';

    element.textContent = isOn ? 'ON' : isOff ? 'OFF' : '--';
    element.classList.toggle('device-on', isOn);
    element.classList.toggle('device-off', !isOn);
    metaElement.textContent = value === undefined || value === null ? 'Chưa có dữ liệu' : `Nguồn Firebase: ${label}`;
}

function updateDashboard(snapshotValue) {
    const sensors = snapshotValue?.sensors ?? {};
    const devices = snapshotValue?.devices ?? {};

    const temperature = sensors.temperature;
    const humidity = sensors.humidity;
    const parking = sensors.parking;

    elements.temperatureValue.textContent = formatNumber(temperature);
    elements.humidityValue.textContent = formatNumber(humidity);
    elements.parkingValue.textContent = formatNumber(parking, 0);

    elements.parkingStatus.textContent = parking === undefined || parking === null
        ? 'Đang chờ dữ liệu từ Firebase'
        : `Còn ${formatNumber(parking, 0)} chỗ trống`;

    setDeviceState(elements.streetLightState, elements.streetLightMeta, devices.street_light, 'smartcity/devices/street_light');
    setDeviceState(elements.waterPumpState, elements.waterPumpMeta, devices.water_pump, 'smartcity/devices/water_pump');

    elements.overviewText.textContent = 'Dữ liệu đang được đẩy trực tiếp từ Realtime Database của Firebase.';
    elements.lastUpdateText.textContent = `Cập nhật lần cuối: ${new Date().toLocaleString('vi-VN')}`;

    elements.logTemperature.textContent = `Nhiệt độ: ${formatNumber(temperature)} °C`;
    elements.logHumidity.textContent = `Độ ẩm: ${formatNumber(humidity)} %`;
    elements.logParking.textContent = `Parking: ${formatNumber(parking, 0)} chỗ trống`;
    elements.logDevices.textContent = `Thiết bị: đèn ${String(devices.street_light ?? '--')}, bơm ${String(devices.water_pump ?? '--')}`;
}

onValue(connectedRef, (snapshot) => {
    const isConnected = snapshot.val() === true;
    elements.connectionStatus.textContent = isConnected ? 'Firebase: Online' : 'Firebase: Offline';
    elements.connectionStatus.style.color = isConnected ? '#c7f4ff' : '#ffd1d1';
});

onValue(rootRef, (snapshot) => {
    updateDashboard(snapshot.val());
}, (error) => {
    elements.connectionStatus.textContent = 'Lỗi kết nối Firebase';
    elements.overviewText.textContent = error?.message || 'Không thể đọc dữ liệu từ Firebase.';
    elements.lastUpdateText.textContent = 'Kiểm tra cấu hình RTDB và rules.';
});