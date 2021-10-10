const core = require('@actions/core');
const github = require('@actions/github');

async function run()
{
    const token = core.getInput("token");
    const octokit = github.getOctokit(token);
    const res = await octokit.rest.repos.getContent({
        owner: "prethora",
        repo: "playground__githubjsactiontest",
        path: "action.yml",
    });
    console.log(res);
}

run();