# Skills Index

A "skill" is an executable audit or playbook for the AI agent or developer to run. It is not standard documentation.

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
- `product-readiness-audit`: Run before launch / major release / handoff.

## Future Reserved Slots (Do not build yet)
- `payment-flow-review`
- `release-checklist`
- `minors-compliance-audit`
- `incident-response`
