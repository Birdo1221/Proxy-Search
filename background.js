chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'setProxy') {
    setProxy(message.proxy);
  }
});

function setProxy(proxy) {
  const config = {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme: 'http',
        host: proxy.host,
        port: proxy.port
      },
      bypassList: []
    }
  };

  chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
    console.log(`Proxy set to ${proxy.host}:${proxy.port}`);
  });
}
