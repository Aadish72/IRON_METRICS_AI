// 1. Handle Intro Animation
window.addEventListener('load', () => {
    setTimeout(() => {
        const intro = document.getElementById('intro-overlay');
        const dash = document.getElementById('dashboard-view');
        
        intro.style.opacity = '0';
        setTimeout(() => {
            intro.style.display = 'none';
            dash.classList.add('visible');
        }, 800);
    }, 2000);
});

// 2. Navigation Functions
function showForceMode() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('force-view').style.display = 'flex';
}

// function showDashboard() {
//     document.getElementById('force-view').style.display = 'none';
//     document.getElementById('dashboard-view').style.display = 'flex';
// }

// Add this to your Navigation section
function showHeartMode() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('heart-view').style.display = 'flex';
}

// Update your existing showDashboard to hide the heart view too
function showDashboard() {
    document.getElementById('force-view').style.display = 'none';
    document.getElementById('heart-view').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'flex';
}

// Reset function for Heart Sync
function resetHeartForm() {
    document.getElementById('heart-input-stack').style.display = 'grid';
    document.getElementById('heart-results').style.display = 'none';

    const btn = document.querySelector('#heart-view .compute-btn');
    btn.innerHTML = "SYNC_BIOMETRICS";
    btn.disabled = false;

    
    // Clear inputs
    document.getElementById('h-age').value = "";
    document.getElementById('h-weight').value = "";
    document.getElementById('h-steps').value = "";
    document.getElementById('h-calories').value = "";
}



function setForceGauge(force) {
    const circle = document.getElementById('force-gauge');
    if (!circle) return;
    const circumference = 70 * 2 * Math.PI; // 439.8
    const maxForce = 1000;
    const percent = Math.min((force / maxForce) * 100, 100);
    const offset = circumference - (percent / 100 * circumference);
    circle.style.strokeDashoffset = offset;
}




// 3. Compute Logic
async function triggerCompute() {
    const inputs = document.querySelectorAll('#force-view .force-input');
    const btn = document.querySelector('#force-view .compute-btn');
    const results = document.getElementById('results-display');
    const stack = document.getElementById('force-input-stack');
    const errorMsg = document.getElementById('error-msg'); // Target the error div

    // Clear previous errors
    errorMsg.innerText = "";
    
    // Define the labels for better error reporting
    const labels = [
        "SIDE_TO_SIDE_PEAK", "UP_AND_DOWN_PEAK", "FORWARD_AND_BACK_PEAK",
        "ROTATION_SPEED_X_PEAK", "ROTATION_SPEED_Y_PEAK", 
        "ROTATION_SPEED_Z_PEAK", "TOTAL_ENERGY"
    ];

    let validationError = "";
    const values = [];

    // 1. VALIDATION LOOP
    inputs.forEach((input, index) => {
        const val = input.value.trim();
        const num = parseFloat(val);

        if (validationError) return; // Stop checking if we already found an error

        // Check if empty
        if (val === "") {
            validationError = `MISSING_DATA: ${labels[index]} IS REQUIRED.`;
        } 
        // Check if it's a valid number
        else if (isNaN(num)) {
            validationError = `INVALID_TYPE: ${labels[index]} MUST BE A NUMBER.`;
        }
        // Check Range (1.0 to 8.0)
        else if (num < 1.0 || num > 8.0) {
            validationError = `OUT_OF_BOUNDS: ${labels[index]} MUST BE BETWEEN 1.0 AND 8.0.`;
        }

        values.push(num);
    });

    if (validationError) {
        errorMsg.innerText = validationError;
        // Optional: Shake the button or change color to show error
        btn.style.background = "var(--blood)";
        setTimeout(() => btn.style.background = "", 2000);
        return; 
    }

    // 2. PREPARE PAYLOAD
    const payload = {
        side: values[0],
        up_down: values[1],
        forward: values[2],
        rot_x: values[3],
        rot_y: values[4],
        rot_z: values[5],
        energy: values[6]
    };

    // 3. SEND TO BACKEND
    btn.innerHTML = "RUNNING_INFERENCE...";
    btn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        stack.style.display = 'none';
        results.style.display = 'block';
        document.getElementById('out-force').innerText = data.force;
        document.getElementById('out-efficiency').innerText = data.efficiency;

        const forcePercent = Math.min((data.force / 1000) * 100, 100);
        setForceGauge(data.force);

        updateBeastUI(data.force);

        









    } catch (err) {
        errorMsg.innerText = "SYSTEM_OFFLINE: CHECK BACKEND STATUS.";
        btn.innerHTML = "COMPUTE_IMPACT";
        btn.disabled = false;
    }
}
function updateBeastUI(force) {
    const rank = document.getElementById('rank-badge');
    const qMain = document.getElementById('quote-main');
    const qSub = document.getElementById('quote-sub');
    const container = document.getElementById('results-display');

    container.classList.remove('beast-mode-glow');

    if (force < 50) {
        rank.innerText = "RANK // RECRUIT";
        qMain.innerText = `FORCE: ${force}N — LIGHT EFFORT.`;
        qSub.innerText = "Wake the muscle. Add some force.";
    } else if (force < 200) {
        rank.innerText = "RANK // CONTENDER";
        qMain.innerText = `FORCE: ${force}N — PRESSURE DETECTED.`;
        qSub.innerText = "Not bad. Not enough. Amplify.";
    } else if (force < 500) {
        rank.innerText = "RANK // ELITE";
        qMain.innerText = "MAX PRESSURE ENGAGED.";
        qSub.innerText = "THIS IS POWER.";
    } else {
        rank.innerText = "RANK // BEAST";
        qMain.innerText = "BEAST MODE: ACTIVE.";
        qSub.innerText = "SYSTEM OVERLOAD. LIMITS: DESTROYED.";
        container.classList.add('beast-mode-glow');
    }
}

function resetForceForm() {
    document.getElementById('force-input-stack').style.display = 'block';
    document.getElementById('results-display').style.display = 'none';
    const btn = document.querySelector('#force-view .compute-btn');
    btn.innerHTML = "COMPUTE_IMPACT";
    btn.disabled = false;
    
    // Reset Gauge to 0
    const circle = document.getElementById('force-gauge');
    if (circle) circle.style.strokeDashoffset = 70 * 2 * Math.PI;

    const inputs = document.querySelectorAll('#force-view .force-input');
    inputs.forEach(input => input.value = "");
}






async function triggerHeartSync() {
    const age = document.getElementById('h-age').value.trim();
    const weight = document.getElementById('h-weight').value.trim();
    const steps = document.getElementById('h-steps').value.trim();
    const calories = document.getElementById('h-calories').value.trim();
    const activity = document.getElementById('h-activity').value;

    const btn = document.querySelector('#heart-view .compute-btn');
    const results = document.getElementById('heart-results');
    const stack = document.getElementById('heart-input-stack');
    const errorMsg = document.getElementById('heart-error-msg');

    // Reset Error State
    errorMsg.innerText = "";

    // --- VALIDATION ---
    if (!age || !weight || !steps || !calories) {
        errorMsg.innerText = "SYSTEM_ERROR: ALL BIOMETRIC FIELDS REQUIRED.";
        return;
    }

    const payload = {
        age: parseInt(age),
        weight: parseInt(weight),
        steps: parseInt(steps),
        calories: parseInt(calories),
        activity_level: parseInt(activity)
    };

    // Range Checks
    if (payload.age < 18 || payload.age > 100) {
        errorMsg.innerText = "INVALID_AGE: MUST BE BETWEEN 18-100.";
        return;
    }

    btn.innerHTML = "SYNCING_BIOMETRICS...";
    btn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:8000/predict_heart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        stack.style.display = 'none';
        results.style.display = 'block';
        document.getElementById('out-bpm').innerText = data.bpm;

        updateHeartUI(data.bpm);

    } catch (err) {
        errorMsg.innerText = "BACKEND_OFFLINE: CORE ENGINE NOT RESPONDING.";
        btn.innerHTML = "SYNC_BIOMETRICS";
        btn.disabled = false;
    }
}
function updateHeartUI(bpm) {
    const rank = document.getElementById('h-rank');
    const qMain = document.getElementById('h-quote-main');
    const qSub = document.getElementById('h-quote-sub');

    // Applying your specific messages
    if (bpm >= 60 && bpm <= 100) {
        rank.innerText = "STATUS // OPTIMAL";
        qMain.innerText = "HEART RATE: OPTIMAL.";
        qSub.innerText = "System stable. Performance efficiency at peak.";
    } 
    else if (bpm > 100) {
        rank.innerText = "STATUS // ELEVATED";
        qMain.innerText = "HEART RATE: ELEVATED.";
        qSub.innerText = "Body under load. Maintain rhythm.";
    } 
    else {
        rank.innerText = "STATUS // LOW_INTENSITY";
        qMain.innerText = "HEART RATE: LOW.";
        qSub.innerText = "Insufficient intensity. Increase effort.";
    }
}

// Handle Activity Toggle Selection
document.querySelectorAll('.activity-option').forEach(option => {
    option.addEventListener('click', function() {
        // 1. Remove active class from all
        document.querySelectorAll('.activity-option').forEach(opt => opt.classList.remove('active'));
        
        // 2. Add to clicked one
        this.classList.add('active');
        
        // 3. Update the hidden input value
        document.getElementById('h-activity').value = this.getAttribute('data-value');
    });
});


// Navigation for Fuel
function showFuelMode() {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('fuel-view').style.display = 'flex';
}

// Update showDashboard to include Fuel
function showDashboard() {
    document.getElementById('force-view').style.display = 'none';
    document.getElementById('heart-view').style.display = 'none';
    document.getElementById('fuel-view').style.display = 'none'; // ADD THIS
    document.getElementById('dashboard-view').style.display = 'flex';
}

// Fuel Toggle Logic
document.querySelectorAll('.f-activity-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.f-activity-option').forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('f-activity').value = this.getAttribute('data-value');
    });
});

async function triggerFuelCompute() {
    const age = document.getElementById('f-age').value;
    const weight = document.getElementById('f-weight').value;
    const steps = document.getElementById('f-steps').value;
    const workout = document.getElementById('f-workout').value;
    const activity = document.getElementById('f-activity').value;
    const errorMsg = document.getElementById('fuel-error-msg');
    const btn = document.querySelector('#fuel-view .compute-btn');

    errorMsg.innerText = "";

    if (!age || !weight || !steps || !workout) {
        errorMsg.innerText = "CRITICAL_MISSING: ALL PARAMETERS REQUIRED.";
        return;
    }

    btn.innerHTML = "CALCULATING_BURN...";
    btn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:8000/predict_fuel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                age: Number(age),
                weight: Number(weight),
                steps: Number(steps),
                activity_level: Number(activity),
                workout_minutes: Number(workout)
            })
        });

        const data = await response.json();
        document.getElementById('fuel-input-stack').style.display = 'none';
        document.getElementById('fuel-results').style.display = 'block';
        document.getElementById('out-calories').innerText = data.calories;

        // Simple UI Update
        const rank = document.getElementById('f-rank');
        rank.innerText = data.calories > 2500 ? "STATUS // HIGH_BURN" : "STATUS // STEADY";
        document.getElementById('f-quote-main').innerText = "FUEL EXHAUSTED.";
        document.getElementById('f-quote-sub').innerText = "Energy reserves depleted. Refuel required.";

    } catch (err) {
        errorMsg.innerText = "BACKEND_ERROR: Is the fuel endpoint active?";
        btn.innerHTML = "TRACK_BURN";
        btn.disabled = false;
    }
}

function resetFuelForm() {
    document.getElementById('fuel-input-stack').style.display = 'grid';
    document.getElementById('fuel-results').style.display = 'none';
    const btn = document.querySelector('#fuel-view .compute-btn');
    btn.innerHTML = "TRACK_BURN";
    btn.disabled = false;
}