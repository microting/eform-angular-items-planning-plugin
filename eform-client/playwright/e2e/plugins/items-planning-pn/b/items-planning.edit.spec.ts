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

let planningData: PlanningCreateUpdate = {
  name: [generateRandmString(), generateRandmString(), generateRandmString()],
  eFormName: generateRandmString(),
  description: generateRandmString(),
  repeatEvery: '1',
  repeatType: 'Dag',
  startFrom: { year: 2020, month: 7, day: 9 },
  repeatUntil: { year: 2021, month: 6, day: 10 },
  folderName: generateRandmString(),
  type: generateRandmString(),
  buildYear: '10',
  locationCode: '12345',
  number: '10',
  pushMessageEnabled: false,
  daysBeforeRedeploymentPushMessage: getRandomInt(1, 27),
};
let folderNameForEdit = generateRandmString();
let eFormNameForEdit = generateRandmString();

test.describe.serial('Items planning actions - Edit', () => {
  test.describe.configure({ timeout: 480000 });
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    const myEformsPage = new MyEformsPage(page);
    const foldersPage = new FoldersPage(page);
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    await loginPage.open('/auth');
    await loginPage.login();
    if ((await myEformsPage.rowNum()) >= 2) {
      planningData.eFormName = (await myEformsPage.getEformRowObj(1)).eFormName;
      eFormNameForEdit = (await myEformsPage.getEformRowObj(2)).eFormName;
    } else {
      if ((await myEformsPage.rowNum()) === 1) {
        planningData.eFormName = (
          await myEformsPage.getEformRowObj(1)
        ).eFormName;
      } else {
        await myEformsPage.createNewEform(planningData.eFormName);
      }
      await myEformsPage.createNewEform(eFormNameForEdit);
    }

    await myEformsPage.Navbar.goToFolderPage();
    await foldersPage.createNewFolder(planningData.folderName, 'Description');
    await foldersPage.createNewFolder(folderNameForEdit, 'Description');
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
    await (await foldersPage.getFolderByName(folderNameForEdit)).delete();

    await myEformsPage.Navbar.goToMyEForms();
    await page.locator('#spinner-animation').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    await (
      await myEformsPage.getFirstMyEformsRowObj()
    ).deleteEForm();
    await (
      await myEformsPage.getFirstMyEformsRowObj()
    ).deleteEForm();

    await page.close();
  });

  test('should create a new planning', async () => {
    const itemsPlanningModalPage = new ItemsPlanningModalPage(page);
    await itemsPlanningModalPage.createPlanning(planningData);
  });

  test('should change all fields after edit', async () => {
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    const itemsPlanningModalPage = new ItemsPlanningModalPage(page);

    let planningRowObject = await itemsPlanningPlanningPage.getPlaningByName(
      planningData.name[0]
    );
    const tempForSwapFolderName = planningData.folderName;
    const tempForSwapEFormFormName = planningData.eFormName;
    planningData = {
      name: [
        generateRandmString(),
        generateRandmString(),
        generateRandmString(),
      ],
      repeatType: 'Dag',
      description: generateRandmString(),
      folderName: folderNameForEdit,
      eFormName: eFormNameForEdit,
      number: '2',
      startFrom: { year: 2020, month: 7, day: 3 },
      locationCode: '54321',
      buildYear: '20',
      type: generateRandmString(),
      repeatUntil: { year: 2021, month: 10, day: 18 },
      repeatEvery: '2',
      pushMessageEnabled: true,
      daysBeforeRedeploymentPushMessage: getRandomInt(1, 27),
    };
    folderNameForEdit = tempForSwapFolderName;
    eFormNameForEdit = tempForSwapEFormFormName;
    await planningRowObject.update(planningData);

    planningRowObject = await itemsPlanningPlanningPage.getPlaningByName(
      planningData.name[0]
    );
    await planningRowObject.openEdit();
    await page.waitForTimeout(1000);
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

    const repeatUntilForExpect = format(set(new Date(), {
      year: planningData.repeatUntil.year,
      month: planningData.repeatUntil.month - 1,
      date: planningData.repeatUntil.day,
    }), 'dd.MM.yyyy');
    expect(
      await itemsPlanningModalPage.editRepeatUntil.inputValue()
    ).toBe(repeatUntilForExpect);
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
