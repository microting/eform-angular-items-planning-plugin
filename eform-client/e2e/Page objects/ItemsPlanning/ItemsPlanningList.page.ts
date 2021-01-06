import itemsPlanningModalPage from './ItemsPlanningModal.page';
import {PageWithNavbarPage} from '../PageWithNavbar.page';
import XMLForPlanning from './XMLForPlanning';
import {generateRandmString} from '../../Helpers/helper-functions';

export class ItemsPlanningListPage extends PageWithNavbarPage {
  constructor() {
    super();
  }

  public rowNum(): number {
    browser.pause(500);
    return $$('#tableBody > tr').length;
  }

  public get newEformBtn() {
    const el = $('#newEFormBtn');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public get xmlTextArea() {
    const el = $('#eFormXml');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public get createEformBtn() {
    const el = $('#createEformBtn');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public get createEformTagSelector() {
    const el = $('#createEFormMultiSelector');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public get createEformNewTagInput() {
    const el = $('#addTagInput');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public clickIdTableHeader() {
    $(`#idTableHeader`).click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public clickNameTableHeader() {
    const ele = $('#nameTableHeader');
    ele.waitForDisplayed({timeout: 20000});
    ele.waitForClickable({timeout: 20000});
    ele.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public clickDescriptionTableHeader() {
    $(`#descriptionTableHeader`).click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public getListValue(selector: any, row: number) {
    if (selector === 'listId') {
      return parseInt(
        $('#tableBody')
          .$(`tr:nth-child(${row})`)
          .$('#' + selector)
          .getText(),
        10
      );
    } else {
      return $('#tableBody')
        .$(`tr:nth-child(${row})`)
        .$('#' + selector)
        .getText();
    }
  }

  public get itemPlanningButton() {
    const el = $('#items-planning-pn');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public get listCreateBtn() {
    const el = $('#listCreateBtn');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public get listsButton() {
    const el = $('#items-planning-pn-lists');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public goToListsPage() {
    const spinnerAnimation = $('#spinner-animation');
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    this.itemPlanningButton.click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    this.listsButton.click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
  }

  public createDummyLists() {
    for (let i = 0; i < 3; i++) {
      this.listCreateBtn.click();
      for (let j = 1; j < 3; j++) {
        itemsPlanningModalPage.createPlanningItemName(j).setValue(generateRandmString());
      }
      itemsPlanningModalPage.createPlanningItemDescription.setValue(
        generateRandmString()
      );
      const spinnerAnimation = $('#spinner-animation');
      spinnerAnimation.waitForDisplayed({
        timeout: 90000,
        reverse: true,
      });
      itemsPlanningModalPage.createPlanningSelector.addValue('Number 1');
      spinnerAnimation.waitForDisplayed({
        timeout: 90000,
        reverse: true,
      });
      itemsPlanningModalPage.createPlanningSelectorOption.click();
      itemsPlanningModalPage.createRepeatEvery.setValue(1);
      itemsPlanningModalPage.selectCreateRepeatType(1);
      itemsPlanningModalPage.createRepeatUntil.setValue('5/15/2020');
      itemsPlanningModalPage.planningCreateSaveBtn.click();
      spinnerAnimation.waitForDisplayed({
        timeout: 90000,
        reverse: true,
      });
    }
  }

  public clearTable() {
    const rowCount = itemsPlanningListPage.rowNum();
    for (let i = 1; i <= rowCount; i++) {
      const listRowObject = new ListRowObject(1);
      listRowObject.clickDeleteList();
      itemsPlanningModalPage.planningDeleteDeleteBtn.click();
      $('#spinner-animation').waitForDisplayed({
        timeout: 90000,
        reverse: true,
      });
    }
  }

  createNewEform(eFormLabel, newTagsList = [], tagAddedNum = 0) {
    this.newEformBtn.click();
    const spinnerAnimation = $('#spinner-animation');
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    // Create replaced xml and insert it in textarea
    const xml = XMLForPlanning.XML.replace('TEST_LABEL', eFormLabel);
    browser.execute(function (xmlText) {
      (<HTMLInputElement>document.getElementById('eFormXml')).value = xmlText;
    }, xml);
    this.xmlTextArea.addValue(' ');
    // Create new tags
    const addedTags: string[] = newTagsList;
    if (newTagsList.length > 0) {
      this.createEformNewTagInput.setValue(newTagsList.join(','));
      spinnerAnimation.waitForDisplayed({
        timeout: 90000,
        reverse: true,
      });
    }
    // Add existing tags
    const selectedTags: string[] = [];
    if (tagAddedNum > 0) {
      spinnerAnimation.waitForDisplayed({
        timeout: 90000,
        reverse: true,
      });
      for (let i = 0; i < tagAddedNum; i++) {
        this.createEformTagSelector.click();
        const selectedTag = $('.ng-option:not(.ng-option-selected)');
        selectedTags.push(selectedTag.getText());
        console.log('selectedTags is ' + JSON.stringify(selectedTags));
        selectedTag.click();
        $('#spinner-animation').waitForDisplayed({
          timeout: 90000,
          reverse: true,
        });
      }
    }
    this.createEformBtn.click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    return {added: addedTags, selected: selectedTags};
  }
}

const itemsPlanningListPage = new ItemsPlanningListPage();
export default itemsPlanningListPage;

export class ListRowObject {
  constructor(rowNumber) {
    if ($$('#listId')[rowNumber - 1]) {
      try {
        this.name = $$('#listName')[rowNumber - 1].getText();
      } catch (e) {
      }
      try {
        this.description = $$('#listDescription')[rowNumber - 1].getText();
      } catch (e) {
      }
      try {
        this.updateBtn = $$('#updateListBtn')[rowNumber - 1];
      } catch (e) {
      }
      try {
        this.deleteBtn = $$('#deleteListBtn')[rowNumber - 1];
      } catch (e) {
      }
    }
  }

  public id;
  public name;
  public description;
  public updateBtn;
  public deleteBtn;

  public clickDeleteList() {
    this.deleteBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public clickUpdateList() {
    this.updateBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }
}

