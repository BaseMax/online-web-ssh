/*jslint browser:true */
/*global Terminal, FitAddon */

var wssh = {};

(function initializeFormDataPolyfill() {
  var proto = FormData.prototype, data = {};

  if (!proto.get) {
    proto.get = function (name) {
      if (data[name] === undefined) {
        var input = document.querySelector('input[name="' + name + '"]');
        var value;
        if (input) {
          if (input.type === 'file') {
            value = input.files[0];
          } else {
            value = input.value;
          }
          data[name] = value;
        }
      }
      return data[name];
    };
  }

  if (!proto.set) {
    proto.set = function (name, value) {
      data[name] = value;
    };
  }
}());

document.addEventListener('DOMContentLoaded', function () {
  var status = document.getElementById('status'),
      formContainer = document.querySelector('.form-container'),
      terminalContainer = document.querySelector('.terminal-container'),
      waiter = document.getElementById('waiter'),
      termSelect = document.getElementById('term'),
      formId = '#connect',
      form = document.querySelector(formId),
      style = {},
      defaultTitle = 'Online Web SSH',
      titleElement = document.querySelector('title'),
      debugMode = form.noValidate,
      DISCONNECTED = 0,
      CONNECTING = 1,
      CONNECTED = 2,
      state = DISCONNECTED,
      messages = { 1: 'Connecting...', 2: 'Already connected.' },
      keyMaxSize = 16384,
      formKeys = ['hostname', 'port', 'username', 'password', 'totp'],
      optsKeys = ['bgcolor', 'title', 'encoding', 'command', 'term', 'fontsize', 'fontcolor'],
      urlFormData = {},
      urlOptsData = {},
      validatedFormData,
      eventOrigin,
      hostnameRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$|^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  function storeItems(names, data) {
    var i, name, value;
    for (i = 0; i < names.length; i++) {
      name = names[i];
      value = data.get(name);
      if (value) {
        try {
          window.localStorage.setItem(name, value);
        } catch (e) {
          console.warn('localStorage not available:', e);
        }
      }
    }
  }

  function restoreItems(names) {
    var i, name, value;
    for (i = 0; i < names.length; i++) {
      name = names[i];
      try {
        value = window.localStorage.getItem(name);
        if (value && document.getElementById(name)) {
          document.getElementById(name).value = value;
        }
      } catch (e) {
        console.warn('localStorage not available:', e);
      }
    }
  }

  function populateForm(data) {
    var names = formKeys.concat(['passphrase']), i, name;
    for (i = 0; i < names.length; i++) {
      name = names[i];
      var element = document.getElementById(name);
      if (element) {
        element.value = data.get(name) || '';
      }
    }
  }

  function getObjectLength(obj) {
    return Object.keys(obj).length;
  }

  function decodeUriComponent(uri) {
    try {
      return decodeURIComponent(uri);
    } catch (e) {
      console.error('URI decode error:', e);
      return '';
    }
  }

  function decodePassword(encoded) {
    try {
      return window.atob(encoded);
    } catch (e) {
      console.error('Password decode error:', e);
      return null;
    }
  }

  function parseUrlData(string, formKeys, optsKeys, formMap, optsMap) {
    var i, pair, key, val, arr = string.split('&');
    for (i = 0; i < arr.length; i++) {
      pair = arr[i].split('=');
      key = pair[0].trim().toLowerCase();
      val = pair.slice(1).join('=').trim();

      if (formKeys.indexOf(key) >= 0) {
        formMap[key] = val;
      } else if (optsKeys.indexOf(key) >= 0) {
        optsMap[key] = val;
      }
    }

    if (formMap.password) {
      formMap.password = decodePassword(formMap.password);
    }
  }

  function getCellSize(term) {
    try {
      if (term._core && term._core._renderService && term._core._renderService._renderer) {
        style.width = term._core._renderService._renderer.dimensions.actualCellWidth;
        style.height = term._core._renderService._renderer.dimensions.actualCellHeight;
      }
    } catch (e) {
      console.warn('Error getting cell size:', e);
    }
  }

  function toggleFullscreen(element) {
    if (element.classList.contains('fullscreen')) {
      element.classList.remove('fullscreen');
    } else {
      element.classList.add('fullscreen');
    }
  }

  function currentGeometry(term) {
    if (!style.width || !style.height) {
      getCellSize(term);
      if (!style.width || !style.height) {
        style.width = 8;
        style.height = 17;
      }
    }

    var cols = Math.max(20, Math.floor(window.innerWidth / style.width) - 2);
    var rows = Math.max(5, Math.floor(window.innerHeight / style.height) - 2);
    return { 'cols': cols, 'rows': rows };
  }

  function resizeTerminal(term) {
    if (!term) return;
    var geometry = currentGeometry(term);
    if (term.resize) {
      term.resize(geometry.cols, geometry.rows);
    }
  }

  function setBackgroundColor(term, color) {
    if (term && term.setOption) {
      term.setOption('theme', { background: sanitizeTermColor(color, 'black') });
    }
  }

  function setFontColor(term, color) {
    if (term && term.setOption) {
      term.setOption('theme', { foreground: sanitizeTermColor(color, 'white') });
    }
  }

  function formatGeometry(cols, rows) {
    return JSON.stringify({ 'cols': cols, 'rows': rows });
  }

  function readFileAsText(file, callback) {
    if (!file) {
      callback(null);
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      try {
        var text = new TextDecoder('utf-8', { 'fatal': true }).decode(reader.result);
        callback(text);
      } catch (e) {
        console.error('Decoding error:', e);
        callback(null);
      }
    };

    reader.onerror = function (e) {
      console.error('File read error:', e);
      callback(null);
    };

    try {
      reader.readAsArrayBuffer(file);
    } catch (e) {
      console.error('File reading not supported:', e);
      callback(null);
    }
  }

  function resetWssh() {
    var name;
    for (name in wssh) {
      if (wssh.hasOwnProperty(name) && name !== 'connect') {
        delete wssh[name];
      }
    }
  }

  function sanitizeTermColor(value, fallback) {
    if (!value || typeof value !== 'string') {
      return fallback;
    }
    var t = value.trim();
    if (t.length > 128) {
      return fallback;
    }
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/i.test(t)) {
      return t;
    }
    if (/^rgba?\(\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}/.test(t) && /\)\s*$/i.test(t)) {
      if (/[<>\"';]|url\(/i.test(t)) {
        return fallback;
      }
      return t;
    }
    if (/^[a-z]{1,40}$/i.test(t)) {
      return t;
    }
    return fallback;
  }

  function logStatus(text, toPopulate) {
    console.log(text);
    status.textContent = text;
    status.style.display = 'block';

    if (toPopulate && validatedFormData) {
      populateForm(validatedFormData);
      validatedFormData = undefined;
    }

    if (waiter.style.display !== 'none') {
      waiter.style.display = 'none';
    }

    if (formContainer.style.display === 'none') {
      formContainer.style.display = 'block';
      terminalContainer.classList.remove('active');
    }
  }

  function showForm() {
    formContainer.style.display = 'block';
    terminalContainer.classList.remove('active');
  }

  function showTerminal() {
    formContainer.style.display = 'none';
    terminalContainer.classList.add('active');
  }

  function handleConnectionSuccess(msg) {
    var wsUrl = window.location.href.split(/\?|#/, 1)[0].replace('http', 'ws');
    var join = (wsUrl[wsUrl.length - 1] === '/' ? '' : '/');
    var url = wsUrl + join + 'ws?id=' + msg.id;
    var sock = new WebSocket(url);
    var encoding = 'utf-8';
    var terminalDiv = document.getElementById('terminal');
    var termOptions = {
      cursorBlink: true,
      cols: 80,
      rows: 24,
      theme: {
        background: sanitizeTermColor(urlOptsData.bgcolor, 'black'),
        foreground: sanitizeTermColor(urlOptsData.fontcolor, 'white')
      }
    };

    if (urlOptsData.fontsize) {
      var fontsize = parseInt(urlOptsData.fontsize);
      if (fontsize && fontsize > 0) {
        termOptions.fontSize = fontsize;
      }
    }

    var term = new Terminal(termOptions);
    var fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);

    console.log('WebSocket URL:', url);
    if (!msg.encoding) {
      console.log('Using default UTF-8 encoding');
    } else {
      encoding = msg.encoding;
      console.log('Server encoding:', encoding);
    }

    function termWrite(text) {
      if (term && text) {
        term.write(text);
        if (!term.resized) {
          try {
            fitAddon.fit();
          } catch (e) {
            console.warn('Terminal fit error:', e);
          }
          term.resized = true;
        }
      }
    }

    function setEncoding(newEncoding) {
      if (!newEncoding) {
        console.log('Encoding required');
        return false;
      }

      try {
        new TextDecoder(newEncoding);
        encoding = newEncoding;
        console.log('Encoding set to:', encoding);
        return true;
      } catch (e) {
        console.log('Unknown encoding:', newEncoding);
        return false;
      }
    }

    wssh.setEncoding = setEncoding;

    if (urlOptsData.encoding) {
      if (setEncoding(urlOptsData.encoding) === false) {
        setEncoding(msg.encoding || 'utf-8');
      }
    } else {
      setEncoding(msg.encoding || 'utf-8');
    }

    wssh.geometry = function () {
      var geometry = currentGeometry(term);
      console.log('Current geometry:', JSON.stringify(geometry));
    };

    wssh.send = function (data) {
      if (!sock) {
        console.log('WebSocket closed');
        return;
      }

      if (typeof data !== 'string') {
        console.log('Only string data allowed');
        return;
      }

      try {
        JSON.parse(data);
        sock.send(data);
      } catch (e) {
        data = data.trim() + '\r';
        sock.send(JSON.stringify({ 'data': data }));
      }
    };

    wssh.resize = function (cols, rows) {
      if (!term) {
        console.log('Terminal not available');
        return;
      }

      var geometry = currentGeometry(term);
      if (cols > 0 && rows > 0 && cols <= geometry.cols && rows <= geometry.rows) {
        term.resize(cols, rows);
        sock.send(JSON.stringify({ 'resize': [cols, rows] }));
      } else {
        console.log('Invalid geometry:', formatGeometry(cols, rows));
      }
    };

    wssh.setBgcolor = function (color) {
      setBackgroundColor(term, color);
    };

    wssh.setFontcolor = function (color) {
      setFontColor(term, color);
    };

    term.onData(function (data) {
      sock.send(JSON.stringify({ 'data': data }));
    });

    sock.onopen = function () {
      term.open(terminalDiv);
      showTerminal();
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('Terminal fit error on open:', e);
      }
      term.focus();
      state = CONNECTED;
      titleElement.textContent = urlOptsData.title || defaultTitle;
      if (urlOptsData.command) {
        setTimeout(function () {
          sock.send(JSON.stringify({ 'data': urlOptsData.command + '\r' }));
        }, 500);
      }
      logStatus('Connected to ' + (urlOptsData.title || 'server'), false);
    };

    sock.onmessage = function (event) {
      readFileAsText(event.data, termWrite);
    };

    sock.onerror = function (e) {
      console.error('WebSocket error:', e);
      logStatus('Connection error: ' + (e.reason || 'Unknown error'), true);
    };

    sock.onclose = function (e) {
      if (term) {
        term.dispose();
      }
      term = undefined;
      sock = undefined;
      resetWssh();
      logStatus('Disconnected: ' + (e.reason || 'Connection closed'), true);
      state = DISCONNECTED;
      titleElement.textContent = defaultTitle;
      showForm();
    };

    window.addEventListener('resize', function () {
      if (term && fitAddon) {
        try {
          fitAddon.fit();
        } catch (e) {
          console.warn('Terminal fit error on resize:', e);
        }
      }
    });
  }

  function wrapObject(opts) {
    var obj = {};
    obj.get = function (attr) {
      return opts[attr] || '';
    };
    obj.set = function (attr, val) {
      opts[attr] = val;
    };
    return obj;
  }

  function cleanData(data) {
    var i, attr, val, attrs = formKeys.concat(['privatekey', 'passphrase']);
    for (i = 0; i < attrs.length; i++) {
      attr = attrs[i];
      val = data.get(attr);
      if (typeof val === 'string') {
        data.set(attr, val.trim());
      }
    }
  }

  function validateFormData(data) {
    cleanData(data);

    var hostname = data.get('hostname'),
        port = data.get('port'),
        username = data.get('username'),
        pk = data.get('privatekey'),
        result = { valid: false, data: data, title: '' },
        errors = [],
        size;

    if (!hostname) {
      errors.push('Hostname is required');
    } else if (!hostnameRegex.test(hostname)) {
      errors.push('Invalid hostname: ' + hostname);
    }

    if (!port) {
      port = '22';
      data.set('port', port);
    } else if (!(port > 0 && port <= 65535)) {
      errors.push('Port must be between 1 and 65535');
    }

    if (!username) {
      errors.push('Username is required');
    }

    if (pk) {
      size = pk.size || pk.length;
      if (size > keyMaxSize) {
        errors.push('Private key file too large');
      }
    }

    if (!errors.length || debugMode) {
      result.valid = true;
      result.title = username + '@' + hostname + ':' + port;
    }

    result.errors = errors;
    return result;
  }

  function disableFileInputs(inputs) {
    var i;
    for (i = 0; i < inputs.length; i++) {
      if (inputs[i].files.length === 0) {
        inputs[i].setAttribute('disabled', '');
      }
    }
  }

  function enableFileInputs(inputs) {
    var i;
    for (i = 0; i < inputs.length; i++) {
      inputs[i].removeAttribute('disabled');
    }
  }

  function connectWithoutOptions() {
    var inputs = form.querySelectorAll('input[type="file"]');
    var data = new FormData(form);
    var pk = data.get('privatekey');

    disableFileInputs(inputs);
    data = new FormData(form);
    pk = data.get('privatekey');
    enableFileInputs(inputs);

    var result = validateFormData(data);
    if (!result.valid) {
      logStatus(result.errors.join('\n'));
      return;
    }

    function ajaxPost() {
      status.textContent = '';
      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      waiter.style.display = 'flex';

      fetch(form.action, {
        method: 'POST',
        body: data
      })
      .then(function(response) {
        submitBtn.disabled = false;
        waiter.style.display = 'none';

        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error(response.status + ': ' + response.statusText);
        }
      })
      .then(function(msg) {
        if (msg.id) {
          state = CONNECTED;
          validatedFormData = result.data;
          storeItems(['hostname', 'port', 'username'], result.data);
          handleConnectionSuccess(msg);
        } else {
          logStatus(msg.status || 'Connection failed', true);
          state = DISCONNECTED;
        }
      })
      .catch(function(error) {
        submitBtn.disabled = false;
        waiter.style.display = 'none';
        logStatus('Error: ' + error.message, true);
        state = DISCONNECTED;
      });
    }

    if (pk && pk.size && !debugMode) {
      readFileAsText(pk, function (text) {
        if (text === undefined || text === null) {
          logStatus('Invalid private key: ' + (pk.name || 'unknown'));
        } else {
          ajaxPost();
        }
      });
    } else {
      ajaxPost();
    }

    return result;
  }

  function connect(hostname, port, username, password) {
    if (state !== DISCONNECTED) {
      console.log(messages[state]);
      return;
    }

    if (hostname === undefined) {
      connectWithoutOptions();
    } else {
      console.log('Manual connection parameters provided');
    }
  }

  wssh.connect = connect;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    state = CONNECTING;
    connect();
  });

  // Parse URL parameters
  parseUrlData(
    decodeUriComponent(window.location.search.substring(1)) + '&' +
    decodeUriComponent(window.location.hash.substring(1)),
    formKeys, optsKeys, urlFormData, urlOptsData
  );

  if (urlOptsData.term) {
    termSelect.value = urlOptsData.term;
  }

  // Sync color pickers with text inputs
  var fontColorPicker = document.getElementById('fontcolor');
  var bgColorPicker = document.getElementById('bgcolor');
  var fontColorText = document.getElementById('fontcolor-text');
  var bgColorText = document.getElementById('bgcolor-text');

  if (fontColorPicker && fontColorText) {
    fontColorPicker.addEventListener('input', function () {
      fontColorText.value = this.value;
    });
    fontColorText.addEventListener('input', function () {
      fontColorPicker.value = this.value;
    });
  }

  if (bgColorPicker && bgColorText) {
    bgColorPicker.addEventListener('input', function () {
      bgColorText.value = this.value;
    });
    bgColorText.addEventListener('input', function () {
      bgColorPicker.value = this.value;
    });
  }

  // Initialize form
  if (getObjectLength(urlFormData)) {
    waiter.style.display = 'flex';
  } else {
    restoreItems(['hostname', 'port', 'username']);
    formContainer.style.display = 'block';
  }
});

window.wssh = wssh;
