import loginPage from '../../Page objects/Login.page';
import itemsPlanningListPage, {ListRowObject} from '../../Page objects/ItemsPlanning/ItemsPlanningList.page';
import itemsPlanningModalPage from '../../Page objects/ItemsPlanning/ItemsPlanningModal.page';

const expect = require('chai').expect;

describe('Items planning actions', function () {
    before(function () {
        loginPage.open('/auth');
        loginPage.login();
        itemsPlanningListPage.goToListsPage();
    });
  it('should should create List', function () {
    itemsPlanningListPage.listCreateBtn.click();
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
    const listData = {
      name: 'Test list',
      template: 'Number 1',
      description: 'Description',
      repeatEvery: '1',
      repeatType: '1',
      repeatUntil: '5/15/2020'
    };
    itemsPlanningModalPage.createList(listData);
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  });
  it ('should delete existing list', function () {
        $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});

        let listRowObject = new ListRowObject(itemsPlanningListPage.rowNum());
        listRowObject.clickDeleteList();
        itemsPlanningModalPage.listDeleteDeleteBtn.click();
        $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
        listRowObject = new ListRowObject(1);
        expect(listRowObject.id === null, 'List is not deleted');
    });
});
