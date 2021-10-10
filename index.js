const core = require('@actions/core');
const github = require('@actions/github');

async function run()
{
    const token = core.getInput("token");
    const octokit = github.getOctokit(token);        
    const { ref,repository: { owner: { name: owner }, name: repo } } = github.context.payload;

    if ((ref) && (ref.startsWith("refs/tags/")))
    {
        const tag_name = ref.substr(10);
        const res = await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name,
        });
        console.log(res);
    }
    else
    {
        throw "ref must be a tag";
    }
}

run();