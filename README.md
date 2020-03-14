# Check Cheetah 🐆

This action lets you re-run your PR's checks by commenting `cheetah run {my_check_name}`

## Inputs
### `github-token: ${{ secrets.GITHUB_TOKEN }}`

**Required** The GitHub token to use.

## Usage instructions
Create a workflow file (e.g. `.github/workflows/cheetah.yml`) that contains a step that `uses: schlagelk/checkcheetah@v0.1`. Here's an example workflow file:

```yaml
name: Check Cheetah
on:
  issue_comment:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: schlagelk/checkcheetah@v0.1
      with:
        github-token: "${{ secrets.GITHUB_TOKEN }}"
```
