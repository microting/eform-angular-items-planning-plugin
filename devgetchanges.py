import shutil
import os

# Change directory to the user's home directory
os.chdir(os.path.expanduser("~"))

# Define paths
src_base = "Documents/workspace/microting/eform-angular-frontend"
dst_base = "Documents/workspace/microting/eform-angular-items-planning-plugin"

# List of files and directories to remove
remove_paths = [
    "eform-client/e2e/Tests/items-planning-settings/",
    "eform-client/e2e/Tests/items-planning-general/",
    "eform-client/wdio-headless-plugin-step2.conf.ts",
    "eform-client/e2e/Page objects/ItemsPlanning",
    "eform-client/e2e/Assets",
    "eform-client/cypress/e2e/plugins/items-planning-pn",
]

# List of files and directories to copy
copy_paths = [
    ("eform-client/e2e/Tests/items-planning-settings", "eform-client/e2e/Tests/items-planning-settings"),
    ("eform-client/e2e/Tests/items-planning-general", "eform-client/e2e/Tests/items-planning-general"),
    ("eform-client/e2e/Page objects/ItemsPlanning", "eform-client/e2e/Page objects/ItemsPlanning"),
    ("eform-client/e2e/Assets", "eform-client/e2e/Assets"),
    ("eform-client/wdio-headless-plugin-step2a.conf.ts", "eform-client/wdio-headless-plugin-step2a.conf.ts"),
    ("eform-client/wdio-headless-plugin-step2b.conf.ts", "eform-client/wdio-headless-plugin-step2b.conf.ts"),
    ("eform-client/wdio-headless-plugin-step2c.conf.ts", "eform-client/wdio-headless-plugin-step2c.conf.ts"),
    ("eform-client/cypress/e2e/plugins/items-planning-pn", "eform-client/cypress/e2e/plugins/items-planning-pn"),
]

# Remove the destination paths if they exist
for path in remove_paths:
    full_path = os.path.join(dst_base, path)
    if os.path.exists(full_path):
        if os.path.isdir(full_path):
            shutil.rmtree(full_path)
        else:
            os.remove(full_path)

# Copy the source directories to the destination
for src, dst in copy_paths:
    src_path = os.path.join(src_base, src)
    dst_path = os.path.join(dst_base, dst)

    # Ensure the destination directory exists
    if os.path.isdir(src_path):
        shutil.copytree(src_path, dst_path)
    else:
        shutil.copy2(src_path, dst_path)
