(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const flash = (message, good = true) => {
    let notice = $('.notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.className = 'notice';
      notice.setAttribute('role', 'status');
      document.body.append(notice);
    }
    notice.textContent = message;
    notice.style.borderColor = good ? 'rgba(110,228,183,.34)' : 'rgba(255,145,145,.4)';
    notice.classList.add('show');
    window.clearTimeout(flash.timer);
    flash.timer = window.setTimeout(() => notice.classList.remove('show'), 3600);
  };

  const mobileMenu = $('.menu-toggle');
  const mainMenu = $('.nav-links');
  mobileMenu?.addEventListener('click', () => {
    const open = mainMenu.classList.toggle('open');
    mobileMenu.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.textContent = open ? '×' : '☰';
  });

  const sideToggle = $('.mobile-sidebar-toggle');
  const sideBar = $('.portal-sidebar');
  sideToggle?.addEventListener('click', () => sideBar?.classList.toggle('open'));
  document.addEventListener('click', event => {
    if (sideBar?.classList.contains('open') && !sideBar.contains(event.target) && !sideToggle?.contains(event.target)) {
      sideBar.classList.remove('open');
    }
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: .12
  });
  $$('.reveal').forEach(item => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.count || 0);
      const suffix = node.dataset.suffix || '';
      const start = performance.now();
      const duration = 1150;
      const step = now => {
        const progress = Math.min((now - start) / duration, 1);
        node.textContent = `${Math.round(target * (1 - Math.pow(1 - progress, 3)))}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counterObserver.unobserve(node);
    });
  }, {
    threshold: .5
  });
  $$('[data-count]').forEach(node => counterObserver.observe(node));

  $$('.filter-btn').forEach(button => button.addEventListener('click', () => {
    $$('.filter-btn').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const category = button.dataset.filter;
    $$('.project-card[data-category]').forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    });
  }));

  const projectData = {
    'alpha-ai': {
      name: 'ALPHA AI',
      category: 'AI',
      details: 'An intelligent assistant experience designed to make everyday workflows faster, clearer, and more helpful.',
      tech: 'AI · Product design · Web application'
    },
    'alpha-studio': {
      name: 'ALPHA Studio',
      category: 'Websites',
      details: 'A refined creative platform for teams to organize their work and present ideas with confidence.',
      tech: 'Responsive web · Brand system · UI/UX'
    },
    'alpha-portfolio': {
      name: 'ALPHA Portfolio',
      category: 'Websites',
      details: 'A flexible portfolio experience built around clear storytelling and a strong visual identity.',
      tech: 'Web design · Front-end · Accessibility'
    },
    'alpha-dashboard': { name: 'ALPHA Dashboard', category: 'Software', details: 'A unified analytics workspace that brings key operational signals into one easy-to-read view.', tech: 'Dashboard · Data visualization · SaaS' },
    'alpha-cloud': { name: 'ALPHA Cloud', category: 'Apps', details: 'A secure, streamlined concept for file collaboration and shared project resources.', tech: 'Cloud tools · Collaboration · Mobile-ready' },
    'alpha-games': { name: 'ALPHA Games', category: 'Games', details: 'A playful browser gaming concept with an accessible interface and responsive controls.', tech: 'Game design · Web · Interactive' },
    'alpha-cloud': {
      name: 'ALPHA Cloud',
      category: 'Apps',
      details: 'A secure, streamlined concept for file collaboration and shared project resources.',
      tech: 'Cloud tools · Collaboration · Mobile-ready'
    },
    'alpha-games': {
      name: 'ALPHA Games',
      category: 'Games',
      details: 'A playful browser gaming concept with an accessible interface and responsive controls.',
      tech: 'Game design · Web · Interactive'
    }
  };

  $$('[data-project]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const project = projectData[link.dataset.project];
    if (!project) return;
    const modal = $('#project-modal');
    if (!modal) return;
    $('[data-modal-title]', modal).textContent = project.name;
    $('[data-modal-category]', modal).textContent = project.category;
    $('[data-modal-details]', modal).textContent = project.details;
    $('[data-modal-tech]', modal).textContent = project.tech;
    modal.showModal();
  }));
  $$('[data-modal-close]').forEach(button => button.addEventListener('click', () => $('#project-modal')?.close()));

  const notificationButton = $('.notification-trigger');
  const notificationPanel = $('.notification-popover');
  notificationButton?.addEventListener('click', event => {
    event.stopPropagation();
    notificationPanel?.classList.toggle('open');
    notificationButton.setAttribute('aria-expanded', String(notificationPanel?.classList.contains('open')));
  });
  document.addEventListener('click', event => {
    if (notificationPanel && !notificationPanel.contains(event.target) && !notificationButton?.contains(event.target)) notificationPanel.classList.remove('open');
  });
  $('[data-mark-read]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    $('.badge').forEach(badge => badge.remove());
    flash('You’re all caught up.');
    notificationPanel?.classList.remove('open');
  }));

  const loginForm = $('#login-form');
  loginForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;
    const data = new FormData(loginForm);
    const role = data.get('role');
    // Demo-only role selection. Real production access control must be enforced by a server.
    localStorage.setItem('alphaDemoRole', role);
    localStorage.setItem('alphaDemoName', String(data.get('email')).split('@')[0] || 'Member');
    flash(`Demo ${role} session started. No credentials were sent to a server.`);
    window.setTimeout(() => window.location.assign(role === 'admin' ? '/admin' : '/portal'), 650);
  });

  const signupForm = $('#signup-form');
  signupForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!signupForm.reportValidity()) return;
    const pass = $('#password', signupForm)?.value;
    const confirm = $('#confirm-password', signupForm)?.value;
    if (pass !== confirm) return flash('Your passwords do not match.', false);
    flash('Demo account details validated. Connect an identity provider to create a real account.');
    window.setTimeout(() => window.location.assign('/login'), 1300);
  });

  const requestForms = $$('[data-request-form]');
  requestForms.forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const record = Object.fromEntries(new FormData(form).entries());
    const records = JSON.parse(localStorage.getItem('alphaDemoRequests') || '[]');
    records.push({
      ...record,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('alphaDemoRequests', JSON.stringify(records));
    form.reset();
    flash('Request saved in this browser’s demo storage. It has not been sent to ALPHA IT.');
  }));

  const forgotForm = $('#forgot-form');
  forgotForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!forgotForm.reportValidity()) return;
    flash('Password reset is a demo flow. Connect email delivery to enable real resets.');
    forgotForm.reset();
  });

  $$('[data-logout]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    localStorage.removeItem('alphaDemoRole');
    localStorage.removeItem('alphaDemoName');
    window.location.assign('/');
  }));

  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const currentRole = localStorage.getItem('alphaDemoRole');
  if (currentPath === '/admin' && currentRole !== 'admin') {
    window.location.replace('/login?role=admin');
  } else if ((currentPath === '/portal' || currentPath === '/portal/projects') && !['client', 'admin'].includes(currentRole)) {
    window.location.replace('/login?role=client');
  }
  const userName = localStorage.getItem('alphaDemoName');
  $$('[data-user-name]').forEach(item => {
    if (userName) item.textContent = userName;
  });
  const roleSelect = $('#role-select');
  if (roleSelect && new URLSearchParams(window.location.search).get('role') === 'admin') roleSelect.value = 'admin';

  $('[data-toggle-password]').forEach(button => button.addEventListener('click', () => {
    const field = $(button.dataset.togglePassword);
    if (!field) return;
    field.type = field.type === 'password' ? 'text' : 'password';
    button.textContent = field.type === 'password' ? 'Show' : 'Hide';
  }));

  if (window.ApexCharts && $('#revenue-chart')) {
    const revenue = new ApexCharts($('#revenue-chart'), {
      chart: { type: 'area', height: 230, toolbar: { show: false }, background: 'transparent', foreColor: '#a0abc5' },
      series: [{ name: 'Revenue (sample)', data: [18, 26, 21, 34, 31, 43] }],
      colors: ['#806cff'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      fill: { type: 'gradient', gradient: { opacityFrom: .35, opacityTo: .02 } },
      grid: { borderColor: 'rgba(174,190,255,.12)' },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], axisBorder: { color: 'rgba(174,190,255,.12)' }, axisTicks: { show: false } },
      yaxis: { labels: { formatter: value => `${value}k` } },
      tooltip: { theme: 'dark' }
    });
    revenue.render();
  }
  if (window.ApexCharts && $('#status-chart')) {
    const statusChart = new ApexCharts($('#status-chart'), {
      chart: { type: 'donut', height: 230, background: 'transparent', foreColor: '#a0abc5' },
      series: [8, 6, 3, 1],
      labels: ['In progress', 'Planning', 'Complete', 'On hold'],
      colors: ['#806cff', '#45d6ff', '#55e6ae', '#ffc56f'],
      stroke: { width: 2, colors: ['#101629'] },
      dataLabels: { enabled: false },
      legend: { position: 'bottom', labels: { colors: '#a0abc5' }, fontSize: '10px' },
      tooltip: { theme: 'dark' },
      plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: { show: true, label: 'Projects', color: '#a0abc5', formatter: () => '18' } } } } }
    });
    statusChart.render();
  }
})();
