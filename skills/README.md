# Skills Index

A "skill" is an executable audit or playbook for the AI agent or developer to run. It is not standard documentation.

## Rules & Cap
- **Skills Cap Rule:** `skills/` holds only skills invoked by a gate or phase (current: 1). A new skill requires naming the gate that invokes it.

## File Standard
Every skill must be its own folder inside `/skills/` and contain a `SKILL.md` file. 
`SKILL.md` must include YAML frontmatter with:
- `name`
- `version`
- `purpose`
- `when_to_invoke`
- `owner`

## How to add one
Create a new folder in `/skills/`, create `SKILL.md`, and register it in this index.

## Registered Skills
- `product-readiness-audit`: Run before launch / major release / handoff (Phase 7 gate).

## Future Reserved Slots (Do not build yet)
- `payment-flow-review`
- `release-checklist`
- `minors-compliance-audit`
- `incident-response`
