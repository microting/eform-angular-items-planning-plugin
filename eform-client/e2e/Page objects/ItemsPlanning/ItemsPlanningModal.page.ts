import Page from '../Page';

export class ItemsPlanningModalPage extends Page {
  constructor() {
    super();
  }

  // Create page elements
  public get createListItemName() {
    $('#createListItemName').waitForDisplayed({timeout: 20000});
    //$('#createListItemName').waitForClickable({timeout: 20000});
    return $('#createListItemName');
  }

  public get createListSelector() {
    $('#createListSelector input').waitForDisplayed({timeout: 20000});
    $('#createListSelector input').waitForClickable({timeout: 20000});
    return $('#createListSelector input');
  }

  public get createListSelectorOption() {
    browser.pause(1000);
    const ele = $(`//*[contains(@class, 'ng-option')]`);
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    return ele;
  }

  public get createListDescription() {
    $('#createListDescription').waitForDisplayed({timeout: 20000});
    $('#createListDescription').waitForClickable({timeout: 20000});
    return $('#createListDescription');
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

  public get listCreateSaveBtn() {
    $('#listCreateSaveBtn').waitForDisplayed({timeout: 20000});
    $('#listCreateSaveBtn').waitForClickable({timeout: 20000});
    return $('#listCreateSaveBtn');
  }

  public get listCreateCancelBtn() {
    $('#listCreateCancelBtn').waitForDisplayed({timeout: 20000});
    $('#listCreateCancelBtn').waitForClickable({timeout: 20000});
    return $('#listCreateCancelBtn');
  }

  // Edit page elements
  public get editListItemName() {
    $('#editListItemName').waitForDisplayed({timeout: 20000});
    $('#editListItemName').waitForClickable({timeout: 20000});
    return $('#editListItemName');
  }

  public get editListSelector() {
    $('#editListSelector input').waitForDisplayed({timeout: 20000});
    $('#editListSelector input').waitForClickable({timeout: 20000});
    return $('#editListSelector input');
  }
  public get editListSelectorValue() {
    return $(`//*[contains(@id, 'editListSelector')]//*[contains(@class, 'ng-value')]//div[contains(@class, 'ng-star-inserted')]`);
  }
  public get editListDescription() {
    $('#editListDescription').waitForDisplayed({timeout: 20000});
    $('#editListDescription').waitForClickable({timeout: 20000});
    return $('#editListDescription');
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

  public get listEditSaveBtn() {
    $('#listEditSaveBtn').waitForDisplayed({timeout: 20000});
    $('#listEditSaveBtn').waitForClickable({timeout: 20000});
    return $('#listEditSaveBtn');
  }

  public get listEditCancelBtn() {
    $('#listEditCancelBtn').waitForDisplayed({timeout: 20000});
    $('#listEditCancelBtn').waitForClickable({timeout: 20000});
    return $('#listEditCancelBtn');
  }

  // Add item elements
  public get addItemBtn() {
    $('#addItemBtn').waitForDisplayed({timeout: 20000});
    $('#addItemBtn').waitForClickable({timeout: 20000});
    return $('#addItemBtn');
  }

  // Delete page elements
  public get listDeleteDeleteBtn() {
    $('#listDeleteDeleteBtn').waitForDisplayed({timeout: 20000});
    $('#listDeleteDeleteBtn').waitForClickable({timeout: 20000});
    return $('#listDeleteDeleteBtn');
  }

  public get listDeleteCancelBtn() {
    $('#listDeleteCancelBtn').waitForDisplayed({timeout: 20000});
    $('#listDeleteCancelBtn').waitForClickable({timeout: 20000});
    return $('#listDeleteCancelBtn');
  }

  public createList(data: any) {
    this.createListItemName.setValue(data.name);
    this.createListSelector.addValue(data.template);
    this.createListSelectorOption.click();
    this.createListDescription.setValue(data.description);
    this.createRepeatEvery.setValue(data.repeatEvery);
    this.selectCreateRepeatType(data.repeatType);
    this.createRepeatUntil.setValue(data.repeatUntil);
    this.listCreateSaveBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public editList(data: any) {
    this.editListItemName.setValue(data.name);
    this.editListSelector.setValue(data.template);
    this.editListDescription.setValue(data.description);
    this.editRepeatEvery.setValue(data.repeatEvery);
    this.selectEditRepeatType(data.repeatType);
    this.editRepeatUntil.setValue(data.repeatUntil);
    this.listEditSaveBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public addNewItem() {
    this.addItemBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

}

const itemsPlanningModalPage = new ItemsPlanningModalPage();
export default itemsPlanningModalPage;

export class ListItemRowObject {
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
