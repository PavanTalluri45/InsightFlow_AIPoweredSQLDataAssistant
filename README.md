# Insight Flow 

### AI-Powered Natural Language SQL Data Assistant

Transform natural language into actionable business insights using Artificial Intelligence.

Insight Flow is a modern AI-powered data analytics platform that enables users to ask business questions in plain English and receive intelligent insights, data visualizations, and business explanations without writing SQL.

Built with a scalable architecture using FastAPI, Google Gemini AI, LangChain, Supabase PostgreSQL, and Next.js, Insight Flow combines Generative AI with Business Intelligence to make data analysis accessible to everyone.

---

# Current Progress

Backend is completed and Frontend Authentication completed and Just need to Connect Backend Fast API to Frontend Next.js and render anwser and Charts it will completed in 3 days

# Project Status

| Module | Status |
|----------|--------|
| Backend Development | ✅ Completed |
| AI Pipeline | ✅ Completed |
| SQL Generation | ✅ Completed |
| SQL Validation | ✅ Completed |
| SQL Execution | ✅ Completed |
| Result Explanation | ✅ Completed |
| Database Metadata Layer | ✅ Completed |
| Database Profiling Layer | ✅ Completed |
| Visualization Decision Engine | ✅ Completed |
| Frontend UI/UX | ✅ Completed |
| Authentication System | ✅ Completed |
| Dashboard | ✅ Completed |
| Responsive Design | ✅ Completed |
| Chat Interface | ✅ Completed |
| Production Architecture | ✅ Completed |
| Deployment | 🚧 In Progress |

---

# Project Overview

Insight Flow is an AI-powered SQL assistant that allows users to communicate with their database using natural language.

Instead of writing SQL queries manually, users simply ask questions like:

> "Which age group spends the most money?"

> "Show monthly sales."

> "Which product category generated the highest revenue?"

The AI understands the question, generates optimized PostgreSQL queries, validates them, executes them securely against Supabase PostgreSQL, explains the results in natural language, and determines the best visualization to present the data.

---

# Features

## AI-Powered SQL Generation

- Natural Language to SQL
- Google Gemini AI
- LangChain Prompt Engineering
- Intelligent Query Generation
- PostgreSQL Optimization

---

## SQL Validation Engine

Before executing any query, Insight Flow validates:

- SQL Syntax
- Dangerous SQL Detection
- Read-only Query Validation
- Schema Validation
- Table Validation
- Column Validation
- Safe Execution Rules

---

## SQL Execution Engine

- Secure Database Execution
- Parameterized Queries
- PostgreSQL Support
- Error Handling
- Execution Logging

---

## AI Result Explanation

After executing SQL, Gemini AI generates:

- Business Summary
- Insights
- Trends
- Key Observations
- Human-Friendly Explanation

---

## Intelligent Visualization Engine

The AI automatically decides whether visualization is required.

Supported visualizations include:

- Bar Charts
- Line Charts
- Area Charts
- Pie Charts
- Scatter Charts
- KPI Cards
- Data Tables

The frontend simply renders the visualization selected by the AI.

---

## Authentication

Powered by Supabase Authentication.

Supports:

- Email & Password Login
- User Registration
- Google Authentication
- Session Persistence
- Automatic Session Restore
- Secure Logout
- Protected Routes
- Authentication Middleware
- SSR Authentication

---

## Modern Chat Experience

- AI Chat Interface
- Streaming Responses
- Conversation History
- Loading Indicators
- Responsive Layout
- Scrollable Chat
- Sidebar Navigation

---

# Project Architecture

```
                        User

                          │

                          ▼

                  Natural Language Question

                          │

                          ▼

                FastAPI Backend Server

                          │

                          ▼

                Intent Understanding (Gemini)

                          │

                          ▼

                SQL Generation (LangChain)

                          │

                          ▼

                  SQL Validation Layer

                          │

                          ▼

                  SQL Execution Layer

                          │

                          ▼

              Supabase PostgreSQL Database

                          │

                          ▼

                    Query Results

                          │

                          ▼

              AI Business Explanation

                          │

                          ▼

            Visualization Decision Engine

                          │

                          ▼

              JSON Response to Frontend

                          │

                          ▼

               Next.js Chat Interface

                          │

                          ▼

                  Interactive Charts
```

---

# AI Pipeline

```
User Question

↓

Intent Understanding

↓

Database Metadata

↓

Prompt Engineering

↓

Google Gemini AI

↓

SQL Generation

↓

SQL Validation

↓

Secure Execution

↓

Database Results

↓

AI Explanation

↓

Visualization Decision

↓

Frontend Rendering
```

---

# Tech Stack

## Frontend

- Next.js (App Router)
- JavaScript (ES6+)
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts

---

## Backend

- Python
- FastAPI
- Uvicorn
- LangChain

---

## Artificial Intelligence

- Google Gemini AI
- LangChain
- Prompt Engineering

---

## Database

- Supabase PostgreSQL

---

## Authentication

- Supabase Authentication
- Email & Password
- Google OAuth
- SSR Authentication

---

## Deployment

Frontend

- Vercel

Backend

- GitHub Repository
- FastAPI Deployment
- Vercel

Database

- Supabase

---


# AI Workflow

```
User asks a question

↓

Gemini understands the intent

↓

LangChain generates SQL

↓

SQL Validator checks safety

↓

FastAPI executes query

↓

Supabase returns results

↓

Gemini explains results

↓

Visualization engine selects chart

↓

Frontend renders chart

↓

User receives business insights
```

---

# Security

- SQL Validation
- Read-only Query Execution
- Secure Database Access
- Supabase Authentication
- Session Persistence
- Protected Routes
- Middleware Authentication
- Input Validation
- Error Handling
- Secure API Architecture

---

# Current Progress

### Backend

- FastAPI Setup
- Gemini Integration
- LangChain Integration
- SQL Generator
- SQL Validator
- SQL Executor
- Result Explainer
- Metadata Layer
- Database Profiling
- Chat Service
- REST APIs

Completed

---

### Frontend

- Responsive UI
- Dashboard
- Sidebar
- Chat Interface
- Loading States
- Empty State
- Conversation Layout
- Chart Rendering
- Authentication Pages

Completed

---

### Authentication

- Email Login
- Signup
- Google Login
- Session Management
- Protected Routes
- Logout
- Middleware
- Auth Context

Completed

---

---

# Backend API Response Architecture

The FastAPI backend follows a standardized response structure for every user query. This consistent format allows the frontend to process responses efficiently, render AI-generated insights, display query results, and prepare dynamic visualizations without requiring additional transformations.

Current response structure:

```json
{
  "success": true,
  "question": "...",
  "sql": "...",
  "execution_time": 0.0,
  "row_count": 0,
  "data": [],
  "answer": "...",
  "visualization": {
    "required": true,
    "intent": "...",
    "chart_type": "...",
    "title": "...",
    "x_axis": "...",
    "y_axis": "...",
    "reason": "..."
  },
  "error": null
}
```

### Response Fields

| Field | Description |
|--------|-------------|
| `success` | Indicates whether the request was processed successfully. |
| `question` | Original natural language question submitted by the user. |
| `sql` | AI-generated PostgreSQL query executed by the backend. |
| `execution_time` | Total query execution time in seconds. |
| `row_count` | Number of records returned from the database. |
| `data` | SQL query results retrieved from Supabase PostgreSQL. |
| `answer` | AI-generated business explanation based on the query results. |
| `visualization` | Metadata used by the frontend to determine whether a chart should be rendered and which visualization is most appropriate. |
| `error` | Error information returned when request execution fails. |

---

# Current Progress

## Backend

The backend has been fully developed using FastAPI and follows a modular AI-driven architecture designed for scalability and maintainability.

### Completed

- FastAPI Project Setup
- REST API Development
- Google Gemini AI Integration
- LangChain Integration
- Database Metadata Layer
- Database Profiling Layer
- AI SQL Generator
- SQL Validator
- SQL Executor
- AI Result Explainer
- Visualization Decision Engine
- Standardized JSON Response Architecture
- Business Insight Generation
- Error Handling
- API Testing

The backend can successfully understand natural language questions, generate optimized PostgreSQL queries, validate them, execute them securely, generate AI-powered business explanations, determine the most appropriate visualization, and return a structured JSON response to the frontend.

---

## Frontend

The frontend has been fully developed using Next.js App Router with a modern and responsive user interface.

### Completed

- Responsive Dashboard
- Responsive Sidebar
- Modern Chat Interface
- Empty Chat State
- Conversation Layout
- Scrollable Chat Window
- Fixed Chat Input
- Loading States
- Typing Indicator
- Responsive Design
- Authentication Pages
- Dashboard Layout
- API Integration with Backend
- Backend Response Rendering
- Error State Handling

The frontend is successfully communicating with the FastAPI backend and rendering AI-generated responses inside the chat interface.

---

## Authentication

Authentication has been successfully implemented using Supabase Authentication.

### Completed

- Email & Password Authentication
- User Registration
- Google Authentication
- Protected Routes
- Middleware Authentication
- Session Persistence
- Automatic Session Restoration
- Automatic Session Refresh
- Secure Logout
- Auth Context
- Dashboard Authentication
- Sidebar Authentication
- Dynamic User Avatar using Initials
- Persistent Login Experience

---

# Current Development Stage

Insight Flow has successfully completed the core development phase.

At the current stage, the application includes:

- Complete AI backend
- Complete frontend UI/UX
- Complete authentication system
- Successful frontend and backend integration
- Secure API communication
- AI-powered SQL generation
- SQL validation
- SQL execution
- Business insight generation
- Visualization recommendation engine
- Standardized backend response architecture

The frontend is now capable of sending user questions to the FastAPI backend, receiving structured JSON responses, and displaying AI-generated business insights.

---

# Next Development Phase

The next phase of development focuses on enhancing the analytics experience by utilizing the visualization metadata returned from the backend.

Planned improvements include:

- Dynamic chart rendering using Recharts
- Automatic chart selection based on AI recommendations
- Interactive KPI cards
- Interactive data tables
- Chat history persistence
- Saved conversations
- Query history
- Export functionality
- Dashboard enhancements

---

# Why Insight Flow?

Traditional Business Intelligence tools often require users to understand SQL and database structures before they can retrieve meaningful insights.

Insight Flow removes this technical barrier by enabling users to communicate with their data using natural language. The platform automatically understands user intent, generates optimized SQL queries, retrieves relevant information from the database, explains the results in simple business language, and recommends the most appropriate visualization for the returned data.

By combining Artificial Intelligence, Large Language Models, Natural Language Processing, and Business Intelligence, Insight Flow delivers a modern analytics experience that enables business users, analysts, students, and decision-makers to gain valuable insights without writing a single SQL query.

Its modular architecture, AI-powered workflow, secure authentication system, scalable backend, and modern frontend make Insight Flow a strong foundation for next-generation AI-driven analytics platforms.



