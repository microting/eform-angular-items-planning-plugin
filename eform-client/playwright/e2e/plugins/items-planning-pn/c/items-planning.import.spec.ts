import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../Page objects/Login.page';
import { MyEformsPage } from '../../../Page objects/MyEforms.page';
import { ItemsPlanningPlanningPage } from '../ItemsPlanningPlanningPage';
import { ItemsPlanningModalPage } from '../ItemsPlanningModal.page';
import { planningsImportTestData } from '../PlanningsTestImport.data';
import * as path from 'path';

let page;

test.describe.serial('Items planning - Import', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.open('/auth');
    await loginPage.login();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should be imported plannings', async () => {
    const myEformsPage = new MyEformsPage(page);
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    const itemsPlanningModalPage = new ItemsPlanningModalPage(page);

    const localPath = process.cwd();
    const eformsBeforeImport = await myEformsPage.rowNum();
    await myEformsPage.importEformsBtn().click();
    await page.waitForTimeout(2000);

    const filePath = path.join(localPath, 'e2e', 'Assets', 'Skabelon Døvmark NEW.xlsx');
    await page.locator('app-eforms-bulk-import-modal * *').first().waitFor({ state: 'visible', timeout: 20000 });
    await myEformsPage.xlsxImportInput().setInputFiles(filePath);
    await myEformsPage.newEformBtn().waitFor({ state: 'visible', timeout: 60000 });
    expect(eformsBeforeImport).not.toBe(await myEformsPage.rowNum());

    await itemsPlanningPlanningPage.goToPlanningsPage();
    const planningsBeforeImport = await itemsPlanningPlanningPage.rowNum();
    await itemsPlanningPlanningPage.importPlanningsBtn.click();

    await page.locator('app-plannings-bulk-import-modal * *').first().waitFor({
      state: 'visible',
      timeout: 20000,
    });
    await itemsPlanningModalPage.xlsxImportPlanningsInput.setInputFiles(filePath);
    await itemsPlanningPlanningPage.planningCreateBtn.waitFor({
      state: 'visible',
      timeout: 60000,
    });
    expect(planningsBeforeImport).not.toBe(
      await itemsPlanningPlanningPage.rowNum()
    );
  });

  test('should be imported data equal moq data', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    for (let i = 0; i < planningsImportTestData.length; i++) {
      const planning = await itemsPlanningPlanningPage.getPlanningByIndex(i + 1);
      const testPlanning = planningsImportTestData[i];
      expect(planning.name).toBe(testPlanning.translatedName);
      expect(planning.description).toBe(testPlanning.description);
      expect(planning.folderName).toBe(testPlanning.folder);
      expect(planning.eFormName).toBe(testPlanning.relatedEFormName);
      expect(planning.repeatEvery).toBe(testPlanning.repeatEvery);
      expect(planning.repeatType).toBe(testPlanning.repeatType);
      for (let j = 0; j < testPlanning.tags.length; j++) {
        expect(testPlanning.tags[j]).toBe(testPlanning.tags[j]);
      }
    }
  });
});
