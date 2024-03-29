/*
The MIT License (MIT)

Copyright (c) 2007 - 2021 Microting A/S

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

using System;
using System.Text.RegularExpressions;
using Microting.eForm.Dto;

namespace ItemsPlanning.Pn.Services.RebusService
{
    using System.Threading.Tasks;
    using Castle.MicroKernel.Registration;
    using Castle.Windsor;
    using eFormCore;
    using Installers;
    using Microting.eFormApi.BasePn.Abstractions;
    using Microting.ItemsPlanningBase.Infrastructure.Data;
    using Microting.ItemsPlanningBase.Infrastructure.Data.Factories;
    using Rebus.Bus;

    public class RebusService : IRebusService
    {
        private IBus _bus;
        private IWindsorContainer _container;
        private string _connectionString;
        private readonly IEFormCoreService _coreHelper;

        public RebusService(IEFormCoreService coreHelper)
        {
            //_dbContext = dbContext;
            _coreHelper = coreHelper;
        }

        public async Task Start(string connectionString)
        {
            Core core = await _coreHelper.GetCore();
            _connectionString = connectionString;
            var dbPrefix = Regex.Match(_connectionString, @"Database=(\d*)_").Groups[1].Value;
            var rabbitmqHost = core.GetSdkSetting(Settings.rabbitMqHost).GetAwaiter().GetResult();
            Console.WriteLine($"rabbitmqHost: {rabbitmqHost}");
            var rabbitMqUser = core.GetSdkSetting(Settings.rabbitMqUser).GetAwaiter().GetResult();
            Console.WriteLine($"rabbitMqUser: {rabbitMqUser}");
            var rabbitMqPassword = core.GetSdkSetting(Settings.rabbitMqPassword).GetAwaiter().GetResult();
            Console.WriteLine($"rabbitMqPassword: {rabbitMqPassword}");

            _container = new WindsorContainer();
            _container.Install(
                new RebusHandlerInstaller()
                , new RebusInstaller(dbPrefix, connectionString, 1, 1, rabbitMqUser, rabbitMqPassword, rabbitmqHost)
            );

            _container.Register(Component.For<Core>().Instance(core));
            _container.Register(Component.For<ItemsPlanningPnDbContext>().Instance(GetContext()));
            _bus = _container.Resolve<IBus>();
        }

        public IBus GetBus()
        {
            return _bus;
        }
        private ItemsPlanningPnDbContext GetContext()
        {
            ItemsPlanningPnContextFactory contextFactory = new ItemsPlanningPnContextFactory();
            return contextFactory.CreateDbContext(new[] {_connectionString});
        }
    }
}