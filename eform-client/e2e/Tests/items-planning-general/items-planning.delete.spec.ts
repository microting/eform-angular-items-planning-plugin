import loginPage from '../../Page objects/Login.page';
import itemsPlanningPlanningPage, {PlanningRowObject} from '../../Page objects/ItemsPlanning/ItemsPlanningPlanningPage';
import itemsPlanningModalPage from '../../Page objects/ItemsPlanning/ItemsPlanningModal.page';

const expect = require('chai').expect;

describe('Items planning actions - Delete', function () {
  before(function () {
    loginPage.open('/auth');
    loginPage.login();
    itemsPlanningPlanningPage.goToPlanningsPage();
  });
  it('should should create planning', function () {
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
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  });
  it('should delete existing planning', function () {
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});

    let planningRowObject = new PlanningRowObject(itemsPlanningPlanningPage.rowNum());
    planningRowObject.clickDeletePlanning();
    itemsPlanningModalPage.planningDeleteDeleteBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    planningRowObject = new PlanningRowObject(1);
    expect(planningRowObject.id === null, 'Planning is not deleted');
  });
});
