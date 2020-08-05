import Page from '../Page';

export class ItemsPlanningModalPage extends Page {
  constructor() {
    super();
  }

  // Create page elements
  public get createPlanningItemName() {
    $('#createPlanningItemName').waitForDisplayed({timeout: 20000});
    return $('#createPlanningItemName');
  }

  public get createPlanningSelector() {
    $('#createPlanningSelector input').waitForDisplayed({timeout: 20000});
    $('#createPlanningSelector input').waitForClickable({timeout: 20000});
    return $('#createPlanningSelector input');
  }

  public get createPlanningSelectorOption() {
    browser.pause(1000);
    const ele = $(`//*[contains(@class, 'ng-option')]`);
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get createPlanningDescription() {
    $('#createPlanningItemDescription').waitForDisplayed({timeout: 20000});
    $('#createPlanningItemDescription').waitForClickable({timeout: 20000});
    return $('#createPlanningItemDescription');
  }

  public get createRepeatEvery() {
    $('#createRepeatEvery').waitForDisplayed({timeout: 20000});
    //$('#createRepeatEvery').waitForClickable({timeout: 20000});
    return $('#createRepeatEvery');
  }

  public selectCreateRepeatType(n: number) {
    $('#createRepeatType').click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    const choices = $$('#createRepeatType .ng-option');
    choices[n].click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public get createRepeatUntil() {
    $('#createRepeatUntil').waitForDisplayed({timeout: 20000});
    //$('#createRepeatUntil').waitForClickable({timeout: 20000});
    return $('#createRepeatUntil');
  }

  public get planningCreateSaveBtn() {
    $('#planningCreateSaveBtn').waitForDisplayed({timeout: 20000});
    $('#planningCreateSaveBtn').waitForClickable({timeout: 20000});
    return $('#planningCreateSaveBtn');
  }

  public get planningCreateCancelBtn() {
    $('#planningCreateCancelBtn').waitForDisplayed({timeout: 20000});
    $('#planningCreateCancelBtn').waitForClickable({timeout: 20000});
    return $('#planningCreateCancelBtn');
  }

  // Edit page elements
  public get editPlanningItemName() {
    $('#editPlanningItemName').waitForDisplayed({timeout: 20000});
    $('#editPlanningItemName').waitForClickable({timeout: 20000});
    return $('#editPlanningItemName');
  }

  public get editPlanningSelector() {
    $('#editPlanningSelector input').waitForDisplayed({timeout: 20000});
    $('#editPlanningSelector input').waitForClickable({timeout: 20000});
    return $('#editPlanningSelector input');
  }
  public get editPlanningSelectorValue() {
    return $(`//*[contains(@id, 'editPlanningSelector')]//*[contains(@class, 'ng-value')]//div[contains(@class, 'ng-star-inserted')]`);
  }
  public get editPlanningDescription() {
    $('#editPlanningItemDescription').waitForDisplayed({timeout: 20000});
    $('#editPlanningItemDescription').waitForClickable({timeout: 20000});
    return $('#editPlanningItemDescription');
  }

  public get editRepeatEvery() {
    $('#editRepeatEvery').waitForDisplayed({timeout: 20000});
    $('#editRepeatEvery').waitForClickable({timeout: 20000});
    return $('#editRepeatEvery');
  }

  public selectEditRepeatType(n: number) {
    $('#editRepeatType').click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    const choices = $$('#editRepeatType .ng-option');
    choices[n].click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public get editRepeatUntil() {
    $('#editRepeatUntil').waitForDisplayed({timeout: 20000});
    $('#editRepeatUntil').waitForClickable({timeout: 20000});
    return $('#editRepeatUntil');
  }

  public get planningEditSaveBtn() {
    $('#planningEditSaveBtn').waitForDisplayed({timeout: 20000});
    $('#planningEditSaveBtn').waitForClickable({timeout: 20000});
    return $('#planningEditSaveBtn');
  }

  public get planningEditCancelBtn() {
    $('#planningEditCancelBtn').waitForDisplayed({timeout: 20000});
    $('#planningEditCancelBtn').waitForClickable({timeout: 20000});
    return $('#planningEditCancelBtn');
  }

  // Add item elements
  public get addItemBtn() {
    $('#addItemBtn').waitForDisplayed({timeout: 20000});
    $('#addItemBtn').waitForClickable({timeout: 20000});
    return $('#addItemBtn');
  }

  // Delete page elements
  public get planningDeleteDeleteBtn() {
    $('#planningDeleteDeleteBtn').waitForDisplayed({timeout: 20000});
    $('#planningDeleteDeleteBtn').waitForClickable({timeout: 20000});
    return $('#planningDeleteDeleteBtn');
  }

  public get planningDeleteCancelBtn() {
    $('#planningDeleteCancelBtn').waitForDisplayed({timeout: 20000});
    $('#planningDeleteCancelBtn').waitForClickable({timeout: 20000});
    return $('#planningDeleteCancelBtn');
  }

  public createPlanning(data: any) {
    this.createPlanningItemName.setValue(data.name);
    this.createPlanningSelector.addValue(data.template);
    this.createPlanningSelectorOption.click();
    this.createPlanningDescription.setValue(data.description);
    this.createRepeatEvery.setValue(data.repeatEvery);
    this.selectCreateRepeatType(data.repeatType);
    this.createRepeatUntil.setValue(data.repeatUntil);
    this.planningCreateSaveBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public editPlanning(data: any) {
    this.editPlanningItemName.setValue(data.name);
    this.editPlanningSelector.setValue(data.template);
    this.editPlanningDescription.setValue(data.description);
    this.editRepeatEvery.setValue(data.repeatEvery);
    this.selectEditRepeatType(data.repeatType);
    this.editRepeatUntil.setValue(data.repeatUntil);
    this.planningEditSaveBtn.click();
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
