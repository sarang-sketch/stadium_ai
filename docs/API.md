# API Documentation

## Base URL
`/api`

---

## Stadium API

### GET `/api/stadium`
Retrieves general stadium information and status.
**Response:**
```json
{
  "id": "std_1",
  "name": "Main Stadium",
  "capacity": 50000,
  "currentOccupancy": 12500
}
```

### POST `/api/stadium/seats/recommend`
Recommends seats based on preferences.
**Request:**
```json
{
  "matchId": "match_1",
  "groupSize": 3,
  "preferences": ["aisle", "lower_tier"]
}
```
**Response:**
```json
{
  "recommendations": [
    {
      "seatIds": ["s_1", "s_2", "s_3"],
      "score": 95,
      "totalPrice": 150.00
    }
  ]
}
```

### GET `/api/stadium/crowd-density`
Returns real-time crowd density metrics.
**Response:**
```json
{
  "sectors": [
    { "id": "sec_A", "densityPercentage": 85, "trend": "increasing" },
    { "id": "sec_B", "densityPercentage": 40, "trend": "stable" }
  ]
}
```

### GET `/api/stadium/queue-prediction`
Predicts wait times for various stadium POIs.
**Response:**
```json
{
  "queues": [
    { "poiId": "restroom_n1", "type": "restroom", "estimatedWaitTimeMinutes": 5 },
    { "poiId": "concession_s2", "type": "food", "estimatedWaitTimeMinutes": 12 }
  ]
}
```

### POST `/api/stadium/emergency-route`
Calculates optimal evacuation routes based on current density.
**Request:**
```json
{
  "startSectorId": "sec_A"
}
```
**Response:**
```json
{
  "route": ["sec_A", "gate_3", "exit_north"],
  "estimatedEvacuationTimeMinutes": 3
}
```

---

## Chat API

### POST `/api/chat`
Interacts with the AI Assistant.
**Request:**
```json
{
  "message": "Where is the nearest restroom from sector B?",
  "history": []
}
```
**Response:**
```json
{
  "reply": "The nearest restroom from Sector B is located near Gate 2, just down the main concourse to your left."
}
```

---

## Analytics API

### GET `/api/analytics`
Fetches high-level operational analytics.
**Response:**
```json
{
  "totalRevenue": 150000,
  "ticketsSold": 3000,
  "averageRiskScore": 0.05
}
```
