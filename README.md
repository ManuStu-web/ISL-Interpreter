# 🤟 ISL Interpreter

### Real-time Indian Sign Language to Text Converter

> No app install required — works directly in your browser

![Demo Placeholder](https://placehold.co/800x400/1D9E75/ffffff?text=Demo+GIF+Coming+Soon)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-orange?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-0097A7?style=for-the-badge&logo=google&logoColor=white)](https://mediapipe.dev/)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

---

## 📖 Table of Contents

- [About](#-about-the-project)
- [Features](#-features)
- [Screenshots](#️-screenshots)
- [Tech Stack](#️-tech-stack)
- [How It Works](#-how-it-works)
- [Project Architecture](#️-project-architecture)
- [Getting Started](#-getting-started)
- [Live Demo](#-live-demo)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🧠 About The Project

India has **63 lakh+ deaf and hard-of-hearing individuals** who face communication barriers in daily life. Most existing solutions require expensive hardware, dedicated devices, or app installations that limit accessibility.

**ISL Interpreter** bridges this gap with a fully browser-based web application that:

- Detects hand gestures in **real-time** using your webcam
- Translates Indian Sign Language gestures into **text and speech**
- Works on **any device with a modern browser** — zero installation needed
- Saves your **translation history** for logged-in users

Built as a **Project-I submission (Semester VI)**, this project demonstrates the practical application of computer vision and machine learning directly in the browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎥 **Real-time Detection** | Live webcam feed with instant gesture recognition |
| 🤖 **AI-Powered Classification** | MediaPipe Hands + TensorFlow.js for accurate ISL gesture recognition |
| 📝 **Sentence Builder** | Collects recognized letters → assembles complete words and sentences |
| 🔊 **Text-to-Speech** | Converts translated text to audio output for two-way communication |
| 📊 **Confidence Score** | Displays model confidence percentage for each recognized gesture |
| 🗂️ **Translation History** | Saves all translated sessions for logged-in users |
| 🔐 **User Authentication** | Secure user registration and login system |
| 🌐 **Zero Installation** | Runs entirely in the browser — no app or plugin required |

---

## 🖼️ Screenshots

> Screenshots will be added once UI development is complete.

| Translator Page | History Page |
|---|---|
| ![Translator](https://placehold.co/400x250/0F6E56/ffffff?text=Translator+Page) | ![History](https://placehold.co/400x250/185FA5/ffffff?text=History+Page) |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Component-based UI framework
- **Tailwind CSS v4** — Utility-first styling
- **MediaPipe Hands** — Real-time hand landmark detection (21 keypoints per hand)
- **TensorFlow.js** — In-browser gesture classification using a pre-trained ISL model
- **Axios** — HTTP client for API communication

### Backend
- **Java Spring Boot** — RESTful API server
- **Spring Security** — Authentication and authorization
- **Spring Data JPA** — Database ORM layer
- **MySQL** — Relational data storage

### Deployment
- **Vercel** — Frontend hosting
- **Render.com** — Backend hosting
- **Railway.app** — Database hosting

---

## 🔄 How It Works

```
User shows hand gesture to webcam
            ↓
    getUserMedia (camera access)
            ↓
    Canvas API (frame capture at ~30fps)
            ↓
    MediaPipe Hands (extracts 21 hand landmarks)
            ↓
    TensorFlow.js (classifies gesture → ISL letter/word)
            ↓
    React UI (displays recognized text + confidence score)
            ↓
    Sentence Builder (accumulates letters → words → sentences)
            ↓
    Web Speech API (optional text-to-speech output)
            ↓
    Spring Boot REST API (saves session to history)
```

---

## 🏗️ Project Architecture

```
ISL-Interpreter/
├── Frontend/                        # React application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Camera.jsx           # Webcam feed + canvas overlay
│   │   │   ├── GestureDisplay.jsx   # Current gesture + confidence
│   │   │   └── SentenceBuilder.jsx  # Text accumulation UI
│   │   ├── pages/
│   │   │   ├── Translator.jsx       # Main ISL interpreter page
│   │   │   ├── History.jsx          # Saved sessions page
│   │   │   └── Login.jsx            # Authentication page
│   │   ├── hooks/                   # Custom React hooks
│   │   └── App.jsx
│   └── package.json
│
└── Backend/                         # Spring Boot application
    ├── src/main/java/
    │   ├── controller/              # REST API endpoints
    │   ├── service/                 # Business logic layer
    │   ├── model/                   # JPA entity classes
    │   └── repository/              # Database access layer
    ├── src/main/resources/
    │   └── application.properties   # Configuration (DB, security)
    └── pom.xml
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js v20+](https://nodejs.org/)
- [Java JDK 17+](https://adoptium.net/)
- [MySQL 8+](https://dev.mysql.com/downloads/)
- [Maven](https://maven.apache.org/) (or use the included `mvnw` wrapper)

---

### 1. Clone the Repository

```bash
git clone https://github.com/ManuStu-web/ISL-Interpreter.git
cd ISL-Interpreter
```

---

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd Frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** Your browser will prompt for webcam access when you open the Translator page — this is required for gesture detection.

---

### 3. Backend Setup

Before running the backend, configure your database credentials:

```properties
# src/main/resources/application.properties

spring.datasource.url=jdbc:mysql://localhost:3306/isl_interpreter
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

Then run the Spring Boot server:

```bash
# Navigate to the backend directory
cd ../Backend

# Run using Maven wrapper
./mvnw spring-boot:run

# Or on Windows
mvnw.cmd spring-boot:run
```

The backend API will start at [http://localhost:8080](http://localhost:8080).

---

### 4. Create the MySQL Database

```sql
CREATE DATABASE isl_interpreter;
```

Spring Boot with `ddl-auto=update` will automatically create the required tables on first run.

---

## 🌐 Live Demo

> 🔗 **[Coming Soon](#)** — Will be deployed on Vercel + Render

---

## 🗺️ Roadmap

- [x] Real-time hand landmark detection
- [x] Gesture classification (ISL alphabets)
- [x] Sentence builder
- [x] Text-to-speech output
- [x] User authentication
- [x] Translation history
- [ ] Live demo deployment
- [ ] Support for ISL words (not just letters)
- [ ] Mobile responsiveness improvements
- [ ] Offline/PWA support
- [ ] Multi-language text output

---

## 📄 License

This project was built for **educational purposes** as part of **Project-I (Semester VI)**. Feel free to use it as a reference, but please credit the original authors.

---

## 🙏 Acknowledgements

- [MediaPipe](https://mediapipe.dev/) by Google — for the powerful hand landmark detection pipeline
- [TensorFlow.js](https://www.tensorflow.org/js) — for enabling ML inference directly in the browser
- [ISL Dataset & Pre-trained Model](https://github.com/) — gesture classification model
- The **63 lakh+ deaf and hard-of-hearing Indians** who inspired this project

---

<p align="center">Made with ❤️ for 63 lakh+ deaf and hard-of-hearing Indians</p>
<p align="center">⭐ Star this repo if you find it useful!</p>
