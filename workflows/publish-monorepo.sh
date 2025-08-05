#!/bin/bash

set -o nounset
set -o pipefail
set -o errexit

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

fail_if_unset () {
  local var_name="$1"
  if [[ -z "${!var_name:-""}" ]]; then
    printf '%s not set\n' "$var_name" >&2
    exit 1
  fi
}

package_exists () {
  npm view --json "$1" &>/dev/null;
}

fail_if_unset NODE_AUTH_TOKEN

git_username="GitHub Actions"
git_useremail="GitHub-Actions@cow.fi"

# Function to determine the package path based on the name
get_package_path() {
  local package_name=$1

  # List of providers that are in packages/providers/
  local providers=("ether-v5-adapter" "ether-v6-adapter" "viem-adapter")

  # Check if it's a provider
  for provider in "${providers[@]}"; do
    if [ "$package_name" = "$provider" ]; then
      echo "packages/providers/${package_name}"
      return 0
    fi
  done

  # For other packages, use packages/
  echo "packages/${package_name}"
}

# Function to get the package name for display
get_package_display_name() {
  local package_name=$1

  case $package_name in
    "sdk")
      echo "@cowprotocol/cow-sdk"
      ;;
    "ether-v5-adapter")
      echo "@cowprotocol/sdk-ethers-v5-adapter"
      ;;
    "ether-v6-adapter")
      echo "@cowprotocol/sdk-ethers-v6-adapter"
      ;;
    "viem-adapter")
      echo "@cowprotocol/sdk-viem-adapter"
      ;;
    *)
      echo "@cowprotocol/sdk-${package_name}"
      ;;
  esac
}

# Correct order based on dependencies (same as yalc script)
packages_in_order=(
  "common"                 # Base - no dependencies
  "config"                 # Base - no dependencies
  "ether-v5-adapter"      # Adapter - depends on common
  "ether-v6-adapter"      # Adapter - depends on common
  "viem-adapter"           # Adapter - depends on common
  "contracts-ts"           # Depends on common and adapters
  "subgraph"               # Depends on common and config
  "order-book"             # Depends on common and config
  "app-data"               # Depends on common
  "order-signing"          # Depends on common, config, contracts-ts, order-book
  "cow-shed"               # Depends on common, config, contracts-ts
  "trading"                # Depends on vários
  "composable"             # Depends on vários
  "bridging"               # Depends on common
  "weiroll"                # Depends on common
  "sdk"                    # Umbrella - last
)

# Function to detect which packages have new versions by comparing package.json versions
# with the expected versions in .release-please-manifest.json
# This allows us to publish only packages that have been updated by Release-Please
detect_changed_packages() {
  local changed_packages=()

  # Read the current manifest to get expected versions from Release-Please
  if [ ! -f ".release-please-manifest.json" ]; then
    echo -e "${RED}❌ .release-please-manifest.json not found${NC}"
    exit 1
  fi

  echo -e "${BLUE}🔍 Detecting packages with new versions...${NC}"

  # Iterate through all packages in dependency order
  for package in "${packages_in_order[@]}"; do
    package_path=$(get_package_path "$package")

    if [ -d "$package_path" ] && [ -f "$package_path/package.json" ]; then
      # Get current version from package.json (what's actually in the file)
      current_version=$(jq --raw-output .version "$package_path/package.json")

      # Get expected version from manifest (what Release-Please updated it to)
      manifest_key="packages/$package"
      expected_version=$(jq --raw-output ".[\"$manifest_key\"]" .release-please-manifest.json)

      # Compare versions to detect changes
      if [ "$current_version" != "$expected_version" ]; then
        echo -e "${GREEN}✅ Package $package has new version: $expected_version (current: $current_version)${NC}"
        changed_packages+=("$package")
      else
        echo -e "${BLUE}📦 Package $package unchanged: $current_version${NC}"
      fi
    fi
  done

  # Return space-separated list of changed packages
  echo "${changed_packages[*]}"
}

# Check if we are in the correct directory
if [ ! -d "packages/sdk" ]; then
  echo -e "${RED}❌ This script must be run from the cow-sdk project root${NC}"
  exit 1
fi

# Get version from root package.json or use git tag
if [ -f "package.json" ]; then
  version="$(jq --raw-output .version ./package.json)"
else
  # Try to get version from git tag
  version_tag="$(git describe --tags --abbrev=0 2>/dev/null || echo '')"
  if [[ -n "$version_tag" ]]; then
    version="${version_tag#v}"
  else
    echo -e "${RED}❌ No version found in package.json or git tags${NC}"
    exit 1
  fi
fi

echo -e "${BLUE}📦 Publishing cow-sdk monorepo packages version: ${version}${NC}"

# Save root directory
ROOT_DIR="$(pwd)"

# Detect which packages have new versions by comparing with Release-Please manifest
# This ensures we only publish packages that have been updated by Release-Please
changed_packages=$(detect_changed_packages)

# Determine which packages to publish based on detected changes
if [ -z "$changed_packages" ]; then
  echo -e "${YELLOW}⚠️  No packages with new versions detected. Publishing all packages...${NC}"
  packages_to_publish=("${packages_in_order[@]}")
else
  echo -e "${GREEN}📦 Packages with new versions: $changed_packages${NC}"
  # Convert space-separated string to array for processing
  IFS=' ' read -ra packages_to_publish <<< "$changed_packages"
fi

# Track published packages for umbrella package
published_packages=()

# Publish each package in order (only changed ones)
for package in "${packages_to_publish[@]}"; do
  package_path=$(get_package_path "$package")
  display_name=$(get_package_display_name "$package")

  if [ -d "$package_path" ]; then
    echo ""
    echo -e "${BLUE}📤 Publishing ${display_name}...${NC}"

    # Navigate to the package directory
    cd "$ROOT_DIR/$package_path"

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
      echo -e "${YELLOW}⚠️  No package.json found in ${package_path}, skipping...${NC}"
      cd "$ROOT_DIR"
      continue
    fi

    # Get package name and version
    package_name="$(jq --raw-output .name ./package.json)"
    package_version="$(jq --raw-output .version ./package.json)"

    # Check if package is private
    if jq -e '.private == true' package.json >/dev/null 2>&1; then
      echo -e "${YELLOW}⚠️  Package ${display_name} is private, skipping...${NC}"
      cd "$ROOT_DIR"
      continue
    fi

    # Publish to npm
    if [[ "$package_version" == *"RC"* ]] || [[ "$package_version" == *"alpha"* ]] || [[ "$package_version" == *"monorepo"* ]]; then
      echo -e "${BLUE}Publishing as pre-release...${NC}"
      npm publish --access public --tag next
    else
      npm publish --access public
    fi

    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ ${display_name} published successfully${NC}"
      published_packages+=("$package_name@$package_version")
    else
      echo -e "${RED}❌ Failed to publish ${display_name}${NC}"
      echo -e "${YELLOW}Continuing with next package...${NC}"
    fi

    # Go back to the root directory
    cd "$ROOT_DIR"
  else
    echo -e "${YELLOW}⚠️  Package ${package} not found at ${package_path}, skipping...${NC}"
  fi
done

# Now handle the umbrella package (sdk) - update dependencies and publish
echo ""
echo -e "${BLUE}🔄 Updating umbrella package dependencies...${NC}"

cd "$ROOT_DIR/packages/sdk"

  # Update workspace dependencies to published versions
  for published_pkg in "${published_packages[@]}"; do
    package_name=$(echo "$published_pkg" | cut -d'@' -f1)
    package_version=$(echo "$published_pkg" | cut -d'@' -f2)

    # Update dependency in package.json
    if jq -e ".dependencies[\"$package_name\"]" package.json >/dev/null 2>&1; then
      echo -e "${BLUE}Updating $package_name to version $package_version${NC}"
      jq ".dependencies[\"$package_name\"] = \"^$package_version\"" package.json > package.json.tmp && mv package.json.tmp package.json
    fi
  done

  # Rebuild the umbrella package with updated dependencies
  echo -e "${BLUE}🔨 Rebuilding umbrella package...${NC}"
  pnpm build

  # Publish umbrella package
  echo -e "${BLUE}📤 Publishing umbrella package ${umbrella_name}...${NC}"

    if [[ "$umbrella_version" == *"RC"* ]] || [[ "$umbrella_version" == *"alpha"* ]] || [[ "$umbrella_version" == *"beta"* ]] || [[ "$umbrella_version" == *"monorepo"* ]]; then
      echo -e "${BLUE}Publishing as pre-release...${NC}"
      npm publish --access public --tag next
    else
      npm publish --access public
    fi

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ${umbrella_name} published successfully${NC}"
  else
    echo -e "${RED}❌ Failed to publish ${umbrella_name}${NC}"
    exit 1
  fi

cd "$ROOT_DIR"

echo ""
echo -e "${GREEN}🎉 All packages published successfully!${NC}"
echo -e "${BLUE}📋 Published packages:${NC}"
for pkg in "${published_packages[@]}"; do
  echo -e "  ${GREEN}✅ $pkg${NC}"
done
