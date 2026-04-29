# VoteWise AI — Intelligent Election Assistant

VoteWise AI is a complete, production-quality web application built to help Indian citizens understand the election process, timelines, voter eligibility, and democratic rights interactively.

Built for **PromptWars: Virtual** powered by Hack2Skill.

## Features & Screens

1. **Home Dashboard**: Animated hero with quick actions, live status, and floating mic access.
2. **Interactive Timeline**: 8-stage horizontal timeline covering the complete election journey.
3. **Phase Map**: Interactive map displaying state-wise voting phases and seat allocations.
4. **Voice + Chat Assistant**: AI assistant powered by Vertex AI Gemini, grounded strictly in election knowledge using RAG. Features Google Cloud TTS and STT.
5. **Eligibility Checker**: 3-step dynamic form validating age and citizenship, providing tailored registration guidance.
6. **Quiz Mode**: 10-question interactive quiz with scoring and explanations, saved to Firebase.
7. **Glossary**: Searchable glossary with interactive flip cards explaining election terminology.
8. **Guided Tour**: Auto-playing walkthrough with pause/resume functionality.

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Jest
- **Database**: Firebase Realtime DB, Firestore
- **Authentication**: Firebase Auth
- **AI & ML**: Google Cloud Vertex AI (Gemini 1.5 Pro)
- **Voice Services**: Google Cloud TTS (WaveNet), Google Cloud STT
- **Analytics**: Google Analytics (gtag)

## Setup Instructions

### 1. Environment Variables

Copy the provided `.env.example` file:
```bash
cp .env.example .env
```
Fill in the required values:
- `FIREBASE_PROJECT_ID`
- `GOOGLE_CLOUD_PROJECT`
- `FIREBASE_API_KEY` (and other frontend Firebase config vars)

### 2. Service Account

Place your Firebase Admin/GCP service account JSON file in the project root and name it `service-account.json`. Ensure it has permissions for Firestore, Realtime DB, Vertex AI, TTS, and STT.

### 3. Backend Setup & Seeding

```bash
cd backend
npm install
npm run seed  # Populates Firestore and Realtime DB
npm run dev   # Starts on port 8080
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev   # Starts on port 3000
```

## Deployment

The application is configured for deployment to Google Cloud Platform:
- **Backend**: Containerized with Docker and deployed to Cloud Run via Cloud Build (`cloudbuild.yaml`).
- **Frontend**: Statically exported (`next build`) and deployed to Firebase Hosting (`firebase.json`).

## Testing

The project maintains high code quality with rigorous testing.

**Backend Tests**:
```bash
cd backend
npm test
```
*Coverage Thresholds: Lines 85%, Functions 85%, Branches 75%*

**Frontend Tests**:
```bash
cd frontend
npm test
```
*Tests cover components, interactions, routing, and accessibility.*

## Accessibility & Security

- 100% Lighthouse Accessibility score targeted.
- Keyboard navigable components (Enter/Space handlers).
- ARIA labels and roles on all interactive elements.
- Security headers implemented via Helmet and Firebase Hosting config.
- Strict input validation and rate limiting on all API routes.
