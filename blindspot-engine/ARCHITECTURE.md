# Blind Spot Engine - Architecture

## Core Concept
An AI system that maps cognitive blind spots by generating "anti-queries" — questions, angles, and connections you'd never think to ask.

## Novel Mechanism
Instead of answering queries, it:
1. Builds a knowledge graph of the obvious/known space
2. Systematically explores the negative space (gaps, assumptions, blind spots)
3. Cross-references across unrelated domains
4. Surfaces "blind spot alerts" — not answers, but questions you should be asking

## Components

### 1. Knowledge Graph Engine (src/kg/)
- Builds a graph of entities, relationships, and known facts about a domain
- Uses LLM + web search to populate initial graph
- Identifies "dense clusters" (well-known areas) and "sparse regions" (potential blind spots)

### 2. Anti-Query Generator (src/antiquery/)
- Generates questions from the negative space
- Types of anti-queries:
  - **Contrarian**: What if the opposite of every assumption is true?
  - **Cross-domain**: What would [unrelated field] do differently?
  - **Historical**: What patterns from similar situations were ignored?
  - **Assumption**: What are you assuming without evidence?
  - **Edge case**: What happens at the extremes?
  - **Second-order**: What are the consequences of the consequences?

### 3. Cross-Domain Pattern Matcher (src/patterns/)
- Maintains a library of patterns from diverse fields (biology, military, sports, finance, etc.)
- Maps patterns from one domain onto the target domain
- Surfaces unexpected analogies

### 4. Assumption Detector (src/assumptions/)
- Reverse-engineers the user's mental model from their description
- Identifies implicit assumptions
- Flags assumptions that are likely wrong or incomplete

### 5. Delivery Layer (web/)
- Web UI for interactive use
- API for programmatic access
- Slack/WhatsApp integration for alerts

## Data Flow
1. User inputs problem/domain/business
2. KG engine builds knowledge graph (web search + LLM)
3. Assumption detector identifies implicit beliefs
4. Anti-query generator produces questions from gaps
5. Pattern matcher cross-references with other domains
6. Results ranked by "surprise value" (novelty × relevance)
7. Delivered as blind spot alerts

## Tech Stack
- Python 3.11+ (core engine)
- FastAPI (API layer)
- SQLite + NetworkX (knowledge graph storage)
- Ollama/OpenRouter (LLM calls)
- Tavily/Firecrawl (web search)
- HTMX + Tailwind (web UI)
