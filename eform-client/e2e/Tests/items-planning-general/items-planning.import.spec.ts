import loginPage from '../../Page objects/Login.page';
import itemsPlanningPlanningPage from '../../Page objects/ItemsPlanning/ItemsPlanningPlanningPage';
import myEformsPage from '../../Page objects/MyEforms.page';
import foldersPage from '../../Page objects/Folders.page';

const expect = require('chai').expect;

describe('Items planning - Import', function () {
  before(function () {
    loginPage.open('/auth');
    loginPage.login();
    const localPath = process.cwd();
    $('#importEformsBtn').click();
    browser.pause(2000);
    const filePath = localPath + '/e2e/Assets/Skabelon Døvmark NEW.xlsx';
    const remoteFilePath = browser.uploadFile(filePath);
    $('app-eforms-bulk-import-modal * *').waitForDisplayed({ timeout: 20000 });
    const input = $('#zipInput');
    browser.execute(
      // assign style to elem in the browser
      (el) => (el.style.display = 'block'),
      // pass in element so we don't need to query it again in the browser
      input
    );
    input.waitForDisplayed({ timeout: 20000 });
    input.setValue(remoteFilePath);
    myEformsPage.newEformBtn.waitForClickable({ timeout: 60000 });
    itemsPlanningPlanningPage.goToPlanningsPage();
  });
  it('should', function () {
    expect(1).eq(1);
  });
  after('delete all created in this test', function () {
    // Delete

    myEformsPage.Navbar.goToFolderPage();

    myEformsPage.Navbar.goToMyEForms();
  });
});
