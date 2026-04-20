"""
Lab 1 - Step 6: Streamlit App
Introduction to Data Science | Florida International University

Run with:
    streamlit run app.py
"""
import pandas as pd
import numpy as np
import plotly.express as px
import streamlit as st

# -----------------------------
# Page config
# -----------------------------
st.set_page_config(
    page_title="Biscayne Bay Explorer",
    page_icon="🌊",
    layout="wide"
)

st.title("🌊 Biscayne Bay Water Quality Explorer")
st.markdown(
    "An interactive dashboard for exploring water-quality sensor data from Biscayne Bay. "
    "Built for **Lab 1 — Introduction to Data Science** at FIU."
)

# -----------------------------
# Load data (cached for speed)
# -----------------------------
@st.cache_data
def load_data(path: str = "biscayne_bay_water_quality.csv") -> pd.DataFrame:
    return pd.read_csv(path)

try:
    df = load_data()
except FileNotFoundError:
    st.error(
        "Could not find `biscayne_bay_water_quality.csv`. "
        "Place it in the same folder as `app.py` and refresh."
    )
    st.stop()

# All numeric columns
all_numeric = df.select_dtypes(include=np.number).columns.tolist()

# Analysis columns exclude Lat/Long (near-zero variance, see notebook Step 1 observation)
analysis_cols = [c for c in all_numeric if c not in ("Latitude", "Longitude")]

# -----------------------------
# Sidebar — global info
# -----------------------------
st.sidebar.header("Dataset Info")
st.sidebar.markdown(f"**Rows:** {df.shape[0]}")
st.sidebar.markdown(f"**Columns:** {df.shape[1]}")
st.sidebar.markdown(f"**Missing values:** {int(df.isnull().sum().sum())}")
st.sidebar.markdown("---")
st.sidebar.caption(
    "Latitude and Longitude are excluded from correlation analysis because they have "
    "near-zero variance — the sensor stayed at a fixed location."
)

# -----------------------------
# Section 1: Raw data toggle
# -----------------------------
st.header("1. Dataset Preview")
show_raw = st.checkbox("Show raw data", value=False)
if show_raw:
    n_rows = st.slider("Number of rows to display", 5, min(200, len(df)), 20)
    st.dataframe(df.head(n_rows), use_container_width=True)
else:
    st.info("Check the box above to preview the raw data.")

# -----------------------------
# Section 2: Descriptive statistics
# -----------------------------
st.header("2. Descriptive Statistics")
col1, col2, col3, col4 = st.columns(4)
col1.metric("Observations", f"{len(df):,}")
col2.metric("Numeric columns", len(all_numeric))
col3.metric("Mean Temperature", f"{df['Temperature (c)'].mean():.2f} °C")
col4.metric("Mean Salinity", f"{df['Salinity (ppt)'].mean():.2f} ppt")

st.subheader("Summary statistics")
st.dataframe(df.describe().round(3), use_container_width=True)

# -----------------------------
# Section 3: Correlation matrix
# -----------------------------
st.header("3. Correlation Matrix")
corr_matrix = df[analysis_cols].corr()

fig_corr = px.imshow(
    corr_matrix.round(2),
    text_auto=True,
    color_continuous_scale="RdBu_r",
    zmin=-1, zmax=1,
    aspect="auto",
    labels=dict(color="Correlation"),
)
fig_corr.update_layout(height=550, title="Correlation between numeric variables")
st.plotly_chart(fig_corr, use_container_width=True)

# Strongest relationships
corr_pairs = corr_matrix.where(~np.eye(len(corr_matrix), dtype=bool)).stack()
corr_pairs = corr_pairs[corr_pairs.index.map(lambda x: x[0] < x[1])]
top_pos = corr_pairs.idxmax()
top_neg = corr_pairs.idxmin()

c1, c2 = st.columns(2)
c1.success(
    f"**Strongest positive:** {top_pos[0]} ↔ {top_pos[1]}  \n"
    f"r = {corr_pairs.max():.3f}"
)
c2.warning(
    f"**Strongest negative:** {top_neg[0]} ↔ {top_neg[1]}  \n"
    f"r = {corr_pairs.min():.3f}"
)

# -----------------------------
# Section 4: Interactive scatter plot
# -----------------------------
st.header("4. Interactive Scatter Plot")
c1, c2, c3 = st.columns(3)
x_var = c1.selectbox(
    "X axis", analysis_cols,
    index=analysis_cols.index("Salinity (ppt)")
)
y_var = c2.selectbox(
    "Y axis", analysis_cols,
    index=analysis_cols.index("Temperature (c)")
)
color_var = c3.selectbox("Color by", ["(none)"] + analysis_cols, index=0)

scatter_kwargs = dict(x=x_var, y=y_var, opacity=0.7)
if color_var != "(none)":
    scatter_kwargs["color"] = color_var
    scatter_kwargs["color_continuous_scale"] = "Viridis"

fig_scatter = px.scatter(
    df,
    title=f"{y_var} vs. {x_var}",
    **scatter_kwargs
)
fig_scatter.update_layout(height=500)
st.plotly_chart(fig_scatter, use_container_width=True)

# -----------------------------
# Section 5: Interactive histogram
# -----------------------------
st.header("5. Interactive Histogram")
c1, c2 = st.columns([1, 1])
hist_var = c1.selectbox(
    "Variable", analysis_cols,
    index=analysis_cols.index("pH"),
    key="hist_var"
)
n_bins = c2.slider("Number of bins", 5, 60, 20)

fig_hist = px.histogram(
    df,
    x=hist_var,
    nbins=n_bins,
    title=f"Distribution of {hist_var}",
    color_discrete_sequence=["#2E86AB"],
)
fig_hist.add_vline(
    x=df[hist_var].mean(),
    line_dash="dash",
    line_color="red",
    annotation_text=f"Mean = {df[hist_var].mean():.3f}",
    annotation_position="top",
)
fig_hist.update_layout(height=450, bargap=0.1)
st.plotly_chart(fig_hist, use_container_width=True)

# -----------------------------
# Footer
# -----------------------------
st.markdown("---")
st.caption("Lab 1 — Data Exploration and Visualization | FIU | Biscayne Bay water quality sensor data")
