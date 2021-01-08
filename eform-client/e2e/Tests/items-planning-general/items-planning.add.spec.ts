import loginPage from '../../Page objects/Login.page';
import itemsPlanningPlanningPage, {PlanningRowObject} from '../../Page objects/ItemsPlanning/ItemsPlanningPlanningPage';
import itemsPlanningModalPage from '../../Page objects/ItemsPlanning/ItemsPlanningModal.page';
import myEformsPage from '../../Page objects/MyEforms.page';
import foldersPage from '../../Page objects/Folders.page';
import {generateRandmString} from '../../Helpers/helper-functions';

const expect = require('chai').expect;
let eformLabel = generateRandmString();
let folderName = generateRandmString();

describe('Items planning - Add', function () {
  before(function () {
    loginPage.open('/auth');
    loginPage.login();
    if (myEformsPage.rowNum <= 0) {
      myEformsPage.createNewEform(eformLabel); // Create eform
    } else {
      eformLabel = myEformsPage.getFirstMyEformsRowObj().eFormName;
    }
    myEformsPage.Navbar.goToFolderPage();
    if (foldersPage.rowNum <= 0) {
      foldersPage.createNewFolder(folderName, 'Description'); // Create folder
    } else {
      folderName = foldersPage.getFolder(1).name;
    }
    itemsPlanningPlanningPage.goToPlanningsPage();
  });
  it('should create planning with all fields', function () {
    itemsPlanningPlanningPage.planningCreateBtn.click();
    const spinnerAnimation = $('#spinner-animation');
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    const planningData = {
      name: [generateRandmString(), generateRandmString(), generateRandmString()],
      template: eformLabel,
      description: 'Description',
      repeatEvery: '1',
      repeatType: 'Dag',
      repeatUntil: '5/15/2020',
      folderName: folderName
    };
    itemsPlanningModalPage.createPlanning(planningData);
    // Check that planning is created in table
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    browser.pause(2000);
    const planningRowObject = itemsPlanningPlanningPage.getPlaningByName(planningData.name[1]);
    // expect(planningRowObject.name, 'Name in table is incorrect').equal(planningData.name);
    // expect(planningRowObject.description, 'Description in table is incorrect').equal(planningData.description);
    // Check that all planning fields are saved
    expect(planningRowObject.name, 'Saved Name is incorrect').equal(planningData.name[1]);
    expect(planningRowObject.eFormName, 'Saved Template is incorrect').equal(planningData.template);
    expect(planningRowObject.description, 'Saved Description is incorrect').equal(planningData.description);
    expect(planningRowObject.repeatEvery, 'Saved Repeat Every is incorrect').equal(planningData.repeatEvery);
    const repeatUntil = new Date(planningData.repeatUntil);
    expect(planningRowObject.repeatUntil.getDate(), 'Saved Repeat Until is incorrect').equal(repeatUntil.getDate());
    expect(planningRowObject.repeatType, 'Saved Repeat Type is incorrect').equal(planningData.repeatType);
    planningRowObject.delete();
  });
});
