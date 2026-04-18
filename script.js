import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js';
import { getDatabase, onValue, push, ref, set } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js';

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

const groqConfig = {
    apiKey: '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',
    model: 'llama-3.1-70b-versatile'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const elements = {
    connectionStatus: document.getElementById('connectionStatus'),
    authButton: document.getElementById('auth-btn'),
    loginModal: document.getElementById('login-modal'),
    cancelLogin: document.getElementById('cancel-login'),
    submitLogin: document.getElementById('submit-login'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    temperatureValue: document.getElementById('temperatureValue'),
    humidityValue: document.getElementById('humidityValue'),
    parkingValue: document.getElementById('parkingValue'),
    parkingStatus: document.getElementById('parkingStatus'),
    waterLevelValue: document.getElementById('waterLevelValue'),
    floodRiskBadge: document.getElementById('floodRiskBadge'),
    airQualityValue: document.getElementById('airQualityValue'),
    lightLevelValue: document.getElementById('lightLevelValue'),
    cardEnv: document.getElementById('card-env'),
    cardParking: document.getElementById('card-parking'),
    cardWater: document.getElementById('card-water'),
    streetLightToggle: document.getElementById('streetLightToggle'),
    waterPumpToggle: document.getElementById('waterPumpToggle'),
    streetLightModeBtn: document.getElementById('streetLightModeBtn'),
    pumpModeBtn: document.getElementById('pumpModeBtn'),
    streetLightHint: document.getElementById('streetLightHint'),
    waterPumpHint: document.getElementById('waterPumpHint'),
    streetLightState: document.getElementById('streetLightState'),
    waterPumpState: document.getElementById('waterPumpState'),
    assistantLauncher: document.getElementById('assistant-launcher'),
    assistantPanel: document.getElementById('assistant-panel'),
    assistantClose: document.getElementById('assistant-close'),
    assistantMessages: document.getElementById('assistant-messages'),
    assistantForm: document.getElementById('assistant-form'),
    assistantInput: document.getElementById('assistant-input'),
    curatorAccess: document.getElementById('curatorAccess'),
    curatorConfidence: document.getElementById('curatorConfidence'),
    anomalyScore: document.getElementById('anomalyScore'),
    riskState: document.getElementById('riskState'),
    activityLog: document.getElementById('activity-log')
};

const historyLimit = 12;

const chart = new Chart(document.getElementById('tempChart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Phòng (°C)',
                data: [],
                borderColor: '#a17046',
                backgroundColor: 'rgba(161, 112, 70, 0.14)',
                pointBackgroundColor: '#a17046',
                pointBorderColor: '#fbfaf6',
                borderWidth: 3,
                tension: 0.35,
                fill: false
            },
            {
                label: 'Độ ẩm (%)',
                data: [],
                borderColor: '#6a8eb5',
                backgroundColor: 'rgba(106, 142, 181, 0.14)',
                pointBackgroundColor: '#6a8eb5',
                pointBorderColor: '#fbfaf6',
                borderWidth: 3,
                tension: 0.35,
                fill: false
            },
            {
                label: 'Chỗ trống',
                data: [],
                borderColor: '#6a9776',
                backgroundColor: 'rgba(106, 151, 118, 0.14)',
                pointBackgroundColor: '#6a9776',
                pointBorderColor: '#fbfaf6',
                borderWidth: 3,
                tension: 0.35,
                fill: false
            },
            {
                label: 'Mực nước (%)',
                data: [],
                borderColor: '#9e7a8b',
                backgroundColor: 'rgba(158, 122, 139, 0.14)',
                pointBackgroundColor: '#9e7a8b',
                pointBorderColor: '#fbfaf6',
                borderWidth: 3,
                tension: 0.35,
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#243043',
                    font: {
                        family: 'Space Grotesk',
                        size: 12,
                        weight: '700'
                    },
                    boxWidth: 18,
                    boxHeight: 10,
                    usePointStyle: false
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(38, 49, 66, 0.08)'
                },
                ticks: {
                    color: '#243043',
                    font: {
                        family: 'Space Grotesk',
                        weight: '700'
                    }
                }
            },
            y: {
                beginAtZero: true,
                suggestedMax: 100,
                grid: {
                    color: 'rgba(38, 49, 66, 0.08)'
                },
                ticks: {
                    color: '#243043',
                    font: {
                        family: 'Space Grotesk',
                        weight: '700'
                    }
                }
            }
        }
    }
});

const dashboardState = {
    sensors: {},
    devices: {},
    modes: {}
};

const assistantState = {
    lastSnapshot: {
        temperature: null,
        humidity: null,
        parking: null,
        waterLevel: null,
        airQuality: null,
        lightLevel: null,
        streetLightAuto: true,
        pumpAuto: true,
        streetLightState: 'OFF',
        waterPumpState: 'OFF'
    },
    messages: []
};

function normalizeNumber(value, digits = 1) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return null;
    }

    return Number.isInteger(parsed) ? parsed : Number(parsed.toFixed(digits));
}

function formatNumber(value, digits = 1) {
    const normalized = normalizeNumber(value, digits);
    return normalized === null ? '--' : String(normalized);
}

function setStateText(element, value) {
    const normalized = String(value ?? '--').toUpperCase();
    const isOn = normalized === 'ON' || normalized === '1' || normalized === 'TRUE';
    const isOff = normalized === 'OFF' || normalized === '0' || normalized === 'FALSE' || normalized === '--';

    element.textContent = isOn ? 'ON' : isOff ? 'OFF' : normalized;
    element.classList.toggle('device-on', isOn);
    element.classList.toggle('device-off', !isOn);
}

function syncToggleState(button, value) {
    const normalized = String(value ?? 'OFF').toUpperCase();
    const isOn = normalized === 'ON' || normalized === '1' || normalized === 'TRUE';
    button.classList.toggle('is-on', isOn);
    button.classList.toggle('is-off', !isOn);
}

function syncModeState(button, isAuto, prefix) {
    button.classList.toggle('manual', !isAuto);
    button.textContent = `${prefix}: ${isAuto ? 'AUTO' : 'MANUAL'}`;
}

function normalizeMode(value, fallback = true) {
    if (value === null || value === undefined) {
        return fallback;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    const normalized = String(value).toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'on';
}

function getCurrentTimeLabel() {
    return new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function updateChart(temperature, humidity, parking, waterLevel) {
    chart.data.labels.push(getCurrentTimeLabel());
    chart.data.datasets[0].data.push(temperature);
    chart.data.datasets[1].data.push(humidity);
    chart.data.datasets[2].data.push(parking);
    chart.data.datasets[3].data.push(waterLevel);

    if (chart.data.labels.length > historyLimit) {
        chart.data.labels.shift();
        chart.data.datasets.forEach((dataset) => dataset.data.shift());
    }

    chart.update();
}

function appendLog(message) {
    const logText = `[${new Date().toLocaleString('vi-VN')}] ${message}`;
    push(ref(db, 'smartcity/logs'), logText);
}

function renderLogs(logs) {
    const logContainer = elements.activityLog;
    logContainer.innerHTML = '';

    if (!logs) {
        logContainer.innerHTML = '<div class="log-item">Đang chờ nhật ký từ Firebase...</div>';
        return;
    }

    Object.values(logs)
        .reverse()
        .slice(0, 10)
        .forEach((logItem) => {
            const item = document.createElement('div');
            item.className = 'log-item';
            item.textContent = String(logItem);
            logContainer.appendChild(item);
        });
}

function addAssistantMessage(text, kind = 'bot') {
    const message = document.createElement('div');
    message.className = `assistant-message ${kind}`;
    message.textContent = text;
    elements.assistantMessages.appendChild(message);
    elements.assistantMessages.scrollTop = elements.assistantMessages.scrollHeight;
    return message;
}

function pushAssistantHistory(role, content) {
    assistantState.messages.push({ role, content });
    if (assistantState.messages.length > 12) {
        assistantState.messages = assistantState.messages.slice(-12);
    }
}

function getFloodLabel(waterLevel) {
    if (waterLevel === null) return 'chưa có dữ liệu';
    if (waterLevel >= 75) return 'ngập cao';
    if (waterLevel >= 45) return 'cảnh báo ngập';
    return 'an toàn';
}

function buildAssistantReply(question) {
    const text = question.toLowerCase();
    const snap = assistantState.lastSnapshot;

    if (text.includes('ngập') || text.includes('nước')) {
        return `Mực nước hiện tại là ${snap.waterLevel ?? '--'}%. Trạng thái: ${getFloodLabel(snap.waterLevel)}.`;
    }

    if (text.includes('đèn') || text.includes('street')) {
        return `Đèn đường đang ${snap.streetLightState}. Chế độ ${snap.streetLightAuto ? 'AUTO' : 'MANUAL'}. Ánh sáng môi trường hiện tại: ${snap.lightLevel ?? '--'}%.`;
    }

    if (text.includes('bơm') || text.includes('pump')) {
        return `Máy bơm đang ${snap.waterPumpState}. Chế độ ${snap.pumpAuto ? 'AUTO' : 'MANUAL'}. Mực nước hiện tại: ${snap.waterLevel ?? '--'}%.`;
    }

    if (text.includes('không khí') || text.includes('aqi') || text.includes('air')) {
        return `Chỉ số chất lượng không khí hiện tại là ${snap.airQuality ?? '--'}. Giá trị này càng cao thì không khí càng kém.`;
    }

    if (text.includes('nhiệt độ') || text.includes('độ ẩm')) {
        return `Nhiệt độ hiện tại ${snap.temperature ?? '--'}°C, độ ẩm ${snap.humidity ?? '--'}%.`;
    }

    if (text.includes('đỗ xe') || text.includes('parking')) {
        return `Bãi đỗ xe hiện còn ${snap.parking ?? '--'} chỗ trống.`;
    }

    return `Mình đang theo dõi các chỉ số: nhiệt độ ${snap.temperature ?? '--'}°C, độ ẩm ${snap.humidity ?? '--'}%, bãi xe ${snap.parking ?? '--'} chỗ, mực nước ${snap.waterLevel ?? '--'}%. Bạn có thể hỏi: ngập, đèn đường, máy bơm, không khí hoặc bãi đỗ xe.`;
}

function buildAssistantSystemPrompt() {
    const snap = assistantState.lastSnapshot;
    return [
        'Bạn là AI Assist cho dashboard smart city bằng tiếng Việt.',
        'Trả lời ngắn gọn, tự nhiên, đúng trọng tâm, tối đa 4 câu trừ khi người dùng yêu cầu chi tiết.',
        'Bám theo ngữ cảnh sensor và trạng thái thiết bị hiện tại.',
        `Ngữ cảnh: nhiệt độ ${snap.temperature ?? '--'}°C, độ ẩm ${snap.humidity ?? '--'}%, bãi xe ${snap.parking ?? '--'} chỗ, mực nước ${snap.waterLevel ?? '--'}%, AQI ${snap.airQuality ?? '--'}, ánh sáng ${snap.lightLevel ?? '--'}%.`,
        `Đèn đường: ${snap.streetLightState}, chế độ ${snap.streetLightAuto ? 'AUTO' : 'MANUAL'}.`,
        `Máy bơm: ${snap.waterPumpState}, chế độ ${snap.pumpAuto ? 'AUTO' : 'MANUAL'}.`,
        'Nếu không chắc, hãy nói rõ là cần thêm dữ liệu thay vì bịa.'
    ].join(' ');
}

async function requestAssistantReply(question) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqConfig.apiKey}`
        },
        body: JSON.stringify({
            model: groqConfig.model,
            messages: [
                { role: 'system', content: buildAssistantSystemPrompt() },
                ...assistantState.messages,
                { role: 'user', content: question }
            ],
            temperature: 0.35,
            max_tokens: 220
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq error ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    return payload?.choices?.[0]?.message?.content?.trim() || '';
}

function setAssistantBusy(isBusy) {
    const submitButton = elements.assistantForm.querySelector('button[type="submit"]');
    elements.assistantInput.disabled = isBusy;
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? 'Đang hỏi...' : 'Gửi';
}

async function sendAssistantQuestion(question) {
    const trimmed = question.trim();
    if (!trimmed) {
        return;
    }

    addAssistantMessage(trimmed, 'user');
    pushAssistantHistory('user', trimmed);
    setAssistantBusy(true);

    try {
        const reply = await requestAssistantReply(trimmed);
        const finalReply = reply || buildAssistantReply(trimmed);
        addAssistantMessage(finalReply, 'bot');
        pushAssistantHistory('assistant', finalReply);
    } catch (error) {
        const fallbackReply = buildAssistantReply(trimmed);
        addAssistantMessage(fallbackReply, 'bot');
        pushAssistantHistory('assistant', fallbackReply);
    } finally {
        setAssistantBusy(false);
    }
}

function updateAiSummary(temperature, humidity, parking, waterLevel, airQuality, lightLevel) {
    const tempValue = normalizeNumber(temperature);
    const humidityValue = normalizeNumber(humidity);
    const parkingValue = normalizeNumber(parking, 0);
    const waterValue = normalizeNumber(waterLevel, 0);
    const airValue = normalizeNumber(airQuality, 0);
    const lightValue = normalizeNumber(lightLevel, 0);

    const tempRisk = tempValue === null ? 0 : Math.max(0, (tempValue - 25) * 4);
    const humidityRisk = humidityValue === null ? 0 : Math.max(0, Math.abs(humidityValue - 65) * 1.3);
    const parkingRisk = parkingValue === null ? 0 : Math.max(0, 20 - parkingValue) * 2.0;
    const floodRisk = waterValue === null ? 0 : Math.max(0, waterValue - 45) * 1.5;
    const airRisk = airValue === null ? 0 : Math.max(0, airValue - 50) * 1.1;
    const anomaly = Math.min(100, Math.round(tempRisk + humidityRisk + parkingRisk + floodRisk + airRisk));
    const confidence = Math.max(0, 100 - anomaly);
    const riskLabel = waterValue === null ? 'AN TOÀN' : (waterValue >= 75 ? 'NGẬP CAO' : waterValue >= 45 ? 'CẢNH BÁO' : 'AN TOÀN');

    elements.curatorConfidence.textContent = `${confidence}%`;
    elements.anomalyScore.textContent = `${anomaly.toFixed(1)}%`;
    elements.riskState.textContent = anomaly >= 60 ? 'Cảnh báo' : anomaly >= 30 ? 'Theo dõi' : 'Ổn định';
    elements.curatorAccess.textContent = auth.currentUser ? 'Đã xác thực admin' : 'Đăng nhập demo';

    elements.waterLevelValue.textContent = waterValue === null ? '--' : `${waterValue}`;
    elements.floodRiskBadge.textContent = riskLabel;
    elements.floodRiskBadge.classList.toggle('is-safe', riskLabel === 'AN TOÀN');
    elements.floodRiskBadge.classList.toggle('is-watch', riskLabel === 'CẢNH BÁO');
    elements.floodRiskBadge.classList.toggle('is-danger', riskLabel === 'NGẬP CAO');

    elements.airQualityValue.textContent = airValue === null ? '--' : `${airValue}`;
    elements.lightLevelValue.textContent = lightValue === null ? '--' : `${lightValue}%`;
}

function updateParkingStatus(parkingValue) {
    if (parkingValue === null) {
        elements.parkingStatus.textContent = 'Đang chờ dữ liệu';
        elements.parkingStatus.style.color = 'rgba(36, 48, 67, 0.72)';
        return;
    }

    if (parkingValue <= 0) {
        elements.parkingStatus.textContent = 'HẾT CHỖ';
        elements.parkingStatus.style.color = '#ce3f4d';
    } else {
        elements.parkingStatus.textContent = `Còn ${parkingValue} chỗ trống`;
        elements.parkingStatus.style.color = '#0aa96d';
    }
}

function updateAssistantSnapshotFromDashboard() {
    const sensors = dashboardState.sensors ?? {};
    const devices = dashboardState.devices ?? {};
    const modes = dashboardState.modes ?? {};

    assistantState.lastSnapshot = {
        temperature: normalizeNumber(sensors.temperature),
        humidity: normalizeNumber(sensors.humidity),
        parking: normalizeNumber(sensors.parking, 0),
        waterLevel: normalizeNumber(sensors.water_level_pct, 0),
        airQuality: normalizeNumber(sensors.air_quality_idx, 0),
        lightLevel: normalizeNumber(sensors.light_level_pct, 0),
        streetLightAuto: normalizeMode(modes.street_light_auto, true),
        pumpAuto: normalizeMode(modes.pump_auto, true),
        streetLightState: String(devices.street_light ?? 'OFF').toUpperCase(),
        waterPumpState: String(devices.water_pump ?? 'OFF').toUpperCase()
    };
}

function updateDashboard(snapshotValue, options = { updateChart: true }) {
    const sensors = snapshotValue?.sensors ?? {};
    const devices = snapshotValue?.devices ?? {};
    const modes = snapshotValue?.modes ?? {};

    const temperature = normalizeNumber(sensors.temperature);
    const humidity = normalizeNumber(sensors.humidity);
    const parking = normalizeNumber(sensors.parking, 0);
    const waterLevel = normalizeNumber(sensors.water_level_pct, 0);
    const airQuality = normalizeNumber(sensors.air_quality_idx, 0);
    const lightLevel = normalizeNumber(sensors.light_level_pct, 0);

    const streetLightAuto = normalizeMode(modes.street_light_auto, true);
    const pumpAuto = normalizeMode(modes.pump_auto, true);

    elements.temperatureValue.textContent = formatNumber(temperature);
    elements.humidityValue.textContent = formatNumber(humidity);
    elements.parkingValue.textContent = formatNumber(parking, 0);

    updateParkingStatus(parking);
    setStateText(elements.streetLightState, devices.street_light);
    setStateText(elements.waterPumpState, devices.water_pump);
    syncToggleState(elements.streetLightToggle, devices.street_light);
    syncToggleState(elements.waterPumpToggle, devices.water_pump);

    syncModeState(elements.streetLightModeBtn, streetLightAuto, 'Đèn');
    syncModeState(elements.pumpModeBtn, pumpAuto, 'Bơm');
    elements.streetLightHint.textContent = streetLightAuto ? 'AUTO theo ánh sáng' : 'MANUAL từ dashboard';
    elements.waterPumpHint.textContent = pumpAuto ? 'AUTO theo mực nước' : 'MANUAL từ dashboard';

    updateAssistantSnapshotFromDashboard();

    if (options.updateChart && temperature !== null && humidity !== null && parking !== null && waterLevel !== null) {
        updateChart(temperature, humidity, parking, waterLevel);
    }

    if (temperature !== null && temperature > 35) {
        elements.cardEnv.classList.add('alert');
    } else {
        elements.cardEnv.classList.remove('alert');
    }

    if (parking !== null && parking <= 0) {
        elements.cardParking.classList.add('alert');
    } else {
        elements.cardParking.classList.remove('alert');
    }

    if (waterLevel !== null && waterLevel >= 75) {
        elements.cardWater.classList.add('alert');
    } else {
        elements.cardWater.classList.remove('alert');
    }

    updateAiSummary(temperature, humidity, parking, waterLevel, airQuality, lightLevel);
}

const connectedRef = ref(db, '.info/connected');
const sensorsRef = ref(db, 'smartcity/sensors');
const devicesRef = ref(db, 'smartcity/devices');
const modesRef = ref(db, 'smartcity/modes');
const logsRef = ref(db, 'smartcity/logs');

onValue(connectedRef, (snapshot) => {
    const isConnected = snapshot.val() === true;
    elements.connectionStatus.textContent = isConnected ? 'Firebase: Online' : 'Firebase: Offline';
    elements.connectionStatus.style.color = isConnected ? '#0aa96d' : '#ce3f4d';
});

onValue(sensorsRef, (snapshot) => {
    dashboardState.sensors = snapshot.val() ?? {};
    updateDashboard(dashboardState, { updateChart: true });
});

onValue(devicesRef, (snapshot) => {
    dashboardState.devices = snapshot.val() ?? {};
    updateDashboard(dashboardState, { updateChart: false });
});

onValue(modesRef, (snapshot) => {
    dashboardState.modes = snapshot.val() ?? {};
    updateDashboard(dashboardState, { updateChart: false });
});

onValue(logsRef, (snapshot) => {
    renderLogs(snapshot.val());
});

onAuthStateChanged(auth, (user) => {
    const adminControls = document.querySelectorAll('.admin-only');
    if (user) {
        elements.authButton.textContent = 'Đăng xuất';
        adminControls.forEach((control) => {
            control.style.display = 'flex';
        });
        elements.loginModal.style.display = 'none';
        elements.curatorAccess.textContent = 'Đã xác thực admin';
    } else {
        elements.authButton.textContent = 'Đăng nhập Admin';
        adminControls.forEach((control) => {
            control.style.display = 'none';
        });
        elements.curatorAccess.textContent = 'Đăng nhập demo';
    }
});

async function handleLogin() {
    const email = elements.email.value.trim();
    const password = elements.password.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        elements.loginModal.style.display = 'none';
        elements.email.value = '';
        elements.password.value = '';
    } catch (error) {
        alert('Sai tài khoản hoặc mật khẩu');
    }
}

function toggleLoginModal(show) {
    elements.loginModal.style.display = show ? 'flex' : 'none';
}

elements.authButton.addEventListener('click', () => {
    if (auth.currentUser) {
        signOut(auth);
        return;
    }

    toggleLoginModal(true);
});

elements.cancelLogin.addEventListener('click', () => toggleLoginModal(false));
elements.submitLogin.addEventListener('click', handleLogin);

elements.loginModal.addEventListener('click', (event) => {
    if (event.target === elements.loginModal) {
        toggleLoginModal(false);
    }
});

elements.assistantLauncher.addEventListener('click', () => {
    elements.assistantPanel.classList.toggle('open');
    elements.assistantInput.focus();
});

elements.assistantClose.addEventListener('click', () => {
    elements.assistantPanel.classList.remove('open');
});

elements.assistantForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = elements.assistantInput.value;
    elements.assistantInput.value = '';
    await sendAssistantQuestion(question);
});

document.querySelectorAll('.assistant-chip').forEach((chip) => {
    chip.addEventListener('click', async () => {
        await sendAssistantQuestion(chip.dataset.prompt || chip.textContent || '');
    });
});

window.controlDevice = async (device, status) => {
    if (!auth.currentUser) {
        alert('Bạn cần đăng nhập Admin để điều khiển.');
        toggleLoginModal(true);
        return;
    }

    const isStreetLight = device === 'street_light';
    const modeKey = isStreetLight ? 'street_light_auto' : 'pump_auto';
    const isAuto = normalizeMode(dashboardState.modes?.[modeKey], true);
    if (isAuto) {
        alert('Thiết bị đang ở chế độ AUTO. Chuyển sang MANUAL để điều khiển tay.');
        return;
    }

    await set(ref(db, `smartcity/devices/${device}`), status);
    const deviceName = device === 'street_light' ? 'Đèn đường' : 'Máy bơm thoát nước';
    appendLog(`Admin đã ${status === 'ON' ? 'BẬT' : 'TẮT'} ${deviceName}`);
};

window.toggleDevice = async (device) => {
    const currentElement = device === 'street_light' ? elements.streetLightState : elements.waterPumpState;
    const nextState = currentElement.textContent.trim().toUpperCase() === 'ON' ? 'OFF' : 'ON';
    await window.controlDevice(device, nextState);
};

window.toggleMode = async (modeKey) => {
    if (!auth.currentUser) {
        alert('Bạn cần đăng nhập Admin để đổi chế độ AUTO/MANUAL.');
        toggleLoginModal(true);
        return;
    }

    const current = normalizeMode(dashboardState.modes?.[modeKey], true);
    await set(ref(db, `smartcity/modes/${modeKey}`), !current);

    const modeName = modeKey === 'street_light_auto' ? 'Đèn đường' : 'Máy bơm';
    appendLog(`Admin chuyển ${modeName} sang ${!current ? 'AUTO' : 'MANUAL'}`);
};