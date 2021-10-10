const fs = require("fs").promises;
const core = require("@actions/core");
const github = require("@actions/github");

const localPayload = {
    ref: "refs/tags/v1.0.10",
    repository: {
        owner: {
            name: "prethora"
        },
        name: "typescript__modules__quickstart_dom_playing"
    }
};

const token = (process.env.LOCAL)?process.env.TOKEN:core.getInput("token");
const octokit = github.getOctokit(token);        
const { ref,repository: { owner: { name: owner }, name: repo } } = (process.env.LOCAL)?localPayload:github.context.payload;

async function extractChanges(content,version)
{
    try
    {
        const ret = [];
        let recording = false;
        content.split("\n").forEach((line) => 
        {
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
        return ret.join("\n").trim();    
    }
    catch(err)
    {
        console.log("error: ",err);
        return "";
    }
}

async function getFileContent(path)
{
    try
    {
        const res = await octokit.rest.repos.getContent({
            owner,
            repo,
            path
        });
        if ((res.status==200) && (res.data))
        {
            const buf = Buffer.from(res.data.content,res.data.encoding);
            return buf.toString("utf8");    
        }
        else
        {
            return "";
        }    
    }
    catch(err)
    {
        console.log("getFileContent error:",err);
        return "";
    }
}

async function createRelease(opt)
{
    if (process.env.LOCAL)
    {
        return {
            type: "simulated",
            opt
        };
    }
    else
    {
        return octokit.rest.repos.createRelease(opt);
    }
}

async function run()
{    
    if ((ref) && (ref.startsWith("refs/tags/")))
    {
        const tag_name = ref.substr(10);
        const version = tag_name.substr(1);
        const res = await createRelease({
            owner,
            repo,
            tag_name,
            name: `release ${version}`,
            body: await extractChanges(await getFileContent("CHANGELOG.md"),version)
        });
        console.log(res);
    }
    else
    {
        throw "ref must be a tag";
    }
}

run();