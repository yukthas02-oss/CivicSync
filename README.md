# CivicSync — AI-Powered Societal Challenges & Collaborative Problem-Solving Platform
> **SIH26043 College Mini-Project**  
> *Tagline:* **From community challenges to collaborative solutions.**

CivicSync is a full-stack, AI-augmented civic-tech platform that connects citizens reporting real-world societal problems (such as water depletion, plastic waste, traffic bottlenecks, and accessibility barriers) with universities, research laboratories, and industry CSR partners to architect and monitor practical, on-ground solutions.

---

## 🌟 Key Capabilities

1. **Multi-Step Community Problem Reporting**
   - Structured submission with location tags, affected community metrics, and urgency ratings.
   - Live semantic duplicate detection preview before final submission.
2. **Advisory AI Intelligence Pipeline**
   - Offline-capable, provider-independent analysis engine.
   - Extracts structured problem summaries, keywords, measurable success indicators, and suggested stakeholders without requiring paid external API keys.
3. **Semantic Similarity & Duplicate Detection**
   - Dense vector comparison powered by `sentence-transformers/all-MiniLM-L6-v2` and scikit-learn cosine similarity.
   - Graceful, clearly-labeled fallback to TF-IDF semantic vectorization if PyTorch is not cached locally.
4. **Academic Recommendation Engine**
   - Intelligently pairs verified challenges with specialized university departments and faculty research interests with match scores and clear rationale.
5. **Collaborative Milestone Tracking**
   - Universities submit technical solution proposals with phased milestones.
   - Interactive milestone checklist and progress dispatches for public transparency.
6. **Role-Based Portals & Dashboards**
   - **Citizen:** Report problems, follow issues, and review local progress.
   - **Administrator:** Moderation queue, ground verification, proposal acceptance, and platform health charts.
   - **University:** Matched problem discovery, capstone proposals, and milestone management.
   - **Industry Partner:** CSR sponsorships, mentorship offers, and collaborative pilot tracking.

---

## 🎨 Visual Design System

Designed with the visual clarity of Linear and modern civic-tech editorial aesthetics:
- **Deep Forest Green (`#173F35`)**: Trust, institutional grounding, and permanence.
- **Primary Green (`#287A59`)**: Forward movement, ecology, and civic action.
- **Warm Off-White (`#F7F7F2`)**: Comfortable, clean, spacious canvas.
- **Soft Mint (`#E4F1E8`)**: Subtle highlighting and verified status tags.
- **Warm Amber (`#E9B44C`)**: Advisory warnings and pending review indicators.
- **Muted Coral (`#D96C5F`)**: Urgent safety hazards and critical alerts.
- **Typography**: Inter & Plus Jakarta Sans.

---

## 🛠️ Technology Stack

| Tier | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Bootstrap 5, React Router 6, Axios, Recharts, Lucide Icons |
| **Backend** | Python 3.13, Django 5.2, Django REST Framework, Simple JWT, Django CORS Headers, Pillow |
| **Database** | PostgreSQL 17 (production/local) with seamless zero-config fallback |
| **AI / ML** | `sentence-transformers` (`all-MiniLM-L6-v2`), `scikit-learn`, `numpy` |

---

## 🚀 Quick Start on Windows

### 1. Prerequisites
- **Python 3.13** installed and available in PATH.
- **Node.js (v18+) & npm** installed.
- (Optional) **PostgreSQL 17** installed locally.

---

### 2. Backend Setup

Open a PowerShell terminal in the project root:

```powershell
# 1. Activate or verify Python virtual environment
cd backend
.venv\Scripts\activate

# 2. Configure Database
# By default, CivicSync runs out-of-the-box using SQLite.
# To connect to your local PostgreSQL 17 database:
# Edit backend/.env and set:
# USE_POSTGRES=True
# DB_NAME=civicsync_db
# DB_USER=postgres
# DB_PASSWORD=your_postgres_password
# DB_PORT=5432

# 3. Apply database migrations
python manage.py migrate

# 4. Seed realistic demonstration data (challenges, universities, proposals)
python manage.py seed_data

# 5. Run backend development server
python manage.py runserver 127.0.0.1:8000
```
Backend will be live at `http://127.0.0.1:8000/`.

---

### 3. Frontend Setup

In a second PowerShell terminal:

```powershell
cd frontend

# Start the Vite development server
npm run dev
```
Frontend will be accessible at `http://localhost:5173/`.

---

### 4. Convenient One-Click Windows Scripts
You can also launch both servers simply by double-clicking:
- `run_backend.bat` — Starts the Django API server.
- `run_frontend.bat` — Starts the React/Vite development server.

---

## 👥 Demo Accounts (Pre-Seeded)

The login page at `/login` provides **one-click autofill buttons** for all four stakeholder roles:

| Role | Username | Password | Purpose |
|---|---|---|---|
| **Citizen** | `arun_kumar` | `citizen123` | Submit challenges, follow issues, comment |
| **Administrator** | `admin` | `admin123` | Ground verification, review proposals, charts |
| **University** | `iit_madras` | `uni123` | Discover matched problems, submit proposals |
| **Industry Partner** | `cleantech_labs` | `ind123` | Express CSR interest, sponsor pilots |

---

## 🧪 Automated Testing

To run the automated test suite verifying Authentication, Challenge Creation, AI Analysis, Semantic Similarity Fallbacks, and Recommenders:

```powershell
cd backend
.venv\Scripts\python.exe manage.py test api
```

Expected output:
```
Ran 7 tests in ~7s
OK
```

---

## 📂 Project Structure

```
SocietalChallengesPlatform/
├── backend/
│   ├── civicsync/              # Django settings, urls, WSGI/ASGI
│   ├── api/                    # REST models, serializers, views, permissions
│   │   └── management/commands/seed_data.py # Seed data generator
│   ├── ai_service/             # AI Pipeline
│   │   ├── analyzer.py         # Structured problem analysis (Demo & LLM)
│   │   ├── similarity.py       # SBERT / Cosine similarity duplicate detector
│   │   └── recommender.py      # University & expertise matchmaker
│   ├── requirements.txt
│   ├── manage.py
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/axios.js        # Centralized Axios with JWT interceptors
│   │   ├── context/AuthContext.jsx
│   │   ├── components/         # StatusBadge, ChallengeCard, AiAnalysisCard, etc.
│   │   ├── layouts/            # MainLayout, DashboardLayout
│   │   ├── pages/              # Landing, Explore, Detail, Submit, Dashboards
│   │   └── styles/             # Design system variables & custom CSS
│   ├── package.json
│   └── vite.config.js
├── run_backend.bat             # Windows one-click backend launcher
├── run_frontend.bat            # Windows one-click frontend launcher
└── README.md
```

---

## ⚖️ Advisory Notice

All artificial intelligence outputs (summaries, keyword extraction, similarity metrics, and university alignments) provided by CivicSync are advisory and intended to accelerate stakeholder collaboration. They do not replace official administrative verification or on-site engineering assessments.
