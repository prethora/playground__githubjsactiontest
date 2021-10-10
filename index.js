const fs = require("fs").promises;
const core = require("@actions/core");
const github = require("@actions/github");

async function extractChanges(filePath,version)
{
    try
    {
        console.log("was here 1");
        const ret = [];
        let recording = false;
        (await fs.readFile(filePath,"utf8")).split("\n").forEach((line) => 
        {
            console.log("was here 2");
            const res = /^\s*##\s+v?(\d+\.\d+\.\d+)\s*$/.exec(line);
            if (res)
            {
                recording = (res[1]==version);
            }
            else if (recording)
            {
                ret.push(line);
            }        
        });
        console.log("was here 3");
        return ret.join("\n").trim();    
    }
    catch(err)
    {
        console.log("was here 4",err);
        return "";
    }
}

async function run()
{
    const token = core.getInput("token");
    const octokit = github.getOctokit(token);        
    const { ref,repository: { owner: { name: owner }, name: repo } } = github.context.payload;

    if ((ref) && (ref.startsWith("refs/tags/")))
    {
        const tag_name = ref.substr(10);
        const version = tag_name.substr(1);
        const res = await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name,
            name: `release ${version}`,
            body: await extractChanges("CHANGELOG.md",version)
        });
        console.log(res);
    }
    else
    {
        throw "ref must be a tag";
    }
}

run();