# Quickstart Guide: Retrieval & Pipeline Validation

**Feature**: Retrieval & Pipeline Validation
**Last Updated**: 2025-12-25

## Overview

This guide explains how to set up and run the `retrieve.py` validation script to verify your RAG retrieval pipeline works correctly after Phase 0 ingestion.

**Prerequisites**: You must have completed Phase 0 (Content Ingestion) with `main.py` before running this validation script.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Basic Usage](#basic-usage)
5. [Advanced Usage](#advanced-usage)
6. [Understanding Output](#understanding-output)
7. [Troubleshooting](#troubleshooting)
8. [CI/CD Integration](#cicd-integration)

---

## Prerequisites

### Required

✅ **Phase 0 Ingestion Completed**: The `rag_embeddings` collection must exist in Qdrant with content
  - Run `uv run main.py` if you haven't completed ingestion yet
  - Verify with `uv run verify_ingestion.py`

✅ **Environment Variables**: You need the same `.env` file used for ingestion
  - `QDRANT_URL`: Your Qdrant cluster URL
  - `QDRANT_API_KEY`: Your Qdrant API key
  - `COHERE_API_KEY`: Your Cohere API key

✅ **Python Environment**: Python 3.11+ with UV package manager installed

### Optional

- Git Bash or PowerShell (for Windows users)
- CI/CD pipeline (for automated validation)

---

## Installation

### Step 1: Ensure Dependencies are Installed

The validation script uses the same dependencies as Phase 0 ingestion. If you've already run `main.py`, you're all set!

```bash
cd src/chatbot/backend
uv sync  # Ensure all dependencies are installed
```

### Step 2: Verify Environment Variables

Check that your `.env` file contains the required keys:

```bash
cat .env  # Linux/Mac
type .env  # Windows
```

Expected contents:
```bash
COHERE_API_KEY=your-cohere-api-key
QDRANT_URL=https://your-qdrant-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
```

**Don't have a `.env` file?** Copy from the example:
```bash
cp .env.example .env
# Then edit .env to add your actual API keys
```

---

## Configuration

The `retrieve.py` script requires **no additional configuration** beyond the `.env` file.

### Environment Variables

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `COHERE_API_KEY` | Generate query embeddings | Yes | `abc123...` |
| `QDRANT_URL` | Connect to Qdrant cluster | Yes | `https://xxx.cloud.qdrant.io` |
| `QDRANT_API_KEY` | Authenticate with Qdrant | Yes | `xyz789...` |

### Optional CLI Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `--query` | string | "What are vector databases?" | Custom test query |
| `--top-k` | integer | 5 | Number of results to retrieve (1-20) |
| `--min-score` | float | 0.0 | Minimum similarity score (0.0-1.0) |

---

## Basic Usage

### Run with Default Settings

```bash
cd src/chatbot/backend
uv run retrieve.py
```

**What happens**:
1. Connects to Qdrant
2. Verifies collection `rag_embeddings` exists
3. Runs default query: "What are vector databases?"
4. Retrieves top 5 results
5. Validates metadata and scores
6. Prints validation report

**Expected output**:
```
============================================================
RETRIEVAL VALIDATION REPORT
============================================================
Query: "What are vector databases?"
Results: 5 chunks retrieved

------------------------------------------------------------
Result 1 (score: 0.523):
  Chapter: Chapter 10: Vision-Language-Action (VLA) Models
  Section: Vector Database Fundamentals
  Source: https://shumailaaijaz.github.io/physical-ai-textbook/docs/10-vision-language-action
  Text: Vector databases store high-dimensional embeddings...

...

------------------------------------------------------------
VALIDATION CHECKS
------------------------------------------------------------
✅ Connection: PASS
✅ Collection Config: PASS (1024-dim, cosine)
✅ Query Embedding: PASS (1024 dimensions)
✅ Search Execution: PASS (5 results)
✅ Metadata Completeness: PASS (5/5 chunks complete)
✅ Score Validation: PASS (range: 0.498-0.523, descending order)

============================================================
OVERALL STATUS: PASS
============================================================
```

**Exit code**: `0` (success)

---

## Advanced Usage

### Custom Query

Test a specific question:

```bash
uv run retrieve.py --query "How does reinforcement learning work in robotics?"
```

### Retrieve More Results

Get top 10 results instead of 5:

```bash
uv run retrieve.py --query "Explain inverse kinematics" --top-k 10
```

### Filter by Minimum Score

Only show results with similarity > 0.4:

```bash
uv run retrieve.py --query "What is URDF?" --min-score 0.4
```

**Note**: `min-score` filters display only, doesn't affect validation checks.

### Combine All Options

```bash
uv run retrieve.py \
  --query "Describe Gazebo simulation for robotics" \
  --top-k 8 \
  --min-score 0.3
```

---

## Understanding Output

### Validation Report Structure

```
============================================================
RETRIEVAL VALIDATION REPORT
============================================================
Query: [Your test query]
Results: [N] chunks retrieved

------------------------------------------------------------
Result [N] (score: [0.0-1.0]):
  Chapter: [Chapter title or N/A]
  Section: [Section heading or N/A]
  Source: [Full URL to textbook page]
  Text: [First ~200 characters of chunk]

------------------------------------------------------------
VALIDATION CHECKS
------------------------------------------------------------
[✅/❌/⚠️] Check Name: [PASS/FAIL/WARNING]

============================================================
OVERALL STATUS: [PASS/FAIL/WARNING]
============================================================
```

### Status Indicators

| Symbol | Status | Meaning |
|--------|--------|---------|
| ✅ | PASS | Check succeeded, no issues |
| ❌ | FAIL | Critical failure, pipeline broken |
| ⚠️ | WARNING | Non-critical issue detected |

### Exit Codes

| Code | Status | Meaning | Next Step |
|------|--------|---------|-----------|
| `0` | PASS | All checks passed | Proceed to Phase 1 |
| `1` | FAIL | Critical failure | Fix errors (see Troubleshooting) |
| `2` | WARNING | Non-critical issue | Review warnings, may proceed |

**Checking exit code** (useful for scripts):
```bash
uv run retrieve.py
echo $?  # Linux/Mac/Git Bash
echo %ERRORLEVEL%  # Windows CMD
```

---

## Troubleshooting

### Error 1: Missing Environment Variables

**Symptom**:
```
❌ FAIL: Missing required environment variable QDRANT_URL
Suggested fix: Add QDRANT_URL to .env file (see .env.example)
```

**Solution**:
1. Check if `.env` file exists: `ls .env`
2. If missing, copy from example: `cp .env.example .env`
3. Edit `.env` to add actual API keys
4. Verify contents: `cat .env`

---

### Error 2: Collection Not Found

**Symptom**:
```
❌ FAIL: Collection 'rag_embeddings' not found in Qdrant
Suggested fix: Run ingestion script (uv run main.py) to create and populate collection
```

**Solution**:
1. Run Phase 0 ingestion: `uv run main.py`
2. Wait for ingestion to complete (~5-10 minutes)
3. Verify collection exists: `uv run verify_ingestion.py`
4. Re-run validation: `uv run retrieve.py`

---

### Error 3: Dimension Mismatch

**Symptom**:
```
❌ FAIL: Query embedding dimension mismatch
Expected: 1024 dimensions (Cohere embed-multilingual-v3.0)
Got: 768 dimensions
```

**Solution**:
1. Check Cohere API key is correct
2. Verify you're using `embed-multilingual-v3.0` model (not older models)
3. Check `research.md` for correct model configuration
4. Re-run ingestion if you changed models: `uv run main.py`

---

### Error 4: Missing Metadata

**Symptom**:
```
❌ FAIL: Metadata validation failed
Chunk ID abc123 missing required field 'source_url'
Affected: 2/5 chunks
```

**Solution**:
1. This indicates ingestion script didn't extract metadata correctly
2. Check HTML parsing logic in `main.py` (extract_text_from_url function)
3. Re-run ingestion: `uv run main.py`
4. If problem persists, check textbook HTML structure hasn't changed

---

### Warning 1: Empty Results

**Symptom**:
```
⚠️  WARNING: No results found for query "quantum computing in robotics"
This may indicate query is outside textbook scope
```

**Solution**:
- This is **not an error** - the query simply doesn't match textbook content
- Try a different query related to robotics, ROS 2, simulation, or AI
- Examples: "What is URDF?", "Explain Gazebo simulation", "How does ROS 2 work?"

**Exit code**: `2` (WARNING) - you can still proceed

---

### Warning 2: Missing Optional Metadata

**Symptom**:
```
⚠️  WARNING: Metadata validation
2/5 chunks missing optional field 'section'
```

**Solution**:
- This is **expected** for some pages (blog posts, index pages without sections)
- Only required fields are: `text` and `source_url`
- No action needed unless many chunks are missing metadata

**Exit code**: `2` (WARNING) - you can still proceed

---

### Error 5: Connection Timeout

**Symptom**:
```
❌ FAIL: Qdrant query timeout - check network connectivity
```

**Solution**:
1. Check internet connection
2. Verify Qdrant cluster is running: Visit `QDRANT_URL` in browser
3. Check firewall settings (allow outbound HTTPS to Qdrant)
4. Try again (transient network issues are common)

---

### Error 6: Cohere Rate Limit

**Symptom**:
```
❌ FAIL: Cohere API error: Rate limit exceeded
```

**Solution**:
1. Wait 60 seconds before retrying
2. Check Cohere free tier limits: https://cohere.com/pricing
3. If you're on free tier, consider upgrading or waiting for rate limit reset
4. The script will automatically retry once with 2s delay

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Validate RAG Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: |
          cd src/chatbot/backend
          uv sync

      - name: Run validation
        env:
          COHERE_API_KEY: ${{ secrets.COHERE_API_KEY }}
          QDRANT_URL: ${{ secrets.QDRANT_URL }}
          QDRANT_API_KEY: ${{ secrets.QDRANT_API_KEY }}
        run: |
          cd src/chatbot/backend
          uv run retrieve.py --query "Test query for CI"

      - name: Check exit code
        run: |
          if [ $? -eq 0 ]; then
            echo "✅ Validation passed"
          elif [ $? -eq 1 ]; then
            echo "❌ Validation failed"
            exit 1
          else
            echo "⚠️  Validation warnings"
          fi
```

**Secrets to add in GitHub Settings → Secrets**:
- `COHERE_API_KEY`
- `QDRANT_URL`
- `QDRANT_API_KEY`

---

## Best Practices

### 1. Run Validation After Ingestion

Always run `retrieve.py` immediately after `main.py` completes:

```bash
uv run main.py && uv run retrieve.py
```

### 2. Test Multiple Queries

Validate with diverse queries to ensure broad coverage:

```bash
uv run retrieve.py --query "What is URDF?"
uv run retrieve.py --query "Explain ROS 2 nodes"
uv run retrieve.py --query "How does Gazebo simulation work?"
```

### 3. Check Exit Codes in Scripts

Use exit codes to control workflow:

```bash
#!/bin/bash
uv run retrieve.py
if [ $? -ne 0 ]; then
  echo "Validation failed, not deploying"
  exit 1
fi
echo "Validation passed, proceeding to deployment"
```

### 4. Monitor Warnings

Even if exit code is 0 (PASS), review warnings in output:
- Missing optional metadata may indicate HTML parsing issues
- Low similarity scores may indicate textbook content gaps

### 5. Re-validate After Textbook Updates

When textbook content changes, re-run full pipeline:

```bash
uv run main.py          # Re-ingest updated content
uv run retrieve.py      # Validate new data
```

---

## Next Steps

### After Successful Validation

✅ **All checks passed** → Proceed to Phase 1:
- Implement query API with FastAPI
- Integrate OpenRouter for LLM
- Add hallucination prevention logic

### If Validation Fails

❌ **Critical failures** → Fix issues before Phase 1:
1. Review error messages in validation report
2. Check troubleshooting section for solutions
3. Re-run ingestion if metadata issues detected
4. Verify environment variables are correct

### If Validation Shows Warnings

⚠️ **Warnings detected** → Review and decide:
- Missing optional metadata: Check if acceptable for your use case
- Empty results: Expected if query outside textbook scope
- Low scores: May need better chunking strategy (revisit Phase 0)

---

## Additional Resources

- **Specification**: [spec.md](./spec.md) - Full feature requirements
- **Implementation Plan**: [plan.md](./plan.md) - Technical approach
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions
- **Research Decisions**: [research.md](./research.md) - Design rationale

---

## Support

### Common Questions

**Q: Can I run validation without re-running ingestion?**
A: Yes! Validation is read-only and doesn't modify the collection.

**Q: How long does validation take?**
A: ~5 seconds (2s for embedding, 1s for search, 2s for validation)

**Q: Can I validate multiple collections?**
A: No, this script only validates `rag_embeddings` collection.

**Q: Can I export validation results?**
A: Currently outputs to stdout/stderr only. Redirect output to file:
```bash
uv run retrieve.py > validation_report.txt 2>&1
```

**Q: How do I know if my validation passed?**
A: Check the "OVERALL STATUS" in the output or the exit code (`echo $?`)

---

**Last Updated**: 2025-12-25
**Version**: 1.0
**Status**: Ready for implementation
