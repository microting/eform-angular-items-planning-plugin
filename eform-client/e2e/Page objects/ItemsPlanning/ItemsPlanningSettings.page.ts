import Page from '../Page';
import myEformsPage from '../MyEforms.page';
import pluginPage from '../Plugin.page';

export class ItemsPlanningSettingsPage extends Page {
  constructor() {
    super();
  }

  public async saveSettingsBtn() {
    return browser.$('#saveBtn');
  }

  public async sdkConnectionString() {
    return browser.$('#sdkConnectionString');
  }

  public async logLevel() {
    return browser.$('#logLevel');
  }

  public async logLimit() {
    return browser.$('#logLimit');
  }

  public async maxParallelism() {
    return browser.$('#maxParallelism');
  }

  public async numberOfWorkers() {
    return browser.$('#numberOfWorkers');
  }

  public async itemsPlanningBtn() {
    return browser.$('#items-planning-pn');
  }

  public async itemsPlanningSettingsBtn() {
    return browser.$('#items-planning-pn-settings');
  }

  public goToSettingsPage() {
    myEformsPage.Navbar.goToPluginsPage();
    $('#spinner-animation').waitForDisplayed({ timeout: 90000, reverse: true });
    pluginPage.pluginSettingsLink.click();
    $('#spinner-animation').waitForDisplayed({ timeout: 90000, reverse: true });
  }

  public saveSettings(data: any) {
    this.sdkConnectionString.setValue(data.sdkConnectionString);
    this.logLevel.setValue(data.logLevel);
    this.logLimit.setValue(data.logLimit);
    this.maxParallelism.setValue(data.maxParallelism);
    this.numberOfWorkers.setValue(data.numberOfWorkers);
    this.saveSettingsBtn.click();
    $('#spinner-animation').waitForDisplayed({ timeout: 90000, reverse: true });
  }

  public getSettings() {
    browser.pause(500);
    return new ItemsPlanningSettings();
  }
}

const itemsPlanningSettingsPage = new ItemsPlanningSettingsPage();
export default itemsPlanningSettingsPage;

export class ItemsPlanningSettings {
  constructor() {
    this.sdkConnectionString = itemsPlanningSettingsPage.sdkConnectionString.getValue();
    this.logLevel = itemsPlanningSettingsPage.logLevel.getValue();
    this.logLimit = itemsPlanningSettingsPage.logLimit.getValue();
    this.maxParallelism = itemsPlanningSettingsPage.maxParallelism.getValue();
    this.numberOfWorkers = itemsPlanningSettingsPage.numberOfWorkers.getValue();
  }

  public sdkConnectionString;
  public logLevel;
  public logLimit;
  public maxParallelism;
  public numberOfWorkers;
}
