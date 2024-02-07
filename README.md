# Set Repo Secrets and Variables

This GitHub Action will set secrets to any repository that you have access to.

## Inputs

### `repo-owner`

**Required** Owner of the Repo (individual or organization)

### `repo-name`

**Required** Name of the Repo

### `secrets-from-env`

**Required** Set secrets from environment variables. You can make it the secret an environment secret by prepending the secret name with the environment name (ie `Prod:...`). The format is "(Env:)TARGET_SECRET_NAME=ENV_NAME", separated by spaces.

### `vars-from-env`

**Required** Set variables from environment variables. You can make it the variable an environment secret by prepending the variable name with the environment name (ie `Prod:...`). the format is "(Env:)TARGET_VAR_NAME=ENV_NAME", separated by spaces

### `security-token`

**Required** The PAT or auth token for either you or your organization. It's this identity that sets the secrets to the target repository. The scope for Classic PAT should include "repo" and "workflows". For Fine Grain Token see below.

## Required Permissions for Fine Grain Token

* "secrets" (read/write) - To set repo-level secrets
* "variables" (read/write) - To set repo-level variables
* "environments" (read/write) - To set environment-level secrets and variables
* "actions" (read/write) - To list out available environments

> Note about Environments: **Environment names are case-sensitive.** And this action cannot create environments for you (to do so would require "Administration" permissions)

## Example Usage

```yaml
env:
  ORG_TOKEN: ${{ secrets.ORG_TOKEN }}
  SOME_SECRET: some-secret-value
  DB_CONN_STR: ${{ secrets.DB_CONNECTION}}
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v3
  - uses: howlowck/set-secrets-action@v1.4
    with:
      repo-owner: 'howlowck'
      repo-name: 'my-new-app'
      security-token: ${{ secrets.ORG_TOKEN }}
      secrets-from-env: >-
        Prod:DB_CONN=DB_CONN_STR
        REPO_SEC_NAME_1=ORG_TOKEN
        REPO_SEC_NAME_2=SOME_SECRET
```
