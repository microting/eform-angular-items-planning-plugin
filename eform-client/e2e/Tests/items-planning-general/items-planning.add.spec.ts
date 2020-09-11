import loginPage from '../../Page objects/Login.page';
import itemsPlanningPlanningPage, {PlanningRowObject} from '../../Page objects/ItemsPlanning/ItemsPlanningPlanningPage';
import itemsPlanningModalPage from '../../Page objects/ItemsPlanning/ItemsPlanningModal.page';
import myEformsPage from '../../Page objects/MyEforms.page';
import foldersPage from '../../Page objects/Folders.page';

const expect = require('chai').expect;

describe('Items planning - Add', function () {
  before(function () {
    loginPage.open('/auth');
    loginPage.login();
    // Create eform
    const newEformLabel = 'Number 1';
    itemsPlanningPlanningPage.createNewEform(newEformLabel);
    // Create folder
    myEformsPage.Navbar.goToFolderPage();
    foldersPage.createNewFolder('My test folder', '');
    itemsPlanningPlanningPage.goToPlanningsPage();
  });
  it('should create planning with all fields', function () {
    itemsPlanningPlanningPage.planningCreateBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    const planningData = {
      name: 'Test item',
      template: 'Number 1',
      description: 'Description',
      repeatEvery: '1',
      repeatType: '1',
      repeatUntil: '5/15/2020',
      folderName: 'My test folder'
    };
    itemsPlanningModalPage.createPlanning(planningData);
    // Check that planning is created in table
    const planningRowObject = new PlanningRowObject(itemsPlanningPlanningPage.rowNum());
    expect(planningRowObject.name, 'Name in table is incorrect').equal(planningData.name);
    expect(planningRowObject.description, 'Description in table is incorrect').equal(planningData.description);
    // Check that all planning fields are saved
    planningRowObject.clickUpdatePlanning();
    expect(itemsPlanningModalPage.editPlanningItemName.getValue(), 'Saved Name is incorrect').equal(planningData.name);
    expect(itemsPlanningModalPage.editPlanningSelectorValue.getText(), 'Saved Template is incorrect').equal(planningData.template);
    expect(itemsPlanningModalPage.editPlanningDescription.getValue(), 'Saved Description is incorrect').equal(planningData.description);
    expect(itemsPlanningModalPage.editRepeatEvery.getValue(), 'Saved Repeat Every is incorrect').equal(planningData.repeatEvery);
    const repeatUntil = new Date(planningData.repeatUntil);
    const repeatUntilSaved = new Date(itemsPlanningModalPage.editRepeatUntil.getValue());
    expect(repeatUntilSaved.getDate(), 'Saved Repeat Until is incorrect').equal(repeatUntil.getDate());
    //
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
