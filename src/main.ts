import * as core from "@actions/core";
import { Octokit } from "octokit";
import _sodium from "libsodium-wrappers";

const securityToken = core.getInput("security-token");
const repoOwner = core.getInput("repo-owner");
const repoName = core.getInput("repo-name");
const secretsFromEnvRaw = core.getInput("secrets-from-env");
const varsFromEnvRaw = core.getInput("vars-from-env");

const envVarsToRepoSecrets = secretsFromEnvRaw
  .split(" ")
  .map((_) => _.trim())
  .filter((_) => !!_)
  .map((_) => {
    const [secretName, envName] = _.split("=");
    if (!secretName || !envName) {
      throw new Error(`Invalid secret mapping: ${_}`);
    }
    return { secretName, envName };
  });

const envVarsToRepoVariables = varsFromEnvRaw
  .split(" ")
  .map((_) => _.trim())
  .filter((_) => !!_)
  .map((_) => {
    const [varName, envName] = _.split("=");
    if (!varName || !envName) {
      throw new Error(`Invalid secret mapping: ${_}`);
    }
    return { varName, envName };
  });

const octokit = new Octokit({
  auth: securityToken,
});

console.log("\nStarting create-repo-action...");

async function main(): Promise<void> {
  const repoData = await octokit.rest.repos.get({
    repo: repoName,
    owner: repoOwner,
  });

  const { id: repoId } = repoData.data;

  if (envVarsToRepoSecrets.length > 0) {
    console.log("Setting repo secrets...");
    await _sodium.ready;
    const sodium = _sodium;

    const {
      data: { key: publicKey, key_id: publicKeyId },
    } = await octokit.rest.actions.getRepoPublicKey({
      owner: repoOwner,
      repo: repoName,
    });

    const secretRequests = envVarsToRepoSecrets.map(
      ({ secretName, envName }) => {
        const secretValue = process.env[envName];
        if (!secretValue) {
          throw new Error(`No such env: ${envName}`);
        }

        console.log(
          `Setting ${secretName} to repo secret from env ${envName}...`,
        );

        let binaryKey = sodium.from_base64(
          publicKey,
          sodium.base64_variants.ORIGINAL,
        );
        let binarySec = sodium.from_string(secretValue);

        //Encrypt the secret using LibSodium
        let encBytes = sodium.crypto_box_seal(binarySec, binaryKey);

        // Convert encrypted Uint8Array to Base64
        let encryptedValue = sodium.to_base64(
          encBytes,
          sodium.base64_variants.ORIGINAL,
        );

        const nameParts = secretName
          .split(":")
          .map((_) => _.trim())
          .filter((_) => !!_);

        if (nameParts.length > 2) {
          const [targetEnvironment, newSecretName] = nameParts;
          return octokit.rest.actions.createOrUpdateEnvironmentSecret({
            repository_id: repoId,
            environment_name: targetEnvironment,
            secret_name: newSecretName,
            encrypted_value: encryptedValue,
            key_id: publicKeyId,
          });
        }

        return octokit.rest.actions.createOrUpdateRepoSecret({
          owner: repoOwner,
          repo: repoName,
          secret_name: secretName,
          encrypted_value: encryptedValue,
          key_id: publicKeyId,
        });
      },
    );

    await Promise.all(secretRequests);
    console.log("✅ All secrets set successfully!");
    console.log("-----------------------------\n");
  } else {
    console.log("🔵 No secrets to set, skipping...");
    console.log("-----------------------------\n");
  }

  if (envVarsToRepoVariables.length > 0) {
    console.log("Setting repo variables...");
    const variableRequests = envVarsToRepoVariables.map(
      ({ varName, envName }) => {
        const varValue = process.env[envName];
        if (!varValue) {
          throw new Error(`No such env: ${envName}`);
        }

        console.log(
          `Setting ${varName} to repo variable from env ${envName}...`,
        );

        const nameParts = varName
          .split(":")
          .map((_) => _.trim())
          .filter((_) => !!_);

        if (nameParts.length > 2) {
          const [targetEnvironment, newVarName] = nameParts;
          return octokit.rest.actions
            .getEnvironmentVariable({
              repository_id: repoId,
              environment_name: targetEnvironment,
              name: newVarName,
            })
            .then(() => {
              return octokit.rest.actions.updateEnvironmentVariable({
                repository_id: repoId,
                environment_name: targetEnvironment,
                name: newVarName,
                value: varValue,
              });
            })
            .catch(() => {
              return octokit.rest.actions.createEnvironmentVariable({
                repository_id: repoId,
                environment_name: targetEnvironment,
                name: newVarName,
                value: varValue,
              });
            });
        }

        return octokit.rest.actions
          .getRepoVariable({
            owner: repoOwner,
            repo: repoName,
            name: varName,
          })
          .then(() => {
            return octokit.rest.actions.updateRepoVariable({
              owner: repoOwner,
              repo: repoName,
              name: varName,
              value: varValue,
            });
          })
          .catch(() => {
            return octokit.rest.actions.createRepoVariable({
              owner: repoOwner,
              repo: repoName,
              name: varName,
              value: varValue,
            });
          });
      },
    );

    await Promise.all(variableRequests);
    console.log("✅ All variables set successfully!");
    console.log("-----------------------------\n");
  } else {
    console.log("🔵 No variables to set, skipping...");
    console.log("-----------------------------\n");
  }
}

main();
