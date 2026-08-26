const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const publisherSource = path.join(__dirname, 'linkedin-publisher.js');

function runScenario({ latestUrl, initialState, expectPost }) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'linkedin-publisher-test-'));
  const publisherPath = path.join(directory, 'linkedin-publisher.js');
  const statePath = path.join(directory, 'last_posted_url.txt');
  const axiosDirectory = path.join(directory, 'node_modules', 'axios');
  const callsPath = path.join(directory, 'calls.json');

  fs.mkdirSync(axiosDirectory, { recursive: true });
  fs.copyFileSync(publisherSource, publisherPath);
  fs.writeFileSync(statePath, initialState);
  fs.writeFileSync(
    path.join(axiosDirectory, 'index.js'),
    `const fs = require('fs');
const callsPath = process.env.MOCK_CALLS_PATH;
const latestUrl = process.env.MOCK_LATEST_URL;
const calls = [];
function record(value) { calls.push(value); fs.writeFileSync(callsPath, JSON.stringify(calls)); }
exports.get = async function (url) {
  record({ method: 'get', url });
  if (url.includes('medium.com/feed')) return { data: { items: [{ title: 'A bounded professional problem', link: latestUrl }] } };
  if (url.includes('drsonny.substack.com')) return { data: { items: [{ title: 'A bounded professional problem', link: 'https://drsonny.substack.com/p/a-bounded-professional-problem' }] } };
  if (url.includes('linkedin.com/v2/userinfo')) return { data: { sub: 'test-user' } };
  throw new Error('Unexpected GET ' + url);
};
exports.post = async function (url, body) {
  record({ method: 'post', url, title: body.specificContent['com.linkedin.ugc.ShareContent'].media[0].title.text });
  return { data: { id: 'test-post' } };
};
`
  );

  const output = execFileSync(process.execPath, [publisherPath], {
    encoding: 'utf8',
    env: {
      ...process.env,
      LINKEDIN_ACCESS_TOKEN: 'test-token',
      MOCK_CALLS_PATH: callsPath,
      MOCK_LATEST_URL: latestUrl
    }
  });
  const calls = JSON.parse(fs.readFileSync(callsPath, 'utf8'));
  const finalState = fs.readFileSync(statePath, 'utf8').trim();
  const postCalls = calls.filter((call) => call.method === 'post');

  if (expectPost) {
    assert.match(output, /Successfully published to LinkedIn and recorded state\./);
    assert.equal(postCalls.length, 1);
    assert.equal(finalState, latestUrl);
  } else {
    assert.match(output, /Latest article has already been posted to LinkedIn\. Exiting\./);
    assert.equal(postCalls.length, 0);
    assert.equal(finalState, initialState);
    assert.equal(calls.some((call) => call.url.includes('linkedin.com')), false);
  }
}

runScenario({
  latestUrl: 'https://medium.com/@saggarsonny/new-dispatch',
  initialState: 'https://medium.com/@saggarsonny/previous-dispatch',
  expectPost: true
});
runScenario({
  latestUrl: 'https://medium.com/@saggarsonny/already-posted',
  initialState: 'https://medium.com/@saggarsonny/already-posted',
  expectPost: false
});

console.log('LinkedIn publisher scenarios passed: new dispatch and nothing new.');
