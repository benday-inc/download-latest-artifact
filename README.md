![build-test](https://github.com/benday-inc/download-latest-artifact/workflows/build-test/badge.svg)

# Download an artifact from a github workflow

This action helps you to download an artifact from another github workflow.  The out-of-the-box download artifact action from github only allows you to download artifacts from a job in the current workflow.  This action gets around this restriction.  The workflow can even be hosted in another github account.  

The action downloads the latest artifact from the last successful workflow run executed against the provided branch.  Failed workflow runs are ignored.  Workflow runs against branches other than the supplied branch are ignored.  

## Usage

To download an artifact from a workflow:  
```yaml
- name: download workflow artifact
  uses: benday-inc/download-latest-artifact@main
  with:
     token: ${{ secrets.TOKEN_WITH_PERMISSIONS }}'
     repository_owner: 'benday'
     repository_name: 'actionsdemo'
     workflow_name: 'my-workflow'
     branch_name: 'master'
     download_path: '${{ github.workspace }}/temp'
     download_filename: 'actionsdemo-artifact.zip'
```

----
## Action Spec:

### Environment variables
- None

### Inputs
- `token` - github token for the target repository
- `repository_owner` - name of the repository account owner
- `repository_name` - name of the repository
- `workflow_name` - name of the workflow that created the artifact
- `branch_name` - name of the branch that the workflow should run off of
- `download_path` - location on the agent to download the artifact to.
- `download_filename` - download the artifact file as this filename

### Outputs
- None
