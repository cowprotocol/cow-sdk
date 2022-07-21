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

yarn publish --access public

echo "Package $package_name version $version successfully published."