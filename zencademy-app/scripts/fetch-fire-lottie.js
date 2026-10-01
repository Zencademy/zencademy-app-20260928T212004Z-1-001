const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
fs.mkdirSync(outDir, { recursive: true });

function get(u, n = 0) {
  return new Promise((res, rej) => {
    const lib = u.startsWith('http:') ? http : https;
    lib
      .get(
        u,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json,text/html,*/*',
            Referer: 'https://lottiefiles.com/',
          },
        },
        (r) => {
          if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && n < 8) {
            return get(new URL(r.headers.location, u).href, n + 1).then(res, rej);
          }
          const chunks = [];
          r.on('data', (c) => chunks.push(c));
          r.on('end', () =>
            res({ status: r.statusCode, buf: Buffer.concat(chunks), ct: r.headers['content-type'] || '' })
          );
        }
      )
      .on('error', rej);
  });
}

function collectUrls(text) {
  const urls = new Set();
  const patterns = [
    /https?:\/\/[^"'\\\s>]+\.(?:json|lottie)/gi,
    /https?:\\\/\\\/[^"']+\.(?:json|lottie)/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) {
      urls.add(m[0].replace(/\\\//g, '/').replace(/\\u002F/g, '/'));
    }
  }
  const assetRe = /assets-v2\.lottiefiles\.com\/a\/[a-f0-9-]+\/[A-Za-z0-9._-]+/gi;
  let m;
  while ((m = assetRe.exec(text))) urls.add('https://' + m[0]);
  const assetReEsc = /assets-v2\.lottiefiles\.com\\\/a\\\/[a-f0-9-]+\\\/[A-Za-z0-9._-]+/gi;
  while ((m = assetReEsc.exec(text))) urls.add('https://' + m[0].replace(/\\\//g, '/'));
  return [...urls];
}

(async () => {
  const page = await get('https://lottiefiles.com/free-animation/fire-NG4n3YU51z');
  console.log('page', page.status, page.buf.length);
  const html = page.buf.toString('utf8');
  fs.writeFileSync(path.join(outDir, '_page.html'), html);

  let urls = collectUrls(html);
  const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextData) {
    urls = urls.concat(collectUrls(nextData[1]));
    try {
      const j = JSON.parse(nextData[1]);
      const flat = JSON.stringify(j);
      for (const key of ['jsonUrl', 'lottieUrl', 'downloadUrl', 'source', 'path', 'url', 'cdnUrl', 'file']) {
        const re = new RegExp('"' + key + '"\\s*:\\s*"(https:[^"]+)"', 'g');
        let mm;
        while ((mm = re.exec(flat))) urls.push(mm[1].replace(/\\\//g, '/'));
      }
      // dig for animation hash NG4n3YU51z related asset folder from gif url we know
      console.log('has next data', flat.includes('NG4n3YU51z'), flat.includes('1df4b596'));
    } catch (e) {
      console.log('next parse fail', e.message);
    }
  }

  // Known thumbnail path from search results — sibling data.json often exists
  urls.push('https://assets-v2.lottiefiles.com/a/1df4b596-1182-11ee-9fc3-6f8d7094dc00/data.json');
  urls.push('https://assets-v2.lottiefiles.com/a/1df4b596-1182-11ee-9fc3-6f8d7094dc00/qQvoRI63gH.json');
  urls.push('https://lottie.host/embed/1df4b596-1182-11ee-9fc3-6f8d7094dc00/fire.json');

  urls = [...new Set(urls)];
  console.log('candidates', urls.length);
  urls.forEach((u) => console.log(' -', u));

  for (const u of urls) {
    try {
      const r = await get(u);
      const head = r.buf.slice(0, 60).toString();
      console.log('try', r.status, r.buf.length, head.slice(0, 50).replace(/\n/g, ' '), u.slice(0, 100));
      if (r.status === 200 && head.trim().startsWith('{')) {
        const j = JSON.parse(r.buf.toString());
        if (j.v && (j.layers || j.assets)) {
          fs.writeFileSync(path.join(outDir, 'fire.json'), r.buf);
          console.log('SAVED fire.json', j.w, 'x', j.h, 'layers', (j.layers || []).length, 'from', u);
          return;
        }
      }
    } catch (e) {
      console.log('fail', u, e.message);
    }
  }
  console.log('NO_SAVE');
})();
