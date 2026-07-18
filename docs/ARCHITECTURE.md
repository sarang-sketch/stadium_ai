# System Architecture

## Overview
StadiumAI is built using a modern, scalable architecture designed around Next.js 15 App Router, React 19, and Google Cloud services. The application follows a strict layered architecture:

```mermaid
graph TD
    Client[Client UI / Browser] --> API[Next.js API Routes / Server Actions]
    API --> Services[Service Layer - Business Logic]
    Services --> Adapters[Adapter Layer - Infrastructure]
    
    Adapters --> Firestore[(Firebase Firestore)]
    Adapters --> Auth[Firebase Authentication]
    Adapters --> AI[Google Gemini API]
```

## Data Flow
1. **Presentation Layer**: React components (Server and Client) render the UI.
2. **API/Transport**: Next.js API Routes or Server Actions handle incoming requests, validating inputs via Zod.
3. **Service Layer**: Contains core business logic (e.g., pricing algorithms, seating recommendations).
4. **Adapter Layer**: Interfaces with external systems, ensuring the Service Layer remains decoupled from specific technologies (e.g., swapping a Mock DB for Firestore).

## Service Layer Architecture
Services are stateless classes or functions that encapsulate business rules. They only interact with infrastructure via Dependency Injection of Adapters.

## Adapter Pattern
The Adapter pattern is heavily used to isolate external APIs (Firebase, GCP, Gemini). Each external dependency has an interface defined in `src/types`, and both a `MockAdapter` and a `LiveAdapter` are provided in `src/adapters/`.

## Entity Relationship (ER) Diagram

```mermaid
erDiagram
    TOURNAMENT ||--o{ MATCH : hosts
    MATCH ||--o{ REGISTRATION : allows
    REGISTRATION }o--|| PLAYER : involves
    PLAYER ||--o{ PLAYER_STAT : has
    MATCH ||--o{ TICKET : issues
    TICKET ||--|| SEAT : reserves
    TICKET ||--o{ FRAUD_REVIEW : triggers
    MATCH ||--o{ PRICING_RULE : uses

    TOURNAMENT {
        string id
        string name
        date startDate
        date endDate
    }
    MATCH {
        string id
        string tournamentId
        string homeTeam
        string awayTeam
        datetime startTime
    }
    SEAT {
        string id
        string section
        string row
        int number
        string status
    }
    TICKET {
        string id
        string matchId
        string seatId
        float price
        string status
    }
    PRICING_RULE {
        string id
        string matchId
        float basePrice
        float currentPrice
    }
    FRAUD_REVIEW {
        string id
        string ticketId
        float riskScore
        string status
    }
```

## Deployment Architecture

```mermaid
graph LR
    User((User)) --> CDN[Firebase Hosting / Cloud CDN]
    CDN --> CloudRun[Cloud Run - Next.js App]
    CloudRun --> Firestore[(Firestore DB)]
    CloudRun --> Auth[Firebase Auth]
    CloudRun --> Gemini[Gemini API]
```
