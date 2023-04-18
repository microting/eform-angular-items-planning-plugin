#!/bin/bash

cd ~

rm -fR Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/src/app/plugins/modules/items-planning-pn

cp -a Documents/workspace/microting/eform-angular-frontend/eform-client/src/app/plugins/modules/items-planning-pn Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/src/app/plugins/modules/items-planning-pn

rm -fR Documents/workspace/microting/eform-angular-items-planning-plugin/eFormAPI/Plugins/ItemsPlanning.Pn

cp -a Documents/workspace/microting/eform-angular-frontend/eFormAPI/Plugins/ItemsPlanning.Pn Documents/workspace/microting/eform-angular-items-planning-plugin/eFormAPI/Plugins/ItemsPlanning.Pn

# Test files rm
rm -fR Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/e2e/Tests/items-planning-settings/
rm -fR Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/e2e/Tests/items-planning-general/
rm -fR Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/wdio-headless-plugin-step2.conf.ts
rm -fR Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/e2e/Page\ objects/ItemsPlanning
rm -fR Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/e2e/Assets
rm -fR Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/cypress/e2e/plugins/items-planning-pn

# Test files cp
cp -a Documents/workspace/microting/eform-angular-frontend/eform-client/e2e/Tests/items-planning-settings Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/e2e/Tests/items-planning-settings
cp -a Documents/workspace/microting/eform-angular-frontend/eform-client/e2e/Tests/items-planning-general Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/e2e/Tests/items-planning-general
cp -a Documents/workspace/microting/eform-angular-frontend/eform-client/e2e/Page\ objects/ItemsPlanning Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/e2e/Page\ objects/ItemsPlanning
cp -a Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/e2e/Assets Documents/workspace/microting/eform-angular-frontend/eform-client/e2e/Assets
cp -a Documents/workspace/microting/eform-angular-frontend/eform-client/wdio-headless-plugin-step2a.conf.ts Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/wdio-headless-plugin-step2a.conf.ts
cp -a Documents/workspace/microting/eform-angular-frontend/eform-client/wdio-headless-plugin-step2b.conf.ts Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/wdio-headless-plugin-step2b.conf.ts
cp -a Documents/workspace/microting/eform-angular-frontend/eform-client/wdio-headless-plugin-step2c.conf.ts Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/wdio-headless-plugin-step2c.conf.ts
cp -a Documents/workspace/microting/eform-angular-frontend/eform-client/cypress/e2e/plugins/items-planning-pn Documents/workspace/microting/eform-angular-items-planning-plugin/eform-client/cypress/e2e/plugins/items-planning-pn