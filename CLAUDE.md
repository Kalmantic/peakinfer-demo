# PeakInfer Demo Repository

## Purpose

This is a **demo repository** used to showcase PeakInfer's GitHub Action capabilities. It contains intentionally suboptimal LLM usage patterns that PeakInfer can detect and recommend fixes for.

## Structure

```
peakinfer-demo/
├── .github/workflows/
│   └── peakinfer.yml    # GitHub Action workflow
├── src/
│   └── ai_service.py    # Demo Python code with LLM calls
├── README.md
└── CLAUDE.md
```

## Demo Scenarios

The `ai_service.py` file contains several intentional issues:

1. **Overpowered model for simple tasks** (`classify_intent` uses gpt-4 for intent classification)
2. **Missing streaming** (`answer_customer_query` doesn't use streaming for user-facing responses)
3. **Sequential batch processing** (`batch_process_feedback` processes items one by one)
4. **Using Opus for summarization** (`summarize_ticket` uses claude-3-opus for simple summaries)

## Testing the Action

1. Create a branch: `git checkout -b test-branch`
2. Make a change to `src/ai_service.py`
3. Push and create a PR to `main`
4. The PeakInfer Action will automatically analyze and comment on the PR

## Do NOT

- Remove the intentional issues from `ai_service.py`
- Modify the workflow file unless updating the action version
- Use this repo for actual production code

## Related Repositories

- **peakinfer** (CLI): https://github.com/Kalmantic/peakinfer
- **peakinfer-site** (Web): Private repository
- **peakinfer_templates**: https://github.com/Kalmantic/peakinfer_templates
