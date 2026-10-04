using System;
using System.Linq;
using ItemsPlanning.Pn.Infrastructure.Helpers;
using ItemsPlanning.Pn.Services.ItemsPlanningLocalizationService;
using NSubstitute;
using NUnit.Framework;

namespace ItemsPlanning.Pn.Test
{
    /// <summary>
    /// The "reports" route was removed from the Angular module, so a menu entry linking to it matches no route
    /// and the frontend's catch-all silently redirects to "My eForms" (#2136). The plugin must no longer offer it.
    /// </summary>
    [TestFixture]
    public class NavigationMenuTests
    {
        [Test]
        public void GetNavigationMenu_DoesNotOfferTheRemovedReportsPage()
        {
            var menu = new EformItemsPlanningPlugin().GetNavigationMenu(Substitute.For<IServiceProvider>());

            var items = menu.Concat(menu.SelectMany(x => x.ChildItems)).ToList();

            Assert.That(items.Select(x => x.Link), Has.None.EqualTo(DeadReportsMenuCleaner.Link));
            Assert.That(items.Where(x => x.MenuTemplate != null).Select(x => x.MenuTemplate.DefaultLink),
                Has.None.EqualTo(DeadReportsMenuCleaner.Link));
            Assert.That(items.Select(x => x.E2EId), Has.None.EqualTo(DeadReportsMenuCleaner.E2EId));
        }

        [Test]
        public void HeaderMenu_DoesNotOfferTheRemovedReportsPage()
        {
            var localizationService = Substitute.For<IItemsPlanningLocalizationService>();
            localizationService.GetString(Arg.Any<string>()).Returns(x => x.Arg<string>());
            var serviceProvider = Substitute.For<IServiceProvider>();
            serviceProvider.GetService(typeof(IItemsPlanningLocalizationService)).Returns(localizationService);

            var menu = new EformItemsPlanningPlugin().HeaderMenu(serviceProvider);

            var links = menu.LeftMenu.SelectMany(x => x.MenuItems).Select(x => x.Link).ToList();
            Assert.That(links, Has.None.EqualTo(DeadReportsMenuCleaner.Link));
            Assert.That(links, Does.Contain("/plugins/items-planning-pn/plannings"));
        }
    }
}
