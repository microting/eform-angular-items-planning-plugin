import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../Page objects/Login.page';
import { TagsModalPage, TagRowObject } from '../../../Page objects/TagsModal.page';
import { ItemsPlanningPlanningPage } from '../ItemsPlanningPlanningPage';
import { generateRandmString } from '../../../helper-functions';

let page;

const tagName = generateRandmString();
const updatedTagName = generateRandmString();

test.describe.serial('Items planning - Tags', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    const itemsPlanningPlanningPage = new ItemsPlanningPlanningPage(page);

    await loginPage.open('/auth');
    await loginPage.login();
    await itemsPlanningPlanningPage.goToPlanningsPage();
    await itemsPlanningPlanningPage.planningManageTagsBtn.click();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should create tag', async () => {
    const tagsModalPage = new TagsModalPage(page);
    const tagsRowsBeforeCreate = await tagsModalPage.rowNum();
    await tagsModalPage.newTagBtn().click();
    await page.waitForTimeout(500);
    await page.locator('#newTagName').waitFor({ state: 'visible', timeout: 90000 });
    await tagsModalPage.newTagNameInput().fill(tagName);
    await page.waitForTimeout(500);
    // Dispatch input event to ensure Angular ngModel picks up the value
    await tagsModalPage.newTagNameInput().evaluate((el: HTMLInputElement) => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(500);
    await page.locator('#newTagSaveBtn:not([disabled])').waitFor({ state: 'visible', timeout: 10000 });
    await tagsModalPage.newTagSaveBtn().click();
    await page.waitForTimeout(500);
    await page.locator('#newTagBtn').waitFor({ state: 'visible', timeout: 40000 });
    // Wait for tag list to refresh
    await page.waitForTimeout(3000);
    const tagsRowsAfterCreate = await tagsModalPage.rowNum();
    const tagRowObject = new TagRowObject(page, tagsModalPage);
    const tagRowObj = await tagRowObject.getRow(tagsRowsAfterCreate);
    expect(tagsRowsAfterCreate).toBe(tagsRowsBeforeCreate + 1);
    expect(tagRowObj.name.trim()).toBe(tagName);
  });

  test('should not create tag', async () => {
    const tagsModalPage = new TagsModalPage(page);
    const tagsRowsBeforeCreate = await tagsModalPage.rowNum();
    await tagsModalPage.cancelCreateTag(tagName);
    const tagsRowsAfterCreate = await tagsModalPage.rowNum();
    expect(tagsRowsAfterCreate).toBe(tagsRowsBeforeCreate);
  });

  test('should update tag', async () => {
    const tagsModalPage = new TagsModalPage(page);
    const rowNum = await tagsModalPage.rowNum();
    await tagsModalPage.editTag(rowNum, updatedTagName);
    const tagRowObjectAfterEdit = new TagRowObject(page);
    const tagRowObj = await tagRowObjectAfterEdit.getRow(rowNum);
    expect(tagRowObj.name.trim()).toBe(updatedTagName);
  });

  test('should not update tag', async () => {
    const tagsModalPage = new TagsModalPage(page);
    const rowNum = await tagsModalPage.rowNum();
    await tagsModalPage.cancelEditTag(rowNum, updatedTagName);
    const tagRowObjectAfterCancelEdit = new TagRowObject(page);
    const tagRowObj = await tagRowObjectAfterCancelEdit.getRow(rowNum);
    expect(tagRowObj.name.trim()).toBe(updatedTagName);
  });

  test('should not delete tag', async () => {
    const tagsModalPage = new TagsModalPage(page);
    const tagsRowsBeforeDelete = await tagsModalPage.rowNum();
    const tagRow = new TagRowObject(page, tagsModalPage);
    await (await tagRow.getRow(tagsRowsBeforeDelete)).deleteTag(true);
    const tagsRowsAfterCancelDelete = await tagsModalPage.rowNum();
    expect(tagsRowsAfterCancelDelete).toBe(tagsRowsBeforeDelete);
  });

  test('should delete tag', async () => {
    const tagsModalPage = new TagsModalPage(page);
    const tagsRowsBeforeDelete = await tagsModalPage.rowNum();
    const tagRow = new TagRowObject(page, tagsModalPage);
    await (await tagRow.getRow(tagsRowsBeforeDelete)).deleteTag();
    await page.waitForTimeout(500);
    const tagsRowsAfterDelete = await tagsModalPage.rowNum();
    expect(tagsRowsAfterDelete).toBe(tagsRowsBeforeDelete - 1);
  });
});
