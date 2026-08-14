const marked = require('marked');
const fs = require('fs');

// Read the source markdown file with all 4 posts
const src = fs.readFileSync('/Users/aleckennedy/.openclaw/workspace/PITROW-SEO-BLOG-POSTS.md', 'utf8');

// Each post is separated by "---" and has a "# POST N" marker.
// The actual post content starts at the "# " H1 title (which is the post title line).
// We split into posts by the "---" separators, then for each find the H1 body start.

// Define post slugs + frontmatter metadata
const posts = [
  {
    slug: 'racing-simulator-party-rental-miami',
    title: "Racing Simulator Party Rental in Miami: The Ultimate Event Upgrade",
    description: "Make your Miami party unforgettable with a premium racing simulator rental from Pit Row Miami. Bachelor parties, birthdays & corporate events. Delivered, set up & staffed. Book today at info@pitrowmiami.com.",
    readTime: '6',
  },
  {
    slug: 'corporate-team-building-events-miami',
    title: "Corporate Team Building Events in Miami: Why F1 Sim Racing Wins",
    description: "Elevate your corporate team building events in Miami with F1 sim racing from Pit Row Miami. Friendly competition, client appreciation & product launches. Delivered, staffed & unforgettable. Email info@pitrowmiami.com.",
    readTime: '6',
  },
  {
    slug: 'f1-race-watch-party-miami',
    title: "F1 Race Watch Party Miami: Race Between Sessions, Watch the Grand Prix",
    description: "Host an epic F1 race watch party in Miami with big-screen racing plus pro sim rigs from Pit Row Miami. Race between sessions, drink, cheer. The Miami Grand Prix experience at home. Email info@pitrowmiami.com.",
    readTime: '5',
  },
  {
    slug: 'racing-simulator-bachelor-party-miami',
    title: "Racing Simulator for Bachelor Party Miami: Pro-Level Rigs & How It Works",
    description: "Plan the ultimate bachelor party in Miami with a pro racing simulator from Pit Row Miami. Real force-feedback rigs, head-to-head racing, full setup. The experience that beats the arcade. Email info@pitrowmiami.com.",
    readTime: '5',
  },
];

// Split source into post chunks by the "---" separators
const chunks = src.split(/\n---\s*\n/);

// For each post, find the chunk that contains its H1 title and extract the body.
function extractBodyForPost(post) {
  // Search all chunks for the one containing the H1 title
  for (const chunk of chunks) {
    // The H1 line is "# <title>" — but title has a colon etc. Match the first line that is "# "
    const lines = chunk.split('\n');
    // Find the index of the first line that is an H1 (# ) AND matches our title's first ~40 chars
    let startIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('# ') && lines[i].length > 10) {
        const t = lines[i].slice(2).trim();
        // match if title is substring of this heading or vice versa
        if (post.title.includes(t) || t.includes(post.title.slice(0, 30))) {
          startIdx = i;
          break;
        }
      }
    }
    if (startIdx !== -1) {
      // Body = everything after the H1 line
      return lines.slice(startIdx + 1).join('\n').trim();
    }
  }
  throw new Error('Could not find body for ' + post.slug);
}

function buildAstroFile(post, bodyMd) {
  // Convert markdown to HTML with marked
  const bodyHtml = marked.parse(bodyMd, { gfm: true, breaks: false });
  return `---
import BlogPost from '../../layouts/BlogPost.astro';
---

<BlogPost
  title="${post.title.replace(/"/g, '&quot;')}"
  description="${post.description.replace(/"/g, '&quot;')}"
  date="August 9, 2026"
  readTime="${post.readTime}"
>

${bodyHtml}

</BlogPost>
`;
}

const outDir = '/Users/aleckennedy/.openclaw/workspace/pitrowmiami-v2/src/pages/blog/';
for (const post of posts) {
  const bodyMd = extractBodyForPost(post);
  const astro = buildAstroFile(post, bodyMd);
  fs.writeFileSync(outDir + post.slug + '.astro', astro);
  console.log('Wrote', post.slug + '.astro', '(', bodyMd.split('\n').length, 'md lines )');
}
