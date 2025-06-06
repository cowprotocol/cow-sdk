#!/bin/bash

set -o nounset
set -o pipefail
set -o errexit

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

package_name="$(jq --raw-output .name ./package.json)"
version="$(jq --raw-output .version ./package.json)"

if package_exists "$package_name" && grep --silent --line-regexp --fixed-strings -- "$version" \
    <(npm view --json "$package_name" | jq '.versions[] | .' --raw-output); then
  echo "Version $version already published"
  exit 1
fi

version_tag="v$version"
if ! git fetch --end-of-options origin "refs/tags/$version_tag" 2>/dev/null; then
  echo "Tag $version_tag is not created. Create the Release first."
  exit 1
fi

latest_tag="$(git describe --tags --abbrev=0)"
if ! [ "$version_tag" = "$latest_tag" ]; then
  echo "Latest tag $latest_tag version doesn't match package.json version $version"
  exit 1
fi

if [[ "$version_tag" == *"RC"* ]]; then
  yarn publish --access public --tag next
else
  yarn publish --access public
fi

echo "Package $package_name version $version successfully published."