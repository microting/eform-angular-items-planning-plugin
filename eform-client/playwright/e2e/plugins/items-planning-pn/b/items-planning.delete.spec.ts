import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../Page objects/Login.page';
import { MyEformsPage } from '../../../Page objects/MyEforms.page';
import { FoldersPage } from '../../../Page objects/Folders.page';
import { generateRandmString } from '../../../helper-functions';
import {
  ItemsPlanningPlanningPage,
  PlanningCreateUpdate,
} from '../ItemsPlanningPlanningPage';
import { ItemsPlanningModalPage } from '../ItemsPlanningModal.page';

let page;

const planningData: PlanningCreateUpdate = {
  name: [generateRandmString(), generateRandmString(), generateRandmString()],
  eFormName: generateRandmString(),
  description: 'Description',
  repeatEvery: '1',
  repeatType: 'Dag',
  folderName: generateRandmString(),
  startFrom: { year: 2020, month: 7, day: 9 },
  repeatUntil: { year: 2021, month: 6, day: 10 },
};

test.describe.serial('Items planning actions - Delete', () => {
  test.describe.configure({ timeout: 480000 });
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    const myEformsPage = new MyEformsPage(page);
    const foldersPage = new FoldersPage(page);
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    await loginPage.open('/auth');
    await loginPage.login();
    if ((await myEformsPage.rowNum()) <= 0) {
      await myEformsPage.createNewEform(planningData.eFormName);
    } else {
      planningData.eFormName = (
        await myEformsPage.getFirstMyEformsRowObj()
      ).eFormName;
    }
    await myEformsPage.Navbar.goToFolderPage();
    await foldersPage.createNewFolder(planningData.folderName, 'Description');
    await itemsPlanningPlanningPage.goToPlanningsPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should create planning', async () => {
    const itemsPlanningModalPage = new ItemsPlanningModalPage(page);
    await itemsPlanningModalPage.createPlanning(planningData);
  });

  test('should not delete existing planning', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    const numRowBeforeDelete = await itemsPlanningPlanningPage.rowNum();
    const planningRowObject = await itemsPlanningPlanningPage.getPlaningByName(
      planningData.name[0]
    );
    await planningRowObject.delete(true);
    expect(numRowBeforeDelete).toBe(
      await itemsPlanningPlanningPage.rowNum()
    );
  });

  test('should delete existing planning', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    const numRowBeforeDelete = await itemsPlanningPlanningPage.rowNum();
    const planningRowObject = await itemsPlanningPlanningPage.getPlaningByName(
      planningData.name[0]
    );
    await planningRowObject.delete();
    expect(numRowBeforeDelete - 1).toBe(
      await itemsPlanningPlanningPage.rowNum()
    );
  });
});
