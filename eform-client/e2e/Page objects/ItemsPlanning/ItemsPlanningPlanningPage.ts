import itemsPlanningModalPage from './ItemsPlanningModal.page';
import {PageWithNavbarPage} from '../PageWithNavbar.page';
import {Guid} from 'guid-typescript';
import XMLForPlanning from './XMLForPlanning';

export class ItemsPlanningPlanningPage extends PageWithNavbarPage {
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
    $('#idTableHeader').click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public clickNameTableHeader() {
    $('#nameTableHeader').click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  public clickDescriptionTableHeader() {
    $('#descriptionTableHeader').click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  }

  // public getPlanningValue(selector: any, row: number) {
  //   if (selector === 'planningId') {
  //     return parseInt($('#tableBody').$(`tr:nth-child(${row})`).$('#' + selector).getText(), 10);
  //   } else {
  //     return $('#tableBody').$(`tr:nth-child(${row})`).$('#' + selector).getText();
  //   }
  // }

  public get itemPlanningButton() {
    const el = $('#items-planning-pn');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public get planningCreateBtn() {
    const el = $('#planningCreateBtn');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public get planningManageTagsBtn() {
    const el = $('#planningManageTagsBtn');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public get planningsButton() {
    const el = $('#items-planning-pn-plannings');
    el.waitForDisplayed({timeout: 20000});
    el.waitForClickable({timeout: 20000});
    return el;
  }

  public goToPlanningsPage() {
    const spinnerAnimation = $('#spinner-animation');
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    this.itemPlanningButton.click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    this.planningsButton.click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
  }

  public createDummyPlannings() {
    for (let i = 0; i < 3; i++) {
      this.planningCreateBtn.click();
      const planningData = {
        name: Guid.create().toString(),
        template: 'Number 1',
        description: Guid.create().toString(),
        repeatEvery: '1',
        repeatType: '1',
        repeatUntil: '5/15/2020',
        folderName: 'My test folder'
      };
      itemsPlanningModalPage.createPlanning(planningData);
      // $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
      // $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
      // itemsPlanningModalPage.createPlanningSelectorOption.click();
      // itemsPlanningModalPage.planningCreateSaveBtn.click();
      // $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    }
  }

  public clearTable() {
    const rowCount = itemsPlanningPlanningPage.rowNum();
    for (let i = 1; i <= rowCount; i++) {
      const planningRowObject = new PlanningRowObject(1);
      planningRowObject.clickDeletePlanning();
      itemsPlanningModalPage.planningDeleteDeleteBtn.click();
      $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    }
  }

  createNewEform(eFormLabel, newTagsPlanning = [], tagAddedNum = 0) {
    const spinnerAnimation = $('#spinner-animation');
    this.newEformBtn.click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    // Create replaced xml and insert it in textarea
    const xml = XMLForPlanning.XML.replace('TEST_LABEL', eFormLabel);
    browser.execute(function (xmlText) {
      (<HTMLInputElement>document.getElementById('eFormXml')).value = xmlText;
    }, xml);
    this.xmlTextArea.addValue(' ');
    // Create new tags
    const addedTags: string[] = newTagsPlanning;
    if (newTagsPlanning.length > 0) {
      this.createEformNewTagInput.setValue(newTagsPlanning.join(','));
      spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    }
    // Add existing tags
    const selectedTags: string[] = [];
    if (tagAddedNum > 0) {
      spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
      for (let i = 0; i < tagAddedNum; i++) {
        this.createEformTagSelector.click();
        const selectedTag = $('.ng-option:not(.ng-option-selected)');
        selectedTags.push(selectedTag.getText());
        console.log('selectedTags is ' + JSON.stringify(selectedTags));
        selectedTag.click();
        spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
      }
    }
    this.createEformBtn.click();
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    return {added: addedTags, selected: selectedTags};
  }
}

const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage();
export default itemsPlanningPlanningPage;

export class PlanningRowObject {
  constructor(rowNumber) {
    if ($$('#planningId')[rowNumber - 1]) {
      try {
        this.name = $$('#planningName')[rowNumber - 1].getText();
      } catch (e) {
      }
      try {
        this.description = $$('#planningDescription')[rowNumber - 1].getText();
      } catch (e) {
      }
      try {
        this.updateBtn = $$('#updatePlanningBtn')[rowNumber - 1];
      } catch (e) {
      }
      try {
        this.deleteBtn = $$('#deletePlanningBtn')[rowNumber - 1];
      } catch (e) {
      }
    }
  }

  public id;
  public name;
  public description;
  public updateBtn;
  public deleteBtn;

  public clickDeletePlanning() {
    this.deleteBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    // browser.pause(3000);
  }

  public clickUpdatePlanning() {
    this.updateBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    browser.pause(3000);
  }
}

