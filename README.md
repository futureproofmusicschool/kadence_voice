# Gemini Voice Chat

This project implements a production-grade, real-time voice chat application that allows users to have natural conversations with Google's Gemini model. It's built with a focus on scalability, security, and maintainability, using a modern technology stack.

## Features

-   **Real-time Voice Conversations:** Low-latency, bidirectional audio streaming using WebSockets.
-   **Customizable Voices:** Choose from multiple voice options for Gemini's responses (Puck, Charon, Kore, Fenrir, Aoede).
-   **Scalable Architecture:** Designed to handle a large number of concurrent users using Kubernetes for container orchestration.
-   **Secure by Design:** API key authentication for configuration, JWT for WebSocket connections, input sanitization, and network policies for enhanced security.
-   **Production-Ready:** Includes comprehensive error handling, logging, monitoring (Prometheus and Grafana), and automated testing.
-   **Containerized Deployment:** Dockerized frontend and backend for easy deployment and portability.
-   **CI/CD Integration:** Demonstrates CI/CD pipeline setup using GitHub Actions.
