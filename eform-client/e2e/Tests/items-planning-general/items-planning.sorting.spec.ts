import loginPage from '../../Page objects/Login.page';
import itemsPlanningPlanningPage from '../../Page objects/ItemsPlanning/ItemsPlanningPlanningPage';

const expect = require('chai').expect;

describe('Items planning plannings - Sorting', function () {
  before(function () {
    loginPage.open('/auth');
    loginPage.login();
    itemsPlanningPlanningPage.goToPlanningsPage();
  });
  it('should create dummy plannings', function () {
    itemsPlanningPlanningPage.createDummyPlannings();
  });
  it ('should be able to sort by ID', function () {
    const planningBefore = $$('#planningId').map(item => {
      return item.getText();
    });

    // check that sorting is correct in both directions
    for (let i = 0; i < 2; i ++) {
      itemsPlanningPlanningPage.clickIdTableHeader();

      const planningAfter = $$('#planningId').map(item => {
        return item.getText();
      });

      // get current direction of sorting
      const sortIcon = $('#idTableHeader i').getText();
      let sorted;
      if (sortIcon === 'expand_more') {
        sorted = planningBefore.sort().reverse();
      } else if (sortIcon === 'expand_less') {
        sorted = planningBefore.sort();
      } else {
        sorted = planningBefore;
      }
      expect(sorted, 'Sort by ID incorrect').deep.equal(planningAfter);
    }
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  });
  it ('should be able to sort by Name', function () {
    const listBefore = $$('#listName').map(item => {
      return item.getText();
    });

    // check that sorting is correct in both directions
    for (let i = 0; i < 2; i ++) {
      itemsPlanningPlanningPage.clickNameTableHeader();

      const planningAfter = $$('#listName').map(item => {
        return item.getText();
      });

      // get current direction of sorting
      const sortIcon = $('#nameTableHeader i').getText();
      let sorted;
      if (sortIcon === 'expand_more') {
        sorted = listBefore.sort().reverse();
      } else if (sortIcon === 'expand_less') {
        sorted = listBefore.sort();
      } else {
        sorted = listBefore;
      }

      $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
      expect(sorted, 'Sort by Name incorrect').deep.equal(planningAfter);
    }
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  });
  it ('should be able to sort by Description', function () {
    const listBefore = $$('#planningDescription').map(item => {
      return item.getText();
    });

    // check that sorting is correct in both directions
    for (let i = 0; i < 2; i ++) {
      itemsPlanningPlanningPage.clickDescriptionTableHeader();

      const listAfter = $$('#planningDescription').map(item => {
        return item.getText();
      });

      // get current direction of sorting
      const sortIcon = $('#descriptionTableHeader i').getText();
      let sorted;
      if (sortIcon === 'expand_more') {
        sorted = listBefore.sort().reverse();
      } else if (sortIcon === 'expand_less') {
        sorted = listBefore.sort();
      } else {
        sorted = listBefore;
      }

      expect(sorted, 'Sort by Description incorrect').deep.equal(listAfter);
    }
    $('#spinner-animation').waitForDisplayed({timeout: 90000, reverse: true});
  });
  it('should clear table', function () {
    itemsPlanningPlanningPage.clearTable();
  });
});
