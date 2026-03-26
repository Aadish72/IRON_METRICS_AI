from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from sklearn.linear_model import LinearRegression

app = FastAPI()

# Enable CORS so your HTML can talk to this Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOAD & TRAIN MODEL ---
df = pd.read_csv("boxing_force_15000.csv")
X = df[["side_to_side_peak", "up_and_down_peak", "forward_and_back_peak",
        "rotation_speed_x_peak", "rotation_speed_y_peak", 
        "rotation_speed_z_peak", "total_energy"]]
y = df["impact_force_newtons"]

model = LinearRegression()
model.fit(X, y)

class PunchInput(BaseModel):
    side: float
    up_down: float
    forward: float
    rot_x: float
    rot_y: float
    rot_z: float
    energy: float

@app.post("/predict")
async def predict(data: PunchInput):
    features = [[data.side, data.up_down, data.forward, 
                 data.rot_x, data.rot_y, data.rot_z, data.energy]]
    
    force_val = model.predict(features)[0]
    efficiency = min((force_val / 1000) * 100, 100) # Assuming 1000N is max
    
    return {"force": round(float(force_val), 2), "efficiency": round(float(efficiency), 1)}



# --- 1. HEART DATA & MODEL ---
# Make sure you've run your generation script and saved 'heart_sync_15000.csv'
df_heart = pd.read_csv("heart_sync_15000 (1).csv") 

# Features must be in the EXACT order they appear in your dataset
X_h = df_heart[["age", "weight", "steps", "calories", "activity_level"]]
y_h = df_heart["heart_rate"]

heart_model = LinearRegression()
heart_model.fit(X_h, y_h)

# --- 2. DATA MODELS (Schemas) ---
class HeartInput(BaseModel):
    age: int
    weight: int
    steps: int
    calories: int
    activity_level: int

# --- 3. ENDPOINTS ---
@app.post("/predict_heart")
async def predict_heart(data: HeartInput):
    # Prepare the features for the model
    features = [[data.age, data.weight, data.steps, data.calories, data.activity_level]]
    
    # Use the trained model to predict
    # .predict() returns a numpy array, we take the first element [0]
    raw_bpm = heart_model.predict(features)[0]
    
    # CRITICAL: Convert numpy.float64 to standard Python float/int
    # This prevents JSON serialization errors
    bpm_val = float(raw_bpm)
    
    # Realistic human limit clamping
    final_bpm = max(60.0, min(180.0, bpm_val))
    
    return {
        "bpm": int(round(final_bpm)), # Force it to a standard Python Integer
        "status": "BIOMETRIC_SYNC_COMPLETE"
    }
    
    
    
    
from fastapi import FastAPI    
from pydantic import BaseModel
import pandas as pd
from sklearn.linear_model import LinearRegression

# 1. Define the Input Schema for Fuel
class FuelInput(BaseModel):
    age: float
    weight: float
    steps: float
    activity_level: float
    workout_minutes: float

# 2. Load and Train the Fuel Model (Global Scope)
# In a real intern project, you'd load a saved .pkl file, 
# but for now, we train on startup:
try:
    df_fuel = pd.read_csv("fuel_tracker_15000.csv")
    X_f = df_fuel[["age", "weight", "steps", "activity_level", "workout_minutes"]]
    y_f = df_fuel["calories_burned"]
    
    fuel_model = LinearRegression()
    fuel_model.fit(X_f, y_f)
    print("FUEL_MODEL_LOADED_SUCCESSFULLY")
except Exception as e:
    print(f"ERROR LOADING FUEL DATA: {e}")

# 3. Create the Endpoint
@app.post("/predict_fuel")
async def predict_fuel(data: FuelInput):
    # Convert input to the format the model expects
    user_data = [[
        data.age, 
        data.weight, 
        data.steps, 
        data.activity_level, 
        data.workout_minutes
    ]]
    
    # Run Inference
    prediction = fuel_model.predict(user_data)[0]
    
    # Return as JSON
    return {
        "calories": round(float(prediction), 2),
        "status": "SUCCESS"
    }