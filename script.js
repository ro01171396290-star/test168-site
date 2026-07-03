/* ========================================
   test168 – Interactive Logic
   ======================================== */

(function () {
  'use strict';

  /* ---------- Tab Switching ---------- */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = this.getAttribute('data-tab');

      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      tabPanels.forEach(function (p) { p.classList.remove('active'); });

      this.classList.add('active');
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  /* ---------- Hamburger Menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      this.classList.toggle('active');
      navLinks.classList.toggle('show');
    });

    // Close menu on link click (mobile)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('show');
      });
    });
  }

  /* ---------- Terms Collapse ---------- */
  const termsToggle = document.getElementById('termsToggle');
  const termsContent = document.getElementById('termsContent');

  if (termsToggle && termsContent) {
    termsToggle.addEventListener('click', function () {
      this.classList.toggle('active');
      termsContent.classList.toggle('open');
    });
  }

  /* ---------- Smooth Scroll for Nav Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Navbar Active Link on Scroll ---------- */
  var sections = document.querySelectorAll('section[id]');
  var navItems = document.querySelectorAll('.nav-link');

  function onScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach(function (section) {
      var sectionTop = section.offsetTop - 100;
      var sectionHeight = section.offsetHeight;
      var sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navItems.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ========================================
     Register Modal
     ======================================== */
  const registerBtn = document.getElementById('registerBtn');
  const registerModal = document.getElementById('registerModal');
  const registerModalClose = document.getElementById('registerModalClose');
  const registerForm = document.getElementById('registerForm');
  const registerStatus = document.getElementById('registerStatus');

  function openRegisterModal() {
    registerModal.classList.add('open');
  }

  function closeRegisterModal() {
    registerModal.classList.remove('open');
    registerStatus.textContent = '';
    registerStatus.className = 'form-status';
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openRegisterModal();
    });
  }

  if (registerModalClose) {
    registerModalClose.addEventListener('click', closeRegisterModal);
  }

  if (registerModal) {
    registerModal.addEventListener('click', function (e) {
      if (e.target === registerModal) closeRegisterModal();
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('regName').value.trim();
      var mobile = document.getElementById('regMobile').value.trim();
      var email = document.getElementById('regEmail').value.trim();
      var password = document.getElementById('regPassword').value;

      if (!name || !mobile || !email || !password) {
        registerStatus.textContent = 'Please fill in all fields.';
        registerStatus.className = 'form-status error';
        return;
      }

      registerStatus.textContent = 'Submitting...';
      registerStatus.className = 'form-status';

      fetch('https://test168.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, mobile: mobile, email: email, password: password })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          registerStatus.textContent = 'Registration submitted, awaiting approval.';
          registerStatus.className = 'form-status success';
          registerForm.reset();
          setTimeout(closeRegisterModal, 2000);
        })
        .catch(function () {
          registerStatus.textContent = 'Registration submitted, awaiting approval.';
          registerStatus.className = 'form-status success';
          registerForm.reset();
          setTimeout(closeRegisterModal, 2000);
        });
    });
  }

  /* ========================================
     Chat Widget
     ======================================== */
  const navChat = document.getElementById('navChat');
  const chatWindow = document.getElementById('chatWindow');
  const chatClose = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatFileInput = document.getElementById('chatFileInput');
  const chatAttach = document.getElementById('chatAttach');
  const nicknameModal = document.getElementById('nicknameModal');
  const nicknameInput = document.getElementById('nicknameInput');
  const nicknameSubmit = document.getElementById('nicknameSubmit');

  var nickname = localStorage.getItem('test168_chat_nickname') || '';
  var customerId = localStorage.getItem('test168_chat_customer_id') || '';
  var chatOpen = false;
  var pollTimer = null;
  var lastMessageId = 0;

  function toggleChat() {
    chatOpen = !chatOpen;
    if (chatOpen) {
      if (!nickname) {
        nicknameModal.classList.add('open');
        chatWindow.classList.remove('open');
      } else {
        chatWindow.classList.add('open');
        chatInput.focus();
        startPolling();
      }
    } else {
      chatWindow.classList.remove('open');
      stopPolling();
    }
  }

  function closeChat() {
    chatOpen = false;
    chatWindow.classList.remove('open');
    stopPolling();
  }

  function startPolling() {
    stopPolling();
    if (nickname) {
      fetchMessages();
      pollTimer = setInterval(fetchMessages, 5000);
    }
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function formatTime() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
  }

  function addMessage(name, message, isSelf) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + (isSelf ? 'self' : 'admin');
    div.innerHTML = '<strong>' + escapeHtml(name) + '</strong>: ' + renderMessageContent(message) +
      '<span class="msg-time">' + formatTime() + '</span>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function renderMessageContent(text) {
    var escaped = escapeHtml(text);
    // Replace image markdown ![](url)
    escaped = escaped.replace(/!\[\]\(([^)]+)\)/g, '<img src="$1" class="chat-msg-img" loading="lazy">');
    // Replace file markdown [name](url)
    escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$1" class="chat-file-link" target="_blank">$1</a>');
    return escaped;
  }

  function escapeHtml(text) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function (c) { return map[c]; });
  }

  function fetchMessages() {
    var url = API_BASE + '/api/chat/messages';
    if (customerId) {
      url += '?customer_id=' + encodeURIComponent(customerId);
    } else if (nickname) {
      url += '?name=' + encodeURIComponent(nickname);
    }
    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var messages = Array.isArray(data) ? data : (data.messages || []);
        var newMsgs = false;
        messages.forEach(function (msg) {
          var msgId = msg.id || 0;
          if (msgId > lastMessageId) {
            lastMessageId = msgId;
            var senderName = msg.sender_type === 'admin' ? (msg.customer_name || 'Admin') : (msg.customer_name || nickname || 'You');
            var text = msg.message || '';
            var isSelf = msg.sender_type !== 'admin';
            addMessage(senderName, text, isSelf);
            newMsgs = true;
          }
        });
        if (!newMsgs && messages.length > 0) {
          lastMessageId = messages[messages.length - 1].id || lastMessageId;
        }
      })
      .catch(function () { /* silent */ });
  }

  function sendMessage() {
    var text = chatInput.value.trim();
    if (!text || !nickname) return;

    addMessage(nickname, text, true);
    chatInput.value = '';

    fetch(API_BASE + '/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nickname, message: text })
    }).then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.customer_id) {
          customerId = String(data.customer_id);
          localStorage.setItem('test168_chat_customer_id', customerId);
        }
      }).catch(function () { /* silent */ });

    // Refresh after sending
    setTimeout(fetchMessages, 1000);
  }

  // File upload for chat
  if (chatAttach) {
    chatAttach.addEventListener('click', function () {
      chatFileInput.click();
    });
  }

  if (chatFileInput) {
    chatFileInput.addEventListener('change', function () {
      var file = chatFileInput.files[0];
      if (!file) return;
      if (!nickname) {
        toggleChat();
        chatFileInput.value = '';
        return;
      }
      var formData = new FormData();
      formData.append('name', nickname);
      formData.append('file', file);

      fetch(API_BASE + '/api/chat/upload', {
        method: 'POST',
        body: formData
      }).then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.customer_id) {
            customerId = String(data.customer_id);
            localStorage.setItem('test168_chat_customer_id', customerId);
          }
          setTimeout(fetchMessages, 500);
        }).catch(function () { /* silent */ });

      chatFileInput.value = '';
    });
  }

  if (navChat) {
    navChat.addEventListener('click', function (e) {
      e.preventDefault();
      toggleChat();
    });
  }

  if (chatClose) {
    chatClose.addEventListener('click', closeChat);
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (nicknameSubmit) {
    nicknameSubmit.addEventListener('click', function () {
      var name = nicknameInput.value.trim();
      if (!name) return;
      nickname = name;
      localStorage.setItem('test168_chat_nickname', name);
      nicknameModal.classList.remove('open');
      chatWindow.classList.add('open');
      chatInput.focus();
      startPolling();
    });

    nicknameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        nicknameSubmit.click();
      }
    });
  }

  if (nicknameModal) {
    nicknameModal.addEventListener('click', function (e) {
      if (e.target === nicknameModal) {
        nicknameModal.classList.remove('open');
        chatOpen = false;
      }
    });
  }

})();
