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

namespace ItemsPlanning.Pn.Test;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ItemsPlanning.Pn.Infrastructure.Helpers;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microting.eFormApi.BasePn.Infrastructure.Models.Application.NavigationMenu;
using Microting.EformAngularFrontendBase.Infrastructure.Data;
using Microting.EformAngularFrontendBase.Infrastructure.Data.Entities.Menu;
using Microting.EformAngularFrontendBase.Infrastructure.Data.Entities.Permissions;
using NSubstitute;
using NUnit.Framework;
using Testcontainers.MariaDb;

/// <summary>
/// Plugin start removes the dead "Reports" menu entry (#2136) from the host's Angular database: the item,
/// its template and their child rows go, whatever E2E id they carry; a second start changes nothing; other
/// menu entries, including ones whose link merely starts like the dead one, are untouched.
/// Runs <see cref="EformItemsPlanningPlugin.Configure"/> against a real MariaDB, the way the host calls it.
/// </summary>
[TestFixture]
public class DeadReportsMenuCleanupTests
{
    private const string PlanningLink = "/plugins/items-planning-pn/plannings";

    private readonly MariaDbContainer _mariaDbContainer = new MariaDbBuilder("mariadb:11.2")
        .WithDatabase("items-planning-dead-reports-menu")
        .WithPassword("secretpassword")
        .Build();

    private DbContextOptions<BaseDbContext> _dbContextOptions;
    private ServiceProvider _serviceProvider;
    private IApplicationBuilder _appBuilder;

    [OneTimeSetUp]
    public async Task OneTimeSetUp()
    {
        await _mariaDbContainer.StartAsync();
        var connectionString = _mariaDbContainer.GetConnectionString();

        _dbContextOptions = new DbContextOptionsBuilder<BaseDbContext>()
            .UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
            .Options;
        // The plugin resolves BaseDbContext from the host's container; register the same options there.
        _serviceProvider = new ServiceCollection()
            .AddLogging()
            .AddScoped(_ => new BaseDbContext(_dbContextOptions))
            .BuildServiceProvider();

        _appBuilder = Substitute.For<IApplicationBuilder>();
        _appBuilder.ApplicationServices.Returns(_serviceProvider);
    }

    [OneTimeTearDown]
    public async Task OneTimeTearDown()
    {
        await _serviceProvider.DisposeAsync();
        await _mariaDbContainer.DisposeAsync();
    }

    [SetUp]
    public async Task SetUp()
    {
        await using var db = NewDbContext();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    [Test]
    public async Task PluginStart_RemovesTheDeadReportsEntry_AndASecondStartIsANoOp()
    {
        int planningItemId, planningTemplateId, reportsItemId, detachedItemId;
        await using (var db = NewDbContext())
        {
            var securityGroup = new SecurityGroup { Name = "Example group" };
            db.SecurityGroups.Add(securityGroup);
            await db.SaveChangesAsync();

            var dropdown = new MenuItem
            {
                Name = "Dropdown", E2EId = "items-planning-pn", Link = "", Type = MenuItemTypeEnum.Dropdown
            };
            db.MenuItems.Add(dropdown);
            await db.SaveChangesAsync();

            var planning = AddLinkWithTemplate(db, dropdown, securityGroup, "Planning",
                "items-planning-pn-plannings", PlanningLink);
            var reports = AddLinkWithTemplate(db, dropdown, securityGroup, "Reports",
                DeadReportsMenuCleaner.E2EId, DeadReportsMenuCleaner.Link);
            // An entry someone re-pointed elsewhere but that still hangs on the dead template: it stays,
            // detached from the template.
            var detached = new MenuItem
            {
                Name = "Example link",
                E2EId = "example-link",
                Link = "/example",
                Type = MenuItemTypeEnum.Link,
                Parent = dropdown,
                MenuTemplate = reports.MenuTemplate
            };
            db.MenuItems.Add(detached);
            await db.SaveChangesAsync();

            planningItemId = planning.Id;
            planningTemplateId = planning.MenuTemplateId!.Value;
            reportsItemId = reports.Id;
            detachedItemId = detached.Id;
        }

        // BaseDbContext seeds its own default menu, templates and permissions, so assert against a snapshot.
        var before = await SnapshotAsync();

        new EformItemsPlanningPlugin().Configure(_appBuilder);

        var after = await SnapshotAsync();
        Assert.That(after, Is.EqualTo(before with
        {
            MenuItemIds = before.MenuItemIds.Where(x => x != reportsItemId).ToList(),
            MenuItemTranslations = before.MenuItemTranslations - 1,
            MenuItemSecurityGroups = before.MenuItemSecurityGroups - 1,
            MenuTemplates = before.MenuTemplates - 1,
            MenuTemplateTranslations = before.MenuTemplateTranslations - 1,
            MenuTemplatePermissions = before.MenuTemplatePermissions - 1
        }).Using<Snapshot>(SameSnapshot));

        await using (var db = NewDbContext())
        {
            Assert.That(await db.MenuItems.AnyAsync(x => x.Link == DeadReportsMenuCleaner.Link), Is.False);
            Assert.That(await db.MenuTemplates.AnyAsync(x => x.DefaultLink == DeadReportsMenuCleaner.Link),
                Is.False);
            Assert.That((await db.MenuItems.SingleAsync(x => x.Id == planningItemId)).MenuTemplateId,
                Is.EqualTo(planningTemplateId));
            Assert.That(await db.MenuItemTranslations.CountAsync(x => x.MenuItemId == planningItemId),
                Is.EqualTo(1));
            Assert.That(await db.MenuItemSecurityGroups.CountAsync(x => x.MenuItemId == planningItemId),
                Is.EqualTo(1));
            Assert.That((await db.MenuItems.SingleAsync(x => x.Id == detachedItemId)).MenuTemplateId, Is.Null);
        }

        new EformItemsPlanningPlugin().Configure(_appBuilder);

        Assert.That(await SnapshotAsync(), Is.EqualTo(after).Using<Snapshot>(SameSnapshot),
            "a second start changes nothing");
    }

    [Test]
    public async Task PluginStart_RemovesTheDeadLink_WhateverItsE2EIdAndWithoutATemplate()
    {
        int advancedItemId, trailingSlashItemId, lookalikeItemId, renamedTemplateId;
        await using (var db = NewDbContext())
        {
            var securityGroup = new SecurityGroup { Name = "Example group" };
            db.SecurityGroups.Add(securityGroup);
            await db.SaveChangesAsync();

            // The shape a menu save leaves behind: the dead link under the "advanced" E2E id, no template.
            var advanced = new MenuItem
            {
                Name = "Reports",
                E2EId = "advanced",
                Link = DeadReportsMenuCleaner.Link,
                Type = MenuItemTypeEnum.Link,
                Translations = { new MenuItemTranslation { Name = "Reports", LocaleName = "en-US", Language = "English" } },
                MenuItemSecurityGroups = { new MenuItemSecurityGroup { SecurityGroup = securityGroup } }
            };
            var trailingSlash = new MenuItem
            {
                Name = "Reports",
                E2EId = "example-reports",
                Link = DeadReportsMenuCleaner.Link + "/",
                Type = MenuItemTypeEnum.Link
            };
            // A user's own entry whose link only starts like the dead one: it stays.
            var lookalike = new MenuItem
            {
                Name = "Example reports archive",
                E2EId = "advanced",
                Link = DeadReportsMenuCleaner.Link + "-archive",
                Type = MenuItemTypeEnum.Link,
                Translations =
                {
                    new MenuItemTranslation { Name = "Example reports archive", LocaleName = "en-US", Language = "English" }
                },
                MenuItemSecurityGroups = { new MenuItemSecurityGroup { SecurityGroup = securityGroup } }
            };
            // A template on the dead link under another E2E id goes too.
            var renamedTemplate = new MenuTemplate
            {
                Name = "Reports",
                E2EId = "example-reports-template",
                DefaultLink = DeadReportsMenuCleaner.Link,
                Translations =
                {
                    new MenuTemplateTranslation { Name = "Reports", LocaleName = "en-US", Language = "English" }
                }
            };
            db.MenuItems.AddRange(advanced, trailingSlash, lookalike);
            db.MenuTemplates.Add(renamedTemplate);
            await db.SaveChangesAsync();

            advancedItemId = advanced.Id;
            trailingSlashItemId = trailingSlash.Id;
            lookalikeItemId = lookalike.Id;
            renamedTemplateId = renamedTemplate.Id;
        }

        var before = await SnapshotAsync();

        new EformItemsPlanningPlugin().Configure(_appBuilder);

        var after = await SnapshotAsync();
        Assert.That(after, Is.EqualTo(before with
        {
            MenuItemIds = before.MenuItemIds.Where(x => x != advancedItemId && x != trailingSlashItemId).ToList(),
            MenuItemTranslations = before.MenuItemTranslations - 1,
            MenuItemSecurityGroups = before.MenuItemSecurityGroups - 1,
            MenuTemplates = before.MenuTemplates - 1,
            MenuTemplateTranslations = before.MenuTemplateTranslations - 1
        }).Using<Snapshot>(SameSnapshot));

        await using (var db = NewDbContext())
        {
            Assert.That(await db.MenuTemplates.AnyAsync(x => x.Id == renamedTemplateId), Is.False);
            var kept = await db.MenuItems.SingleAsync(x => x.Id == lookalikeItemId);
            Assert.That(kept.Link, Is.EqualTo(DeadReportsMenuCleaner.Link + "-archive"));
            Assert.That(kept.E2EId, Is.EqualTo("advanced"));
            Assert.That(await db.MenuItemTranslations.CountAsync(x => x.MenuItemId == lookalikeItemId),
                Is.EqualTo(1));
            Assert.That(await db.MenuItemSecurityGroups.CountAsync(x => x.MenuItemId == lookalikeItemId),
                Is.EqualTo(1));
        }

        new EformItemsPlanningPlugin().Configure(_appBuilder);

        Assert.That(await SnapshotAsync(), Is.EqualTo(after).Using<Snapshot>(SameSnapshot),
            "a second start changes nothing");
    }

    [Test]
    public void PluginStart_WithoutTheAngularDatabase_DoesNotThrow()
    {
        using var serviceProvider = new ServiceCollection().AddLogging().BuildServiceProvider();
        var appBuilder = Substitute.For<IApplicationBuilder>();
        appBuilder.ApplicationServices.Returns(serviceProvider);

        Assert.DoesNotThrow(() => new EformItemsPlanningPlugin().Configure(appBuilder));
    }

    private BaseDbContext NewDbContext() => new(_dbContextOptions);

    private record Snapshot(
        List<int> MenuItemIds,
        int MenuItemTranslations,
        int MenuItemSecurityGroups,
        int MenuTemplates,
        int MenuTemplateTranslations,
        int MenuTemplatePermissions,
        int SecurityGroups,
        int Permissions);

    private static bool SameSnapshot(Snapshot x, Snapshot y) =>
        x with { MenuItemIds = null } == y with { MenuItemIds = null }
        && x.MenuItemIds.SequenceEqual(y.MenuItemIds);

    private async Task<Snapshot> SnapshotAsync()
    {
        await using var db = NewDbContext();
        return new Snapshot(
            await db.MenuItems.OrderBy(x => x.Id).Select(x => x.Id).ToListAsync(),
            await db.MenuItemTranslations.CountAsync(),
            await db.MenuItemSecurityGroups.CountAsync(),
            await db.MenuTemplates.CountAsync(),
            await db.MenuTemplateTranslations.CountAsync(),
            await db.MenuTemplatePermissions.CountAsync(),
            await db.SecurityGroups.CountAsync(),
            await db.Permissions.CountAsync());
    }

    private static MenuItem AddLinkWithTemplate(BaseDbContext db, MenuItem parent, SecurityGroup securityGroup,
        string name, string e2eId, string link)
    {
        var permissionType = new PermissionType { Name = $"{name} permissions" };
        var template = new MenuTemplate
        {
            Name = name,
            E2EId = e2eId,
            DefaultLink = link,
            Translations = { new MenuTemplateTranslation { Name = name, LocaleName = "en-US", Language = "English" } },
            MenuTemplatePermissions =
            {
                new MenuTemplatePermission
                {
                    Permission = new Permission
                    {
                        PermissionName = $"Obtain {name}",
                        ClaimName = $"{e2eId}_claim",
                        PermissionType = permissionType
                    }
                }
            }
        };
        var item = new MenuItem
        {
            Name = name,
            E2EId = e2eId,
            Link = link,
            Type = MenuItemTypeEnum.Link,
            Parent = parent,
            MenuTemplate = template,
            Translations = { new MenuItemTranslation { Name = name, LocaleName = "en-US", Language = "English" } },
            MenuItemSecurityGroups = { new MenuItemSecurityGroup { SecurityGroup = securityGroup } }
        };
        db.MenuItems.Add(item);
        return item;
    }
}
