# Set Repo Secrets and Variables

This GitHub Action will set secrets to any repository that you have access to.

## Inputs

### `repo-owner`

**Required** Owner of the Repo (individual or organization)

### `repo-name`

**Required** Name of the Repo

### `secrets-from-env`

**Required** Set secrets from environment variables, the format is "TARGET_SECRET_NAME=ENV_NAME", separated by spaces

### `vars-from-env`

**Required** Set variables from environment variables, the format is "TARGET_VAR_NAME=ENV_NAME", separated by spaces

### `security-token`

**Required** The PAT or auth token for either you or your organization. It's this identity that sets the secrets to the target repository. The scope for Classic PAT should include "repo" and "workflows". For fine-grain PAT, set "secrets", "variables", "environments" to "read and write" permissions.

## Example Usage

```yaml
env:
  ORG_TOKEN: ${{ secrets.ORG_TOKEN }}
  SOME_SECRET: some-secret-value
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v3
  - uses: howlowck/set-secrets-action@v1.2
    with:
      repo-owner: 'howlowck'
      repo-name: 'my-new-app'
      security-token: ${{ secrets.ORG_TOKEN }}
      secrets-from-env: |-
        REPO_SEC_NAME_1=ORG_TOKEN
        REPO_SEC_NAME_2=SOME_SECRET
```
