# Issue Tracker

This repo uses **GitHub Issues** as its issue tracker.

## Creating issues

Use the `gh` CLI:

```bash
gh issue create --title "..." --body "..." --label "needs-triage"
```

## Reading issues

```bash
gh issue view <number>
gh issue list --label "ready-for-agent"
```

## Workflow notes

- New issues should be created with the `needs-triage` label
- Issues are triaged into one of the five canonical roles defined in `triage-labels.md`
