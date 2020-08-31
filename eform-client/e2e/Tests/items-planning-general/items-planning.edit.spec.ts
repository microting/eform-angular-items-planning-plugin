import loginPage from '../../Page objects/Login.page';
import itemsPlanningPlanningPage, {PlanningRowObject} from '../../Page objects/ItemsPlanning/ItemsPlanningPlanningPage';
import itemsPlanningModalPage from '../../Page objects/ItemsPlanning/ItemsPlanningModal.page';

const expect = require('chai').expect;

describe('Items planning actions - Edit', function () {
  before(function () {
    loginPage.open('/auth');
    loginPage.login();
    itemsPlanningPlanningPage.goToPlanningsPage();
  });
  it('should create a new planning', function () {
    itemsPlanningPlanningPage.planningCreateBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    const planningData = {
      name: 'Test Planning',
      template: 'Number 1',
      description: 'Description',
      repeatEvery: '1',
      repeatType: '1',
      repeatUntil: '5/15/2020',
      folderName: 'My test folder'
    };
    itemsPlanningModalPage.createPlanning(planningData);
  });
  it('should change all fields after edit', function () {
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    let planningRowObject = new PlanningRowObject(itemsPlanningPlanningPage.rowNum());
    planningRowObject.clickUpdatePlanning();
    const planningData = {
      name: 'Test planning 2',
      template: '',
      description: 'Description 2',
      repeatEvery: '2',
      repeatType: '1',
      repeatUntil: '5/15/2023',
      folderName: 'My test folder'
    };
    itemsPlanningModalPage.editPlanning(planningData);
    // Check that list is edited successfully in table
    planningRowObject = new PlanningRowObject(itemsPlanningPlanningPage.rowNum());
    expect(planningRowObject.name, 'Name in table is incorrect').equal(planningData.name);
    expect(planningRowObject.description, 'Description in table is incorrect').equal(planningData.description);
    // Check that all list fields are saved
    planningRowObject.clickUpdatePlanning();
    expect(itemsPlanningModalPage.editPlanningItemName.getValue(), 'Saved Name is incorrect').equal(planningData.name);
    expect(itemsPlanningModalPage.editPlanningSelector.getValue(), 'Saved Template is incorrect').equal(planningData.template);
    expect(itemsPlanningModalPage.editPlanningDescription.getValue(), 'Saved Description is incorrect').equal(planningData.description);
    expect(itemsPlanningModalPage.editRepeatEvery.getValue(), 'Saved Repeat Every is incorrect').equal(planningData.repeatEvery);
    const repeatUntil = new Date(planningData.repeatUntil);
    const repeatUntilSaved = new Date(itemsPlanningModalPage.editRepeatUntil.getValue());
    expect(repeatUntilSaved.getDate(), 'Saved Repeat Until is incorrect').equal(repeatUntil.getDate());

    $('#editRepeatType').click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    const editRepeatTypeSelected = $$('#editRepeatType .ng-option')[planningData.repeatType];
    expect(editRepeatTypeSelected.getAttribute('class'), 'Saved Repeat Type is incorrect').contains('ng-option-selected');

    itemsPlanningModalPage.planningEditCancelBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    planningRowObject.clickDeletePlanning();
    itemsPlanningModalPage.planningDeleteDeleteBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  });
});
