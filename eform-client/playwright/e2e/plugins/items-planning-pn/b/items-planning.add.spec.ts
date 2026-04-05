import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../Page objects/Login.page';
import { MyEformsPage } from '../../../Page objects/MyEforms.page';
import { FoldersPage } from '../../../Page objects/Folders.page';
import { generateRandmString, getRandomInt } from '../../../helper-functions';
import {
  ItemsPlanningPlanningPage,
  PlanningCreateUpdate,
  PlanningRowObject,
} from '../ItemsPlanningPlanningPage';
import { ItemsPlanningModalPage } from '../ItemsPlanningModal.page';
import { format, set } from 'date-fns';

let page;

const planningData: PlanningCreateUpdate = {
  name: [generateRandmString(), generateRandmString(), generateRandmString()],
  eFormName: generateRandmString(),
  folderName: generateRandmString(),
  description: generateRandmString(),
  repeatEvery: '1',
  repeatType: 'Dag',
  startFrom: { year: 2020, day: 7, month: 9 },
  repeatUntil: { year: 2020, day: 6, month: 10 },
  type: generateRandmString(),
  locationCode: '12345',
  buildYear: '10',
  number: '10',
  daysBeforeRedeploymentPushMessage: getRandomInt(1, 27),
  pushMessageEnabled: true,
};

test.describe.serial('Items planning - Add', () => {
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

  test.afterAll(async ({}, testInfo) => {
    testInfo.setTimeout(240000);
    const myEformsPage = new MyEformsPage(page);
    const foldersPage = new FoldersPage(page);
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    await itemsPlanningPlanningPage.clearTable();

    await myEformsPage.Navbar.goToFolderPage();
    await (await foldersPage.getFolderByName(planningData.folderName)).delete();

    await myEformsPage.Navbar.goToMyEForms();
    await myEformsPage.clearEFormTable();

    await page.close();
  });

  test('should create planning with all fields', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    const itemsPlanningModalPage = new ItemsPlanningModalPage(page);

    const rowNumBeforeCreatePlanning = await itemsPlanningPlanningPage.rowNum();
    await itemsPlanningModalPage.createPlanning(planningData);
    await page.waitForTimeout(500);
    expect(rowNumBeforeCreatePlanning + 1).toBe(
      await itemsPlanningPlanningPage.rowNum()
    );
  });

  test('check all fields planning', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    const itemsPlanningModalPage = new ItemsPlanningModalPage(page);

    const planningRowObject = await itemsPlanningPlanningPage.getPlaningByName(
      planningData.name[0]
    );
    expect(planningRowObject.name).toBe(planningData.name[0]);
    expect(planningRowObject.eFormName).toBe(planningData.eFormName);
    expect(planningRowObject.description).toBe(planningData.description);
    expect(planningRowObject.repeatEvery.toString()).toBe(planningData.repeatEvery);
    expect(planningRowObject.repeatType).toBe(planningData.repeatType);

    await planningRowObject.openEdit();
    for (let i = 0; i < planningData.name.length; i++) {
      expect(
        await itemsPlanningModalPage.editPlanningItemName(i).inputValue()
      ).toBe(planningData.name[i]);
    }
    expect(
      await itemsPlanningModalPage.editPlanningDescription.inputValue()
    ).toBe(planningData.description);
    expect(
      (await itemsPlanningModalPage.editPlanningSelector.locator('.ng-value').textContent() || '').trim()
    ).toBe(planningData.eFormName);
    expect(
      await itemsPlanningModalPage.editRepeatEvery.inputValue()
    ).toBe(planningData.repeatEvery);
    expect(
      (await itemsPlanningModalPage.editRepeatType.locator('.ng-value-label').textContent() || '').trim()
    ).toBe(planningData.repeatType);
    expect(
      await itemsPlanningModalPage.editItemType.inputValue()
    ).toBe(planningData.type);
    expect(
      await itemsPlanningModalPage.editItemBuildYear.inputValue()
    ).toBe(planningData.buildYear);
    expect(
      (await page.locator('#folderName').textContent() || '').trim()
    ).toBe(planningData.folderName);
    expect(
      await itemsPlanningModalPage.editItemLocationCode.inputValue()
    ).toBe(planningData.locationCode);

    const startDateForExpect = format(set(new Date(), {
      year: planningData.startFrom.year,
      month: planningData.startFrom.month - 1,
      date: planningData.startFrom.day,
    }), 'dd.MM.yyyy');
    expect(
      await itemsPlanningModalPage.editStartFrom.inputValue()
    ).toBe(startDateForExpect);

    expect(
      (await itemsPlanningModalPage.pushMessageEnabledEdit.locator('.ng-value-label').textContent() || '').trim()
    ).toBe(planningData.pushMessageEnabled ? 'Aktiveret' : 'Deaktiveret');
    expect(
      +(await itemsPlanningModalPage.editDaysBeforeRedeploymentPushMessage.locator('.ng-value-label').textContent() || '0')
    ).toBe(planningData.daysBeforeRedeploymentPushMessage);

    await planningRowObject.closeEdit(true);
  });
});
