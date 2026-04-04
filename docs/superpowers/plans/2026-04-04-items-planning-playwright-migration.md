# Items Planning Playwright Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Migrate items-planning WDIO e2e tests to Playwright with CI jobs.

**Architecture:** 3 page objects + 8 test files across folders a/b/c. Uses shared Playwright page objects from eform-angular-frontend.

**Tech Stack:** Playwright Test, TypeScript, GitHub Actions

---

See spec at `docs/superpowers/specs/2026-04-04-items-planning-playwright-migration-design.md` for detailed conversion patterns.

Tasks:
1. Create `playwright.config.ts`
2. Port `ItemsPlanningPlanningPage.ts` (main page + PlanningRowObject + PlanningCreateUpdate)
3. Port `ItemsPlanningModal.page.ts` (create/edit/delete modals)
4. Port `ItemsPlanningPairingPage.ts` (pairing grid)
5. Copy `PlanningsTestImport.data.ts` (pure data, no WDIO deps)
6. Port folder `a/` test (plugin activation)
7. Port folder `b/` tests (add, edit, delete)
8. Port folder `c/` tests (sorting, multiple-delete, tags, import, pairing)
9. Update master workflow
10. Update PR workflow
11. Create PR
