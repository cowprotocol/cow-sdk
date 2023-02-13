/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The version of the codebase that is currently running.
 *
 */
export type VersionResponse = {
  /**
   * the git branch name at the time of build
   */
  branch?: string
  /**
   * the git commit hash at the time of build
   */
  commit?: string
  /**
   * the git tagged version (if any) at the time of the build
   */
  version?: string
}
