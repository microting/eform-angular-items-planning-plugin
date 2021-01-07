import Page from '../Page';

export class ItemsPlanningModalPage extends Page {
  constructor() {
    super();
  }

  // Create page elements
  public createPlanningItemName(index) {
    const ele = $(`#createPlanningNameTranslation_${index}`);
    ele.waitForDisplayed({timeout: 20000});
    return ele;
  }

  public get createPlanningSelector() {
    const ele = $('#createPlanningSelector input');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get createPlanningSelectorOption() {
    browser.pause(500);
    const ele = $(`.ng-option`);
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get createPlanningItemDescription() {
    const ele = $('#createPlanningItemDescription');
    ele.waitForDisplayed({timeout: 20000});
    return ele;
  }

  public get createRepeatEvery() {
    const ele = $('#createRepeatEvery');
    ele.waitForDisplayed({timeout: 20000});
    return ele;
  }

  public selectCreateRepeatType(n: number) {
    const spinnerAnimation = $('#spinner-animation');
    $('#createRepeatType').click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    const choices = $$('#createRepeatType .ng-option');
    choices[n].click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
  }

  public selectFolder(nameFolder: string) {
    this.createFolderName.click();
    $('tree-viewport').waitForDisplayed({timeout: 20000});
    $(`#folderTreeName=${nameFolder}`).click();
  }

  public get createFolderName() {
    const ele = $('#folderSelector');
    ele.waitForDisplayed({timeout: 20000});
    return ele;
  }

  public get createRepeatUntil() {
    const ele = $('#createRepeatUntil');
    ele.waitForDisplayed({timeout: 20000});
    return ele;
  }

  public get planningCreateSaveBtn() {
    const ele = $('#planningCreateSaveBtn');
    ele.waitForDisplayed({timeout: 20000});
    // ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get planningCreateCancelBtn() {
    const ele = $('#planningCreateCancelBtn');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  // Edit page elements
  public editPlanningItemName(index: number) {
    const ele = $(`#editPlanningNameTranslation_${index}`);
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get editPlanningSelector() {
    const ele = $('#editPlanningSelector input');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get editPlanningSelectorValue() {
    return $(`/ /*[contains(@id, 'editPlanningSelector')]//*[contains(@class, 'ng-value')]//div[contains(@class, 'ng-star-inserted')]`);
  }

  public get editPlanningDescription() {
    const ele = $('#editPlanningItemDescription');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get editRepeatEvery() {
    const ele = $('#editRepeatEvery');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get planningId() {
    const ele = $('#planningId');
    ele.waitForDisplayed({timeout: 20000});
    return ele;
  }

  public selectEditRepeatType(n: number) {
    const spinnerAnimation = $('#spinner-animation');
    $('#editRepeatType').click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    const choices = $$('#editRepeatType .ng-option');
    choices[n].click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
  }

  public get editRepeatUntil() {
    const ele = $('#editRepeatUntil');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get planningEditSaveBtn() {
    const ele = $('#planningEditSaveBtn');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get planningEditCancelBtn() {
    const ele = $('#planningEditCancelBtn');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  // Add item elements
  public get addItemBtn() {
    const ele = $('#addItemBtn');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  // Delete page elements
  public get planningDeleteDeleteBtn() {
    const ele = $('#planningDeleteDeleteBtn');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get planningDeleteCancelBtn() {
    const cancelBtn = $('#planningDeleteCancelBtn');
    cancelBtn.waitForDisplayed({timeout: 20000});
    cancelBtn.waitForClickable({timeout: 20000});
    return cancelBtn;
  }

  public createPlanning(planning: any, clickCancel = false) {
    const spinnerAnimation = $('#spinner-animation');
    const ngOption = $('.ng-option');
    this.planningCreateSaveBtn.waitForDisplayed();
    for (let i = 0; i < planning.name.length; i++) {
      this.createPlanningItemName(i).setValue(planning.name[i]);
    }
    this.createPlanningSelector.setValue(planning.template);
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    ngOption.waitForDisplayed({timeout: 20000});
    $('#createPlanningSelector ng-dropdown-panel').$(`.ng-option=${planning.template}`).click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    this.createPlanningItemDescription.setValue(planning.description);
    this.createRepeatEvery.setValue(planning.repeatEvery);
    $('#createRepeatType input').setValue(planning.repeatType);
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    ngOption.waitForDisplayed({timeout: 20000});
    $('#createRepeatType ng-dropdown-panel').$(`.ng-option=${planning.repeatType}`).click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    this.createRepeatUntil.setValue(planning.repeatUntil);
    this.selectFolder(planning.folderName);
    if (!clickCancel) {
      this.planningCreateSaveBtn.click();
      spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    } else {
      this.planningCreateCancelBtn.click();
    }
    this.planningId.waitForDisplayed();
  }


  public editPlanning(data: any, clickCancel = false) {
    this.planningEditSaveBtn.waitForDisplayed({timeout: 20000});
    for (let i = 0; i < data.name.length; i++) {
      if (this.editPlanningItemName(i).getValue() !== data.name[i]) {
        this.editPlanningItemName(i).setValue(data.name[i]);
      }
    }
    this.editPlanningDescription.setValue(data.description);
    this.editRepeatEvery.setValue(data.repeatEvery);
    this.selectEditRepeatType(data.repeatType);
    this.editRepeatUntil.setValue(data.repeatUntil);
    if (!clickCancel) {
      this.planningEditSaveBtn.click();
    } else {
      this.planningEditCancelBtn.click();
    }
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public addNewItem() {
    this.addItemBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

}

const itemsPlanningModalPage = new ItemsPlanningModalPage();
export default itemsPlanningModalPage;

export class PlanningItemRowObject {
  constructor(rowNumber) {
    this.name = $$('#createItemName')[rowNumber - 1].getText();
    this.description = $$('#createItemDescription')[rowNumber - 1].getText();
    this.number = $$('#createItemNumber')[rowNumber - 1].getText();
    this.locationCode = $$('#createItemLocationCode')[rowNumber - 1].getText();
    this.deleteBtn = $$('#deleteItemBtn')[rowNumber - 1];

  }

  public name;
  public description;
  public number;
  public locationCode;
  public deleteBtn;

  public deleteItem() {
    this.deleteBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }
}
