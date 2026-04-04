import { Page, Locator } from '@playwright/test';
import { PageWithNavbarPage } from '../../Page objects/PageWithNavbar.page';
import {
  generateRandmString,
  selectValueInNgSelector,
  selectDateOnNewDatePicker,
} from '../../helper-functions';
import { format, set } from 'date-fns';
import { ItemsPlanningModalPage } from './ItemsPlanningModal.page';

export class ItemsPlanningPlanningPage extends PageWithNavbarPage {
  constructor(page: Page) {
    super(page);
  }

  public async rowNum(): Promise<number> {
    await this.page.waitForTimeout(500);
    return await this.page.locator('tbody > tr').count();
  }

  public get planningDeleteDeleteBtn(): Locator {
    return this.page.locator('#planningDeleteDeleteBtn');
  }

  public get planningDeleteCancelBtn(): Locator {
    return this.page.locator('#planningDeleteCancelBtn');
  }

  public async clickIdTableHeader() {
    await this.page.locator('th.planningId').click();
    await this.page.waitForTimeout(500);
  }

  public async clickNameTableHeader() {
    await this.page.locator('th.planningName').click();
    await this.page.waitForTimeout(500);
  }

  public async clickDescriptionTableHeader() {
    await this.page.locator('th.planningDescription').click();
    await this.page.waitForTimeout(500);
  }

  public get itemPlanningButton(): Locator {
    return this.page.locator('#items-planning-pn');
  }

  public get planningCreateBtn(): Locator {
    return this.page.locator('#planningCreateBtn');
  }

  public get planningManageTagsBtn(): Locator {
    return this.page.locator('#planningManageTagsBtn');
  }

  public get planningsButton(): Locator {
    return this.page.locator('#items-planning-pn-plannings');
  }

  public get planningId(): Locator {
    return this.page.locator('#planningId');
  }

  public get deleteMultiplePluginsBtn(): Locator {
    return this.page.locator('#deleteMultiplePluginsBtn');
  }

  public get planningsMultipleDeleteCancelBtn(): Locator {
    return this.page.locator('#planningsMultipleDeleteCancelBtn');
  }

  public get planningsMultipleDeleteDeleteBtn(): Locator {
    return this.page.locator('#planningsMultipleDeleteDeleteBtn');
  }

  public get selectAllPlanningsCheckbox(): Locator {
    return this.page.locator('th.mat-column-MtxGridCheckboxColumnDef mat-checkbox');
  }

  public get selectAllPlanningsCheckboxForClick(): Locator {
    return this.selectAllPlanningsCheckbox.locator('..');
  }

  public get importPlanningsBtn(): Locator {
    return this.page.locator('#importPlanningsBtn');
  }

  public async goToPlanningsPage() {
    await this.itemPlanningButton.waitFor({ state: 'visible', timeout: 40000 });
    await this.itemPlanningButton.click();
    await this.planningsButton.waitFor({ state: 'visible', timeout: 40000 });
    await this.planningsButton.click();
    await this.planningCreateBtn.waitFor({ state: 'visible', timeout: 40000 });
  }

  public async getPlaningByName(namePlanning: string): Promise<PlanningRowObject | null> {
    const rowCount = await this.rowNum();
    for (let i = 1; i < rowCount + 1; i++) {
      const planningObj = new PlanningRowObject(this.page, this);
      const planning = await planningObj.getRow(i, false);
      if (planning.name === namePlanning) {
        return planning;
      }
    }
    return null;
  }

  public async createDummyPlannings(
    template: string,
    folderName: string,
    createCount = 3
  ): Promise<PlanningCreateUpdate[]> {
    const modalPage = new ItemsPlanningModalPage(this.page);
    const masResult = new Array<PlanningCreateUpdate>();
    for (let i = 0; i < createCount; i++) {
      const planningData: PlanningCreateUpdate = {
        name: [
          generateRandmString(),
          generateRandmString(),
          generateRandmString(),
        ],
        eFormName: template,
        description: generateRandmString(),
        repeatEvery: '1',
        repeatType: 'Dag',
        repeatUntil: { year: 2020, day: 15, month: 5 },
        folderName: folderName,
      };
      masResult.push(planningData);
      await modalPage.createPlanning(planningData);
    }
    return masResult;
  }

  public async clearTable(deleteWithMultipleDelete: boolean = true) {
    if (deleteWithMultipleDelete) {
      await this.selectAllPlanningsForDelete();
      await this.multipleDelete();
    } else {
      await this.page.waitForTimeout(2000);
      const rowCount = await this.rowNum();
      for (let i = 1; i <= rowCount; i++) {
        await (await this.getFirstPlanningRowObject()).delete();
      }
    }
  }

  async getAllPlannings(countFirstElements = 0, skipDelete: boolean): Promise<PlanningRowObject[]> {
    await this.page.waitForTimeout(1000);
    const resultMas = new Array<PlanningRowObject>();
    if (countFirstElements === 0) {
      countFirstElements = await this.rowNum();
    }
    for (let i = 1; i < countFirstElements + 1; i++) {
      resultMas.push(await new PlanningRowObject(this.page, this).getRow(i, skipDelete));
    }
    return resultMas;
  }

  async getLastPlanningRowObject(skipDelete: boolean): Promise<PlanningRowObject> {
    return await new PlanningRowObject(this.page, this).getRow(await this.rowNum(), skipDelete);
  }

  async getFirstPlanningRowObject(): Promise<PlanningRowObject> {
    return await new PlanningRowObject(this.page, this).getRow(1, false);
  }

  async getPlanningByIndex(i: number): Promise<PlanningRowObject> {
    return await new PlanningRowObject(this.page, this).getRow(i, false);
  }

  async openMultipleDelete() {
    if (await this.deleteMultiplePluginsBtn.isVisible()) {
      await this.deleteMultiplePluginsBtn.click();
    }
  }

  async closeMultipleDelete(clickCancel = false) {
    if (clickCancel) {
      await this.planningsMultipleDeleteCancelBtn.waitFor({ state: 'visible', timeout: 40000 });
      await this.planningsMultipleDeleteCancelBtn.click();
    } else {
      await this.planningsMultipleDeleteDeleteBtn.waitFor({ state: 'visible', timeout: 40000 });
      await this.planningsMultipleDeleteDeleteBtn.click();
    }
    await this.planningCreateBtn.waitFor({ state: 'visible', timeout: 40000 });
  }

  async multipleDelete(clickCancel = false) {
    await this.openMultipleDelete();
    await this.closeMultipleDelete(clickCancel);
  }

  async selectAllPlanningsForDelete(valueCheckbox = true, pickOne = false) {
    if (!pickOne) {
      const currentValue = await this.selectAllPlanningsCheckbox.inputValue().catch(() => '');
      if (currentValue !== valueCheckbox.toString()) {
        await this.selectAllPlanningsCheckboxForClick.click();
      }
    } else {
      const plannings = await this.getAllPlannings(0, false);
      for (let i = 0; i < plannings.length; i++) {
        await plannings[i].clickOnCheckboxForMultipleDelete();
      }
    }
  }
}

export class PlanningRowObject {
  private page: Page;
  private planningPage: ItemsPlanningPlanningPage;

  constructor(page: Page, planningPage: ItemsPlanningPlanningPage) {
    this.page = page;
    this.planningPage = planningPage;
  }

  public row: Locator;
  public id: number;
  public name: string;
  public description: string;
  public folderName: string;
  public eFormName: string;
  public tags: string[];
  public repeatEvery: number;
  public repeatType: string;
  public repeatUntil: Date;
  public planningDayOfWeek: string;
  public nextExecution: string;
  public lastExecution: string;
  public updateBtn: Locator;
  public deleteBtn: Locator;
  public pairingBtn: Locator;
  public checkboxDelete: Locator;
  public checkboxDeleteForClick: Locator;

  public async closeEdit(clickCancel = false) {
    const modalPage = new ItemsPlanningModalPage(this.page);
    if (!clickCancel) {
      await modalPage.planningEditSaveBtn.click();
      await modalPage.waitForSpinnerHide();
    } else {
      await modalPage.planningEditCancelBtn.click();
    }
    await this.page.waitForTimeout(500);
    await this.planningPage.planningCreateBtn.waitFor({ state: 'visible' });
  }

  public async closeDelete(clickCancel = false) {
    if (!clickCancel) {
      await this.planningPage.planningDeleteDeleteBtn.waitFor({ state: 'visible', timeout: 40000 });
      await this.planningPage.planningDeleteDeleteBtn.click();
    } else {
      await this.planningPage.planningDeleteCancelBtn.waitFor({ state: 'visible', timeout: 40000 });
      await this.planningPage.planningDeleteCancelBtn.click();
    }
    await this.page.waitForTimeout(500);
    await this.planningPage.planningCreateBtn.waitFor({ state: 'visible', timeout: 40000 });
  }

  async getRow(rowNum: number, skipDelete: boolean): Promise<PlanningRowObject> {
    rowNum = rowNum - 1;
    this.row = this.page.locator('tbody > tr').nth(rowNum);
    if ((await this.page.locator('tbody > tr').count()) > rowNum) {
      this.checkboxDelete = this.row.locator('.cdk-column-MtxGridCheckboxColumnDef mat-checkbox');
      this.checkboxDeleteForClick = this.row.locator('.cdk-column-MtxGridCheckboxColumnDef mat-checkbox label');
      this.id = +(await this.row.locator('.cdk-column-id span').textContent() || '0');
      this.name = (await this.row.locator('.cdk-column-translatedName span').textContent()) || '';
      this.description = (await this.row.locator('.cdk-column-description span').textContent()) || '';
      this.folderName = (await this.row.locator('.cdk-column-folder-eFormSdkFolderName span').textContent()) || '';
      this.eFormName = (await this.row.locator('.cdk-column-planningRelatedEformName span').textContent()) || '';

      const tagsText = (await this.row.locator('.cdk-column-tags').textContent()) || '';
      const tags = tagsText.split('discount');
      if (tags.length > 0) {
        tags[tags.length - 1] = tags[tags.length - 1].replace('edit', '');
        this.tags = tags.filter(x => x);
      }

      this.repeatEvery = +(await this.row.locator('.cdk-column-reiteration-repeatEvery span').textContent() || '0');
      this.repeatType = (await this.row.locator('.cdk-column-reiteration-repeatType span').textContent()) || '';
      this.planningDayOfWeek = (await this.row.locator('.cdk-column-reiteration-dayOfWeek span').textContent()) || '';
      this.lastExecution = (await this.row.locator('.cdk-column-lastExecutedTime span').textContent()) || '';
      this.nextExecution = (await this.row.locator('.cdk-column-nextExecutionTime span').textContent()) || '';
      this.pairingBtn = this.row.locator('.cdk-column-actions button').nth(0);
      this.updateBtn = this.row.locator('.cdk-column-actions button').nth(1);
      if (!skipDelete) {
        this.deleteBtn = this.row.locator('.cdk-column-actions button').nth(2);
      }
    }
    return this;
  }

  public async openDelete() {
    await this.deleteBtn.waitFor({ state: 'visible', timeout: 40000 });
    await this.deleteBtn.click();
    await this.planningPage.planningDeleteDeleteBtn.waitFor({ state: 'visible', timeout: 40000 });
  }

  public async openEdit() {
    await this.updateBtn.click();
    const modalPage = new ItemsPlanningModalPage(this.page);
    await modalPage.planningEditSaveBtn.waitFor({ state: 'visible', timeout: 40000 });
  }

  async update(
    planning: PlanningCreateUpdate,
    clearTags = false,
    clickCancel = false
  ) {
    const modalPage = new ItemsPlanningModalPage(this.page);
    await this.openEdit();
    if (planning.name && planning.name.length > 0) {
      for (let i = 0; i < planning.name.length; i++) {
        const nameInput = modalPage.editPlanningItemName(i);
        if ((await nameInput.inputValue()) !== planning.name[i]) {
          await nameInput.fill(planning.name[i]);
        }
      }
    }
    if (
      planning.folderName &&
      (await modalPage.editFolderName.locator('#editFolderSelectorInput').inputValue()) !== planning.folderName
    ) {
      await modalPage.selectFolder(planning.folderName);
    }
    if (
      planning.eFormName &&
      (await modalPage.editPlanningSelector.locator('.ng-value').textContent() || '') !== planning.eFormName
    ) {
      await selectValueInNgSelector(this.page, '#editPlanningSelector', planning.eFormName);
    }
    if (clearTags) {
      const clearButton = modalPage.editPlanningTagsSelector.locator('span.ng-clear');
      if ((await clearButton.count()) > 0) {
        await clearButton.click();
      }
    }
    if (planning.tags && planning.tags.length > 0) {
      for (let i = 0; i < planning.tags.length; i++) {
        await modalPage.editPlanningTagsSelector.pressSequentially(planning.tags[i]);
        await this.page.keyboard.press('Enter');
      }
    }
    if (
      planning.repeatEvery &&
      (await modalPage.editRepeatEvery.inputValue()) !== planning.repeatEvery
    ) {
      await modalPage.editRepeatEvery.fill(planning.repeatEvery);
    }
    if (
      planning.repeatType &&
      (await modalPage.editRepeatType.locator('.ng-value-label').textContent() || '') !== planning.repeatType
    ) {
      await selectValueInNgSelector(this.page, '#editRepeatType', planning.repeatType);
    }
    if (
      planning.repeatUntil &&
      (await modalPage.editRepeatUntil.inputValue()) !==
      format(set(new Date(), {
        year: planning.repeatUntil.year,
        month: planning.repeatUntil.month - 1,
        date: planning.repeatUntil.day,
      }), 'dd.MM.yyyy')
    ) {
      await modalPage.editRepeatUntil.click();
      await selectDateOnNewDatePicker(
        this.page,
        planning.repeatUntil.year,
        planning.repeatUntil.month,
        planning.repeatUntil.day
      );
    }
    if (
      planning.startFrom &&
      (await modalPage.editStartFrom.inputValue()) !==
      format(set(new Date(), {
        year: planning.startFrom.year,
        month: planning.startFrom.month - 1,
        date: planning.startFrom.day,
      }), 'dd.MM.yyyy')
    ) {
      await modalPage.editStartFrom.click();
      await selectDateOnNewDatePicker(
        this.page,
        planning.startFrom.year,
        planning.startFrom.month,
        planning.startFrom.day
      );
    }
    if (
      planning.number &&
      (await modalPage.editItemNumber.inputValue()) !== planning.number
    ) {
      await modalPage.editItemNumber.fill(planning.number);
    }
    if (
      planning.description &&
      (await modalPage.editPlanningDescription.inputValue()) !== planning.description
    ) {
      await modalPage.editPlanningDescription.fill(planning.description);
    }
    if (
      planning.locationCode &&
      (await modalPage.editItemLocationCode.inputValue()) !== planning.locationCode
    ) {
      await modalPage.editItemLocationCode.fill(planning.locationCode);
    }
    if (
      planning.buildYear &&
      (await modalPage.editItemBuildYear.inputValue()) !== planning.buildYear
    ) {
      await modalPage.editItemBuildYear.fill(planning.buildYear);
    }
    if (
      planning.type &&
      (await modalPage.editItemType.inputValue()) !== planning.type
    ) {
      await modalPage.editItemType.fill(planning.type);
    }
    if (planning.pushMessageEnabled != null) {
      const status = planning.pushMessageEnabled ? 'Aktiveret' : 'Deaktiveret';
      await selectValueInNgSelector(this.page, '#pushMessageEnabledEdit', status);
      await selectValueInNgSelector(
        this.page, '#editDaysBeforeRedeploymentPushMessage', planning.daysBeforeRedeploymentPushMessage.toString());
    }
    await this.closeEdit(clickCancel);
  }

  async delete(clickCancel = false) {
    await this.openDelete();
    await this.closeDelete(clickCancel);
  }

  async clickOnCheckboxForMultipleDelete(valueCheckbox = true) {
    const currentValue = await this.checkboxDelete.inputValue().catch(() => '');
    if (currentValue !== valueCheckbox.toString()) {
      await this.checkboxDeleteForClick.click();
    }
  }

  async readPairing(): Promise<{ workerName: string; workerValue: boolean }[]> {
    await this.pairingBtn.click();
    await this.page.waitForTimeout(500);
    const changeAssignmentsCancel = this.page.locator('#changeAssignmentsCancel');
    await changeAssignmentsCancel.waitFor({ state: 'visible', timeout: 40000 });
    let pairings: { workerName: string; workerValue: boolean }[] = [];
    const pairingRows = this.page.locator('#pairingModalTableBody tr.mat-mdc-row');
    const rowCount = await pairingRows.count();
    for (let i = 0; i < rowCount; i++) {
      const workerName = (await this.page.locator('.mat-column-siteName > mtx-grid-cell > span').nth(i).textContent()) || '';
      const ele = this.page.locator(`#checkboxCreateAssignment${i}-input`);
      const workerValue = (await ele.getAttribute('class')) === 'mdc-checkbox__native-control mdc-checkbox--selected';
      pairings = [...pairings, { workerName, workerValue }];
    }
    await changeAssignmentsCancel.click();
    return pairings;
  }

  public checkboxEditAssignment(i: number): Locator {
    return this.page.locator(`#checkboxCreateAssignment${i}-input`);
  }
}

export class PlanningCreateUpdate {
  public name: string[];
  public folderName: string;
  public eFormName: string;
  public tags?: string[];
  public repeatEvery?: string;
  public repeatType?: string;
  public startFrom?: { month: number; day: number; year: number };
  public repeatUntil?: { month: number; day: number; year: number };
  public number?: string;
  public description?: string;
  public locationCode?: string;
  public buildYear?: string;
  public type?: string;
  public pushMessageEnabled?: boolean;
  public daysBeforeRedeploymentPushMessage?: number;
}
