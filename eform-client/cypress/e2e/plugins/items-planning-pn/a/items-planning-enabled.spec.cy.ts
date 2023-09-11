import loginPage from '../../../Login.page';
import pluginPage from '../../../Plugin.page';

describe('Enable Items Planning plugin', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
    loginPage.login();
    pluginPage.Navbar.goToPluginsPage();
    pluginPage.rowNum()
      .should('not.eq', 0) // we have plugins list
      .should('eq', 1); // we have only 1 plugin: items planning
  });
  it('should enabled Items Planning plugin', () => {
    const pluginName = 'Microting Items Planning Plugin';
    pluginPage.enablePluginByName(pluginName);
    const row = cy.contains('.mat-row', pluginName).first();
    row.find('.mat-column-actions button')
      .should('contain.text', 'toggle_on'); // plugin is enabled
  });
});
