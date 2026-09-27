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

using System.Linq;
using System.Threading.Tasks;
using ItemsPlanning.Pn.Services.ItemsPlanningLocalizationService;
using ItemsPlanning.Pn.Services.ItemsPlanningTagsService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microting.eFormApi.BasePn.Abstractions;
using Microting.ItemsPlanningBase.Infrastructure.Data;
using Microting.ItemsPlanningBase.Infrastructure.Data.Entities;
using NSubstitute;
using NUnit.Framework;
using Testcontainers.MariaDb;

/// <summary>
/// GetItemsPlanningTags must list tags in Danish order (#2126). Runs against a real
/// MariaDB so the test also fails if the sort ever moves back into SQL, where the
/// column collation (utf8mb4_general_ci) folds Å to A.
/// </summary>
[TestFixture]
public class ItemsPlanningTagsServiceOrderTests
{
    private readonly MariaDbContainer _mariaDbContainer = new MariaDbBuilder("mariadb:11.2")
        .WithDatabase("items-planning-tags-order")
        .WithPassword("secretpassword")
        .Build();

    private ItemsPlanningPnDbContext _dbContext;

    [OneTimeSetUp]
    public async Task OneTimeSetUp()
    {
        await _mariaDbContainer.StartAsync();

        var connectionString = _mariaDbContainer.GetConnectionString();
        var options = new DbContextOptionsBuilder<ItemsPlanningPnDbContext>()
            .UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
            .Options;

        _dbContext = new ItemsPlanningPnDbContext(options);
        await _dbContext.Database.EnsureCreatedAsync();
    }

    [OneTimeTearDown]
    public async Task OneTimeTearDown()
    {
        await _dbContext.DisposeAsync();
        await _mariaDbContainer.DisposeAsync();
    }

    [Test]
    public async Task GetItemsPlanningTags_ReturnsTagsInDanishOrder()
    {
        foreach (var name in new[] { "Øko", "Beta", "Åben", "Alfa", "Æble" })
        {
            await new PlanningTag { Name = name }.Create(_dbContext);
        }

        var service = new ItemsPlanningTagsService(
            Substitute.For<IItemsPlanningLocalizationService>(),
            NullLogger<ItemsPlanningTagsService>.Instance,
            _dbContext,
            Substitute.For<IUserService>());

        var result = await service.GetItemsPlanningTags();

        Assert.That(result.Success, Is.True);
        Assert.That(result.Model.Select(x => x.Name),
            Is.EqualTo(new[] { "Alfa", "Beta", "Æble", "Øko", "Åben" }));
    }
}
