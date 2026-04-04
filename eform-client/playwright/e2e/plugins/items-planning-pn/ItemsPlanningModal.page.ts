import { Page, Locator } from '@playwright/test';
import { ItemsPlanningPlanningPage, PlanningCreateUpdate } from './ItemsPlanningPlanningPage';
import { selectDateOnNewDatePicker, selectValueInNgSelector } from '../../helper-functions';

export class ItemsPlanningModalPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Create page elements
  public createPlanningItemName(index: number): Locator {
    return this.page.locator(`#createPlanningNameTranslation_${index}`);
  }

  public get createPlanningSelector(): Locator {
    return this.page.locator('#createPlanningSelector');
  }

  public get createPlanningItemDescription(): Locator {
    return this.page.locator('#createPlanningItemDescription');
  }

  public get createRepeatEvery(): Locator {
    return this.page.locator('#createRepeatEvery');
  }

  public async selectFolder(nameFolder: string) {
    await this.page.waitForTimeout(1000);
    const createFolder = this.createFolderName;
    const editFolder = this.editFolderName;
    if ((await createFolder.count()) > 0) {
      await createFolder.click();
    } else {
      await editFolder.click();
    }
    await this.page.waitForTimeout(1000);
    const treeViewport = this.page.locator('app-eform-tree-view-picker');
    await treeViewport.waitFor({ state: 'visible', timeout: 20000 });
    await this.page.locator('.folder-tree-name', { hasText: nameFolder }).first().click();
    await treeViewport.waitFor({ state: 'hidden', timeout: 2000 });
  }

  public get createFolderName(): Locator {
    return this.page.locator('#createFolderSelector');
  }

  public get editFolderName(): Locator {
    return this.page.locator('#editFolderSelector');
  }

  public get createRepeatUntil(): Locator {
    return this.page.locator('#createRepeatUntil');
  }

  public get planningCreateSaveBtn(): Locator {
    return this.page.locator('#planningCreateSaveBtn');
  }

  public get planningCreateCancelBtn(): Locator {
    return this.page.locator('#planningCreateCancelBtn');
  }

  public get createPlanningTagsSelector(): Locator {
    return this.page.locator('#createPlanningTagsSelector');
  }

  public get createStartFrom(): Locator {
    return this.page.locator('#createStartFrom');
  }

  public get createItemNumber(): Locator {
    return this.page.locator('#createItemNumber');
  }

  public get createItemLocationCode(): Locator {
    return this.page.locator('#createItemLocationCode');
  }

  public get createItemBuildYear(): Locator {
    return this.page.locator('#createItemBuildYear');
  }

  public get createItemType(): Locator {
    return this.page.locator('#createItemType');
  }

  // Edit page elements
  public editPlanningItemName(index: number): Locator {
    return this.page.locator(`#editPlanningNameTranslation_${index}`);
  }

  public get editPlanningSelector(): Locator {
    return this.page.locator('#editPlanningSelector');
  }

  public get editPlanningTagsSelector(): Locator {
    return this.page.locator('#editPlanningTagsSelector');
  }

  public get editItemNumber(): Locator {
    return this.page.locator('#editItemNumber');
  }

  public get editPlanningDescription(): Locator {
    return this.page.locator('#editPlanningItemDescription');
  }

  public get editRepeatEvery(): Locator {
    return this.page.locator('#editRepeatEvery');
  }

  public get planningId(): Locator {
    return this.page.locator('#planningId');
  }

  public get editRepeatType(): Locator {
    return this.page.locator('#editRepeatType');
  }

  public get editRepeatUntil(): Locator {
    return this.page.locator('#editRepeatUntil');
  }

  public get editStartFrom(): Locator {
    return this.page.locator('#editStartFrom');
  }

  public get editItemLocationCode(): Locator {
    return this.page.locator('#editItemLocationCode');
  }

  public get editItemBuildYear(): Locator {
    return this.page.locator('#editItemBuildYear');
  }

  public get editItemType(): Locator {
    return this.page.locator('#editItemType');
  }

  public get planningEditSaveBtn(): Locator {
    return this.page.locator('#planningEditSaveBtn');
  }

  public get planningEditCancelBtn(): Locator {
    return this.page.locator('#planningEditCancelBtn');
  }

  // Add item elements
  public get addItemBtn(): Locator {
    return this.page.locator('#addItemBtn');
  }

  // Delete page elements
  public get planningDeleteDeleteBtn(): Locator {
    return this.page.locator('#planningDeleteDeleteBtn');
  }

  public get planningDeleteCancelBtn(): Locator {
    return this.page.locator('#planningDeleteCancelBtn');
  }

  public get xlsxImportPlanningsInput(): Locator {
    return this.page.locator('#xlsxImportPlanningsInput');
  }

  public get pushMessageEnabledCreate(): Locator {
    return this.page.locator('#pushMessageEnabledCreate');
  }

  public get createDaysBeforeRedeploymentPushMessage(): Locator {
    return this.page.locator('#createDaysBeforeRedeploymentPushMessage');
  }

  public get pushMessageEnabledEdit(): Locator {
    return this.page.locator('#pushMessageEnabledEdit');
  }

  public get editDaysBeforeRedeploymentPushMessage(): Locator {
    return this.page.locator('#editDaysBeforeRedeploymentPushMessage');
  }

  public get createRepeatType(): Locator {
    return this.page.locator('#createRepeatType');
  }

  public async waitForSpinnerHide() {
    await this.page.locator('#spinner-animation').waitFor({ state: 'hidden', timeout: 90000 });
  }

  public async createPlanning(
    planning: PlanningCreateUpdate,
    clickCancel = false
  ) {
    const planningPage = new ItemsPlanningPlanningPage(this.page);
    await planningPage.planningCreateBtn.waitFor({ state: 'visible', timeout: 90000 });
    await planningPage.planningCreateBtn.click();
    await this.planningCreateSaveBtn.waitFor({ state: 'visible', timeout: 20000 });
    await this.page.locator('#spinner-animation').waitFor({ state: 'hidden', timeout: 90000 });
    await this.page.waitForTimeout(1000);
    for (let i = 0; i < planning.name.length; i++) {
      await this.createPlanningItemName(i).waitFor({ state: 'visible', timeout: 20000 });
      await this.createPlanningItemName(i).fill(planning.name[i]);
    }
    if (planning.description) {
      await this.createPlanningItemDescription.waitFor({ state: 'visible', timeout: 20000 });
      await this.createPlanningItemDescription.fill(planning.description);
    }
    await selectValueInNgSelector(this.page, '#createPlanningSelector', planning.eFormName);
    if (planning.tags && planning.tags.length > 0) {
      for (let i = 0; i < planning.tags.length; i++) {
        await this.createPlanningTagsSelector.pressSequentially(planning.tags[i]);
        await this.page.keyboard.press('Enter');
      }
    }
    if (planning.repeatEvery) {
      await this.page.locator('input.createRepeatEvery').fill(planning.repeatEvery);
    }
    if (planning.repeatType) {
      await selectValueInNgSelector(this.page, '#createRepeatType', planning.repeatType);
    }
    if (planning.startFrom) {
      await this.createStartFrom.click({ force: true });
      await selectDateOnNewDatePicker(
        this.page,
        planning.startFrom.year,
        planning.startFrom.month,
        planning.startFrom.day
      );
    }
    if (planning.repeatUntil) {
      await this.createRepeatUntil.click({ force: true });
      await selectDateOnNewDatePicker(
        this.page,
        planning.repeatUntil.year,
        planning.repeatUntil.month,
        planning.repeatUntil.day
      );
    }
    if (planning.number) {
      await this.createItemNumber.fill(planning.number);
    }
    if (planning.locationCode) {
      await this.createItemLocationCode.fill(planning.locationCode);
    }
    if (planning.buildYear) {
      await this.createItemBuildYear.fill(planning.buildYear);
    }
    if (planning.type) {
      await this.createItemType.fill(planning.type);
    }
    if (planning.pushMessageEnabled != null) {
      const status = planning.pushMessageEnabled ? 'Aktiveret' : 'Deaktiveret';
      await selectValueInNgSelector(this.page, '#pushMessageEnabledCreate', status);
      await selectValueInNgSelector(
        this.page, '#createDaysBeforeRedeploymentPushMessage', planning.daysBeforeRedeploymentPushMessage.toString());
    }
    if (planning.folderName) {
      await this.selectFolder(planning.folderName);
    }
    if (!clickCancel) {
      await this.planningCreateSaveBtn.click();
    } else {
      await this.planningCreateCancelBtn.click();
    }
    await planningPage.planningCreateBtn.waitFor({ state: 'visible' });
  }

  public async addNewItem() {
    await this.addItemBtn.click();
  }
}

export class PlanningItemRowObject {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public name: string;
  public description: string;
  public number: string;
  public locationCode: string;
  public deleteBtn: Locator;

  async getRow(rowNum: number): Promise<PlanningItemRowObject> {
    this.name = (await this.page.locator('#createItemName').nth(rowNum - 1).textContent()) || '';
    this.description = (await this.page.locator('#createItemDescription').nth(rowNum - 1).textContent()) || '';
    this.number = (await this.page.locator('#createItemNumber').nth(rowNum - 1).textContent()) || '';
    this.locationCode = (await this.page.locator('#createItemLocationCode').nth(rowNum - 1).textContent()) || '';
    this.deleteBtn = this.page.locator('#deleteItemBtn').nth(rowNum - 1);
    return this;
  }

  public async deleteItem() {
    await this.deleteBtn.click();
    await this.page.waitForTimeout(500);
  }
}
