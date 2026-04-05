import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../Page objects/Login.page';
import { MyEformsPage } from '../../../Page objects/MyEforms.page';
import { FoldersPage } from '../../../Page objects/Folders.page';
import { generateRandmString } from '../../../helper-functions';
import { ItemsPlanningPlanningPage } from '../ItemsPlanningPlanningPage';

let page;
let template = generateRandmString();
let folderName = generateRandmString();
const countPlannings = 5;

test.describe.serial('Items planning plannings - Multiple delete', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    const myEformsPage = new MyEformsPage(page);
    const foldersPage = new FoldersPage(page);
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    await loginPage.open('/auth');
    await loginPage.login();
    if ((await myEformsPage.rowNum()) <= 0) {
      await myEformsPage.createNewEform(template);
    } else {
      template = (await myEformsPage.getFirstMyEformsRowObj()).eFormName;
    }
    await myEformsPage.Navbar.goToFolderPage();
    await foldersPage.createNewFolder(folderName, 'Description');
    await itemsPlanningPlanningPage.goToPlanningsPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should create dummy plannings', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    await itemsPlanningPlanningPage.createDummyPlannings(
      template,
      folderName,
      countPlannings
    );
  });

  test('should not delete because click cancel', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    const countBeforeDelete = await itemsPlanningPlanningPage.rowNum();
    await itemsPlanningPlanningPage.selectAllPlanningsForDelete();
    await itemsPlanningPlanningPage.multipleDelete(true);
    expect(countBeforeDelete).toBe(
      await itemsPlanningPlanningPage.rowNum()
    );
  });

  test('should multiple delete plannings', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    const countBeforeDelete = await itemsPlanningPlanningPage.rowNum();
    await itemsPlanningPlanningPage.multipleDelete();
    expect(countBeforeDelete - countPlannings).toBe(
      await itemsPlanningPlanningPage.rowNum()
    );
  });
});
