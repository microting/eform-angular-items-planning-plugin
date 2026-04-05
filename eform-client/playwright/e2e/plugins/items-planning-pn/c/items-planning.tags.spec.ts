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
    await tagsModalPage.createTag(tagName);
    // Wait for the tag to appear in the list (API call + list refresh)
    await page.locator('#tagName', { hasText: tagName }).waitFor({ state: 'visible', timeout: 30000 });
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
