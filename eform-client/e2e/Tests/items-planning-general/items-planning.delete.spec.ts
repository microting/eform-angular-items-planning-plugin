import loginPage from '../../Page objects/Login.page';
import itemsPlanningPlanningPage, {
  PlanningCreateUpdate,
} from '../../Page objects/ItemsPlanning/ItemsPlanningPlanningPage';
import itemsPlanningModalPage from '../../Page objects/ItemsPlanning/ItemsPlanningModal.page';
import { generateRandmString } from '../../Helpers/helper-functions';
import myEformsPage from '../../Page objects/MyEforms.page';
import foldersPage from '../../Page objects/Folders.page';

const expect = require('chai').expect;
const planningData: PlanningCreateUpdate = {
  name: [generateRandmString(), generateRandmString(), generateRandmString()],
  eFormName: generateRandmString(),
  description: 'Description',
  repeatEvery: '1',
  repeatType: 'Dag',
  repeatUntil: new Date('5/15/2020'),
  folderName: generateRandmString(),
};

describe('Items planning actions - Delete', function () {
  before(async () => {
    await loginPage.open('/auth');
    await loginPage.login();
    if (await myEformsPage.rowNum() <= 0) {
      await myEformsPage.createNewEform(planningData.eFormName); // Create eform
    } else {
      planningData.eFormName = await (await myEformsPage.getFirstMyEformsRowObj()).eFormName;
    }
    await myEformsPage.Navbar.goToFolderPage();
    if (await foldersPage.rowNum() <= 0) {
      await foldersPage.createNewFolder(planningData.folderName, 'Description'); // Create folder
    } else {
      planningData.folderName = await (await foldersPage.getFolder(1)).name;
    }
    await itemsPlanningPlanningPage.goToPlanningsPage();
  });
  it('should should create planning', async () => {
    await itemsPlanningModalPage.createPlanning(planningData);
  });
  it('should not delete existing planning', async () => {
    const numRowBeforeDelete = await itemsPlanningPlanningPage.rowNum();
    const planningRowObject = await itemsPlanningPlanningPage.getPlaningByName(
      planningData.name[0]
    );
    await planningRowObject.delete(true);
    expect(numRowBeforeDelete, 'Planning is deleted').eq(
      await itemsPlanningPlanningPage.rowNum()
    );
  });
  it('should delete existing planning', async () => {
    const numRowBeforeDelete = await itemsPlanningPlanningPage.rowNum();
    const planningRowObject = await itemsPlanningPlanningPage.getPlaningByName(
      planningData.name[0]
    );
    await planningRowObject.delete();
    expect(numRowBeforeDelete - 1, 'Planning is not deleted').eq(
      await itemsPlanningPlanningPage.rowNum()
    );
  });
});
