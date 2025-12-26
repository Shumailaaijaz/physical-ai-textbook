# ADR-001: Migrate from OpenAI Chat Completion to OpenAI Agents SDK

## Status
Accepted

## Context
The current implementation uses the OpenAI Chat Completion API directly for generating responses in the RAG agent. This approach works but doesn't leverage the more structured and feature-rich OpenAI Agents SDK, which provides better abstractions for building agent-based applications.

## Decision
We will migrate from the OpenAI Chat Completion API to the OpenAI Agents SDK for the RAG answer generation agent. This involves:

1. Replacing direct `client.chat.completions.create()` calls with `Agent` and `Runner` classes
2. Updating dependencies to include `openai-agents`
3. Maintaining the same functionality while using the new SDK

## Rationale
- The OpenAI Agents SDK provides better abstractions for building agent-based applications
- More structured approach to agent orchestration
- Better support for future enhancements and multi-agent workflows
- Consistent with modern OpenAI development patterns
- Maintains all existing functionality while using more appropriate tooling

## Consequences
### Positive
- More maintainable and structured code
- Better alignment with OpenAI's recommended patterns
- Easier to extend with additional agent capabilities in the future
- Improved separation of concerns between agent definition and execution

### Negative
- Additional dependency (`openai-agents`)
- Slight learning curve for team members unfamiliar with the Agents SDK
- Potential compatibility considerations with OpenRouter (though it should work with the same models)

## Alternatives Considered
1. **Keep current Chat Completion approach**: Continue using the direct API calls, which works but doesn't provide the structured agent abstractions.
2. **Use OpenAI Assistants API**: More complex but potentially more powerful for advanced RAG scenarios.
3. **Custom agent framework**: Build our own agent orchestration, but this would be reinventing existing functionality.

## Implementation
The migration has been completed in the `agent.py` file by:
- Adding the `agents` import
- Replacing the chat completion call with `Agent` and `Runner.run_sync()`
- Updating both `requirements.txt` and `pyproject.toml` to include the new dependency