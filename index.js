const core = require('@actions/core');
const github = require('@actions/github');

async function run()
{
    const token = core.getInput("token");
    const octokit = github.getOctokit(token);        
    const res = await octokit.rest.repos.getContent({
        owner: github.context.payload.repository.owner.name,
        repo: github.context.payload.repository.name,
        path: "package.json",
    });
    console.log(res);
}

run();