# 🚚 FleetFlow — Smart Logistics & Fleet Optimization Platform

> An enterprise-grade, real-time fleet tracking, dispatch management, and route optimization platform connecting interactive GIS mapping with low-latency WebSocket telematics.

[![Live Demo](https://img.shields.io/badge/Demo-Live_Deployment-success?style=for-the-badge&logo=render&logoColor=white)](https://fleetflow-fh0s.onrender.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

### 🌐 Live Application
👉 **Experience the live dashboard:** [https://fleetflow-fh0s.onrender.com/](https://fleetflow-fh0s.onrender.com/)

---

## 📌 Overview

**FleetFlow** is a comprehensive logistics execution and dispatcher console designed to solve the complexities of modern transport networks. It unifies vehicle telematics, intelligent automated order dispatch, and dynamic route visualization into a single responsive interface.

Built on an event-driven architecture, FleetFlow streams live coordinate updates and telemetry alerts from a Spring Boot WebSocket message broker directly to an interactive Leaflet geospatial map in the React client with sub-second latency.

---

## ✨ Key Features

- **🗺️ Interactive GIS Fleet Map**:
  - Live tracking of moving delivery vehicles across national routes using Leaflet and OpenStreetMap.
  - Custom vehicle icons, status badges (Active, Idle, In-Transit, Maintenance), and order destination markers.
- **⚡ Real-Time WebSocket Telematics**:
  - Bi-directional STOMP protocol connection over WebSockets for instant coordinates, speed, and fuel/battery metrics streaming.
- **📦 Intelligent Dispatch Console**:
  - Automated and manual load assignment matching order weights and cargo volumes to optimal vehicle capacities.
- **🛣️ Route Optimization & Polyline Mapping**:
  - Visualized waypoints, multi-stop delivery routes, and dynamic route polylines.
- **📊 Executive Analytics Dashboard**:
  - Key Performance Indicators (KPIs) tracking fleet utilization, total active trips, pending deliveries, and on-time performance using Recharts.
- **🌓 Dark / Light Theme Support**:
  - Tailored operational UI designed for 24/7 dispatcher workstations with seamless theme toggling.

---

## 🛠️ Architecture & Tech Stack

```text
┌─────────────────────────────────┐         WebSocket / STOMP         ┌─────────────────────────────────┐
│          React Client           │ <===============================> │       Spring Boot Backend       │
│  (Leaflet, Recharts, Context)   │             REST APIs             │  (JPA, H2 / PostgreSQL, Events) │
└─────────────────────────────────┘ --------------------------------> └─────────────────────────────────┘
```

### Frontend
- **Framework**: React 18, Vite, TypeScript
- **Mapping & GIS**: Leaflet, React-Leaflet
- **Real-Time Streaming**: `@stomp/stompjs`, WebSocket
- **Data Visualization**: Recharts
- **Icons & UI**: Lucide React, Custom Responsive CSS

### Backend
- **Framework**: Spring Boot 3.2.5 (Java 17)
- **Messaging**: Spring WebSocket Message Broker (`@EnableWebSocketMessageBroker`, STOMP)
- **Persistence**: Spring Data JPA, H2 Database (In-Memory & File-based)
- **Utilities**: Project Lombok, Jackson

---

## 📂 Project Directory Structure

```text
FleetFlow/
├── frontend/                     # React + TypeScript Vite frontend
│   ├── src/
│   │   ├── components/           # Map markers, polylines, KPI cards, tables
│   │   ├── context/              # ThemeContext & global state
│   │   ├── pages/                # Dashboard, FleetMap, Dispatch, RouteOptimizer, Vehicles
│   │   ├── services/             # API client & WebSocket STOMP listener
│   │   └── assets/               # Branding assets & hero banner
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Spring Boot 3 Java backend
│   ├── src/main/java/com/fleetflow/
│   │   ├── controller/           # REST APIs & WebSocket endpoints
│   │   ├── model/                # Vehicle, Order & Route JPA entities
│   │   ├── repository/           # Spring Data JPA repositories
│   │   └── service/              # Dispatching & routing algorithms
│   ├── src/main/resources/       # application.yml & pre-seeded data
│   └── pom.xml
└── README.md                     # Documentation
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** (v18+) and **npm**
- **Java Development Kit (JDK)** 17+
- **Maven** 3.8+ (or use the included `mvnw` wrapper)

---

### 1. Clone the Repository
```bash
git clone https://github.com/kumarrishi4981/FleetFlow.git
cd FleetFlow
```

### 2. Run the Backend (Spring Boot)
```bash
cd backend
./mvnw clean spring-boot:run
```
* The backend will start on `http://localhost:8080`.
* H2 Database console is available at `http://localhost:8080/h2-console`.

### 3. Run the Frontend (React + Vite)
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
* Open your browser at `http://localhost:5173`.

---

## ☁️ Cloud Deployment

- **Backend**: Deployed on **Render** as a Java Web Service (with dynamic port detection).
- **Frontend**: Can be served via **Render**, **Vercel**, or **Netlify** configured with SPA rewrites and environment variables:
  - `VITE_API_URL` = `https://fleetflow-fh0s.onrender.com`
  - `VITE_WS_URL` = `wss://fleetflow-fh0s.onrender.com/ws`

---

## 🤝 Contributing
Contributions, feature suggestions, and bug reports are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/SmartDispatch`)
3. Commit your Changes (`git commit -m 'feat: Add dynamic ETA calculations'`)
4. Push to the Branch (`git push origin feature/SmartDispatch`)
5. Open a Pull Request

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👤 Author
- **Rishi Kumar**
- GitHub: [@kumarrishi4981](https://github.com/kumarrishi4981)
- Live App: [FleetFlow on Render](https://fleetflow-fh0s.onrender.com/)
