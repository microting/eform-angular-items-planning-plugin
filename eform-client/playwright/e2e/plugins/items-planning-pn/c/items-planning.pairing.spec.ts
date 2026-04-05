import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../Page objects/Login.page';
import { MyEformsPage } from '../../../Page objects/MyEforms.page';
import { FoldersPage } from '../../../Page objects/Folders.page';
import { DeviceUsersPage } from '../../../Page objects/DeviceUsers.page';
import { generateRandmString } from '../../../helper-functions';
import {
  ItemsPlanningPlanningPage,
  PlanningCreateUpdate,
  PlanningRowObject,
} from '../ItemsPlanningPlanningPage';
import { ItemsPlanningModalPage } from '../ItemsPlanningModal.page';
import { ItemsPlanningPairingPage } from '../ItemsPlanningPairingPage';

let page;
let template = generateRandmString();
let folderName = generateRandmString();
let planningRowObjects: PlanningRowObject[];
const deviceUsers: any[] = [];
const countDeviceUsers = 2;
const countPlanning = 2;

test.describe.serial('Items planning plugin - Pairing', () => {
  test.describe.configure({ timeout: 600000 });
  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(600000);
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    const myEformsPage = new MyEformsPage(page);
    const foldersPage = new FoldersPage(page);
    const deviceUsersPage = new DeviceUsersPage(page);
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);
    const itemsPlanningModalPage = new ItemsPlanningModalPage(page);
    const itemsPlanningPairingPage = new ItemsPlanningPairingPage(page);

    await loginPage.open('/auth');
    await loginPage.login();

    if ((await myEformsPage.rowNum()) <= 0) {
      await myEformsPage.createNewEform(template);
    } else {
      template = (await myEformsPage.getFirstMyEformsRowObj()).eFormName;
    }

    await myEformsPage.Navbar.goToDeviceUsersPage();
    while ((await deviceUsersPage.rowNum()) !== countDeviceUsers) {
      await deviceUsersPage.createNewDeviceUser(
        generateRandmString(),
        generateRandmString()
      );
    }
    for (let i = 1; i < countDeviceUsers + 1; i++) {
      deviceUsers.push(await deviceUsersPage.getDeviceUser(i));
    }

    await myEformsPage.Navbar.goToFolderPage();
    await foldersPage.createNewFolder(folderName, 'Description');

    await itemsPlanningPlanningPage.goToPlanningsPage();
    while ((await itemsPlanningPlanningPage.rowNum()) < countPlanning) {
      const planningData: PlanningCreateUpdate = {
        name: [
          generateRandmString(),
          generateRandmString(),
          generateRandmString(),
        ],
        eFormName: template,
        folderName: folderName,
      };
      await itemsPlanningModalPage.createPlanning(planningData);
    }
    await page.waitForTimeout(1000);
    planningRowObjects = [
      ...await itemsPlanningPlanningPage.getAllPlannings(countPlanning, false),
    ];

    await itemsPlanningPairingPage.goToPairingPage();
  });

  test.afterAll(async ({}, testInfo) => {
    testInfo.setTimeout(600000);
    const myEformsPage = new MyEformsPage(page);
    const foldersPage = new FoldersPage(page);
    const deviceUsersPage = new DeviceUsersPage(page);
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    await itemsPlanningPlanningPage.goToPlanningsPage();
    await itemsPlanningPlanningPage.clearTable();

    await myEformsPage.Navbar.goToFolderPage();
    await (await foldersPage.getFolderByName(folderName)).delete();

    await myEformsPage.Navbar.goToDeviceUsersPage();
    for (let i = 0; i < deviceUsers.length; i++) {
      await deviceUsers[i].delete();
    }

    await myEformsPage.Navbar.goToMyEForms();
    await (await myEformsPage.getEformsRowObjByNameEForm(template)).deleteEForm();

    await page.close();
  });

  test('should pair one device user which all plannings', async () => {
    const itemsPlanningPairingPage = new ItemsPlanningPairingPage(page);
    const pair = true;
    const pairingColObject = await itemsPlanningPairingPage.getDeviceUserByIndex(1);
    await pairingColObject.pairWhichAllPlannings(pair);
    for (let i = 0; i < pairingColObject.pairCheckboxesForClick.length; i++) {
      expect(
        await pairingColObject.pairCheckboxes[i].locator('input').isChecked()
      ).toBe(pair);
    }
  });

  test('should unpair one device user which all plannings', async () => {
    const itemsPlanningPairingPage = new ItemsPlanningPairingPage(page);
    const pair = false;
    const pairingColObject = await itemsPlanningPairingPage.getDeviceUserByIndex(1);
    await pairingColObject.pairWhichAllPlannings(pair, true);
    for (let i = 0; i < pairingColObject.pairCheckboxesForClick.length; i++) {
      expect(
        await pairingColObject.pairCheckboxes[i].locator('input').isChecked()
      ).toBe(pair);
    }
  });

  test('should pair one planning which all device user', async () => {
    const itemsPlanningPairingPage = new ItemsPlanningPairingPage(page);
    const pair = true;
    const pairingRowObject = await itemsPlanningPairingPage.getPlanningByIndex(1);
    await pairingRowObject.pairWhichAllDeviceUsers(pair);
    for (let i = 0; i < pairingRowObject.pairCheckboxesForClick.length; i++) {
      expect(
        await pairingRowObject.pairCheckboxes[i].locator('input').isChecked()
      ).toBe(pair);
    }
  });

  test('should unpair one planning which all device user', async () => {
    const itemsPlanningPairingPage = new ItemsPlanningPairingPage(page);
    const pair = false;
    const pairingRowObject = await itemsPlanningPairingPage.getPlanningByIndex(1);
    await pairingRowObject.pairWhichAllDeviceUsers(pair, true);
    for (let i = 0; i < pairingRowObject.pairCheckboxesForClick.length; i++) {
      expect(
        await pairingRowObject.pairCheckboxes[i].locator('input').isChecked()
      ).toBe(pair);
    }
  });

  test('should pair one planning which one device user', async () => {
    const itemsPlanningPairingPage = new ItemsPlanningPairingPage(page);
    const pair = true;
    const indexDeviceForPair = 1;
    const pairingRowObject = await itemsPlanningPairingPage.getPlanningByIndex(1);
    await pairingRowObject.pairWithOneDeviceUser(pair, indexDeviceForPair);
    expect(
      await pairingRowObject.pairCheckboxes[indexDeviceForPair].locator('input').isChecked()
    ).toBe(pair);
  });

  test('should unpair one planning which one device user', async () => {
    const itemsPlanningPairingPage = new ItemsPlanningPairingPage(page);
    const pair = false;
    const indexDeviceForPair = 1;
    const pairingRowObject = await itemsPlanningPairingPage.getPlanningByIndex(1);
    await pairingRowObject.pairWithOneDeviceUser(pair, indexDeviceForPair);
    expect(
      await pairingRowObject.pairCheckboxes[indexDeviceForPair].locator('input').isChecked()
    ).toBe(pair);
  });
});
