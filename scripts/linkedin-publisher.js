const axios = require('axios');
const fs = require('fs');
const path = require('path');

const LINKEDIN_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LAST_POSTED_FILE = path.join(__dirname, 'last_posted_url.txt');

async function getLatestMediumArticle() {
  const rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@saggarsonny';
  const response = await axios.get(rssUrl);
  if (response.data && response.data.items && response.data.items.length > 0) {
    return response.data.items[0];
  }
  return null;
}

async function getLinkedInUserId() {
  const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${LINKEDIN_TOKEN}` }
  });
  return response.data.sub;
}

async function postToLinkedIn(userId, article) {
  const postBody = {
    author: `urn:li:person:${userId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: `New Dispatch:\n\n${article.title}\n\nRead the full Systems Autopsy on the structural failure and reinvention of modern medicine.\n\n#TheNewPhysician #TheHive #Medicine #SystemsEngineering #HealthcareInnovation`
        },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            description: { text: "Read the latest dispatch from The New Physician." },
            originalUrl: article.link,
            title: { text: article.title }
          }
        ]
      }
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
  };

  const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postBody, {
    headers: {
      'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
}

async function run() {
  try {
    const article = await getLatestMediumArticle();
    if (!article) {
      console.log('No articles found in Medium feed.');
      return;
    }

    let lastPostedUrl = '';
    if (fs.existsSync(LAST_POSTED_FILE)) {
      lastPostedUrl = fs.readFileSync(LAST_POSTED_FILE, 'utf8').trim();
    }

    if (article.link === lastPostedUrl) {
      console.log('Latest article has already been posted to LinkedIn. Exiting.');
      return;
    }

    console.log(`New article found! Publishing: ${article.title}`);
    
    const userId = await getLinkedInUserId();
    await postToLinkedIn(userId, article);
    
    fs.writeFileSync(LAST_POSTED_FILE, article.link);
    console.log('Successfully published to LinkedIn and recorded state.');
    
  } catch (error) {
    console.error('Error during execution:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

run();
