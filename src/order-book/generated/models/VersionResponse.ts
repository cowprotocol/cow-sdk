/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The version of the codebase that is currently running.
 *
 */
export type VersionResponse = {
    /**
     * The git branch name at the time of build.
     */
    branch?: string;
    /**
     * The git commit hash at the time of build.
     */
    commit?: string;
    /**
     * The git tagged version (if any) at the time of the build.
     */
    version?: string;
};

