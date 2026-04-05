import { Page, Locator } from '@playwright/test';
import { PageWithNavbarPage } from '../../Page objects/PageWithNavbar.page';
import { ItemsPlanningPlanningPage } from './ItemsPlanningPlanningPage';

export class ItemsPlanningPairingPage extends PageWithNavbarPage {
  constructor(page: Page) {
    super(page);
  }

  public get pairingBtn(): Locator {
    return this.page.locator('#items-planning-pn-pairing');
  }

  public async goToPairingPage() {
    const planningPage = new ItemsPlanningPlanningPage(this.page);
    await planningPage.itemPlanningButton.waitFor({ state: 'visible', timeout: 20000 });
    await planningPage.itemPlanningButton.click();
    await this.pairingBtn.waitFor({ state: 'visible', timeout: 20000 });
    await this.pairingBtn.click();
    await this.savePairingGridBtn.waitFor({ state: 'visible', timeout: 120000 });
  }

  public async countPlanningRow(): Promise<number> {
    await this.page.waitForTimeout(500);
    return await this.page.locator('#planningName').count();
  }

  public get savePairingGridBtn(): Locator {
    return this.page.locator('#savePairingGridBtn');
  }

  public get updatePairingsSaveBtn(): Locator {
    return this.page.locator('#updatePairingsSaveBtn');
  }

  public get updatePairingsSaveCancelBtn(): Locator {
    return this.page.locator('#updatePairingsSaveCancelBtn');
  }

  public async savePairing(clickCancel = false) {
    await this.page.waitForTimeout(5000);
    await this.savePairingGridBtn.click();
    if (clickCancel) {
      await this.updatePairingsSaveCancelBtn.waitFor({ state: 'visible', timeout: 20000 });
      await this.updatePairingsSaveCancelBtn.click();
    } else {
      await this.updatePairingsSaveBtn.waitFor({ state: 'visible', timeout: 40000 });
      await this.updatePairingsSaveBtn.click();
    }
    await this.savePairingGridBtn.waitFor({ state: 'visible', timeout: 40000 });
  }

  public async countDeviceUserCol(): Promise<number> {
    await this.page.waitForTimeout(500);
    const count = await this.page.locator('.mat-header-cell').count();
    return count > 0 ? count - 1 : 0;
  }

  public async planningRowByPlanningName(
    planningName: string
  ): Promise<PairingRowObject | null> {
    for (let i = 1; i < (await this.countPlanningRow()) + 1; i++) {
      const pairObj = new PairingRowObject(this.page, this);
      const element = await pairObj.getRow(i);
      if (element && element.planningName === planningName) {
        return element;
      }
    }
    return null;
  }

  async getDeviceUserByIndex(index: number): Promise<PairingColObject | null> {
    if (index > 0 && index <= (await this.countDeviceUserCol())) {
      const obj = new PairingColObject(this.page, this);
      return await obj.getRow(index);
    }
    return null;
  }

  async getPlanningByIndex(index: number): Promise<PairingRowObject | null> {
    if (index > 0 && index <= (await this.countPlanningRow())) {
      const obj = new PairingRowObject(this.page, this);
      return await obj.getRow(index);
    }
    return null;
  }

  public async indexColDeviceUserInTableByName(
    deviceUserName: string
  ): Promise<number> {
    for (let i = 0; i < (await this.countDeviceUserCol()); i++) {
      const deviceUser = await this.getDeviceUserByIndex(i);
      if (deviceUser && deviceUser.deviceUserName === deviceUserName) {
        return i;
      }
    }
    return -1;
  }
}

export class PairingRowObject {
  private page: Page;
  private pairingPage: ItemsPlanningPairingPage;

  constructor(page: Page, pairingPage: ItemsPlanningPairingPage) {
    this.page = page;
    this.pairingPage = pairingPage;
  }

  public planningName: string;
  public pairRow: Locator;
  public pairRowForClick: Locator;
  public pairCheckboxes: Locator[];
  public pairCheckboxesForClick: Locator[];
  public row: Locator;

  async getRow(rowNum: number): Promise<PairingRowObject | null> {
    this.row = this.page.locator('tbody tr').nth(rowNum - 1);
    if ((await this.page.locator('tbody tr').count()) >= rowNum) {
      this.planningName = (await this.row.locator('#planningName').textContent()) || '';
      this.pairRow = this.page.locator(`#planningRowCheckbox${rowNum - 1}`);
      this.pairRowForClick = this.pairRow;
      this.pairCheckboxes = [];
      await this.page.waitForTimeout(1000);
      const deviceUserCount = (await this.pairingPage.countDeviceUserCol()) - 1;
      for (let i = 0; i < deviceUserCount; i++) {
        this.pairCheckboxes.push(this.page.locator(`#deviceUserCheckbox${rowNum - 1}_planning${i}`));
      }
      this.pairCheckboxesForClick = [];
      for (let i = 0; i < this.pairCheckboxes.length; i++) {
        this.pairCheckboxesForClick.push(this.pairCheckboxes[i]);
      }
    } else {
      return null;
    }
    return this;
  }

  public async pairWhichAllDeviceUsers(
    pair: boolean,
    clickOnPairRow = false,
    clickCancel = false
  ) {
    if (clickOnPairRow) {
      await this.pairRowForClick.click({ force: true });
      await this.page.waitForTimeout(500);
      if ((await this.pairRow.locator('input').isChecked()) !== pair) {
        await this.pairRowForClick.click({ force: true });
        await this.page.waitForTimeout(500);
      }
    } else {
      for (let i = 0; i < this.pairCheckboxesForClick.length; i++) {
        if ((await this.pairCheckboxes[i].locator('input').isChecked()) !== pair) {
          await this.pairCheckboxesForClick[i].click({ force: true });
          await this.page.waitForTimeout(500);
        }
      }
    }
    await this.pairingPage.savePairing(clickCancel);
  }

  public async pairWithOneDeviceUser(
    pair: boolean,
    indexDeviceForPair: number,
    clickCancel = false
  ) {
    await this.pairCheckboxesForClick[indexDeviceForPair].click({ force: true });
    await this.page.waitForTimeout(1000);
    await this.pairingPage.savePairing(clickCancel);
  }

  public async isPair(deviceUser: { firstName: string; lastName: string }): Promise<boolean> {
    const index = await this.pairingPage.indexColDeviceUserInTableByName(
      `${deviceUser.firstName} ${deviceUser.lastName}`
    );
    return await this.pairCheckboxes[index - 1].locator('input').isChecked();
  }
}

export class PairingColObject {
  private page: Page;
  private pairingPage: ItemsPlanningPairingPage;

  constructor(page: Page, pairingPage: ItemsPlanningPairingPage) {
    this.page = page;
    this.pairingPage = pairingPage;
  }

  public deviceUserName: string;
  public pairCol: Locator;
  public pairColForClick: Locator;
  public pairCheckboxesForClick: Locator[];
  public pairCheckboxes: Locator[];

  async getRow(rowNum: number): Promise<PairingColObject> {
    const ele = this.page.locator('.mat-header-cell').nth(rowNum);
    await ele.waitFor({ state: 'visible', timeout: 20000 });
    this.deviceUserName = ((await ele.textContent()) || '').trim();
    this.pairCol = ele.locator('mat-checkbox');
    this.pairColForClick = this.pairCol;
    this.pairCheckboxesForClick = [];
    this.pairCheckboxes = [];
    const planningCount = await this.pairingPage.countPlanningRow();
    for (let i = 0; i < planningCount; i++) {
      this.pairCheckboxes.push(this.page.locator(`#deviceUserCheckbox${i}_planning${rowNum - 1}`));
    }
    for (let i = 0; i < this.pairCheckboxes.length; i++) {
      this.pairCheckboxesForClick.push(this.pairCheckboxes[i]);
    }
    return this;
  }

  public async pairWhichAllPlannings(
    pair: boolean,
    clickOnPairRow = false,
    clickCancel = false
  ) {
    if (clickOnPairRow) {
      await this.pairColForClick.click({ force: true });
      await this.page.waitForTimeout(500);
      if ((await this.pairCol.locator('input').isChecked()) !== pair) {
        await this.pairColForClick.click({ force: true });
        await this.page.waitForTimeout(500);
      }
    } else {
      for (let i = 0; i < this.pairCheckboxesForClick.length; i++) {
        if ((await this.pairCheckboxes[i].locator('input').isChecked()) !== pair) {
          await this.pairCheckboxesForClick[i].click({ force: true });
          await this.page.waitForTimeout(500);
        }
      }
    }
    await this.pairingPage.savePairing(clickCancel);
  }
}
