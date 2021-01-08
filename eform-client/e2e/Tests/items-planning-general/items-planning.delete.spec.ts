import loginPage from '../../Page objects/Login.page';
import itemsPlanningPlanningPage from '../../Page objects/ItemsPlanning/ItemsPlanningPlanningPage';
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
  repeatType: 'Dag',
  repeatUntil: '5/15/2020',
  folderName: generateRandmString()
};

describe('Items planning actions - Delete', function () {
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
  it('should should create planning', function () {
    itemsPlanningPlanningPage.planningCreateBtn.click();
    const spinnerAnimation = $('#spinner-animation');
    spinnerAnimation.waitForDisplayed({timeout: 90000, reverse: true});
    itemsPlanningModalPage.createPlanning(planningData);
  });
  it('should delete existing planning', function () {
    const planningRowObject = itemsPlanningPlanningPage.getPlaningByName(planningData.name[1]);
    planningRowObject.delete();
    expect(itemsPlanningPlanningPage.getPlaningByName(planningData.name[1]), 'Planning is not deleted').eq(null);
  });
});
