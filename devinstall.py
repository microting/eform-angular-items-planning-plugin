import os
import shutil

# Change directory to the user's home directory
os.chdir(os.path.expanduser("~"))

# Print the current working directory
print(os.getcwd())

# Define paths
src_base = "Documents/workspace/microting/eform-angular-items-planning-plugin"
dst_base = "Documents/workspace/microting/eform-angular-frontend"

# Remove and copy directories
paths = [
    ("eform-client/src/app/plugins/modules/items-planning-pn", "eform-client/src/app/plugins/modules/items-planning-pn"),
    ("eFormAPI/Plugins/ItemsPlanning.Pn", "eFormAPI/Plugins/ItemsPlanning.Pn"),
]

# Removing and copying files
for dst_rel_path, src_rel_path in paths:
    dst_path = os.path.join(dst_base, dst_rel_path)
    src_path = os.path.join(src_base, src_rel_path)

    # Remove the destination directory if it exists
    if os.path.exists(dst_path):
        shutil.rmtree(dst_path)

    # Copy the source directory to the destination
    shutil.copytree(src_path, dst_path)

# Ensure the Plugins directory exists
plugins_dir = os.path.join(dst_base, "eFormAPI/Plugins")
os.makedirs(plugins_dir, exist_ok=True)

# List of test files and directories to remove
test_files_to_remove = [
    "eform-client/e2e/Tests/items-planning-settings",
    "eform-client/e2e/Tests/items-planning-general",
    "eform-client/e2e/Page objects/ItemsPlanning",
    "eform-client/e2e/Assets",
    "eform-client/wdio-plugin-step2.conf.ts",
    "eform-client/cypress/e2e/plugins/items-planning-pn"
]

# Remove the test files and directories
for rel_path in test_files_to_remove:
    full_path = os.path.join(dst_base, rel_path)
    if os.path.exists(full_path):
        if os.path.isdir(full_path):
            shutil.rmtree(full_path)
        else:
            os.remove(full_path)

# Ensure the plugins directory exists within the Cypress structure
cypress_plugins_dir = os.path.join(dst_base, "eform-client/cypress/e2e/plugins")
os.makedirs(cypress_plugins_dir, exist_ok=True)

# List of test files and directories to copy
test_files_to_copy = [
    ("eform-client/e2e/Tests/items-planning-settings", "eform-client/e2e/Tests/items-planning-settings"),
    ("eform-client/e2e/Tests/items-planning-general", "eform-client/e2e/Tests/items-planning-general"),
    ("eform-client/e2e/Page objects/ItemsPlanning", "eform-client/e2e/Page objects/ItemsPlanning"),
    ("eform-client/e2e/Assets", "eform-client/e2e/Assets"),
    ("eform-client/wdio-headless-plugin-step2a.conf.ts", "eform-client/wdio-headless-plugin-step2a.conf.ts"),
    ("eform-client/wdio-headless-plugin-step2b.conf.ts", "eform-client/wdio-headless-plugin-step2b.conf.ts"),
    ("eform-client/wdio-headless-plugin-step2c.conf.ts", "eform-client/wdio-headless-plugin-step2c.conf.ts"),
    ("eform-client/cypress/e2e/plugins/items-planning-pn", "eform-client/cypress/e2e/plugins/items-planning-pn"),
]

# Copy the test files and directories
for src_rel_path, dst_rel_path in test_files_to_copy:
    src_path = os.path.join(src_base, src_rel_path)
    dst_path = os.path.join(dst_base, dst_rel_path)

    # Copy the source directory to the destination
    if os.path.isdir(src_path):
        shutil.copytree(src_path, dst_path)
    else:
        shutil.copy2(src_path, dst_path)
