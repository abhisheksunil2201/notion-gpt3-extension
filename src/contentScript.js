const insert = (content) => {
  const { Client } = require('@notionhq/client');
  //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

  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  (async () => {
    const blockId = '16d8004e5f6a42a6981151c22ddada12';
    const response = await notion.blocks.children.append({
      block_id: blockId,
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            text: [
              {
                type: 'text',
                text: {
                  content: '– Notion API Team',
                  link: {
                    type: 'url',
                    url: 'https://twitter.com/NotionAPI',
                  },
                },
              },
            ],
          },
        },
      ],
    });
    console.log(response);
  })();
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'inject') {
    const { content } = request;

    const result = insert(content);

    if (!result) {
      sendResponse({ status: 'failed' });
    }

    sendResponse({ status: 'success' });
  }
});
