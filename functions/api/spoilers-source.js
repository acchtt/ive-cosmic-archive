const MEMBER_POSTS = [
  ['gaeul', '2016151017696723199'],
  ['yujin', '2016151111749820512'],
  ['rei', '2016150820228890959'],
  ['wonyoung', '2016150607573483593'],
  ['liz', '2016150914076443139'],
  ['leeseo', '2016150712049402127']
];

export async function onRequestGet() {
  try {
    const members = await Promise.all(MEMBER_POSTS.map(async ([key, tweetId]) => {
      const response = await fetch(`https://api.vxtwitter.com/IVEstarship/status/${tweetId}`, {
        headers: {
          accept: 'application/json',
          'user-agent': 'IVE-Cosmic-Archive/1.0'
        }
      });

      if (!response.ok) {
        return { key, tweetId, error: `VXTwitter ${response.status}` };
      }

      const payload = await response.json();
      const mediaURLs = Array.isArray(payload.mediaURLs)
        ? payload.mediaURLs
        : Array.isArray(payload.media_extended)
          ? payload.media_extended.map((item) => item?.url).filter(Boolean)
          : [];

      return { key, tweetId, mediaURLs };
    }));

    return new Response(JSON.stringify({ members }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=300'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message || error) }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }
}
