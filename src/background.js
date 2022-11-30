'use strict';

const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key']);
        resolve(decodedKey);
      }
    });
  });
};

const sendMessage = (content) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0].id;

    chrome.tabs.sendMessage(
      activeTab,
      { message: 'inject', content },
      (response) => {
        if (response?.status === 'failed') {
          console.log('injection failed.');
        }
      }
    );
  });
};

const generate = async (prompt) => {
  const key = await getKey();
  const url = 'https://api.openai.com/v1/completions';

  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-002',
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  });

  const completion = await completionResponse.json();
  return completion.choices.pop();
};

const generateCompletionAction = async (info) => {
  try {
    const { selectionText } = info;
    const basePromptPrefix = `
    Write me some stoic advice in the style of Marcus Aurelius with the topic below. Please make sure the advice goes in-depth on the topic and shows the stoic principles.

    Topic:
      `;
    const baseCompletion = await generate(
      `${basePromptPrefix}${selectionText}`
    );

    sendMessage(baseCompletion.text);
  } catch (error) {
    console.log(error);
    sendMessage(error.toString());
  }
};

chrome.contextMenus.create(
  {
    id: 'context-run',
    title: 'Generate advice',
    contexts: ['selection'],
  },
  () => chrome.runtime.lastError
);

chrome.contextMenus.onClicked.addListener(generateCompletionAction);
