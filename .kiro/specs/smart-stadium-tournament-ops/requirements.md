# Requirements Document

## Introduction

Smart Stadiums & Tournament Operations is a production-grade, full-stack platform built with Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, and Firebase (Firestore, Auth, Storage, Cloud Functions, Analytics, Cloud Messaging). It allows fans and team participants to browse tournaments, self-register teams/players, book seats, and interact with an AI chatbot, while administrators manage tournaments, matches, fixtures, dynamic pricing, and fraud detection. Google Cloud services that cannot be credentialed in this environment (Maps, Vision, Speech-to-Text, Translate, Vertex AI, BigQuery, Cloud Scheduler, Cloud Tasks, Cloud Logging, Secret Manager) are implemented behind interfaces with functional mock adapters returning realistic data, each documented with a swap-in path to a real credentialed client. Gemini is integrated as a real, working AI client with a documented mock/fallback mode when no API key is configured. Dynamic pricing and ticket fraud detection are the flagship features, receiving the deepest Gemini reasoning integration, the most polished UI, and the most thorough automated test coverage.

## Glossary

- **Platform**: The Smart Stadiums & Tournament Operations Next.js application as a whole.
- **AuthGateway**: The authentication and session layer that verifies Firebase ID tokens via the Firebase Admin SDK, issues secure httpOnly session cookies, and enforces role-based access control using custom claims.
- **User_Role**: A Firebase Auth custom claim value of either `admin` or `user`, where `user` represents a fan or team participant.
- **RouteHandler**: A Next.js App Router Route Handler that serves as an API endpoint, validated with a Zod schema for its request and response contracts.
- **RateLimiter**: The edge-safe, in-memory rate limiting middleware applied to RouteHandlers.
- **TournamentRepository**: The Firestore data access module responsible for CRUD operations on tournament documents.
- **MatchRepository**: The Firestore data access module responsible for CRUD operations on match and fixture documents.
- **RegistrationRepository**: The Firestore data access module responsible for CRUD operations on team and player registration documents.
- **TicketRepository**: The Firestore data access module responsible for CRUD operations on seat and ticket/booking documents.
- **TournamentService**: The service layer module implementing tournament and match lifecycle business logic.
- **RegistrationService**: The service layer module implementing team/player self-registration and admin approval workflow logic.
- **BookingService**: The service layer module implementing seat selection, reservation, and ticket purchase logic.
- **PricingEngine**: The flagship service module that computes dynamic ticket prices using Gemini reasoning combined with heuristic signals (demand, time-to-event, occupancy).
- **FraudDetectionService**: The flagship service module that scores booking/ticket transactions for fraud risk using Gemini reasoning combined with heuristic signals.
- **SeatRecommendationService**: The service module that suggests seats to a user using Gemini or heuristic logic.
- **CrowdDensityService**: The service module that predicts stadium zone crowd density using a mocked Cloud Vision adapter and heuristic logic.
- **QueuePredictionService**: The service module that predicts wait times at stadium entry/concession queues using heuristic logic.
- **MatchPredictionService**: The service module that predicts match outcomes using Gemini reasoning over historical statistics.
- **ChatbotService**: The service module powering the AI chatbot using the GeminiAdapter.
- **SchedulerService**: The service module that generates tournament schedules and fixtures automatically.
- **EmergencyRoutingService**: The service module that computes evacuation/emergency routes using a mocked Google Maps adapter.
- **PlayerStatsService**: The service module that computes and serves player statistics.
- **InsightsService**: The service module that aggregates tournament analytics for the admin insights dashboard, using a mocked BigQuery adapter.
- **GeminiAdapter**: The adapter that wraps calls to the real Gemini API, falling back to a documented deterministic mock response when no API key is configured at runtime.
- **ExternalServiceAdapter**: Any adapter implementing an ExternalServiceInterface (Maps, Vision, Speech-to-Text, Translate, Vertex AI, BigQuery, Cloud Scheduler, Cloud Tasks, Cloud Logging, Secret Manager) that returns realistic mock data and is clearly labeled as mock in code.
- **SeatMapComponent**: The interactive, keyboard-navigable UI component rendering a stadium's seat layout.
- **FraudDashboard**: The admin UI surface displaying flagged transactions and fraud risk scores.
- **PricingDashboard**: The admin UI surface displaying and controlling dynamic pricing rules and computed prices.
- **InsightsDashboard**: The admin UI surface displaying tournament analytics and insights.
- **CIWorkflow**: The GitHub Actions workflow that runs lint, typecheck, and test on push/PR.

## Requirements

### Requirement 1: Authentication and Role-Based Access Control

**User Story:** As a fan or administrator, I want to securely sign in and have my role recognized, so that I can access only the features appropriate to my role.

#### Acceptance Criteria

1. WHEN a client submits a valid Firebase ID token to the session RouteHandler, THE AuthGateway SHALL verify the token via the Firebase Admin SDK and issue a secure httpOnly session cookie.
2. IF a client submits an invalid or expired Firebase ID token to the session RouteHandler, THEN THE AuthGateway SHALL reject the request with an authentication error response and SHALL NOT issue a session cookie.
3. WHEN a new user account is created, THE AuthGateway SHALL assign the `user` custom claim by default.
4. WHERE an account is designated as an administrator account, THE AuthGateway SHALL assign the `admin` custom claim to that account.
5. WHEN a request is made to a RouteHandler that requires the `admin` User_Role, THE AuthGateway SHALL verify the session cookie's custom claim equals `admin` before allowing the request to proceed.
6. IF a request is made to a RouteHandler requiring the `admin` User_Role by a session with the `user` User_Role, THEN THE AuthGateway SHALL reject the request with an authorization error response.
7. WHEN a user signs out, THE AuthGateway SHALL invalidate the session cookie.
8. THE AuthGateway SHALL set security-related HTTP response headers (Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) on every response via Next.js middleware.

### Requirement 2: API Input Validation and Rate Limiting

**User Story:** As a platform operator, I want every API route to validate its inputs and limit request rates, so that the platform is protected from malformed data and abuse.

#### Acceptance Criteria

1. WHEN a RouteHandler receives a request body, THE RouteHandler SHALL validate the request body against a Zod schema before executing business logic.
2. IF a request body fails Zod schema validation, THEN THE RouteHandler SHALL return a 400 response containing the validation error details and SHALL NOT execute business logic.
3. WHEN a client sends requests to a rate-limited RouteHandler exceeding the configured request threshold within the configured time window, THE RateLimiter SHALL reject subsequent requests from that client with a 429 response until the time window elapses.
4. THE RateLimiter SHALL expose a documented configuration point describing how to replace the in-memory store with a Redis-backed store in production.

### Requirement 3: Tournament Browsing

**User Story:** As a fan, I want to browse tournaments and view their details, so that I can decide which events to attend.

#### Acceptance Criteria

1. WHEN a user requests the tournament list, THE TournamentService SHALL return a paginated list of tournaments ordered by start date.
2. WHEN a user requests a specific tournament by identifier, THE TournamentService SHALL return that tournament's details including its matches.
3. IF a user requests a tournament identifier that does not exist, THEN THE TournamentService SHALL return a not-found response.
4. WHEN a user requests the seat map for a match, THE Platform SHALL render the SeatMapComponent showing seat availability and current computed price per seat.

### Requirement 4: Team and Player Self-Registration

**User Story:** As a team participant, I want to register my team and its players into a tournament, so that I can compete once an administrator approves my registration.

#### Acceptance Criteria

1. WHEN a user submits a team registration with a team name and a non-empty list of players for a tournament, THE RegistrationService SHALL create a registration record with status `pending`.
2. IF a user submits a team registration with an empty player list, THEN THE RegistrationService SHALL reject the submission with a validation error and SHALL NOT create a registration record.
3. WHEN a registration record is created, THE RegistrationService SHALL associate the record with the submitting user's account identifier.
4. WHILE a registration record has status `pending`, THE Platform SHALL display that registration as pending to the submitting user and SHALL prevent that team from appearing in tournament fixtures.
5. WHEN a user requests their own registrations, THE RegistrationService SHALL return only registrations associated with that user's account identifier.

### Requirement 5: Team and Player Registration Approval

**User Story:** As an administrator, I want to review and approve or reject team/player registrations, so that only legitimate teams participate in tournaments.

#### Acceptance Criteria

1. WHEN an administrator approves a pending registration, THE RegistrationService SHALL set the registration status to `approved` and make the team eligible for fixture generation.
2. WHEN an administrator rejects a pending registration, THE RegistrationService SHALL set the registration status to `rejected` and record the rejection reason supplied by the administrator.
3. IF a non-administrator attempts to approve or reject a registration, THEN THE RegistrationService SHALL reject the request with an authorization error.
4. WHEN an administrator requests the list of pending registrations for a tournament, THE RegistrationService SHALL return all registrations for that tournament with status `pending`.

### Requirement 6: Seat Selection and Ticket Booking

**User Story:** As a fan, I want to select seats and purchase tickets for a match, so that I can attend the event.

#### Acceptance Criteria

1. WHEN a user selects an available seat and confirms purchase, THE BookingService SHALL reserve the seat, compute its price via the PricingEngine, and create a ticket record linked to the user's account identifier.
2. IF a user attempts to purchase a seat that is already reserved or sold, THEN THE BookingService SHALL reject the purchase with a conflict error and SHALL NOT create a duplicate ticket record.
3. WHEN a ticket is successfully created, THE BookingService SHALL update the seat's status to `sold` within the same transactional operation.
4. WHEN a user requests their own tickets, THE BookingService SHALL return only tickets associated with that user's account identifier.
5. WHILE a seat reservation is held pending payment confirmation for longer than the configured reservation timeout, THE BookingService SHALL release the seat back to `available` status.

### Requirement 7: Dynamic Pricing (Flagship)

**User Story:** As an administrator, I want ticket prices to adjust dynamically based on demand and Gemini-driven reasoning, so that revenue and attendance are optimized.

#### Acceptance Criteria

1. WHEN the PricingEngine computes a price for a seat, THE PricingEngine SHALL submit current demand signals (occupancy percentage, time remaining to event, historical sales velocity) to the GeminiAdapter and incorporate the returned recommendation into the final price.
2. IF the GeminiAdapter is unavailable or returns an error, THEN THE PricingEngine SHALL fall back to a documented heuristic pricing formula and SHALL label the resulting price as heuristic-derived in the response.
3. THE PricingEngine SHALL constrain every computed price within an administrator-configured minimum and maximum bound for that tournament.
4. WHEN an administrator updates a pricing rule for a tournament, THE PricingEngine SHALL apply the updated rule to subsequent price computations for that tournament.
5. WHEN an administrator requests the PricingDashboard, THE PricingEngine SHALL return the current computed price, the pricing rule in effect, and whether the last computation used Gemini or the heuristic fallback for each seat category.

### Requirement 8: Ticket Fraud Detection (Flagship)

**User Story:** As an administrator, I want suspicious ticket transactions flagged automatically, so that I can investigate and prevent fraud.

#### Acceptance Criteria

1. WHEN a ticket purchase transaction completes, THE FraudDetectionService SHALL submit the transaction's behavioral signals (purchase velocity, account age, seat-to-account mismatch indicators, payment pattern) to the GeminiAdapter and compute a fraud risk score between 0 and 100.
2. IF the GeminiAdapter is unavailable or returns an error, THEN THE FraudDetectionService SHALL fall back to a documented heuristic fraud scoring formula and SHALL label the resulting score as heuristic-derived.
3. WHEN a transaction's fraud risk score meets or exceeds the administrator-configured flagging threshold, THE FraudDetectionService SHALL mark the transaction as `flagged` and make it visible on the FraudDashboard.
4. WHEN an administrator requests the FraudDashboard, THE FraudDetectionService SHALL return all flagged transactions ordered by risk score descending, including the contributing signals for each.
5. WHEN an administrator marks a flagged transaction as reviewed, THE FraudDetectionService SHALL record the review outcome and the reviewing administrator's identifier.

### Requirement 9: Smart Seat Recommendation

**User Story:** As a fan, I want personalized seat recommendations, so that I can quickly find a good seat matching my preferences.

#### Acceptance Criteria

1. WHEN a user requests seat recommendations for a match with stated preferences (budget, proximity, group size), THE SeatRecommendationService SHALL return a ranked list of available seats matching those preferences.
2. IF no available seats satisfy the user's stated budget, THEN THE SeatRecommendationService SHALL return the closest-matching available seats along with an indication that the budget constraint was relaxed.
3. THE SeatRecommendationService SHALL exclude seats with status `sold` or `reserved` from its recommendations.

### Requirement 10: Crowd Density Prediction

**User Story:** As an administrator, I want predicted crowd density per stadium zone, so that I can manage stadium operations proactively.

#### Acceptance Criteria

1. WHEN an administrator requests crowd density predictions for a match, THE CrowdDensityService SHALL return a predicted density level per stadium zone derived from ticket sales distribution and the mocked Cloud Vision ExternalServiceAdapter.
2. THE CrowdDensityService SHALL label every returned prediction with the data source used (mock adapter identifier) in the response payload.

### Requirement 11: Queue Wait-Time Prediction

**User Story:** As a fan, I want to see predicted wait times at entry gates and concessions, so that I can plan my arrival.

#### Acceptance Criteria

1. WHEN a user requests queue predictions for a match, THE QueuePredictionService SHALL return an estimated wait time per queue point derived from historical throughput and current ticket sales volume.
2. IF no historical throughput data exists for a queue point, THEN THE QueuePredictionService SHALL return a default estimate derived from stadium capacity and SHALL label it as a default estimate.

### Requirement 12: Match Outcome Prediction

**User Story:** As a fan, I want AI-generated match outcome predictions, so that I can engage more deeply with the tournament.

#### Acceptance Criteria

1. WHEN a user requests an outcome prediction for an upcoming match, THE MatchPredictionService SHALL submit both teams' historical statistics to the GeminiAdapter and return a predicted outcome with a confidence percentage.
2. IF the GeminiAdapter is unavailable or returns an error, THEN THE MatchPredictionService SHALL fall back to a documented heuristic prediction based on historical win rate and SHALL label the result as heuristic-derived.

### Requirement 13: AI Chatbot

**User Story:** As a fan, I want to ask an AI chatbot questions about tournaments, tickets, and my bookings, so that I can get help without contacting support.

#### Acceptance Criteria

1. WHEN a user sends a chat message, THE ChatbotService SHALL submit the message and relevant conversational context to the GeminiAdapter and return a generated response.
2. IF the GeminiAdapter is unavailable or returns an error, THEN THE ChatbotService SHALL return a documented deterministic fallback response and SHALL indicate the fallback was used.
3. THE ChatbotService SHALL restrict chatbot access to the authenticated user's own tournament, ticket, and registration data when answering account-specific questions.

### Requirement 14: Tournament, Match, and Fixture Management

**User Story:** As an administrator, I want to create and manage tournaments, matches, and fixtures, so that events are organized correctly.

#### Acceptance Criteria

1. WHEN an administrator submits a new tournament with a name, start date, end date, and venue, THE TournamentService SHALL create the tournament record.
2. IF an administrator submits a tournament with an end date earlier than its start date, THEN THE TournamentService SHALL reject the submission with a validation error.
3. WHEN an administrator submits a new match linked to an existing tournament and two approved teams, THE MatchRepository SHALL create the match record.
4. WHEN an administrator updates a tournament's or match's details, THE TournamentService SHALL persist the updated details and SHALL preserve existing ticket and registration records unaffected by the update.
5. WHEN an administrator deletes a tournament that has no sold tickets, THE TournamentService SHALL remove the tournament and its associated match and fixture records.
6. IF an administrator attempts to delete a tournament that has at least one sold ticket, THEN THE TournamentService SHALL reject the deletion with a conflict error.

### Requirement 15: Automatic Fixture Generation and Scheduling

**User Story:** As an administrator, I want fixtures generated automatically from approved teams, so that I save time creating tournament schedules manually.

#### Acceptance Criteria

1. WHEN an administrator triggers fixture generation for a tournament with two or more approved teams, THE SchedulerService SHALL generate a complete set of matches such that every approved team is scheduled against every other approved team exactly once.
2. IF an administrator triggers fixture generation for a tournament with fewer than two approved teams, THEN THE SchedulerService SHALL reject the request with a validation error and SHALL NOT create any match records.
3. WHEN THE SchedulerService generates fixtures, THE SchedulerService SHALL assign each generated match a start time such that no two matches for the same venue overlap.
4. WHEN an administrator triggers fixture generation for a tournament that already has generated fixtures, THE SchedulerService SHALL replace the existing generated fixtures that have no sold tickets.

### Requirement 16: Emergency Routing

**User Story:** As an administrator, I want computed emergency evacuation routes for a stadium, so that I can respond quickly during an incident.

#### Acceptance Criteria

1. WHEN an administrator requests an emergency route from a stadium zone to the nearest exit, THE EmergencyRoutingService SHALL return a route derived from the mocked Google Maps ExternalServiceAdapter, including step-by-step directions and estimated travel time.
2. IF the requested stadium zone does not exist in the venue's zone map, THEN THE EmergencyRoutingService SHALL reject the request with a validation error.

### Requirement 17: Player Statistics

**User Story:** As a fan and administrator, I want to view player statistics, so that I can track performance across the tournament.

#### Acceptance Criteria

1. WHEN a user requests statistics for a player, THE PlayerStatsService SHALL return that player's aggregated statistics across all completed matches in the tournament.
2. WHEN a match is marked as completed with recorded player performance data, THE PlayerStatsService SHALL incorporate that match's data into the affected players' aggregated statistics.

### Requirement 18: Tournament Insights and Analytics Dashboard

**User Story:** As an administrator, I want an analytics dashboard summarizing tournament performance, so that I can make informed operational decisions.

#### Acceptance Criteria

1. WHEN an administrator requests the InsightsDashboard for a tournament, THE InsightsService SHALL return aggregated metrics including total tickets sold, total revenue, average fraud risk score, and attendance-by-match derived via the mocked BigQuery ExternalServiceAdapter.
2. THE InsightsService SHALL label every metric in the InsightsDashboard response with the data source (mock adapter identifier) used to derive it.

### Requirement 19: External Google Service Adapter Pattern

**User Story:** As a platform engineer, I want every non-credentialable Google Cloud service represented by a consistent interface/adapter/mock pattern, so that the platform can be upgraded to real credentialed services without changing calling code.

#### Acceptance Criteria

1. THE Platform SHALL define a TypeScript interface for each of the following services: Maps, Cloud Vision, Speech-to-Text, Translate, Vertex AI, BigQuery, Cloud Scheduler, Cloud Tasks, Cloud Logging, and Secret Manager.
2. WHEN a mock adapter for one of these services is invoked, THE mock adapter SHALL return realistic, structurally valid sample data conforming to the corresponding TypeScript interface.
3. THE Platform SHALL label every mock adapter's source file and exported symbols with a comment identifying it as a mock implementation.
4. THE Platform SHALL document, for each mock adapter, the steps required to replace it with a real credentialed client implementing the same interface.

### Requirement 20: Gemini Integration with Fallback

**User Story:** As a platform engineer, I want the Gemini integration to work with a real API key and degrade gracefully without one, so that the flagship AI features remain functional during evaluation and development.

#### Acceptance Criteria

1. WHERE a Gemini API key is present in the runtime environment configuration, THE GeminiAdapter SHALL send requests to the real Gemini API and return its response.
2. WHERE no Gemini API key is present in the runtime environment configuration, THE GeminiAdapter SHALL return a deterministic mock response and SHALL label the response as mock-derived.
3. IF a call to the real Gemini API fails or times out, THEN THE GeminiAdapter SHALL return the documented deterministic mock response as a fallback rather than propagating an unhandled error.

### Requirement 21: Accessibility

**User Story:** As a fan using assistive technology, I want the platform to be fully navigable and understandable, so that I can use all features regardless of ability.

#### Acceptance Criteria

1. THE Platform SHALL provide ARIA labels on every interactive custom UI component, including the SeatMapComponent and chatbot widget.
2. THE Platform SHALL provide a visible focus indicator on every focusable interactive element.
3. THE SeatMapComponent SHALL support full seat selection and purchase confirmation using only keyboard navigation.
4. WHERE a user enables dark mode, THE Platform SHALL apply a dark color theme meeting WCAG AA contrast requirements across all pages.
5. THE Platform SHALL render all page layouts responsively across mobile, tablet, and desktop viewport widths.

### Requirement 22: Automated Testing Infrastructure

**User Story:** As a platform engineer, I want automated unit, property, and integration tests, so that regressions are caught before deployment.

#### Acceptance Criteria

1. THE Platform SHALL run unit and component tests using Vitest and React Testing Library.
2. THE Platform SHALL run integration tests for RouteHandlers using a mocked Firebase Admin SDK and a mocked GeminiAdapter.
3. WHEN a pull request or push occurs on the repository, THE CIWorkflow SHALL execute lint, typecheck, and test steps and SHALL report a failing status if any step fails.
4. THE Platform SHALL include automated test coverage for the PricingEngine and FraudDetectionService that exceeds the test coverage depth of the non-flagship AI feature services.

### Requirement 23: Efficiency and Performance

**User Story:** As a fan, I want the platform to load quickly and remain responsive with large data sets, so that I have a smooth experience.

#### Acceptance Criteria

1. THE Platform SHALL render pages using React Server Components by default, opting into client components only where interactivity is required.
2. THE Platform SHALL lazily load heavy client components (charts, chatbot widget, seat map visualizations) using dynamic import.
3. WHEN a list of tournaments, matches, or registrations is requested, THE RouteHandler SHALL return results in paginated pages rather than the full unpaginated collection.
4. WHEN the SeatMapComponent renders a seat map containing more seats than the configured virtualization threshold, THE SeatMapComponent SHALL render only the currently visible seats using virtualization.
5. THE Platform SHALL use the Next.js Image component for every raster image displayed in the UI.

### Requirement 24: Documentation and Deployment Configuration

**User Story:** As a developer evaluating or deploying the platform, I want complete documentation and deployment configuration, so that I can run, understand, and deploy the project without additional research.

#### Acceptance Criteria

1. THE Platform repository SHALL include a README containing an architecture diagram, an entity-relationship diagram for the Firestore data model, and a table documenting every RouteHandler's method, path, authentication requirement, request schema, and response schema.
2. THE Platform repository SHALL include Firebase configuration files (firebase.json, .firebaserc placeholder, firestore.rules, firestore.indexes.json, storage.rules).
3. THE Platform repository SHALL include a Dockerfile and docker-compose configuration enabling local development.
4. THE Platform repository SHALL include a .env.example file listing every required environment variable without committing secret values.
5. THE Platform repository SHALL include CONTRIBUTING.md, a LICENSE file using the MIT license, issue templates, and a pull request template.
