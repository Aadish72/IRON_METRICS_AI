AI-Powered Athletic Performance & Biometric Dashboard
A high-performance Full-Stack application that leverages Machine Learning (Linear Regression) to provide real-time analytical insights into combat sports mechanics and human biometrics. The system processes multi-axial sensor data to predict physical impact force and physiological states with sub-100ms latency.

 Core Features
Kinetic Impact Analysis: Predicts strike force in Newtons (N) using 3-axis acceleration and rotational velocity data.

Physiological Sync: Estimates real-time Heart Rate (BPM) based on user demographics and activity loads.

Metabolic Tracking: Calculates caloric expenditure using a weighted regression model for precision nutrition.

Industrial UI/UX: A "Mission-Critical" dashboard featuring SVG Data Visualizations, real-time "Scanning" telemetry, and dynamic performance ranking (e.g., "Beast Mode").

🛠️ Technical Architecture
Backend (Inference Layer): Built with FastAPI (Python). Implements an asynchronous REST API to serve model predictions.

Machine Learning: Developed using Scikit-Learn and Pandas. Linear Regression models were trained on custom-engineered datasets of 15,000+ samples to ensure high-confidence trend-line fitting.

Frontend (Data Viz): A responsive, vanilla JavaScript interface. Utilizes SVG Stroke Manipulation for animated gauges and CSS3 for high-fidelity "Cyberpunk" aesthetics.

DevOps/Standards: Includes a strict .gitignore for repo hygiene, MIT Licensing, and a requirements.txt for reproducible environments.

 Machine Learning Specifications
The project emphasizes Model Interpretability. Linear Regression was selected over Deep Learning to minimize computational overhead, ensuring the application remains lightweight enough for edge-case deployments while maintaining a high degree of mathematical transparency.

Features Processed: Tri-axial acceleration, Angular velocity, Body mass index, Metabolic equivalents (METs).

Optimization: Feature scaling and normalization were applied to raw sensor inputs to prevent bias in high-magnitude force predictions.

 Quick Installation
Clone: git clone https://github.com/your-username/boxing-ai-project.git

Environment: pip install -r backend/requirements.txt

Launch: uvicorn backend.main:app --reload

View: Open frontend/index.html
