-- Synthetic Audience Database Schema

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Optional/Simple profile table)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ideas Table
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    raw_text TEXT NOT NULL,
    industry VARCHAR(255),
    target_audience TEXT,
    stakeholders TEXT[],
    business_type VARCHAR(255),
    competitors TEXT[],
    key_value_proposition TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Personas Table
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    role VARCHAR(255) NOT NULL,
    experience TEXT NOT NULL,
    motivations TEXT[] NOT NULL,
    frustrations TEXT[] NOT NULL,
    concerns TEXT[] NOT NULL,
    goals TEXT[] NOT NULL,
    personality_traits TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Simulations Table
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL,
    excitement_score INTEGER NOT NULL,
    concerns TEXT[] NOT NULL,
    objections TEXT[] NOT NULL,
    likelihood_to_use INTEGER NOT NULL, -- Scale of 1 to 10
    suggestions TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    overall_interest_score INTEGER NOT NULL, -- Scale of 1 to 100
    adoption_probability INTEGER NOT NULL, -- Percentage 0 to 100
    top_concerns TEXT[] NOT NULL,
    top_suggestions TEXT[] NOT NULL,
    most_interested_segment VARCHAR(255) NOT NULL,
    least_interested_segment VARCHAR(255) NOT NULL,
    frequently_asked_questions JSONB NOT NULL, -- Array of { question, answer }
    improvement_opportunities TEXT[] NOT NULL,
    full_report_markdown TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
