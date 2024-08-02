# Path to the file to be modified
$filePath = "src/app/plugins/plugins.routing.ts"

# Read the content of the file
$content = Get-Content $filePath

# Modify the content by inserting the lines in the appropriate places
$content = $content -replace 'INSERT ROUTES HERE', "INSERT ROUTES HERE`n  },"
$content = $content -replace 'INSERT ROUTES HERE', "INSERT ROUTES HERE`n      .then(m => m.ItemsPlanningPnModule)"
$content = $content -replace 'INSERT ROUTES HERE', "INSERT ROUTES HERE`n    loadChildren: () => import('./modules/items-planning-pn/items-planning-pn.module')"
$content = $content -replace 'INSERT ROUTES HERE', "INSERT ROUTES HERE`n    path: 'items-planning-pn',"
$content = $content -replace 'INSERT ROUTES HERE', "INSERT ROUTES HERE`n  {"

# Write the modified content back to the file
Set-Content $filePath -Value $content
