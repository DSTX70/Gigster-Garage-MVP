# Gigster Garage API Specification

## Base URL
- Development: `http://localhost:5000`
- Production: `https://your-app-domain.com`

## Authentication
- Session-based authentication using Express sessions
- Default accounts:
  - Admin: `admin` / `admin123`
  - Demo: `demo` / `demo123`

## Core API Endpoints

### Authentication
```
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
GET  /api/auth/me            # Get current user info
```

### User Management
```
GET    /api/users            # List all users
POST   /api/users            # Create new user
GET    /api/users/:id        # Get user by ID
PUT    /api/users/:id        # Update user
DELETE /api/users/:id        # Delete user
```

### Project Management
```
GET    /api/projects         # List all projects
POST   /api/projects         # Create new project
GET    /api/projects/:id     # Get project details
PUT    /api/projects/:id     # Update project
DELETE /api/projects/:id     # Delete project
```

### Task Management
```
GET    /api/tasks           # List all tasks
POST   /api/tasks           # Create new task
GET    /api/tasks/:id       # Get task details
PUT    /api/tasks/:id       # Update task
DELETE /api/tasks/:id       # Delete task
```

### Client Management
```
GET    /api/clients         # List all clients
POST   /api/clients         # Create new client
GET    /api/clients/:id     # Get client details
PUT    /api/clients/:id     # Update client
DELETE /api/clients/:id     # Delete client
```

### Proposal Management
```
GET    /api/proposals       # List all proposals
POST   /api/proposals       # Create new proposal
GET    /api/proposals/:id   # Get proposal details
PUT    /api/proposals/:id   # Update proposal
DELETE /api/proposals/:id   # Delete proposal
POST   /api/proposals/:id/send # Send proposal to client
```

### Invoice Management
```
GET    /api/invoices        # List all invoices
POST   /api/invoices        # Create new invoice
GET    /api/invoices/:id    # Get invoice details
PUT    /api/invoices/:id    # Update invoice
DELETE /api/invoices/:id    # Delete invoice
POST   /api/invoices/:id/send # Send invoice to client
```

### Contract Management
```
GET    /api/contracts       # List all contracts
POST   /api/contracts       # Create new contract
GET    /api/contracts/:id   # Get contract details
PUT    /api/contracts/:id   # Update contract
DELETE /api/contracts/:id   # Delete contract
POST   /api/contracts/:id/sign # Digital signature
```

### Time Tracking
```
GET    /api/time-logs       # List time logs
POST   /api/time-logs       # Create time log entry
GET    /api/time-logs/:id   # Get time log details
PUT    /api/time-logs/:id   # Update time log
DELETE /api/time-logs/:id   # Delete time log
```

### File Management
```
GET    /api/files           # List files
POST   /api/files           # Upload file
GET    /api/files/:id       # Get file details
DELETE /api/files/:id       # Delete file
GET    /api/files/:id/download # Download file
```

### Analytics & Reporting
```
GET    /api/analytics/dashboard    # Dashboard metrics
GET    /api/analytics/productivity # Productivity analytics
GET    /api/analytics/financial    # Financial reports
GET    /api/reports/time          # Time tracking reports
GET    /api/reports/projects      # Project reports
```

### AI Features (Requires OpenAI API Key)
```
POST   /api/ai/insights           # Generate AI insights
POST   /api/ai/schedule-optimize  # Smart scheduling
POST   /api/ai/analytics          # Predictive analytics
```

### Real-time Features
```
WebSocket: /socket.io             # Real-time collaboration
GET /api/notifications            # Get notifications
POST /api/notifications/mark-read # Mark notifications as read
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": { },
  "message": "Operation completed successfully",
  "timestamp": "2025-09-28T21:00:00Z"
}
```

## Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { }
  },
  "timestamp": "2025-09-28T21:00:00Z"
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error

## Rate Limiting
- API Key required for external access
- Rate limits: 1000 requests per hour per API key
- WebSocket connections: 50 concurrent per user

## Integration Support
- Stripe payments
- SendGrid email notifications
- Twilio SMS notifications
- Google Cloud Storage
- Slack notifications
- OpenAI AI features