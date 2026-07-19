# Insight Flow

### AI-Powered Natural Language SQL Data Assistant

Transform natural language into actionable business insights using Artificial Intelligence.

Insight Flow is a modern AI-powered data analytics platform that enables users to ask business questions in plain English and receive intelligent insights, data visualizations, and business explanations without writing SQL.

Built with a scalable architecture using FastAPI, Google Gemini AI, LangChain, Supabase PostgreSQL, and Next.js, Insight Flow combines Generative AI with Business Intelligence to make data analysis accessible to everyone.

---

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

# Future Enhancements

- Export Reports (PDF / Excel)
- Saved Queries
- Dashboard Templates
- Multi-Database Support
- CSV Upload
- Role-Based Access Control (RBAC)
- Admin Dashboard
- Team Collaboration
- AI Suggestions
- Voice Queries
- Scheduled Reports
- Advanced Analytics
- Query History Search

  ---

# Why Insight Flow?

Traditional BI tools require technical knowledge and SQL expertise.

Insight Flow removes that barrier by allowing anyone to interact with data using natural language, making analytics faster, more intuitive, and accessible to business users, analysts, and decision-makers.

---

# Author

**Pavan Kumar Talluri**

Full Stack AI Developer

---

# License

This project is intended for educational purposes.
