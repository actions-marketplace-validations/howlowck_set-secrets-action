# Set Repo Secrets

This GitHub Action will set secrets to any repository that you have access to.

## Inputs

### `repo-owner`

**Required** Owner of the Repo (individual or organization)

### `repo-name`

**Required** Name of the Repo

### `secrets-from-env`

**Required** Set secrets from environment variables, the format is "TARGET_SECRET_NAME:ENV_NAME", separated by spaces

### `security-token`

**Required** The PAT or auth token for either you or your organization. It's this identity that sets the secrets to the target repository. The scope for Classic PAT should include "repo". For fine-grain PAT, include "secrets" and "variables" to the scope.

## Example Usage

```yaml
env:
  ORG_TOKEN: ${{ secrets.ORG_TOKEN }}
  SOME_SECRET: some-secret-value
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v3
  - uses: howlowck/set-secrets@v1.0
    with:
      repo-owner: 'howlowck'
      repo-name: 'my-new-app'
      security-token: ${{ secrets.ORG_TOKEN }}
      secrets-from-env: |-
        REPO_SEC_NAME_1=ORG_TOKEN
        REPO_SEC_NAME_2=SOME_SECRET
```
