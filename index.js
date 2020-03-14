const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    const myToken = core.getInput('github-token');

    if (!myToken || myToken == "") {
      core.setFailed("🐆 Looks like your repo's token is missing.  Make sure it's added in your .yaml config file as `github-token: ${{ secrets.GITHUB_TOKEN }}`. See the Cheetah README for more info.");
      return;
    }

    const octokit = new github.GitHub(myToken);
    const payload = github.context.payload;

    const command = payload.comment.body.trim();
    let split = command.split(" ");

    if (split.length < 3) {
      console.log("🐆 Cheetah won't run without a check name. To invoke the cheetah, comment `cheetah run {CHECK_NAME}`");
      return;
    }

    if (split[0].toLowerCase().trim() != "cheetah") {
      console.log("🐆 Cheetah was not invoked. To invoke the cheetah, comment `cheetah run {CHECK_NAME}`");
      return;
    }

    const cheetahCheckName = split.slice(2).join(" ");
    const fullRepo = payload.repository.full_name.split("/");
    const owner = fullRepo[0];
    const repo = fullRepo[1];
    const pullNumber = payload.issue.number;

    try {
      const { data: pullRequest } = await octokit.pulls.get({
          owner: owner,
          repo: repo,
          pull_number: pullNumber
      });

      const branch = pullRequest.head.ref;

      const { data: checks } = await octokit.checks.listForRef({
          owner: owner,
          repo: repo,
          ref: branch,
      });

      if (checks.check_runs.length < 1) {
        core.setFailed("🐆 Cheetah could not find any checks for this PR");
        return;
      }

      const foundChecks = checks.check_runs.filter( run => run.name == cheetahCheckName).sort(function(a,b) {
        return new Date(b.completed_at) - new Date(a.completed_at);
      });

      if (foundChecks.length < 1) {
        const mappedNames = checks.check_runs.map (run => run.name);
        core.setFailed("🐆 Cheetah could not find any checks named '" + cheetahCheckName + "' for this PR.  Checks found were: " + mappedNames);
        return;
      }

      const checkSuiteID = foundChecks[0].check_suite.id;
      console.log("🐆 Cheetah is re-running " + cheetahCheckName + " with ID " + checkSuiteID + "..." + "for branch " + branch);

      await octokit.checks.rerequestSuite({
          owner: owner,
          repo: repo,
          check_suite_id: checkSuiteID
      });
    } catch(error) {
      core.setFailed(error);
    }
}

run();
