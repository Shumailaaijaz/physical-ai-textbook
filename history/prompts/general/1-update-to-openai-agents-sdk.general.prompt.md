---
id: 1
title: "Update agent.py to use OpenAI Agents SDK"
stage: "refactor"
date_iso: "2025-12-25"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "Claude Code"
command: "update agent to use openai agents sdk"
labels: ["refactor", "openai-agents", "sdk"]
link_spec: null
link_ticket: null
link_adr: null
link_pr: null
files_yaml:
  - "src/chatbot/backend/agent.py"
  - "src/chatbot/backend/requirements.txt"
  - "src/chatbot/backend/pyproject.toml"
tests_yaml: []
---

# Update agent.py to use OpenAI Agents SDK

## User Input
Update the agent.py file to use the OpenAI Agents SDK instead of the OpenAI Chat Completion API.

## Response Summary
Updated the agent.py file to replace the OpenAI Chat Completion API with the OpenAI Agents SDK. This involved:

1. Adding the `agents` import to the agent.py file
2. Updating the `query_agent` function to use the Agent and Runner classes from the OpenAI Agents SDK
3. Updating requirements.txt to include openai-agents dependency
4. Updating pyproject.toml to include openai-agents dependency
5. Testing the updated implementation to ensure it works correctly

## Changes Made

### agent.py
- Added import for `Agent` and `Runner` from `agents`
- Updated `query_agent` function to use `Agent` class with instructions and model
- Used `Runner.run_sync()` to execute the agent instead of `client.chat.completions.create()`
- Updated the function documentation to reflect the new approach

### requirements.txt
- Added `openai-agents>=0.6.0` dependency

### pyproject.toml
- Added `openai-agents>=0.6.0` dependency

## Outcome
The agent now uses the OpenAI Agents SDK instead of direct Chat Completion API calls. The functionality remains the same, but the implementation now uses the more structured agent-based approach. Testing confirmed that the agent works correctly with the new SDK.

## Evaluation
The update was successful and maintains all existing functionality while using the new OpenAI Agents SDK. The agent continues to properly handle RAG queries, citations, and grounding validation.