document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const proxyInput = document.getElementById('proxyInput');
  const applyButton = document.getElementById('applyButton');
  const modeSwitch = document.getElementById('modeSwitch');

  let extensionEnabled = false;
  let proxyType = 'http'; // Default proxy type

  // Load extension state from storage
  chrome.storage.local.get(['extensionEnabled', 'proxyType', 'proxy'], (data) => {
    extensionEnabled = data.extensionEnabled || false;
    proxyType = data.proxyType || 'http';

    toggleSwitch.checked = extensionEnabled;
    modeSwitch.checked = (proxyType === 'socks5');

    if (data.proxy) {
      proxyInput.value = `${data.proxy.host}:${data.proxy.port}:${data.proxy.username}:${data.proxy.password}`;
    }

    updateProxySettings();
  });

  // Toggle switch listener
  toggleSwitch.addEventListener('change', () => {
    extensionEnabled = toggleSwitch.checked;
    chrome.storage.local.set({ extensionEnabled });
    updateProxySettings();
  });

  // Mode switch listener
  modeSwitch.addEventListener('change', () => {
    proxyType = modeSwitch.checked ? 'socks5' : 'http';
    chrome.storage.local.set({ proxyType });
    updateProxySettings();
  });

  // Apply button listener
  applyButton.addEventListener('click', () => {
    const proxyString = proxyInput.value.trim();
    chrome.storage.local.set({ proxy: parseProxy(proxyString) });
    updateProxySettings();
  });

  function updateProxySettings() {
    if (extensionEnabled) {
      const proxyString = proxyInput.value.trim();
      const proxy = parseProxy(proxyString);
      if (proxy) {
        const config = {
          mode: 'fixed_servers',
          rules: {
            singleProxy: {
              scheme: proxyType,
              host: proxy.host,
              port: parseInt(proxy.port),
              username: proxy.username,
              password: proxy.password,
            },
          },
        };
        chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          }
        });
      } else {
        console.error('Invalid proxy format');
      }
    } else {
      chrome.proxy.settings.clear({ scope: 'regular' }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        }
      });
    }
  }

  function parseProxy(proxyString) {
    const parts = proxyString.split(':');
    if (parts.length >= 2) {
      return {
        scheme: parts.length > 2 ? parts[2] : 'socks5', // Default to 'socks5' if not specified
        host: parts[0],
        port: parts[1],
        username: parts.length > 3 ? parts[3] : '',
        password: parts.length > 4 ? parts[4] : '',
      };
    }
    return null;
  }
});
