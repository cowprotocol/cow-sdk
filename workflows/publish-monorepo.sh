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

version_exists () {
  local package_name="$1"
  local version="$2"
  if package_exists "$package_name"; then
    npm view --json "$package_name" | jq -e ".versions | has(\"$version\")" >/dev/null 2>&1
  else
    return 1
  fi
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

# Verify git tag exists
version_tag="v$version"
# if ! git fetch --end-of-options origin "refs/tags/$version_tag" 2>/dev/null; then
#   echo -e "${RED}❌ Tag $version_tag is not created. Create the Release first.${NC}"
#   exit 1
# fi

latest_tag="$(git describe --tags --abbrev=0)"
if ! [ "$version_tag" = "$latest_tag" ]; then
  echo -e "${RED}❌ Latest tag $latest_tag version doesn't match package.json version $version${NC}"
  exit 1
fi

# Save root directory
ROOT_DIR="$(pwd)"

# Track published packages for umbrella package
published_packages=()

# Publish each package in order
for package in "${packages_in_order[@]}"; do
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

    # Check if version already exists
    if version_exists "$package_name" "$package_version"; then
      echo -e "${YELLOW}⚠️  Version $package_version of $package_name already published, skipping...${NC}"
      published_packages+=("$package_name@$package_version")
      cd "$ROOT_DIR"
      continue
    fi

    # Publish to npm
    if [[ "$version_tag" == *"RC"* ]] || [[ "$package_version" == *"RC"* ]] || [[ "$package_version" == *"alpha"* ]] || [[ "$package_version" == *"beta"* ]]; then
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
umbrella_name="$(jq --raw-output .name ./package.json)"
umbrella_version="$(jq --raw-output .version ./package.json)"

if version_exists "$umbrella_name" "$umbrella_version"; then
  echo -e "${YELLOW}⚠️  Version $umbrella_version of $umbrella_name already published, skipping...${NC}"
else
  echo -e "${BLUE}📤 Publishing umbrella package ${umbrella_name}...${NC}"

  if [[ "$version_tag" == *"RC"* ]] || [[ "$umbrella_version" == *"RC"* ]] || [[ "$umbrella_version" == *"alpha"* ]] || [[ "$umbrella_version" == *"beta"* ]]; then
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
fi

cd "$ROOT_DIR"

echo ""
echo -e "${GREEN}🎉 All packages published successfully!${NC}"
echo -e "${BLUE}📋 Published packages:${NC}"
for pkg in "${published_packages[@]}"; do
  echo -e "  ${GREEN}✅ $pkg${NC}"
done
