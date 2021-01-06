import loginPage from '../../Page objects/Login.page';
import itemsPlanningPlanningPage, {PlanningRowObject} from '../../Page objects/ItemsPlanning/ItemsPlanningPlanningPage';
import itemsPlanningModalPage from '../../Page objects/ItemsPlanning/ItemsPlanningModal.page';
import {generateRandmString} from '../../Helpers/helper-functions';
import myEformsPage from '../../Page objects/MyEforms.page';
import foldersPage from '../../Page objects/Folders.page';

const expect = require('chai').expect;
const planningData = {
  name: [generateRandmString(), generateRandmString(), generateRandmString()],
  template: generateRandmString(),
  description: 'Description',
  repeatEvery: '1',
  repeatType: 'Day',
  repeatUntil: '5/15/2020',
  folderName: generateRandmString()
};

describe('Items planning actions - Edit', function () {
  before(function () {
    loginPage.open('/auth');
    loginPage.login();
    if (myEformsPage.rowNum <= 0) {
      myEformsPage.createNewEform(planningData.template); // Create eform
    } else {
      planningData.template = myEformsPage.getFirstMyEformsRowObj().eFormName;
    }
    myEformsPage.Navbar.goToFolderPage();
    if (foldersPage.rowNum <= 0) {
      foldersPage.createNewFolder(planningData.folderName, 'Description'); // Create folder
    } else {
      planningData.folderName = foldersPage.getFolder(1).name;
    }
    itemsPlanningPlanningPage.goToPlanningsPage();
  });
  it('should create a new planning', function () {
    itemsPlanningPlanningPage.planningCreateBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    itemsPlanningModalPage.createPlanning(planningData);
  });
  it('should change all fields after edit', function () {
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    let planningRowObject = itemsPlanningPlanningPage.getPlaningByName(planningData.name[1]);
    planningData.repeatType = 'Week';
    planningData.name[1] = generateRandmString();
    planningData.description = generateRandmString();
    planningRowObject.update(planningData);
    // Check that list is edited successfully in table
    planningRowObject = itemsPlanningPlanningPage.getPlaningByName(planningData.name[1]);
    expect(planningRowObject.name, 'Name in table is incorrect').equal(planningData.name[1]);
    expect(planningRowObject.description, 'Description in table is incorrect').equal(planningData.description);
    expect(planningRowObject.eFormName, 'Saved Template is incorrect').equal(planningData.template);
    expect(planningRowObject.repeatEvery, 'Saved Repeat Every is incorrect').equal(planningData.repeatEvery);
    const repeatUntil = new Date(planningData.repeatUntil);
    expect(planningRowObject.repeatUntil.getDate(), 'Saved Repeat Until is incorrect').equal(repeatUntil.getDate());
    expect(planningRowObject.repeatType, 'Saved Repeat Type is incorrect').eq(planningData.repeatType);
    // Delete
    planningRowObject.delete();
  });
});
