import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../Page objects/Login.page';
import { MyEformsPage } from '../../../Page objects/MyEforms.page';
import { FoldersPage } from '../../../Page objects/Folders.page';
import { generateRandmString } from '../../../helper-functions';
import { ItemsPlanningPlanningPage } from '../ItemsPlanningPlanningPage';

let page;
let template = generateRandmString();
let folderName = generateRandmString();

test.describe.serial('Items planning plannings - Sorting', () => {
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
    await itemsPlanningPlanningPage.createDummyPlannings(template, folderName);
  });

  test('should be able to sort by ID', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    await page.waitForTimeout(1000);

    // First click sorts descending (default view is already ascending by ID)
    await itemsPlanningPlanningPage.clickIdTableHeader();
    let list = await page.locator('td.planningId').all();
    const descValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedDesc = [...descValues].sort((a, b) => +(b || 0) - +(a || 0));
    expect(descValues).toEqual(sortedDesc);

    // Second click sorts ascending
    await itemsPlanningPlanningPage.clickIdTableHeader();
    list = await page.locator('td.planningId').all();
    const ascValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedAsc = [...ascValues].sort((a, b) => +(a || 0) - +(b || 0));
    expect(ascValues).toEqual(sortedAsc);
  });

  test('should be able to sort by Name', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    // First click = ascending by name
    await itemsPlanningPlanningPage.clickNameTableHeader();
    let list = await page.locator('td.planningName').all();
    const firstValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedAsc = [...firstValues].sort();
    expect(firstValues).toEqual(sortedAsc);

    // Second click = descending by name
    await itemsPlanningPlanningPage.clickNameTableHeader();
    list = await page.locator('td.planningName').all();
    const secondValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedDesc = [...secondValues].sort().reverse();
    expect(secondValues).toEqual(sortedDesc);
  });

  test('should be able to sort by Description', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    // First click = ascending by description
    await itemsPlanningPlanningPage.clickDescriptionTableHeader();
    let list = await page.locator('td.planningDescription').all();
    const firstValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedAsc = [...firstValues].sort();
    expect(firstValues).toEqual(sortedAsc);

    // Second click = descending by description
    await itemsPlanningPlanningPage.clickDescriptionTableHeader();
    list = await page.locator('td.planningDescription').all();
    const secondValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedDesc = [...secondValues].sort().reverse();
    expect(secondValues).toEqual(sortedDesc);
  });

  test('should clear table', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    await itemsPlanningPlanningPage.clearTable();
  });
});
