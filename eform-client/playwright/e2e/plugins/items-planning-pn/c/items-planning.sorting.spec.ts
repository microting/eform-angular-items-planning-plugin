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

    // Click once for ascending sort
    await itemsPlanningPlanningPage.clickIdTableHeader();
    let list = await page.locator('td.planningId').all();
    const ascValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedAsc = [...ascValues].sort();
    expect(ascValues).toEqual(sortedAsc);

    // Click again for descending sort
    await itemsPlanningPlanningPage.clickIdTableHeader();
    list = await page.locator('td.planningId').all();
    const descValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedDesc = [...descValues].sort().reverse();
    expect(descValues).toEqual(sortedDesc);
  });

  test('should be able to sort by Name', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    await itemsPlanningPlanningPage.clickNameTableHeader();
    let list = await page.locator('td.planningName').all();
    const ascValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedAsc = [...ascValues].sort();
    expect(ascValues).toEqual(sortedAsc);

    await itemsPlanningPlanningPage.clickNameTableHeader();
    list = await page.locator('td.planningName').all();
    const descValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedDesc = [...descValues].sort().reverse();
    expect(descValues).toEqual(sortedDesc);
  });

  test('should be able to sort by Description', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    await itemsPlanningPlanningPage.clickDescriptionTableHeader();
    let list = await page.locator('td.planningDescription').all();
    const ascValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedAsc = [...ascValues].sort();
    expect(ascValues).toEqual(sortedAsc);

    await itemsPlanningPlanningPage.clickDescriptionTableHeader();
    list = await page.locator('td.planningDescription').all();
    const descValues = await Promise.all(list.map((item) => item.textContent()));
    const sortedDesc = [...descValues].sort().reverse();
    expect(descValues).toEqual(sortedDesc);
  });

  test('should clear table', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    await itemsPlanningPlanningPage.clearTable();
  });
});
