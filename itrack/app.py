"""
iTrack — Job & Internship Application Tracker

Run with:
    streamlit run app.py

Data is stored locally in itrack.db (SQLite), created automatically on first run.
"""
import sqlite3
from datetime import date
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

# -----------------------------
# Constants
# -----------------------------
DB_PATH = Path(__file__).parent / "itrack.db"

STATUSES = [
    "Wishlist",
    "Applied",
    "Online Assessment",
    "Interview",
    "Offer",
    "Rejected",
    "Ghosted",
]

STATUS_COLORS = {
    "Wishlist": "#9AA0A6",
    "Applied": "#2E86AB",
    "Online Assessment": "#F6AE2D",
    "Interview": "#7B2CBF",
    "Offer": "#2A9D8F",
    "Rejected": "#E63946",
    "Ghosted": "#6C757D",
}

# Statuses that count as "still in play"
ACTIVE_STATUSES = {"Applied", "Online Assessment", "Interview"}
# Statuses that mean the company responded to the application
RESPONDED_STATUSES = {"Online Assessment", "Interview", "Offer", "Rejected"}

# -----------------------------
# Database layer
# -----------------------------
def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            location TEXT DEFAULT '',
            status TEXT NOT NULL DEFAULT 'Applied',
            date_applied TEXT NOT NULL,
            job_link TEXT DEFAULT '',
            notes TEXT DEFAULT ''
        )
        """
    )
    return conn


def load_applications() -> pd.DataFrame:
    with get_conn() as conn:
        df = pd.read_sql_query(
            "SELECT * FROM applications ORDER BY date_applied DESC, id DESC", conn
        )
    df["date_applied"] = pd.to_datetime(df["date_applied"]).dt.date
    return df


def add_application(company, role, location, status, date_applied, job_link, notes):
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO applications (company, role, location, status, date_applied, job_link, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (company, role, location, status, str(date_applied), job_link, notes),
        )


def update_application(row_id, company, role, location, status, date_applied, job_link, notes):
    with get_conn() as conn:
        conn.execute(
            """
            UPDATE applications
            SET company=?, role=?, location=?, status=?, date_applied=?, job_link=?, notes=?
            WHERE id=?
            """,
            (company, role, location, status, str(date_applied), job_link, notes, row_id),
        )


def delete_applications(row_ids):
    if not row_ids:
        return
    with get_conn() as conn:
        conn.executemany("DELETE FROM applications WHERE id=?", [(i,) for i in row_ids])


# -----------------------------
# Page config
# -----------------------------
st.set_page_config(page_title="iTrack", page_icon="🎯", layout="wide")

st.title("🎯 iTrack — Application Tracker")
st.markdown(
    "Track every job and internship application in one place: status, dates, links, and notes."
)

df = load_applications()

# -----------------------------
# Sidebar — add a new application
# -----------------------------
st.sidebar.header("➕ Add Application")
with st.sidebar.form("add_form", clear_on_submit=True):
    company = st.text_input("Company *")
    role = st.text_input("Role / Position *")
    location = st.text_input("Location", placeholder="e.g. Miami, FL / Remote")
    status = st.selectbox("Status", STATUSES, index=STATUSES.index("Applied"))
    date_applied = st.date_input("Date applied", value=date.today())
    job_link = st.text_input("Job posting link", placeholder="https://...")
    notes = st.text_area("Notes", placeholder="Referral, recruiter name, next steps...")
    submitted = st.form_submit_button("Add", use_container_width=True)

if submitted:
    if not company.strip() or not role.strip():
        st.sidebar.error("Company and Role are required.")
    else:
        add_application(
            company.strip(), role.strip(), location.strip(),
            status, date_applied, job_link.strip(), notes.strip(),
        )
        st.sidebar.success(f"Added {company.strip()} — {role.strip()}")
        st.rerun()

# -----------------------------
# Section 1: Overview metrics
# -----------------------------
st.header("1. Overview")

if df.empty:
    st.info("No applications yet — add your first one from the sidebar. 👈")
else:
    total = len(df)
    active = int(df["status"].isin(ACTIVE_STATUSES).sum())
    interviews = int((df["status"] == "Interview").sum())
    offers = int((df["status"] == "Offer").sum())
    sent = df[df["status"] != "Wishlist"]
    response_rate = (
        sent["status"].isin(RESPONDED_STATUSES).mean() * 100 if len(sent) else 0.0
    )

    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Total tracked", total)
    c2.metric("Active", active)
    c3.metric("Interviews", interviews)
    c4.metric("Offers", offers)
    c5.metric("Response rate", f"{response_rate:.0f}%")

# -----------------------------
# Section 2: Charts
# -----------------------------
if not df.empty:
    st.header("2. Insights")
    col_a, col_b = st.columns(2)

    with col_a:
        status_counts = (
            df["status"].value_counts().reindex(STATUSES).dropna().reset_index()
        )
        status_counts.columns = ["status", "count"]
        fig_status = px.bar(
            status_counts,
            x="status",
            y="count",
            color="status",
            color_discrete_map=STATUS_COLORS,
            title="Applications by status",
        )
        fig_status.update_layout(showlegend=False, height=400)
        st.plotly_chart(fig_status, use_container_width=True)

    with col_b:
        timeline = (
            df.assign(week=pd.to_datetime(df["date_applied"]).dt.to_period("W").dt.start_time)
            .groupby("week")
            .size()
            .reset_index(name="applications")
        )
        fig_time = px.line(
            timeline,
            x="week",
            y="applications",
            markers=True,
            title="Applications per week",
        )
        fig_time.update_layout(height=400)
        st.plotly_chart(fig_time, use_container_width=True)

# -----------------------------
# Section 3: Applications table
# -----------------------------
st.header("3. All Applications")

if df.empty:
    st.stop()

f1, f2 = st.columns([2, 3])
status_filter = f1.multiselect("Filter by status", STATUSES, default=[])
search = f2.text_input("Search company or role", placeholder="Type to filter...")

filtered = df.copy()
if status_filter:
    filtered = filtered[filtered["status"].isin(status_filter)]
if search.strip():
    q = search.strip().lower()
    filtered = filtered[
        filtered["company"].str.lower().str.contains(q, regex=False)
        | filtered["role"].str.lower().str.contains(q, regex=False)
    ]

st.caption(f"Showing {len(filtered)} of {len(df)} applications")
st.dataframe(
    filtered.drop(columns=["id"]),
    use_container_width=True,
    hide_index=True,
    column_config={
        "company": "Company",
        "role": "Role",
        "location": "Location",
        "status": "Status",
        "date_applied": "Date Applied",
        "job_link": st.column_config.LinkColumn("Job Link"),
        "notes": "Notes",
    },
)

# -----------------------------
# Section 4: Edit / delete
# -----------------------------
st.header("4. Update or Delete")

labels = {
    int(r.id): f"#{int(r.id)} — {r.company} · {r.role} ({r.status})"
    for r in df.itertuples()
}
selected_id = st.selectbox(
    "Select an application",
    options=list(labels.keys()),
    format_func=lambda i: labels[i],
)
row = df.loc[df["id"] == selected_id].iloc[0]

with st.form("edit_form"):
    e1, e2 = st.columns(2)
    new_company = e1.text_input("Company", value=row["company"])
    new_role = e2.text_input("Role", value=row["role"])
    e3, e4, e5 = st.columns(3)
    new_location = e3.text_input("Location", value=row["location"] or "")
    new_status = e4.selectbox("Status", STATUSES, index=STATUSES.index(row["status"]))
    new_date = e5.date_input("Date applied", value=row["date_applied"])
    new_link = st.text_input("Job posting link", value=row["job_link"] or "")
    new_notes = st.text_area("Notes", value=row["notes"] or "")

    b1, b2 = st.columns(2)
    save_clicked = b1.form_submit_button("💾 Save changes", use_container_width=True)
    delete_clicked = b2.form_submit_button("🗑️ Delete", use_container_width=True)

if save_clicked:
    update_application(
        selected_id, new_company.strip(), new_role.strip(), new_location.strip(),
        new_status, new_date, new_link.strip(), new_notes.strip(),
    )
    st.success("Saved.")
    st.rerun()

if delete_clicked:
    delete_applications([selected_id])
    st.success("Deleted.")
    st.rerun()

# -----------------------------
# Footer
# -----------------------------
st.markdown("---")
st.caption("iTrack — your applications, organized. Data stays local in itrack.db.")
