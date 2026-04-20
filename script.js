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
    faceLoginModal: document.getElementById('face-login-modal'),
    faceEnrollModal: document.getElementById('face-enroll-modal'),
    cancelLogin: document.getElementById('cancel-login'),
    cancelFaceLogin: document.getElementById('cancel-face-login'),
    closeFaceEnroll: document.getElementById('close-face-enroll'),
    submitLogin: document.getElementById('submit-login'),
    switchFaceLogin: document.getElementById('switch-face-login'),
    openTraditionalLogin: document.getElementById('open-traditional-login'),
    startFaceLogin: document.getElementById('start-face-login'),
    enrollFaceBtn: document.getElementById('enroll-face-btn'),
    captureFaceEnroll: document.getElementById('capture-face-enroll'),
    traditionalLoginHint: document.getElementById('traditional-login-hint'),
    faceLoginStatus: document.getElementById('face-login-status'),
    faceEnrollStatus: document.getElementById('face-enroll-status'),
    faceLoginVideo: document.getElementById('faceLoginVideo'),
    faceEnrollVideo: document.getElementById('faceEnrollVideo'),
    faceLoginOverlay: document.getElementById('faceLoginOverlay'),
    faceEnrollOverlay: document.getElementById('faceEnrollOverlay'),
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

const faceAuthState = {
    modelsLoaded: false,
    sessionActive: false,
    activeMode: null,
    stream: null,
    descriptor: null,
    label: null,
    trackingTimer: null
};

const faceAuthConfig = {
    modelUrl: './models',
    storageKey: 'smartcity_face_descriptor_v1',
    threshold: 0.38,
    minSamples: 3,
    maxSamples: 6,
    sampleIntervalMs: 140,
    modelLoadTimeoutMs: 20000,
    cameraStartTimeoutMs: 15000
};

const mapZoneMeta = new Map([
    ['floodZoneGroup', {
        title: 'Kênh thoát nước',
        detail: 'Theo dõi mực nước và cảnh báo ngập theo realtime từ Firebase.'
    }],
    ['parkingZoneGroup', {
        title: 'Bãi đỗ xe',
        detail: 'Hiển thị số chỗ trống để đánh giá tải giao thông khu trung tâm.'
    }],
    ['streetLightMarker', {
        title: 'Đèn đường',
        detail: 'Nhấp để xem trạng thái ON/OFF và chế độ AUTO/MANUAL của đèn.'
    }],
    ['pumpMarker', {
        title: 'Máy bơm thoát nước',
        detail: 'Thiết bị hỗ trợ chống ngập và có thể tự động điều khiển theo mực nước.'
    }],
    ['airQualityMarker', {
        title: 'Trạm AQI',
        detail: 'Giám sát chất lượng không khí của khu vực để cập nhật cảnh báo đô thị.'
    }],
    ['tempSensorMarker', {
        title: 'Sensor môi trường',
        detail: 'Cụm cảm biến nhiệt độ, độ ẩm và điều kiện môi trường tổng hợp.'
    }],
    ['controlCenterMarker', {
        title: 'Trung tâm điều khiển',
        detail: 'Điểm điều phối vận hành toàn hệ thống smart city giả lập.'
    }]
]);

const mapDefaultFocus = {
    title: 'Bản đồ tổng quan',
    detail: 'Rê chuột hoặc nhấn vào khu trên bản đồ để xem chi tiết.'
};

function isAdminAuthenticated() {
    return Boolean(auth.currentUser || faceAuthState.sessionActive);
}

function setAdminUiState() {
    const adminControls = document.querySelectorAll('.admin-only');
    const isAuthenticated = isAdminAuthenticated();

    if (isAuthenticated) {
        elements.authButton.textContent = 'Đăng xuất';
        adminControls.forEach((control) => {
            control.style.display = 'flex';
        });
        elements.curatorAccess.textContent = faceAuthState.sessionActive ? 'Đã xác thực Face ID' : 'Đã xác thực admin';
    } else {
        elements.authButton.textContent = 'Đăng nhập Face ID';
        adminControls.forEach((control) => {
            control.style.display = 'none';
        });
        elements.curatorAccess.textContent = 'Đăng nhập demo';
    }
}

function loadFaceProfileFromStorage() {
    try {
        const raw = localStorage.getItem(faceAuthConfig.storageKey);
        if (!raw) {
            return;
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.descriptor) || !parsed.descriptor.length) {
            return;
        }

        faceAuthState.label = parsed.label || 'admin';
        faceAuthState.descriptor = new Float32Array(parsed.descriptor);
    } catch (error) {
        faceAuthState.label = null;
        faceAuthState.descriptor = null;
    }
}

function saveFaceProfile(label, descriptor) {
    localStorage.setItem(faceAuthConfig.storageKey, JSON.stringify({
        label,
        descriptor: Array.from(descriptor)
    }));

    faceAuthState.label = label;
    faceAuthState.descriptor = new Float32Array(descriptor);
}

async function waitForFaceApiScript(timeoutMs = 8000) {
    if (window.faceapi) {
        return window.faceapi;
    }

    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            if (window.faceapi) {
                resolve(window.faceapi);
                return;
            }
            if (Date.now() - start > timeoutMs) {
                reject(new Error('face-api.js script chưa tải xong (timeout). Kiểm tra kết nối mạng.'));
                return;
            }
            setTimeout(check, 200);
        };
        check();
    });
}

async function loadFaceModels() {
    if (faceAuthState.modelsLoaded) {
        return;
    }

    elements.faceLoginStatus.textContent = 'Đang chờ face-api.js tải về...';
    elements.faceEnrollStatus.textContent = 'Đang chờ face-api.js tải về...';

    const faceApi = await waitForFaceApiScript(10000);

    elements.faceLoginStatus.textContent = 'Đang tải model nhận diện (có thể mất 10-20s)...';
    elements.faceEnrollStatus.textContent = 'Đang tải model nhận diện (có thể mất 10-20s)...';

    const loadModelsPromise = Promise.all([
        faceApi.nets.tinyFaceDetector.loadFromUri(faceAuthConfig.modelUrl),
        faceApi.nets.faceLandmark68Net.loadFromUri(faceAuthConfig.modelUrl),
        faceApi.nets.faceRecognitionNet.loadFromUri(faceAuthConfig.modelUrl)
    ]);

    const timeoutPromise = new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error('Face models load timeout')), faceAuthConfig.modelLoadTimeoutMs);
    });

    await Promise.race([loadModelsPromise, timeoutPromise]);

    faceAuthState.modelsLoaded = true;
}

function getFaceElementsByMode(mode) {
    if (mode === 'enroll') {
        return {
            video: elements.faceEnrollVideo,
            overlay: elements.faceEnrollOverlay,
            status: elements.faceEnrollStatus
        };
    }

    return {
        video: elements.faceLoginVideo,
        overlay: elements.faceLoginOverlay,
        status: elements.faceLoginStatus
    };
}

function syncOverlaySize(video, canvas) {
    const nextWidth = Math.max(1, Math.floor(video.clientWidth));
    const nextHeight = Math.max(1, Math.floor(video.clientHeight));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
    }
}

function clearOverlay(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawFocusBox(canvas, video, box) {
    const ctx = canvas.getContext('2d');
    clearOverlay(canvas);

    if (!box || !video.videoWidth || !video.videoHeight) {
        return;
    }

    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;
    const x = box.x * scaleX;
    const y = box.y * scaleY;
    const width = box.width * scaleX;
    const height = box.height * scaleY;

    ctx.strokeStyle = '#00d26a';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    const corner = Math.max(12, Math.min(width, height) * 0.18);
    ctx.beginPath();
    ctx.moveTo(x, y + corner);
    ctx.lineTo(x, y);
    ctx.lineTo(x + corner, y);

    ctx.moveTo(x + width - corner, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + corner);

    ctx.moveTo(x + width, y + height - corner);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width - corner, y + height);

    ctx.moveTo(x + corner, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + height - corner);
    ctx.stroke();
}

async function detectFace(videoElement, withDescriptor = false) {
    const faceApi = window.faceapi;
    let detection = await faceApi
        .detectSingleFace(videoElement, new faceApi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.55 }))
        .withFaceLandmarks();

    if (detection && withDescriptor) {
        detection = await faceApi
            .detectSingleFace(videoElement, new faceApi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.55 }))
            .withFaceLandmarks()
            .withFaceDescriptor();
    }

    return detection;
}

function stopFaceTracking() {
    if (faceAuthState.trackingTimer) {
        clearTimeout(faceAuthState.trackingTimer);
        faceAuthState.trackingTimer = null;
    }

    clearOverlay(elements.faceLoginOverlay);
    clearOverlay(elements.faceEnrollOverlay);
}

async function startFaceTracking(mode) {
    stopFaceTracking();

    const run = async () => {
        if (faceAuthState.activeMode !== mode) {
            return;
        }

        const { video, overlay, status } = getFaceElementsByMode(mode);
        if (!video || !overlay || !video.videoWidth) {
            faceAuthState.trackingTimer = setTimeout(run, 120);
            return;
        }

        syncOverlaySize(video, overlay);
        const detection = await detectFace(video, false);
        if (detection?.detection?.box) {
            drawFocusBox(overlay, video, detection.detection.box);
            if (status.textContent.includes('khung')) {
                status.textContent = 'Đã bắt được khuôn mặt. Bạn có thể tiến hành xác thực.';
            }
        } else {
            clearOverlay(overlay);
        }

        faceAuthState.trackingTimer = setTimeout(run, 120);
    };

    await run();
}

function averageDescriptors(descriptors) {
    const length = descriptors[0].length;
    const avg = new Float32Array(length);

    for (let i = 0; i < length; i += 1) {
        let sum = 0;
        descriptors.forEach((descriptor) => {
            sum += descriptor[i];
        });
        avg[i] = sum / descriptors.length;
    }

    return avg;
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureStableDescriptor(videoElement) {
    const samples = [];

    for (let i = 0; i < faceAuthConfig.maxSamples; i += 1) {
        const detection = await detectFace(videoElement, true);
        if (detection?.descriptor && detection?.detection?.score >= 0.72) {
            samples.push(detection.descriptor);
        }

        if (samples.length >= faceAuthConfig.minSamples) {
            break;
        }

        await wait(faceAuthConfig.sampleIntervalMs);
    }

    if (samples.length < faceAuthConfig.minSamples) {
        return null;
    }

    return averageDescriptors(samples);
}

async function startFaceCamera(mode) {
    const target = mode === 'enroll' ? elements.faceEnrollVideo : elements.faceLoginVideo;

    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not available');
    }

    if (!faceAuthState.stream) {
        const cameraPromise = navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
        });

        const timeoutPromise = new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error('Camera start timeout')), faceAuthConfig.cameraStartTimeoutMs);
        });

        faceAuthState.stream = await Promise.race([cameraPromise, timeoutPromise]);
    }

    faceAuthState.activeMode = mode;
    target.srcObject = faceAuthState.stream;
    await target.play();
    await startFaceTracking(mode);
}

function stopFaceCamera() {
    stopFaceTracking();

    if (faceAuthState.stream) {
        faceAuthState.stream.getTracks().forEach((track) => track.stop());
    }

    faceAuthState.stream = null;
    faceAuthState.activeMode = null;
    elements.faceLoginVideo.srcObject = null;
    elements.faceEnrollVideo.srcObject = null;
}

async function openFaceLoginModal(show) {
    elements.faceLoginModal.style.display = show ? 'flex' : 'none';
    if (!show) {
        stopFaceCamera();
        return;
    }

    elements.faceLoginStatus.textContent = 'Đang khởi tạo Face ID...';
    try {
        await loadFaceModels();
    } catch (error) {
        console.warn('Face model load failed:', error);
        elements.faceLoginStatus.textContent = '⚠ Không tải được model Face ID. Bạn có thể dùng "Đăng nhập truyền thống" phía dưới.';
        return;
    }

    try {
        await startFaceCamera('login');
    } catch (error) {
        console.warn('Camera start failed:', error);
        elements.faceLoginStatus.textContent = '⚠ Không thể mở camera. Kiểm tra quyền camera hoặc dùng "Đăng nhập truyền thống".';
        return;
    }

    if (faceAuthState.descriptor) {
        elements.faceLoginStatus.textContent = 'Mời đặt khuôn mặt vào khung và bấm Quét khuôn mặt.';
    } else {
        elements.faceLoginStatus.textContent = 'Chưa có khuôn mặt mẫu. Hãy dùng "Đăng nhập truyền thống" để thêm khuôn mặt.';
    }
}

async function openFaceEnrollModal(show) {
    elements.faceEnrollModal.style.display = show ? 'flex' : 'none';
    if (!show) {
        stopFaceCamera();
        return;
    }

    elements.faceEnrollStatus.textContent = 'Đang khởi tạo camera để thêm khuôn mặt...';
    try {
        await loadFaceModels();
    } catch (error) {
        console.warn('Face model load failed (enroll):', error);
        elements.faceEnrollStatus.textContent = '⚠ Không tải được model Face ID. Kiểm tra kết nối mạng rồi thử lại.';
        return;
    }

    try {
        await startFaceCamera('enroll');
        elements.faceEnrollStatus.textContent = 'Đặt khuôn mặt vào giữa khung rồi bấm Lưu khuôn mặt.';
    } catch (error) {
        console.warn('Camera start failed (enroll):', error);
        elements.faceEnrollStatus.textContent = '⚠ Không thể mở camera. Kiểm tra quyền truy cập camera.';
    }
}

async function verifyFaceLogin() {
    if (!faceAuthState.descriptor) {
        elements.faceLoginStatus.textContent = 'Chưa có khuôn mặt mẫu. Hãy đăng nhập truyền thống để thêm khuôn mặt.';
        return;
    }

    elements.faceLoginStatus.textContent = 'Đang nhận diện...';
    const descriptor = await captureStableDescriptor(elements.faceLoginVideo);
    if (!descriptor) {
        elements.faceLoginStatus.textContent = 'Không lấy đủ mẫu khuôn mặt rõ nét. Vui lòng giữ yên mặt và thử lại.';
        return;
    }

    const distance = window.faceapi.euclideanDistance(descriptor, faceAuthState.descriptor);
    if (distance <= faceAuthConfig.threshold) {
        faceAuthState.sessionActive = true;
        setAdminUiState();
        elements.faceLoginStatus.textContent = 'Xác thực thành công.';
        appendLog('Đăng nhập Face ID thành công');
        window.setTimeout(() => {
            openFaceLoginModal(false);
        }, 350);
    } else {
        elements.faceLoginStatus.textContent = `Khuôn mặt không khớp mẫu đã đăng ký (độ lệch: ${distance.toFixed(3)}).`;
    }
}

async function enrollCurrentFace() {
    if (!auth.currentUser) {
        elements.faceEnrollStatus.textContent = 'Cần đăng nhập truyền thống trước khi thêm khuôn mặt.';
        return;
    }

    elements.faceEnrollStatus.textContent = 'Đang trích xuất đặc trưng khuôn mặt...';
    const descriptor = await captureStableDescriptor(elements.faceEnrollVideo);
    if (!descriptor) {
        elements.faceEnrollStatus.textContent = 'Không lấy đủ mẫu khuôn mặt rõ nét. Hãy thử lại ở nơi đủ sáng và giữ mặt ổn định.';
        return;
    }

    saveFaceProfile(auth.currentUser.email || 'admin', descriptor);
    elements.faceEnrollStatus.textContent = 'Đã lưu khuôn mặt nhận diện thành công.';
    appendLog('Admin đã cập nhật khuôn mặt nhận diện Face ID');
}

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

function setMapZoneState(element, state) {
    if (!element) {
        return;
    }
    element.classList.remove('is-safe', 'is-watch', 'is-danger', 'is-on', 'is-off');
    if (state) {
        element.classList.add(state);
    }
}

function clearMapSelection() {
    document.querySelectorAll('.map-zone.is-selected').forEach((zone) => {
        zone.classList.remove('is-selected');
    });
}

function setMapFocus(zoneId) {
    const meta = mapZoneMeta.get(zoneId) || mapDefaultFocus;
    if (elements.mapFocusTitle) {
        elements.mapFocusTitle.textContent = meta.title;
    }
    if (elements.mapFocusDetail) {
        elements.mapFocusDetail.textContent = meta.detail;
    }
}

function bindMapInteractions() {
    mapZoneMeta.forEach((_, zoneId) => {
        const zone = elements[zoneId];
        if (!zone) {
            return;
        }

        zone.setAttribute('tabindex', '0');
        zone.addEventListener('mouseenter', () => setMapFocus(zoneId));
        zone.addEventListener('focus', () => setMapFocus(zoneId));
        zone.addEventListener('click', () => {
            clearMapSelection();
            zone.classList.add('is-selected');
            setMapFocus(zoneId);
        });
    });
}

function updateCityMap(temperature, parking, waterLevel, airQuality, lightLevel, devices, modes) {
    if (!elements.floodZoneGroup) {
        return;
    }

    const floodLabel = getFloodLabel(waterLevel);
    const streetLightAuto = normalizeMode(modes.street_light_auto, true);
    const pumpAuto = normalizeMode(modes.pump_auto, true);
    const streetLightState = String(devices.street_light ?? 'OFF').toUpperCase();
    const pumpState = String(devices.water_pump ?? 'OFF').toUpperCase();
    const floodStateClass = floodLabel === 'an toàn' ? 'is-safe' : floodLabel === 'cảnh báo ngập' ? 'is-watch' : 'is-danger';
    const parkingStatus = parking === null ? 'Đang chờ' : parking <= 0 ? 'Hết chỗ' : `${parking} chỗ trống`;

    if (elements.mapFloodStatus) {
        elements.mapFloodStatus.textContent = floodLabel === 'an toàn' ? 'An toàn' : floodLabel === 'cảnh báo ngập' ? 'Cảnh báo' : 'Ngập cao';
    }
    if (elements.mapStreetLightStatus) {
        elements.mapStreetLightStatus.textContent = `${streetLightState} / ${streetLightAuto ? 'AUTO' : 'MANUAL'}`;
    }
    if (elements.mapPumpStatus) {
        elements.mapPumpStatus.textContent = `${pumpState} / ${pumpAuto ? 'AUTO' : 'MANUAL'}`;
    }
    if (elements.mapAirQualityStatus) {
        elements.mapAirQualityStatus.textContent = airQuality === null ? '--' : String(airQuality);
    }
    if (elements.parkingZoneLabel) {
        elements.parkingZoneLabel.textContent = parkingStatus;
    }
    if (elements.floodZoneLabel) {
        elements.floodZoneLabel.textContent = waterLevel === null ? 'Mực nước: --%' : `Mực nước: ${waterLevel}%`;
    }

    setMapZoneState(elements.floodZoneGroup, floodStateClass);
    setMapZoneState(elements.parkingZoneGroup, parking !== null && parking <= 0 ? 'is-danger' : parking !== null && parking <= 4 ? 'is-watch' : 'is-safe');
    setMapZoneState(elements.streetLightMarker, streetLightState === 'ON' ? 'is-on' : 'is-off');
    setMapZoneState(elements.pumpMarker, pumpState === 'ON' ? 'is-on' : 'is-off');
    setMapZoneState(elements.airQualityMarker, airQuality === null ? 'is-safe' : airQuality >= 80 ? 'is-danger' : airQuality >= 55 ? 'is-watch' : 'is-safe');
    setMapZoneState(elements.tempSensorMarker, temperature !== null && temperature > 35 ? 'is-danger' : 'is-safe');
    setMapZoneState(elements.controlCenterMarker, lightLevel !== null && lightLevel < 20 ? 'is-watch' : 'is-safe');

    if (!document.querySelector('.map-zone.is-selected')) {
        setMapFocus('');
    }
}

function buildAssistantReply(question) {
    const text = question.toLowerCase();
    const trimmed = text.trim();
    const snap = assistantState.lastSnapshot;
    const greetingPattern = /(^|\s)(xin chào|xin chao|chào|chao|hello|hi|hey)(\s|$|[.!?,])/i;

    // Only treat as greeting when it is actually a short greeting phrase.
    if (greetingPattern.test(trimmed) && trimmed.length <= 40) {
        return 'Chào bạn, mình vẫn theo dõi dashboard đô thị cho bạn, nhưng cũng có thể trò chuyện tự do về học tập, công nghệ hoặc ý tưởng dự án.';
    }

    if (
        text.includes('ai là ai') ||
        text.includes('bạn là ai') ||
        text.includes('làm được gì') ||
        text.includes('giúp gì')
    ) {
        return 'Mình là trợ lý AI trong dashboard này: vừa hỗ trợ dữ liệu smart city theo thời gian thực, vừa có thể trao đổi các chủ đề ngoài lề theo kiểu chat tự nhiên.';
    }

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

    return `Mình hiểu câu hỏi của bạn về "${question.trim()}". Nếu bạn muốn trao đổi ngoài lề, cứ nói rõ chủ đề (ví dụ học tập, code, công nghệ, ý tưởng dự án), mình sẽ trả lời tự nhiên; còn nếu liên quan smart city thì mình sẽ bám theo dữ liệu realtime hiện có.`;
}

function buildAssistantSystemPrompt() {
    const snap = assistantState.lastSnapshot;
    return [
        'Bạn là AI Assist cho dashboard smart city bằng tiếng Việt.',
        'Trả lời tự nhiên, thân thiện, đúng trọng tâm; mặc định 3-6 câu và có thể dài hơn khi người dùng yêu cầu.',
        'Bạn được phép trao đổi cả chủ đề ngoài lề (học tập, công nghệ, đời sống, ý tưởng...) thay vì chỉ giới hạn ở smart city.',
        'Khi câu hỏi liên quan dashboard thì ưu tiên dùng ngữ cảnh sensor và trạng thái thiết bị hiện tại.',
        'Khi câu hỏi không liên quan dashboard, vẫn trả lời bình thường như một trợ lý AI đa năng.',
        `Ngữ cảnh: nhiệt độ ${snap.temperature ?? '--'}°C, độ ẩm ${snap.humidity ?? '--'}%, bãi xe ${snap.parking ?? '--'} chỗ, mực nước ${snap.waterLevel ?? '--'}%, AQI ${snap.airQuality ?? '--'}, ánh sáng ${snap.lightLevel ?? '--'}%.`,
        `Đèn đường: ${snap.streetLightState}, chế độ ${snap.streetLightAuto ? 'AUTO' : 'MANUAL'}.`,
        `Máy bơm: ${snap.waterPumpState}, chế độ ${snap.pumpAuto ? 'AUTO' : 'MANUAL'}.`,
        'Không tự nhận có hành động ngoài phạm vi chat (không giả vờ đã điều khiển thiết bị).',
        'Nếu không chắc, hãy nói rõ giới hạn thay vì bịa thông tin.'
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
            temperature: 0.7,
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
    const waterValue = normalizeNumber(waterLevel, 0);
    const airValue = normalizeNumber(airQuality, 0);
    const lightValue = normalizeNumber(lightLevel, 0);

    const riskLabel = waterValue === null ? 'AN TOÀN' : (waterValue >= 75 ? 'NGẬP CAO' : waterValue >= 45 ? 'CẢNH BÁO' : 'AN TOÀN');

    elements.curatorAccess.textContent = isAdminAuthenticated() ? 'Đã xác thực admin' : 'Đăng nhập demo';

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
    updateCityMap(temperature, parking, waterLevel, airQuality, lightLevel, devices, modes);

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
    if (!user) {
        elements.enrollFaceBtn.disabled = true;
        if (!faceAuthState.sessionActive) {
            elements.traditionalLoginHint.textContent = 'Dùng tài khoản truyền thống để thêm/cập nhật khuôn mặt nhận diện.';
        }
    } else {
        elements.enrollFaceBtn.disabled = false;
        elements.traditionalLoginHint.textContent = 'Đăng nhập truyền thống thành công. Bạn có thể thêm khuôn mặt nhận diện.';
    }

    setAdminUiState();
});

async function handleLogin() {
    const email = elements.email.value.trim();
    const password = elements.password.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        elements.enrollFaceBtn.disabled = false;
        elements.traditionalLoginHint.textContent = 'Đăng nhập truyền thống thành công. Hãy bấm Thêm khuôn mặt nhận diện.';
    } catch (error) {
        alert('Sai tài khoản hoặc mật khẩu');
    }
}

function toggleLoginModal(show) {
    elements.loginModal.style.display = show ? 'flex' : 'none';
}

elements.authButton.addEventListener('click', async () => {
    if (isAdminAuthenticated()) {
        faceAuthState.sessionActive = false;
        if (auth.currentUser) {
            await signOut(auth);
        }
        setAdminUiState();
        appendLog('Admin đã đăng xuất');
        return;
    }

    openFaceLoginModal(true);
});

elements.cancelLogin.addEventListener('click', () => toggleLoginModal(false));
elements.submitLogin.addEventListener('click', handleLogin);
elements.switchFaceLogin.addEventListener('click', async () => {
    toggleLoginModal(false);
    await openFaceLoginModal(true);
});
elements.openTraditionalLogin.addEventListener('click', async () => {
    await openFaceLoginModal(false);
    toggleLoginModal(true);
});
elements.cancelFaceLogin.addEventListener('click', async () => {
    await openFaceLoginModal(false);
});
elements.startFaceLogin.addEventListener('click', verifyFaceLogin);
elements.enrollFaceBtn.addEventListener('click', async () => {
    if (!auth.currentUser) {
        alert('Bạn cần đăng nhập truyền thống trước khi thêm khuôn mặt.');
        return;
    }

    await openFaceEnrollModal(true);
});
elements.captureFaceEnroll.addEventListener('click', enrollCurrentFace);
elements.closeFaceEnroll.addEventListener('click', async () => {
    await openFaceEnrollModal(false);
});

elements.loginModal.addEventListener('click', (event) => {
    if (event.target === elements.loginModal) {
        toggleLoginModal(false);
    }
});

elements.faceLoginModal.addEventListener('click', async (event) => {
    if (event.target === elements.faceLoginModal) {
        await openFaceLoginModal(false);
    }
});

elements.faceEnrollModal.addEventListener('click', async (event) => {
    if (event.target === elements.faceEnrollModal) {
        await openFaceEnrollModal(false);
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
    if (!isAdminAuthenticated()) {
        alert('Bạn cần đăng nhập Admin để điều khiển.');
        openFaceLoginModal(true);
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
    if (!isAdminAuthenticated()) {
        alert('Bạn cần đăng nhập Admin để đổi chế độ AUTO/MANUAL.');
        openFaceLoginModal(true);
        return;
    }

    const current = normalizeMode(dashboardState.modes?.[modeKey], true);
    await set(ref(db, `smartcity/modes/${modeKey}`), !current);

    const modeName = modeKey === 'street_light_auto' ? 'Đèn đường' : 'Máy bơm';
    appendLog(`Admin chuyển ${modeName} sang ${!current ? 'AUTO' : 'MANUAL'}`);
};

loadFaceProfileFromStorage();
bindMapInteractions();
setAdminUiState();