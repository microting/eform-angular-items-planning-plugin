import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../Page objects/Login.page';
import { MyEformsPage } from '../../../Page objects/MyEforms.page';
import { FoldersPage } from '../../../Page objects/Folders.page';
import { generateRandmString } from '../../../helper-functions';
import { ItemsPlanningPlanningPage } from '../ItemsPlanningPlanningPage';

let page;
let template = generateRandmString();
let folderName = generateRandmString();

test.describe('Items planning plannings - Sorting', () => {
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
    if ((await foldersPage.rowNum()) <= 0) {
      await foldersPage.createNewFolder(folderName, 'Description');
    } else {
      folderName = (await foldersPage.getFolder(1)).name;
    }
    await itemsPlanningPlanningPage.goToPlanningsPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should create dummy plannings', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    await itemsPlanningPlanningPage.createDummyPlannings(template, folderName);
  });

  test('should be able to sort by ID', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    await page.waitForTimeout(1000);

    let list = await page.locator('td.planningId').all();
    const planningBefore = await Promise.all(list.map((item) => item.textContent()));

    for (let i = 0; i < 2; i++) {
      await itemsPlanningPlanningPage.clickIdTableHeader();

      list = await page.locator('td.planningId').all();
      const planningAfter = await Promise.all(list.map((item) => item.textContent()));

      const sortIcon = await page.locator('th.planningId').locator('.ng-trigger-leftPointer').getAttribute('style');
      let sorted;
      if (sortIcon === 'transform: rotate(45deg);') {
        sorted = [...planningBefore].sort().reverse();
      } else if (sortIcon === 'expand_less') {
        sorted = planningBefore;
      } else {
        sorted = [...planningBefore].sort();
      }
      expect(sorted).toEqual(planningAfter);
    }
  });

  test('should be able to sort by Name', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    let list = await page.locator('td.planningName').all();
    const planningBefore = await Promise.all(list.map((item) => item.textContent()));

    for (let i = 0; i < 2; i++) {
      await itemsPlanningPlanningPage.clickNameTableHeader();

      list = await page.locator('td.planningName').all();
      const planningAfter = await Promise.all(list.map((item) => item.textContent()));

      const sortIcon = await page.locator('th.planningName').locator('.ng-trigger-leftPointer').getAttribute('style');
      let sorted;
      if (sortIcon === 'transform: rotate(45deg);') {
        sorted = [...planningBefore].sort().reverse();
      } else if (sortIcon === 'expand_less') {
        sorted = planningBefore;
      } else {
        sorted = [...planningBefore].sort();
      }
      expect(sorted).toEqual(planningAfter);
    }
  });

  test('should be able to sort by Description', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    let list = await page.locator('td.planningDescription').all();
    const planningBefore = await Promise.all(list.map((item) => item.textContent()));

    for (let i = 0; i < 2; i++) {
      await itemsPlanningPlanningPage.clickDescriptionTableHeader();

      list = await page.locator('td.planningDescription').all();
      const planningAfter = await Promise.all(list.map((item) => item.textContent()));

      const sortIcon = await page.locator('th.planningDescription').locator('.ng-trigger-leftPointer').getAttribute('style');
      let sorted;
      if (sortIcon === 'transform: rotate(45deg);') {
        sorted = [...planningBefore].sort().reverse();
      } else if (sortIcon === 'expand_less') {
        sorted = planningBefore;
      } else {
        sorted = [...planningBefore].sort();
      }
      expect(sorted).toEqual(planningAfter);
    }
  });

  test('should clear table', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    await itemsPlanningPlanningPage.clearTable();
  });
});
