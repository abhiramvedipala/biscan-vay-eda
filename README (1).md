# Lab 1 — Data Exploration and Visualization
**Introduction to Data Science | Florida International University**

## Files
- `Lab1_Biscayne_Bay.ipynb` — Jupyter notebook covering Steps 1–5 (loading, descriptive stats, correlation, outliers, Plotly visualizations). All cells are pre-executed, so outputs are visible without re-running.
- `app.py` — Streamlit app for Step 6 (interactive dashboard).
- `biscayne_bay_water_quality.csv` — The actual dataset (942 rows × 10 columns).

## Setup
```bash
pip install pandas plotly streamlit jupyter
```

## Run

**Notebook (Steps 1–5):**
```bash
jupyter notebook Lab1_Biscayne_Bay.ipynb
```

**Streamlit app (Step 6):**
```bash
streamlit run app.py
```
The app opens in your browser at `http://localhost:8501`.

## Dataset columns (exact names, with units)
Because the column names have **spaces and unit suffixes in parentheses**, they must be quoted exactly in code (otherwise pandas raises `KeyError`):
- `Latitude`, `Longitude` — excluded from analysis (near-zero variance)
- `Time`, `Date` — string columns (not numeric)
- `Total Water Column (m)`, `Vehicle Speed (kn)` — operational
- `Salinity (ppt)`, `Temperature (c)`, `pH`, `ODO mg/L` — water-quality variables

## Key findings (for reference, not copying)
- **Strongest positive correlation:** `Total Water Column (m)` ↔ `Vehicle Speed (kn)` (r ≈ +0.65) — operational artifact
- **Most environmentally interesting correlation:** `Temperature (c)` ↔ `pH` (r ≈ +0.60) — likely diurnal photosynthesis
- **No meaningfully negative correlations** exist in the dataset (strongest negative is only r ≈ −0.056)
- **pH is near-constant** (range only 7.73–7.77, sensor-resolution limited)
- **Zero missing values** — no imputation needed

## Rubric coverage checklist
- ✅ Step 1: `.head()`, `.info()`, `.isnull().sum()` + observations on column types and missing values
- ✅ Step 2: `.describe()` + two meaningful observations (pH resolution limit, single-location short-window survey)
- ✅ Step 3: covariance matrix, correlation matrix, strongest +/− pairs identified + interpretation with environmental reasoning
- ✅ Step 4: Q1, Q3, IQR, bounds, outlier counts per column + justified retain/drop decision distinguishing operational vs environmental outliers
- ✅ Step 5: scatter plot + histogram, both with titles and axis labels + observations
- ✅ Step 6: Streamlit app with raw-data toggle, descriptive stats, correlation matrix, interactive scatter plot, and interactive histogram
