/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Component, Task, github, javascript } from 'projen';

const UPDATE_JOB_ID = 'update_upstream_sources';

export interface UpstreamSourceSyncOptions {
  readonly upstreamRepo: string;
  readonly schedule?: string;
  readonly targetDirectory?: string;
}

export class UpstreamSourceSync extends Component {
  public readonly task: Task;
  public readonly workflow: github.GithubWorkflow;

  public constructor(project: javascript.NodeProject, options: UpstreamSourceSyncOptions) {
    if (!project.github) {
      throw new Error('Can only add UpstreamSourceSync to a project with GitHub integration enabled');
    }

    super(project);

    const taskName = 'update-upstream-sources';
    const workflowName = 'update-upstream-sources';
    const targetDir = options.targetDirectory ?? 'sources';

    this.task = project.addTask(taskName, {
      steps: [
        {
          exec: `bash -c '
# Get latest release tag from GitHub API
LATEST_TAG=$(curl -s "https://api.github.com/repos/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/releases/latest" | grep "tag_name" | cut -d ":" -f 2 | tr -d " ,\\"")
if [ -z "$LATEST_TAG" ] || [ "$LATEST_TAG" = "null" ]; then
  echo "No releases found in upstream repository"
  exit 0
fi
echo "Found latest release: $LATEST_TAG"

# Clone the specific release tag
git clone --depth 1 --branch $LATEST_TAG ${options.upstreamRepo} temp-upstream
VERSION=$(cat temp-upstream/VERSION)
if [[ ! $VERSION =~ ^[0-9]+\\.[0-9]+\\.[0-9]+$ ]]; then
  echo "Skipping sync: VERSION '"'"'$VERSION'"'"' is not in X.Y.Z format (appears to be work-in-progress)"
  rm -rf temp-upstream
  exit 0
fi
rm -rf ${targetDir}
mv temp-upstream ${targetDir}
rm -rf ${targetDir}/.git
echo "Successfully synced release $LATEST_TAG (VERSION: $VERSION)"

# Stage the changes for git
git add ${targetDir}
'`,
        },
      ],
    });

    this.workflow = new github.GithubWorkflow(project.github, workflowName);

    this.workflow.on({
      workflowDispatch: {},
      schedule: [{ cron: options.schedule ?? '0 2 * * 1' }], // Weekly on Monday at 2 AM
    });

    this.workflow.addJob(UPDATE_JOB_ID, {
      permissions: {
        contents: github.workflows.JobPermission.READ,
        idToken: github.workflows.JobPermission.NONE,
        pullRequests: github.workflows.JobPermission.WRITE,
      },
      runsOn: ['ubuntu-latest'],
      steps: [
        ...project.renderWorkflowSetup(),
        {
          name: 'Update upstream sources',
          run: this.task.steps.map(step => step.exec).join('\n'),
        },
        {
          name: 'Check for changes',
          id: 'check-changes',
          run: [
            'if [ -n "$(git status --porcelain)" ]; then',
            '  echo "changes=true" >> $GITHUB_OUTPUT',
            '  echo "Changes detected in sources/"',
            'else',
            '  echo "changes=false" >> $GITHUB_OUTPUT',
            '  echo "No changes detected"',
            'fi',
          ].join('\n'),
        },
        {
          name: 'Create Pull Request',
          id: 'create-pr',
          if: 'steps.check-changes.outputs.changes == \'true\'',
          uses: 'peter-evans/create-pull-request@v5',
          with: {
            'token': '${{ secrets.PROJEN_GITHUB_TOKEN }}',
            'commit-message': 'feat(sources): update upstream sources',
            'title': 'feat(sources): update upstream sources',
            'body': [
              '> ⚠️ This Pull Request updates weekly and will overwrite **all** manual changes pushed to the branch',
              '',
              'Updates the sources from upstream repository latest release. See details in [workflow run].',
              '',
              '[Workflow Run]: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}',
              '',
              '**Manual Review Required**: This PR requires manual testing and mapping of new changes to CDK constructs.',
              '',
              '## How to work with this PR',
              '',
              '**⚠️ DO NOT work directly on this branch** - it will be overwritten by automation.',
              '',
              'Instead, create a separate branch for your integration work:',
              '```bash',
              'gh pr checkout <PR_NUMBER>',
              'git switch -c integration/upstream-<VERSION>',
              'git push -u origin HEAD',
              'gh pr create --title "feat: integrate upstream <VERSION>" --body "Integrates changes from #<PR_NUMBER>"',
              '```',
              '',
              'This keeps your integration work safe while allowing automation to continue updating the upstream sync.',
              '',
              '------',
              '',
              '*Automatically created by projen via the "update-upstream-sources" workflow*',
            ].join('\n'),
            'branch': 'update-upstream-sources',
            'base': 'main',
          },
        },
        {
          if: '${{ steps.create-pr.outputs.pull-request-number }}',
          env: {
            GH_TOKEN: '${{ github.token }}',
          },
          name: 'add-instructions',
          run: [
            'echo -e "**To work on this Pull Request, please create a new branch and PR. This prevents your work from being deleted by the automation.**\\n\\n',
            'Run the following commands inside the repo:\\n',
            '\\`\\`\\`console\\n',
            'gh co ${{ steps.create-pr.outputs.pull-request-number }}\\n',
            'git switch -c fix-pr-${{ steps.create-pr.outputs.pull-request-number }} && git push -u origin HEAD\\n',
            'gh pr create -t \\"fix: PR #${{ steps.create-pr.outputs.pull-request-number }}\\" --body \\"Fixes ${{ steps.create-pr.outputs.pull-request-url }}\\"\\n',
            '\\`\\`\\`"',
            '| gh pr comment ${{ steps.create-pr.outputs.pull-request-number }} -F-',
          ].join(''),
        },
      ],
    });
  }
}
