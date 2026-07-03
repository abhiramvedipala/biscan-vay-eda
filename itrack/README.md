# iTrack — Job & Internship Application Tracker

A Streamlit app for tracking job and internship applications: companies, roles, statuses, dates, links, and notes — all stored locally in SQLite.

## Features
- **Add applications** from the sidebar form (company, role, location, status, date, link, notes)
- **Overview metrics** — total tracked, active, interviews, offers, and response rate
- **Insights charts** — applications by status and applications per week
- **Filter & search** the full application table by status or keyword
- **Edit or delete** any application inline
- **Local persistence** — data lives in `itrack.db` (SQLite), created automatically on first run; nothing leaves your machine

## Status pipeline
`Wishlist → Applied → Online Assessment → Interview → Offer` (plus `Rejected` / `Ghosted`)

- **Active** = Applied, Online Assessment, or Interview
- **Response rate** = share of sent applications (everything except Wishlist) where the company responded (OA, Interview, Offer, or Rejected)

## Setup
```bash
pip install streamlit pandas plotly
```

## Run
```bash
cd itrack
streamlit run app.py
```
The app opens at `http://localhost:8501`.
