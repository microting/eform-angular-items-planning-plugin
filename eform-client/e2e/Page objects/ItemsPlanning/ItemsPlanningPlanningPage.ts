import Page from '../Page';
import itemsPlanningModalPage from './ItemsPlanningModal.page';
import {PageWithNavbarPage} from '../PageWithNavbar.page';
import {Guid} from 'guid-typescript';
import XMLForEformFractions from '../../Constants/XMLForEformFractions';
import myEformsPage from '../MyEforms.page';

export class ItemsPlanningPlanningPage extends PageWithNavbarPage {
  constructor() {
    super();
  }

  public rowNum(): number {
    browser.pause(500);
    return $$('#tableBody > tr').length;
  }

  public get newEformBtn() {
    $('#newEFormBtn').waitForDisplayed({timeout: 20000});
    $('#newEFormBtn').waitForClickable({timeout: 20000});
    return $('#newEFormBtn');
  }

  public get xmlTextArea() {
    $('#eFormXml').waitForDisplayed({timeout: 20000});
    $('#eFormXml').waitForClickable({timeout: 20000});
    return $('#eFormXml');
  }

  public get createEformBtn() {
    $('#createEformBtn').waitForDisplayed({timeout: 20000});
    $('#createEformBtn').waitForClickable({timeout: 20000});
    return $('#createEformBtn');
  }

  public get createEformTagSelector() {
    $('#createEFormMultiSelector').waitForDisplayed({timeout: 20000});
    $('#createEFormMultiSelector').waitForClickable({timeout: 20000});
    return $('#createEFormMultiSelector');
  }

  public get createEformNewTagInput() {
    $('#addTagInput').waitForDisplayed({timeout: 20000});
    $('#addTagInput').waitForClickable({timeout: 20000});
    return $('#addTagInput');
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

  public getPlanningValue(selector: any, row: number) {
    if (selector === 'planningId') {
      return parseInt($('#tableBody').$(`tr:nth-child(${row})`).$('#' + selector).getText(), 10);
    } else {
      return $('#tableBody').$(`tr:nth-child(${row})`).$('#' + selector).getText();
    }
  }

  public get itemPlanningButton() {
    $('#items-planning-pn').waitForDisplayed({timeout: 20000});
    $('#items-planning-pn').waitForClickable({timeout: 20000});
    return $('#items-planning-pn');
  }

  public get planningCreateBtn() {
    $('#planningCreateBtn').waitForDisplayed({timeout: 20000});
    $('#planningCreateBtn').waitForClickable({timeout: 20000});
    return $('#planningCreateBtn');
  }

  public get planningsButton() {
    $('#items-planning-pn-plannings').waitForDisplayed({timeout: 20000});
    $('#items-planning-pn-plannings').waitForClickable({timeout: 20000});
    return $('#items-planning-pn-plannings');
  }

  public goToPlanningsPage() {
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    this.itemPlanningButton.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    this.planningsButton.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
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
    this.newEformBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    // Create replaced xml and insert it in textarea
    const xml = XMLForEformFractions.XML.replace('TEST_LABEL', eFormLabel);
    browser.execute(function (xmlText) {
      (<HTMLInputElement>document.getElementById('eFormXml')).value = xmlText;
    }, xml);
    this.xmlTextArea.addValue(' ');
    // Create new tags
    const addedTags: string[] = newTagsPlanning;
    if (newTagsPlanning.length > 0) {
      this.createEformNewTagInput.setValue(newTagsPlanning.join(','));
      $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    }
    // Add existing tags
    const selectedTags: string[] = [];
    if (tagAddedNum > 0) {
      $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
      for (let i = 0; i < tagAddedNum; i++) {
        this.createEformTagSelector.click();
        const selectedTag = $('.ng-option:not(.ng-option-selected)');
        selectedTags.push(selectedTag.getText());
        console.log('selectedTags is ' + JSON.stringify(selectedTags));
        selectedTag.click();
        $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
      }
    }
    this.createEformBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
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
  }

  public clickUpdatePlanning() {
    this.updateBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    browser.pause(500);
  }
}

