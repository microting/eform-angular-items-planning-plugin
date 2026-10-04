/*
The MIT License (MIT)

Copyright (c) 2007 - 2026 Microting A/S

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

namespace ItemsPlanning.Pn.Infrastructure.Helpers;

using System.Linq;
using Microsoft.Extensions.Logging;
using Microting.EformAngularFrontendBase.Infrastructure.Data;

/// <summary>
/// The "reports" page left the Angular module in 2023, but the plugin kept registering a "Reports" menu
/// entry for it. Clicking it matches no route and the frontend's catch-all silently lands on "My eForms"
/// (#2136). The host only ever adds plugin menu entries, so the plugin removes its own dead one on start.
/// Only rows that carry both the dead link and its E2E id are touched; a second run finds nothing.
/// </summary>
public static class DeadReportsMenuCleaner
{
    public const string Link = "/plugins/items-planning-pn/reports";
    public const string E2EId = "items-planning-pn-reports";

    /// <returns>The number of menu items plus menu templates removed.</returns>
    public static int Remove(BaseDbContext dbContext, ILogger logger)
    {
        var menuItems = dbContext.MenuItems
            .Where(x => x.Link == Link && x.E2EId == E2EId)
            .ToList();
        var menuTemplates = dbContext.MenuTemplates
            .Where(x => x.DefaultLink == Link && x.E2EId == E2EId)
            .ToList();

        if (menuItems.Count == 0 && menuTemplates.Count == 0)
        {
            return 0;
        }

        // Child rows are matched through their parent's link rather than an id list, so the queries need no
        // IN (...) translation.
        dbContext.MenuItemTranslations.RemoveRange(dbContext.MenuItemTranslations
            .Where(x => x.MenuItem.Link == Link && x.MenuItem.E2EId == E2EId));
        dbContext.MenuItemSecurityGroups.RemoveRange(dbContext.MenuItemSecurityGroups
            .Where(x => x.MenuItem.Link == Link && x.MenuItem.E2EId == E2EId));
        dbContext.MenuItems.RemoveRange(menuItems);

        // A menu item that still points at a removed template would block the delete; detach it the way
        // the host does when it removes a plugin's templates.
        foreach (var remaining in dbContext.MenuItems
                     .Where(x => x.MenuTemplate.DefaultLink == Link && x.MenuTemplate.E2EId == E2EId)
                     .Where(x => x.Link != Link || x.E2EId != E2EId))
        {
            remaining.MenuTemplateId = null;
        }

        dbContext.MenuTemplateTranslations.RemoveRange(dbContext.MenuTemplateTranslations
            .Where(x => x.MenuTemplate.DefaultLink == Link && x.MenuTemplate.E2EId == E2EId));
        dbContext.MenuTemplatePermissions.RemoveRange(dbContext.MenuTemplatePermissions
            .Where(x => x.MenuTemplate.DefaultLink == Link && x.MenuTemplate.E2EId == E2EId));
        dbContext.MenuTemplates.RemoveRange(menuTemplates);

        dbContext.SaveChanges();

        logger.LogInformation(
            "Removed the dead items-planning Reports menu: menu items [{MenuItemIds}], menu templates [{MenuTemplateIds}]",
            string.Join(", ", menuItems.Select(x => x.Id)), string.Join(", ", menuTemplates.Select(x => x.Id)));

        return menuItems.Count + menuTemplates.Count;
    }
}
