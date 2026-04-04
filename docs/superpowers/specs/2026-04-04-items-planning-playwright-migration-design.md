# Items Planning Plugin — Playwright Migration Design Spec

## Goal

Migrate WDIO e2e tests in `eform-angular-items-planning-plugin` to Playwright, following patterns from `eform-angular-workflow-plugin` PR #1346. WDIO tests remain in place.

## Current State

- **10 WDIO test files** (+ 1 placeholder `assert-true.spec.ts`)
- **4 WDIO page objects** in `eform-client/e2e/Page objects/ItemsPlanning/`
- **CI uses matrix [a,b,c]** mapping to `wdio-headless-plugin-step2{a,b,c}.conf.ts`
- Config `a` runs only `assert-true.spec.ts` (placeholder), `b` same, `c` runs tags/import/pairing/plugins-page
- No Playwright files exist

## Target State

### New Files

```
eform-client/playwright.config.ts
eform-client/playwright/e2e/plugins/items-planning-pn/
├── ItemsPlanningPlanningPage.ts
├── ItemsPlanningModal.page.ts
├── ItemsPlanningPairingPage.ts
├── PlanningsTestImport.data.ts
├── a/
│   └── items-planning-settings.spec.ts       # plugin activation
├── b/
│   ├── items-planning.add.spec.ts
│   ├── items-planning.edit.spec.ts
│   └── items-planning.delete.spec.ts
└── c/
    ├── items-planning.sorting.spec.ts
    ├── items-planning.multiple-delete.spec.ts
    ├── items-planning.tags.spec.ts
    ├── items-planning.import.spec.ts
    └── items-planning.pairing.spec.ts
```

### Modified Files

| File | Change |
|------|--------|
| `.github/workflows/dotnet-core-master.yml` | Add `items-planning-playwright-test` job |
| `.github/workflows/dotnet-core-pr.yml` | Add `items-planning-playwright-test` job |

## Excluded Tests

- `items-planning.settings.spec.ts` — references missing `ItemsPlanningSettings.page`, not run in CI
- `assert-true.spec.ts` — placeholder canary

## WDIO → Playwright Conversion Patterns

| WDIO | Playwright |
|------|-----------|
| `$('#id')` | `this.page.locator('#id')` |
| `$$('sel')` | `this.page.locator('sel')` |
| `element.getText()` | `locator.textContent()` + `.trim()` |
| `element.getValue()` | `locator.inputValue()` |
| `element.setValue(v)` | `locator.fill(v)` |
| `element.addValue(v)` | `locator.pressSequentially(v)` |
| `element.getProperty('checked')` | `locator.isChecked()` |
| `element.getAttribute('style')` | `locator.getAttribute('style')` |
| `element.waitForDisplayed()` | `locator.waitFor({state:'visible'})` |
| `element.waitForDisplayed({reverse:true})` | `locator.waitFor({state:'hidden'})` |
| `element.waitForClickable()` | `locator.waitFor({state:'visible'})` (Playwright auto-waits on click) |
| `element.isClickable()` | `await locator.isVisible()` |
| `element.isExisting()` | `await locator.count() > 0` |
| `browser.pause(n)` | `page.waitForTimeout(n)` |
| `browser.keys(['Return'])` | `page.keyboard.press('Enter')` |
| `browser.keys(['Escape'])` | `page.keyboard.press('Escape')` |
| `browser.uploadFile(path)` | `locator.setInputFiles(path)` |
| `export default new Class()` | `export class Class { constructor(page: Page) {} }` |
| `selectValueInNgSelector(element, value)` | `selectValueInNgSelector(page, '#selector', value)` |
| `selectDateOnDatePicker(y,m,d)` | `selectDateOnNewDatePicker(page, y, m, d)` |
| `customDaLocale` date format `P` | `format(date, 'dd.MM.yyyy')` (equivalent output) |

## Shared Dependencies from eform-angular-frontend

Page objects (already Playwright-ready):
- `LoginPage`, `MyEformsPage`, `PluginPage`, `FoldersPage`, `DeviceUsersPage`, `TagsModalPage`

Helper functions:
- `generateRandmString`, `getRandomInt`, `selectValueInNgSelector`, `selectDateOnNewDatePicker`, `testSorting`

Import paths from `plugins/items-planning-pn/`:
- Shared page objects: `../../Page objects/X.page`
- Helper functions: `../../helper-functions`
- From test files in `a/`, `b/`, `c/`: `../../../Page objects/X.page`, `../../../helper-functions`
- Plugin page objects from same plugin dir: `../ItemsPlanningPlanningPage`

## CI Job Design

New `items-planning-playwright-test` job:
- `needs: build`, matrix `[a,b,c]`
- Copies plugin source + Playwright tests + config into frontend
- For matrix `a`: no plugin enable (activation test), loads DB dump from cypress path
- For matrix `b`,`c`: enables plugin in DB, restarts container
- Runs `npx playwright test playwright/e2e/plugins/items-planning-pn/${{matrix.test}}/`
- Uploads Playwright report artifact on failure

## Assets

The import test requires `e2e/Assets/Skabelon Døvmark NEW.xlsx`. This needs to be copied to the frontend in CI. The Playwright test uses `page.setInputFiles()` instead of WDIO's `browser.uploadFile()`.
