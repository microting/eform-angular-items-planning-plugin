# Change directory to the user's home
Set-Location $HOME

# Remove the directory (if it exists) and its contents
Remove-Item -Recurse -Force "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\src\app\plugins\modules\items-planning-pn"

# Copy the directory and its contents
Copy-Item -Recurse -Force "Documents\workspace\microting\eform-angular-frontend\eform-client\src\app\plugins\modules\items-planning-pn" "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\src\app\plugins\modules\items-planning-pn"

# Remove the directory (if it exists) and its contents
Remove-Item -Recurse -Force "Documents\workspace\microting\eform-angular-items-planning-plugin\eFormAPI\Plugins\ItemsPlanning.Pn"

# Copy the directory and its contents
Copy-Item -Recurse -Force "Documents\workspace\microting\eform-angular-frontend\eFormAPI\Plugins\ItemsPlanning.Pn" "Documents\workspace\microting\eform-angular-items-planning-plugin\eFormAPI\Plugins\ItemsPlanning.Pn"

# Remove the specified test files and directories
Remove-Item -Recurse -Force "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\e2e\Tests\items-planning-settings"
Remove-Item -Recurse -Force "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\e2e\Tests\items-planning-general"
Remove-Item -Force "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\wdio-headless-plugin-step2.conf.ts"
Remove-Item -Recurse -Force "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\e2e\Page objects\ItemsPlanning"
Remove-Item -Recurse -Force "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\e2e\Assets"
Remove-Item -Recurse -Force "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\cypress\e2e\plugins\items-planning-pn"

# Copy the specified test files and directories
Copy-Item -Recurse -Force "Documents\workspace\microting\eform-angular-frontend\eform-client\e2e\Tests\items-planning-settings" "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\e2e\Tests\items-planning-settings"
Copy-Item -Recurse -Force "Documents\workspace\microting\eform-angular-frontend\eform-client\e2e\Tests\items-planning-general" "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\e2e\Tests\items-planning-general"
Copy-Item -Recurse -Force "Documents\workspace\microting\eform-angular-frontend\eform-client\e2e\Page objects\ItemsPlanning" "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\e2e\Page objects\ItemsPlanning"
Copy-Item -Recurse -Force "Documents\workspace\microting\eform-angular-frontend\eform-client\e2e\Assets" "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\e2e\Assets"
Copy-Item -Force "Documents\workspace\microting\eform-angular-frontend\eform-client\wdio-headless-plugin-step2a.conf.ts" "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\wdio-headless-plugin-step2a.conf.ts"
Copy-Item -Force "Documents\workspace\microting\eform-angular-frontend\eform-client\wdio-headless-plugin-step2b.conf.ts" "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\wdio-headless-plugin-step2b.conf.ts"
Copy-Item -Force "Documents\workspace\microting\eform-angular-frontend\eform-client\wdio-headless-plugin-step2c.conf.ts" "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\wdio-headless-plugin-step2c.conf.ts"
Copy-Item -Recurse -Force "Documents\workspace\microting\eform-angular-frontend\eform-client\cypress\e2e\plugins\items-planning-pn" "Documents\workspace\microting\eform-angular-items-planning-plugin\eform-client\cypress\e2e\plugins\items-planning-pn"
