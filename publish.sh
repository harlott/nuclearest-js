#!/usr/bin/env bash
set -e
# SEMVER FLAG: THIS IS TO CREATE SNAPSHOT VERSION: IT'S THE ONLY WAY TO APPEND A STRING AND INCREMENT 4th FACTOR
developmentVersioningRequested=prerelease
# SEMVER FLAG: THIS IS TO INCREMENT PATCH VERSION
patchVersion=patch

currentVersion=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' package.json)
versionToPublish=${currentVersion}
nextVersion=${currentVersion}
branchOption=${1}
releaseOption=${2}

echo currentVersion is ${currentVersion}

sanitizeBranchName() {
  shopt -s extglob
  branchName=${branchOption//+([^A-Za-z0-9])/-}
  echo Sanitized branch name is ${branchName}
}

setNextSnapshotVersion() {
  snapshotSuffix='-SNAPSHOT-'${branchName}
  if [[ $versionToPublish == *"SNAPSHOT-${branchName}"* ]]; then
    snapshotSuffix=''
  else
    versionToPublish=${versionToPublish%%-*}
  fi

  echo Preparing next ${developmentVersioningRequested} snapshot version...
  snapshotVersion=$(semver ${versionToPublish}${snapshotSuffix} -i ${developmentVersioningRequested})

  echo Next snapshot version is ${snapshotVersion}
  echo ${snapshotVersion} version applying...
  npm --no-git-tag-version version ${snapshotVersion} -m 'Releasing snapshot version %s'
  git add -A && git commit -a -m "version update" && git push origin ${branchOption}
}

releaseRcVersion() {
  currentRcVersion=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' package.json)
  versionToPublish=${currentRcVersion%%-*}

  echo release Candidate Version is ${versionToPublish}
  npm --no-git-tag-version version ${versionToPublish} -m 'Releasing rc version %s'
  echo Pushing updates...
  git add -A && git push && git push --tags
  echo Publishing new version...
  npm run build && npm publish
  versionToPublish=$(semver ${versionToPublish} -i ${patchVersion})
  npm --no-git-tag-version version ${versionToPublish} -m 'Releasing next rc snapshot version %s'
  echo Pushing Next Version updates...
  git add -A && git push && git push --tags
  setNextSnapshotVersion
  echo Exit successfully with ${versionToPublish}
  exit 0
}

# VERIFY BRANCH OPTION
if [[ $branchOption == '' ]]; then
          echo Branch option is required
          exit 1
fi

sanitizeBranchName

case "$2" in
    release)
        releaseRcVersion
    ;;
    *)
esac

echo Publishing current version...

npm run build && npm publish
setNextSnapshotVersion


echo Exit successfully with ${snapshotVersion}
