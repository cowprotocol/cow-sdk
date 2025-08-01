#!/bin/bash

set -o nounset
set -o pipefail
set -o errexit

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 COW-SDK MONOREPO PUBLICATION TEST${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "${YELLOW}This is a DRY RUN test - no packages will be published${NC}"
echo ""

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
  echo -e "${RED}❌ ERROR: This script must be run from the cow-sdk project root${NC}"
  echo -e "${YELLOW}💡 Run: cd /path/to/cow-sdk && bash workflows/test-publish-monorepo.sh${NC}"
  exit 1
fi

# Save root directory
ROOT_DIR="$(pwd)"

# Track packages that would be published
packages_to_publish=()
packages_with_issues=()

echo -e "${BLUE}📋 CHECKING PACKAGES FOR PUBLICATION:${NC}"
echo ""

# Check each package in order
for i in "${!packages_in_order[@]}"; do
  package="${packages_in_order[$i]}"
  package_path=$(get_package_path "$package")
  display_name=$(get_package_display_name "$package")
  order_num=$((i + 1))

  echo -e "${PURPLE}[${order_num}/${#packages_in_order[@]}]${NC} Checking ${display_name}..."

  if [ -d "$package_path" ]; then
    cd "$ROOT_DIR/$package_path"

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
      echo -e "  ${RED}❌ ERROR: No package.json found in ${package_path}${NC}"
      packages_with_issues+=("$display_name (no package.json)")
      cd "$ROOT_DIR"
      continue
    fi

    # Get package name and version
    package_name="$(jq --raw-output .name ./package.json)"
    package_version="$(jq --raw-output .version ./package.json)"

    # Check if package is private
    if jq -e '.private == true' package.json >/dev/null 2>&1; then
      echo -e "  ${YELLOW}⚠️  SKIP: ${display_name} (private package)${NC}"
      cd "$ROOT_DIR"
      continue
    fi

    # Check if dist folder exists
    if [ ! -d "dist" ]; then
      echo -e "  ${RED}❌ ERROR: ${display_name} - no dist folder found (needs build)${NC}"
      packages_with_issues+=("$display_name (no dist folder)")
      cd "$ROOT_DIR"
      continue
    fi

    # Check if dist folder has content
    if [ ! "$(ls -A dist)" ]; then
      echo -e "  ${RED}❌ ERROR: ${display_name} - dist folder is empty${NC}"
      packages_with_issues+=("$display_name (empty dist folder)")
      cd "$ROOT_DIR"
      continue
    fi

    echo -e "  ${GREEN}✅ OK: ${display_name}@${package_version} - ready to publish${NC}"
    packages_to_publish+=("$package_name@$package_version")

    cd "$ROOT_DIR"
  else
    echo -e "  ${YELLOW}⚠️  SKIP: Package ${package} not found at ${package_path}${NC}"
  fi
done

echo ""
echo -e "${BLUE}🔄 UMBRELLA PACKAGE ANALYSIS:${NC}"

cd "$ROOT_DIR/packages/sdk"

# Check umbrella package
umbrella_name="$(jq --raw-output .name ./package.json)"
umbrella_version="$(jq --raw-output .version ./package.json)"

echo -e "${BLUE}📦 Umbrella package: ${umbrella_name}@${umbrella_version}${NC}"

# Check if umbrella package has dist folder
if [ ! -d "dist" ]; then
  echo -e "  ${RED}❌ ERROR: Umbrella package has no dist folder${NC}"
  packages_with_issues+=("$umbrella_name (no dist folder)")
else
  echo -e "  ${GREEN}✅ OK: Umbrella package has dist folder${NC}"
fi

# Check workspace dependencies
workspace_deps=$(jq -r '.dependencies | to_entries[] | select(.value | startswith("workspace:")) | .key' package.json | wc -l)
echo -e "${BLUE}📋 Workspace dependencies found: ${workspace_deps}${NC}"

if [ "$workspace_deps" -gt 0 ]; then
  echo -e "${BLUE}📋 Current workspace dependencies:${NC}"
  jq -r '.dependencies | to_entries[] | select(.value | startswith("workspace:")) | "  " + .key + ": " + .value' package.json
fi

echo ""
echo -e "${BLUE}🔄 DEPENDENCIES THAT WOULD BE UPDATED:${NC}"
dependencies_to_update=0
for pkg in "${packages_to_publish[@]}"; do
  package_name=$(echo "$pkg" | cut -d'@' -f1)
  package_version=$(echo "$pkg" | cut -d'@' -f2)

  if jq -e ".dependencies[\"$package_name\"]" package.json >/dev/null 2>&1; then
    current_version=$(jq -r ".dependencies[\"$package_name\"]" package.json)
    echo -e "  ${GREEN}✅ $package_name: $current_version → ^$package_version${NC}"
    dependencies_to_update=$((dependencies_to_update + 1))
  fi
done

cd "$ROOT_DIR"

echo ""
echo -e "${BLUE}📊 TEST SUMMARY:${NC}"
echo -e "  ${GREEN}✅ ${#packages_to_publish[@]} packages ready to publish${NC}"
echo -e "  ${BLUE}📦 1 umbrella package ready to publish${NC}"
echo -e "  ${PURPLE}🔄 $dependencies_to_update dependencies would be updated${NC}"

if [ ${#packages_with_issues[@]} -gt 0 ]; then
  echo -e "  ${RED}❌ ${#packages_with_issues[@]} packages with issues:${NC}"
  for issue in "${packages_with_issues[@]}"; do
    echo -e "    ${RED}• $issue${NC}"
  done
  echo ""
  echo -e "${YELLOW}💡 FIX THE ISSUES ABOVE BEFORE PUBLISHING${NC}"
  echo -e "${YELLOW}💡 Run: pnpm build${NC}"
else
  echo -e "  ${GREEN}🎉 All packages are ready for publication!${NC}"
fi

echo ""
echo -e "${BLUE}📋 NEXT STEPS:${NC}"
echo -e "  1. ${YELLOW}If there are issues:${NC} Run 'pnpm build' and test again"
echo -e "  2. ${YELLOW}To publish:${NC} Run 'bash workflows/publish-monorepo.sh'"
echo -e "  3. ${YELLOW}To test again:${NC} Run 'bash workflows/test-publish-monorepo.sh'"
echo ""
echo -e "${GREEN}🎉 Test completed successfully!${NC}"
