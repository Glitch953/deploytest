const apiBaseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') 
    ? 'http://localhost:5000/api' 
    : '/api';

function getTypeArabic(type) {
    const types = {
        'courses': 'دورات تدريبية',
        'events': 'فعاليات ومبادرات',
        'competitions': 'مسابقات وجوائز',
        'sports': 'أنشطة رياضية',
        'other': 'أخرى'
    };
    return types[type] || 'فعالية';
}
function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        'approved': 'bg-green-500/20 text-green-400 border border-green-500/30',
        'rejected': 'bg-red-500/20 text-red-400 border border-red-500/30',
        'waitlist': 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    };
    return classes[status] || classes.pending;
}

        function getStatusText(status) {
            const texts = {
                'pending': 'قيد الانتظار',
                'approved': 'مقبول',
                'rejected': 'مرفوض',
                'waitlist': 'قائمة انتظار'
            };
            return texts[status] || status;
        }

document.addEventListener('DOMContentLoaded', async () => {

    const savedTheme = localStorage.getItem('theme') || 'night';
document.documentElement.className = savedTheme;

    setTheme(savedTheme);
    //applyLanguage(currentLang);
    updateNavbar();
    
    let user = null;
    try {
        user = await loadCurrentUser();
        if (user) {
            checkUserSuspension(user);
        }
    } catch (e) {
        console.error("Initialization user fetch failed:", e);
    }
    
    window.onpopstate = (event) => {
        if (event.state && event.state.page) {
            loadPage(event.state.page, false);
        } else {
            const currentPath = window.location.pathname.substring(1);
            if (currentPath && currentPath !== 'home' && pages[currentPath]) {
                loadPage(currentPath, false);
            } else {
                loadPage('home', false);
            }
        }
    };

    const path = window.location.pathname.substring(1);
    if (path && path !== 'index.html' && path !== 'home') {
        loadPage(path);
    } else {
        loadPage('home');
    }


    setTimeout(() => {
        document.getElementById('footer').style.opacity = '1';
        document.getElementById('footer').classList.remove('hidden');
    }, 1000);

    window.scrollTo(0, 0);
});

async function loadCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${apiBaseUrl}/user/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        localStorage.removeItem('token');
        return null;
    }

    return await response.json();
}

(function() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1; 
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 5 + 's';
        star.style.animationDuration = (Math.random() * 5 + 3) + 's';
        
        starsContainer.appendChild(star);
    }
})();

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(`btn-${theme}-mode`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

tailwind.config = {
    darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    primary: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    accent: 'var(--accent)',
                    'accent-hover': 'var(--accent-hover)',
                    'text-primary': 'var(--text-primary)',
                    'text-secondary': 'var(--text-secondary)'
                }
            }
        }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    
    if (!mobileMenu || !menuIcon) {
        return;
    }
    
    if (!mobileMenu.classList.contains('active')) {
        mobileMenu.classList.add('active');
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-times');
        document.body.style.overflow = 'hidden';
    } else {
        mobileMenu.classList.remove('active');
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
        document.body.style.overflow = '';
    }
}
function handleMobileNav(page) {
    toggleMobileMenu();
    loadPage(page);
}

function logout() {
    localStorage.removeItem('token');
    showNotification('تم تسجيل الخروج', 'info');
    loadPage('home');
    updateNavbar();
}

function showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <div class="toast-content font-medium">${message}</div>
    `;

    container.appendChild(toast);

    toast.offsetHeight;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// Custom Confirm Modal for actions
function showConfirmModal(title, text, onConfirm, type = 'warning', confirmText = 'تأكيد') {
    const existing = document.getElementById('custom-confirm-modal');
    if (existing) existing.remove();

    const typeConfigs = {
        success: {
            icon: 'fa-check-circle',
            iconColor: 'text-green-400',
            iconBg: 'bg-green-500/20',
            border: 'border-green-500/30',
            btnGradient: 'from-green-500 to-emerald-600',
            btnShadow: 'shadow-green-500/20',
            premium: true
        },
        danger: {
            icon: 'fa-exclamation-circle',
            iconColor: 'text-red-400',
            iconBg: 'bg-red-500/20',
            border: 'border-red-500/30',
            btnGradient: 'from-red-500 to-rose-600',
            btnShadow: 'shadow-red-500/20',
            premium: true
        },
        warning: {
            icon: 'fa-exclamation-triangle',
            iconColor: 'text-orange-400',
            iconBg: 'bg-orange-500/20',
            border: 'border-orange-500/30',
            btnGradient: 'from-orange-500 to-red-600',
            btnShadow: 'shadow-orange-500/20',
            premium: true
        },
        'activity-success': {
            icon: 'fa-star',
            iconColor: 'text-sky-400',
            iconBg: 'bg-sky-500/20',
            border: 'border-sky-500/40',
            btnGradient: 'from-sky-500 to-blue-600',
            btnShadow: 'shadow-sky-500/30',
            premium: true
        },
        'activity-danger': {
            icon: 'fa-calendar-times',
            iconColor: 'text-rose-400',
            iconBg: 'bg-rose-500/20',
            border: 'border-rose-500/40',
            btnGradient: 'from-rose-500 to-red-700',
            btnShadow: 'shadow-rose-500/30',
            premium: true
        }
    };

    const config = typeConfigs[type] || typeConfigs.warning;

    const modal = document.createElement('div');
    modal.id = 'custom-confirm-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-[#050B14]/95 backdrop-blur-md opacity-0 transition-opacity duration-300';
    
    const premiumClasses = config.premium ? 'shadow-[0_0_50px_rgba(23,148,232,0.15)] ring-1 ring-white/10' : '';
    const textDesign = config.premium ? 'text-white' : 'text-gray-400';

    modal.innerHTML = `
        <div class="bg-[#020F17] border ${config.border} ${premiumClasses} rounded-[2rem] p-10 w-[95%] max-w-sm shadow-2xl transform scale-90 transition-all duration-300">
            <div class="flex flex-col items-center text-center">
                <div class="w-24 h-24 ${config.iconBg} rounded-[1.5rem] flex items-center justify-center mb-8 border ${config.border} ${config.iconColor} text-5xl transform rotate-6 hover:rotate-0 transition-all duration-500 shadow-inner">
                    <i class="fas ${config.icon}"></i>
                </div>
                <h3 class="text-3xl font-black text-white mb-4 tracking-tight">${title}</h3>
                <div class="p-4 rounded-2xl bg-white/5 border border-white/5 mb-8">
                     <p class="${textDesign} text-lg font-bold leading-relaxed px-2">${text}</p>
                </div>
                <div class="flex gap-4 w-full">
                    <button type="button" id="confirm-cancel-btn" class="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-bold hover:text-white hover:bg-white/10 transition-all">إلغاء</button>
                    <button type="button" id="confirm-accept-btn" class="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-br ${config.btnGradient} text-white font-black shadow-xl hover:${config.btnShadow} hover:scale-105 active:scale-95 transition-all">${confirmText}</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animate in
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-90');
    }, 10);

    const closeModal = () => {
        modal.classList.add('opacity-0');
        modal.querySelector('div').classList.add('scale-90');
        setTimeout(() => modal.remove(), 300);
    };

    document.getElementById('confirm-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('confirm-accept-btn').addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
    });
}


// Custom Prompt Modal for inputs
function showPromptModal(title, placeholderText, onConfirm) {
    // Remove if exists
    const existing = document.getElementById('custom-prompt-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'custom-prompt-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-[#050B14]/80 backdrop-blur-sm opacity-0 transition-opacity duration-300';
    
    modal.innerHTML = `
        <div class="bg-[var(--bg-primary)] border border-sky-500/30 rounded-2xl p-6 w-[90%] max-w-md shadow-2xl transform scale-95 transition-transform duration-300">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <i class="fas fa-question-circle text-sky-400"></i> ${title}
            </h3>
            <textarea id="prompt-input-val" class="w-full h-24 bg-[#0B1521]/50 border border-sky-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-sky-400 mb-6 placeholder:text-gray-500" placeholder="${placeholderText}"></textarea>
            <div class="flex gap-3 justify-end">
                <button type="button" id="prompt-cancel-btn" class="px-5 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">إلغاء</button>
                <button type="button" id="prompt-confirm-btn" class="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold hover:shadow-lg hover:shadow-sky-500/20 transition-all">تأكيد الإغلاق</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animate in
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);

    const closeModal = () => {
        modal.classList.add('opacity-0');
        modal.querySelector('div').classList.add('scale-95');
        setTimeout(() => modal.remove(), 300);
    };

    document.getElementById('prompt-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('prompt-confirm-btn').addEventListener('click', () => {
        const val = document.getElementById('prompt-input-val').value.trim();
        closeModal();
        if (onConfirm) onConfirm(val);
    });
}

// Global Registration Modal close handler
window.closeModal = function(id) {
    const modalId = id || 'registrationModal';
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (modalId === 'registrationModal') {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        const form = document.getElementById('registrationForm');
        if (form) form.reset();
    } else {
        modal.remove();
    }
};

async function loadPage(page, push = true) {
    if (!pages[page]) {
        page = 'error404';
    }
    document.getElementById("content").innerHTML = pages[page];

    if (push) {
        const newPath = page === 'home' ? '/' : `/${page}`;
        if (window.location.pathname !== newPath) {
            window.history.pushState({ page: page }, '', newPath);
        }
    }
    let user = null;
    try {
        user = await loadCurrentUser();
    } catch (e) {
        console.error("Failed to load user info:", e);
    }

    if (page === 'home') {
        const homeButtons = document.getElementById('homeButtons');
        if (homeButtons) {
            if (user) {
                homeButtons.innerHTML = `
                    <button class="btn-gradient" onclick="loadPage('news')">
                        اكتشف الأخبار
                        <i class="fas fa-arrow-left"></i>
                    </button>
                `;
            } else {
                homeButtons.innerHTML = `
                    <a href="https://forms.gle/39rwVUJaqenBPRSQA" target="_blank" class="btn-gradient">
                        <i class="fas fa-user-plus"></i>
                        سجل الآن
                    </a>
                    <button onclick="loadPage('login')" class="btn-outline">
                        <i class="fas fa-sign-in-alt text-accent"></i>
                        تسجيل الدخول
                    </button>
                `;
            }
        }
    }

    if (page === 'adminPanel') {
        if (!user || user.role !== 'admin') {
            showNotification('يجب تسجيل الدخول كمسؤول للوصول لهذه الصفحة', 'error');
            loadPage('login');
            return;
        }
        updateAdminStats();
    }

    if (page === 'account') {
        if (!user) {
            document.getElementById("content").innerHTML = pages['guestLanding'];
            return;
        }
        document.getElementById("content").innerHTML = pages[page];

        if (typeof loadProfileData === 'function') loadProfileData();
    }

    if (page === 'quizGame'){
        initQuizLobby();
    }

    if (page === 'events') {
        EventsController.init(); 
    }

    if (page === 'news') {
        fetchNews();
    }

    if (page === 'chat') {
        initChat();
    }

    if (page === 'archive') {
        initArchivePage();
    }

    if (page === 'userSearch') {
        if (typeof searchUsers === 'function') searchUsers('');
    }

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// showTab - used by events page tab buttons
function showTab(type) {
    state.currentType = type === 'all' ? 'all' : type;
    if (typeof EventsController !== 'undefined') {
        EventsController.updateView();
    }
    // Update active tab button styles
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === type;
        btn.classList.toggle('active-tab', isActive);
        btn.style.background = isActive
            ? 'linear-gradient(135deg, var(--sky-500, #0ea5e9), var(--teal-500, #14b8a6))'
            : '';
        btn.style.color = isActive ? '#fff' : '';
    });
}
// load page pre
function loadPagepre(page) {

            const user = getUser();


            if (page === 'adminPanel') {
                if (!user || user.role !== 'admin') {
                    showNotification('يجب تسجيل الدخول كمسؤول للوصول لهذه الصفحة', 'error');
                    loadPage('login');
                    return;
                }
            }

            if (page === 'account') {
                if (!user) {
                    document.getElementById("content").innerHTML = pages['guestLanding'];
                    return;
                }
                document.getElementById("content").innerHTML = pages[page];
            }

            document.getElementById("content").innerHTML = pages[page];

            if (page === 'home') {
                const homeButtons = document.getElementById('homeButtons');
                if (homeButtons) {
                    if (user) {
                        homeButtons.innerHTML = `
                            <button class="btn-primary px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2" onclick="loadPage('dashboard')">
                                اكتشف الأخبار
                                <i class="fas fa-arrow-left"></i>
                            </button>
                        `;
                    } else {
                        homeButtons.innerHTML = `
                            <a href="https://forms.gle/39rwVUJaqenBPRSQA" target="_blank" class="btn-primary px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2">
                                <i class="fas fa-user-plus"></i>
                                سجل الآن
                            </a>
                            <button onclick="loadPage('login')" class="card px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 hover:border-accent">
                                <i class="fas fa-sign-in-alt text-accent"></i>
                                تسجيل الدخول
                            </button>
                        `;
                    }
                }
            }

            if (page === 'dashboard') {
                fetchNews();
            }
            if (page === 'account') {
                if (typeof loadProfileData === 'function') loadProfileData();
            }
            if (page === 'events') {
                loadEventsUser();
            }
            if (page === 'quizGame') {
                initQuizLobby();
            }
            if (page === 'chat') {
                initChat();
            } else {
                if (chatPollingInterval) {
                    clearInterval(chatPollingInterval);
                    chatPollingInterval = null;
                }
            }
            updateActiveLink(page);
            applyLanguage(currentLang);

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${apiBaseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.message || 'فشل تسجيل الدخول', 'error');
            return;
        }

        localStorage.setItem('token', data.token);

        const userResponse = await fetch(`${apiBaseUrl}/user/me`, {
            headers: {
                Authorization: `Bearer ${data.token}`
            }
        });

        if (!userResponse.ok) {
            localStorage.removeItem('token');
            showNotification('فشل تحميل بيانات المستخدم', 'error');
            return;
        }

        const user = await userResponse.json();

        showNotification('تم تسجيل الدخول بنجاح!', 'success');

        if (user.role === 'admin') {
            loadPage('adminPanel');
        } else {
            loadPage('home');
        }

        window.location.reload();

    } catch (error) {
        showNotification('حدث خطأ أثناء الاتصال', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        showNotification('كلمات المرور غير متطابقة!', 'error');
        return;
    }

    const username = `${firstName} ${lastName}`;

    try {
        const response = await fetch(`${apiBaseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                firstName,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.message || 'فشل إنشاء الحساب', 'error');
            return;
        }

        showNotification('تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.', 'success');
        loadPage('login');

    } catch (error) {
        showNotification('حدث خطأ أثناء الاتصال بالسيرفر', 'error');
    }
}

        async function deleteUser(userId) {
            showConfirmModal('حذف المستخدم', 'هل أنت متأكد من حذف هذا المستخدم نهائيا؟', async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${apiBaseUrl}/user/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        showNotification('تم حذف المستخدم', 'success');
                        fetchUsers();
                    } else {
                        showNotification('فشل في حذف المستخدم', 'error');
                    }
                } catch (error) {
                    showNotification('خطأ بالاتصال بالسيرفر', 'error');
                }
            }, 'delete');
        }
        // Privacy & Followers Logic
        async function updatePrivacySettings(showFollowers) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${apiBaseUrl}/user/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        privacySettings: { showFollowers }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    showNotification('تم تحديث إعدادات الخصوصية', 'success');
                } else {
                    showNotification('فشل تحديث الإعدادات', 'error');
                    document.getElementById('privacy-showFollowers').checked = !showFollowers;
                }
            } catch (error) {
                console.error('Error updating privacy:', error);
                showNotification('خطأ في الاتصال', 'error');
            }
        }

        async function showFollowersModal(userId, type) {
    const modal = document.getElementById('followersModal');
    const list = document.getElementById('followersList');
    const title = document.getElementById('followersModalTitle');

    if (!modal || !list) {
        showNotification("المودال غير موجود!", 'error');
        return;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    title.innerText = type === 'followers' ? 'المتابعون' : 'يتابع';
    list.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-accent text-2xl mb-2"></i>
            <p class="text-gray-400 text-sm">جاري التحميل...</p>
        </div>
    `;

    try {
        const response = await fetch(`${apiBaseUrl}/user/${userId}/${type}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            // لو privacy أو أي فشل
            list.innerHTML = `
                <div class="text-center py-8 text-red-400">
                    <i class="fas fa-lock text-3xl mb-2"></i>
                    <p class="text-sm">هذه القائمة خاصة</p>
                </div>
            `;
            return;
        }

        const users = await response.json();

        if (!users || users.length === 0) {
            list.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-users-slash text-gray-500 text-4xl mb-3"></i>
                    <p class="text-gray-400">القائمة فارغة</p>
                </div>
            `;
            return;
        }

        // لو في بيانات
        list.innerHTML = users.map(user => `
            <div class="flex items-center justify-between bg-primary/30 p-3 rounded-xl border border-gray-700/50 hover:bg-primary/50 transition cursor-pointer" onclick="viewUserProfile('${user._id}'); closeFollowersModal()">
                <div class="flex items-center gap-3">
                    <img src="${user.profilePhoto || 'https://ui-avatars.com/api/?name=' + user.username}" class="w-10 h-10 rounded-full object-cover bg-secondary">
                    <div>
                        <h4 class="text-white font-bold text-sm">${user.username}</h4>
                        <span class="text-[10px] text-gray-400 border border-gray-600 px-1.5 py-0.5 rounded-full">${user.userType || 'عضو'}</span>
                    </div>
                </div>
                <i class="fas fa-chevron-left text-gray-500 text-xs"></i>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error fetching list:', error);
        list.innerHTML = `
            <div class="text-center py-8 text-red-400">
                <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                <p class="text-sm">حدث خطأ أثناء التحميل</p>
            </div>
        `;
    }
}

        function closeFollowersModal() {
            const modal = document.getElementById('followersModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        // Close on outside click
        document.getElementById('followersModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'followersModal') closeFollowersModal();
        });

async function updateNavbar() {
    const user = await loadCurrentUser();

    let currentRole = "guest";

    if (user) {
        currentRole = user.role === "admin" ? "admin" : "user";
    }

    const loginBtn = document.getElementById("headerUserBtn");

    if (loginBtn) {
        if (currentRole === "guest") {
            loginBtn.innerHTML =
                '<i class="fas fa-user"></i> <span class="hidden md:inline">الحساب</span>';
        } else {
            loginBtn.innerHTML =
                `<i class="fas fa-user-circle"></i> <span class="hidden md:inline">${user.firstName}</span>`;
        }
    }

    const elements = document.querySelectorAll("[data-role]");

    elements.forEach(el => {
        const allowedRoles = el.dataset.role.split(" ");

        if (allowedRoles.includes(currentRole)) {
            el.style.display = "";
        } else {
            el.style.display = "none";
        }
    });
}

async function handleContact(event) {
    event.preventDefault();

    const fullNameInput = document.getElementById('contactfullName');
    const emailInput = document.getElementById('contactEmail');
    const messageTypeSelect = document.getElementById('contactMessageType');
    const messageTextarea = document.getElementById('contactMessage');
    const submitBtn = document.getElementById('contactSubmitBtn');

    const formData = {
        name: fullNameInput.value,
        email: emailInput.value,
        message: messageTextarea.value,
        type: messageTypeSelect.value
    };

    if (!formData.name || !formData.email || !formData.message) {
        showNotification('الرجاء ملء جميع الحقول', 'error');
        return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
        showNotification('البريد الإلكتروني غير صحيح', 'error');
        emailInput.focus();
        return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الإرسال...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${apiBaseUrl}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', 'success');
            fullNameInput.value = '';
            emailInput.value = '';
            messageTextarea.value = '';
            messageTypeSelect.value = 'استفسار';
        } else {
            showNotification( 'حدث خطأ أثناء الإرسال', 'error');
        }
    } catch (error) {
        showNotification('حدث خطأ اثناء الاتصال', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function accountPageLoader(section) {
    document.querySelectorAll('.account-section-content').forEach(el => {
        el.classList.add('hidden');
    });

    if (section === 'personal') {
        document.getElementById('personal-section').classList.remove('hidden');
    } else if (section === 'registrations') {
        document.getElementById('registrations-section').classList.remove('hidden');
    } else if (section === 'certificates') {
        document.getElementById('certificates-section').classList.remove('hidden');
            loadCertificates();
    } else if (section === 'settings') {
        document.getElementById('settings-section').classList.remove('hidden');
    }

    document.querySelectorAll('.space-y-2 a').forEach(link => {
        link.classList.remove('bg-accent', 'text-white');
        link.classList.add('bg-primary', 'text-gray-300');
    });

    event.target.closest('a').classList.remove('bg-primary', 'text-gray-300');
    event.target.closest('a').classList.add('bg-accent', 'text-white');
}

async function uploadProfilePhoto(input) {
    if (!input.files || !input.files[0]) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('photo', input.files[0]);

    try {
        showNotification('جاري رفع الصورة...', 'info');
        const uploadRes = await fetch(`${apiBaseUrl}/user/upload-photo`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const uploadData = await uploadRes.json();

        if (uploadRes.ok) {
            const photoUrl = uploadData.photoUrl.startsWith('http')
                ? uploadData.photoUrl
                : `${apiBaseUrl.replace('/api', '')}${uploadData.photoUrl}`;

            const img = document.getElementById('profilePhotoImg');
            const placeholder = document.getElementById('profilePhotoPlaceholder');
            if (img && placeholder) {
                img.src = photoUrl;
                img.classList.remove('hidden');
                placeholder.classList.add('hidden');
            }
            showNotification('تم تحديث الصورة الشخصية بنجاح', 'success');
        } else {
            showNotification(uploadData.message || 'فشل رفع الصورة', 'error');
        }
    } catch (error) {
        console.error('Error uploading photo:', error);
        showNotification('خطأ في رفع الصورة', 'error');
    }
}

async function loadProfileData() {

    let user = await loadCurrentUser();
    if (!user) { return; }
        
    const token = localStorage.getItem('token');

    const userId = user._id || user.id;

    if (userId && token) {
        try {
            const response = await fetch(`${apiBaseUrl}/user/${userId}/profile`);
            if (response.ok) {
                const freshUser = await response.json();
                user = { ...user, ...freshUser };
            }
        } catch (error) {
            showNotification('فشل تحميل بيانات الملف الشخصي', 'error');
        }
    }

    const theme = localStorage.getItem('theme');
    setTheme(theme);

    const nameEl = document.getElementById('profileDisplayName');
    const typeEl = document.getElementById('profileUserType');
    const typeSR = document.getElementById('settingsUserType');
    const userJoinDate = document.getElementById('settingsJoinDate');
    const img = document.getElementById('profilePhotoImg');
    const placeholder = document.getElementById('profilePhotoPlaceholder');
    const usernameInput = document.getElementById('accountUsername');
    const emailInput = document.getElementById('accountEmail');
    const bioInput = document.getElementById('accountBio');
    const phoneInput = document.getElementById('accountPhone');
    const followersEl = document.getElementById('profileFollowersCount');
    const followingEl = document.getElementById('profileFollowingCount');
    const quizPointsEl = document.getElementById('profileQuizPoints');

    if (followersEl) followersEl.textContent = user.followers ? user.followers.length : 0;
    if (followingEl) followingEl.textContent = user.following ? user.following.length : 0;
    if (quizPointsEl) quizPointsEl.textContent = user.quizPoints || 0;

    if (nameEl && user.username) nameEl.textContent = user.username;
    if (typeEl) {
        typeEl.innerHTML = getUserTypeBadge(user.userType || 'مستخدم عادي');
        typeSR.innerHTML = setUserTypeBadge(user.userType || 'مستخدم عادي');
    }
    if (userJoinDate) {
        userJoinDate.innerHTML = setUserJoinDate(user.createdAt);
    }
    if (usernameInput && user.username) usernameInput.value = user.username;
    if (emailInput && user.email) emailInput.value = user.email;
    if (bioInput && user.bio) bioInput.value = user.bio;
     if (phoneInput && user.phone) phoneInput.value = user.phone;
 
     // Populate social links
     if (user.socialLinks) {
         if (document.getElementById('social-facebook')) document.getElementById('social-facebook').value = user.socialLinks.facebook || '';
         if (document.getElementById('social-twitter')) document.getElementById('social-twitter').value = user.socialLinks.twitter || '';
         if (document.getElementById('social-instagram')) document.getElementById('social-instagram').value = user.socialLinks.instagram || '';
         if (document.getElementById('social-linkedin')) document.getElementById('social-linkedin').value = user.socialLinks.linkedin || '';
         if (document.getElementById('social-website')) document.getElementById('social-website').value = user.socialLinks.website || '';
     }

     if (user.profilePhoto && img && placeholder) {
        console.log('Loading profile photo:', user.profilePhoto);
        let photoUrl = user.profilePhoto;
        if (!photoUrl.startsWith('http')) {
            const baseUrl = apiBaseUrl.replace('/api', '');
            const cleanPath = photoUrl.startsWith('/') ? photoUrl : '/' + photoUrl;
            photoUrl = `${baseUrl}${cleanPath}`;
        }

        img.src = photoUrl;
        img.onload = () => {
            img.classList.remove('hidden');
            placeholder.classList.add('hidden');
        };
        img.onerror = () => {
            console.error('Failed to load profile photo:', photoUrl);
            img.classList.add('hidden');
            placeholder.classList.remove('hidden');
        };
    }

    const langSelect = document.querySelector('select[onchange="applyLanguage(this.value)"]');
    if (langSelect) langSelect.value = localStorage.getItem('lang') || 'ar';


    const privacyToggle = document.getElementById('privacy-showFollowers');
    if (privacyToggle && user.privacySettings) {
        privacyToggle.checked = user.privacySettings.showFollowers !== false;
    }

    // Fetch and render registrations
    fetchUserRegistrations(user._id);
}

async function fetchUserRegistrations(userId) {
    const coursesList = document.getElementById('user-courses-list');
    const eventsList = document.getElementById('user-events-list');
    const token = localStorage.getItem('token');

    if (!coursesList || !eventsList) return;

    try {
        const response = await fetch(`${apiBaseUrl}/registrations/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch registrations');

        const registrations = await response.json();

        if (registrations.length === 0) {
            const emptyMsg = '<div class="text-center py-6 text-gray-500">لا يوجد تسجيلات حالياً</div>';
            coursesList.innerHTML = emptyMsg;
            eventsList.innerHTML = emptyMsg;
            return;
        }

        const statusBadges = {
            'pending': '<span class="px-2 py-1 text-[10px] bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20">قيد المراجعة</span>',
            'approved': '<span class="px-2 py-1 text-[10px] bg-green-500/10 text-green-500 rounded-full border border-green-500/20">مقبول</span>',
            'rejected': '<span class="px-2 py-1 text-[10px] bg-red-500/10 text-red-500 rounded-full border border-red-500/20">مرفوض</span>'
        };

        const renderReg = (reg) => `
            <div class="flex items-center justify-between p-4 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl hover:border-sky-400/50 transition-all">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/10 to-teal-500/10 flex items-center justify-center">
                        <i class="fas ${reg.eventId?.type === 'courses' ? 'fa-graduation-cap text-teal-400' : 'fa-calendar-alt text-sky-400'}"></i>
                    </div>
                    <div>
                        <h5 class="text-sm font-bold text-[var(--text-primary)]">${reg.eventName || (reg.eventId ? reg.eventId.title : 'فعالية')}</h5>
                        <p class="text-[10px] text-gray-500">${new Date(reg.createdAt).toLocaleDateString('ar-JO')}</p>
                    </div>
                </div>
                <div>
                    ${statusBadges[reg.status] || reg.status}
                </div>
            </div>
        `;

        const courses = registrations.filter(r => r.eventId?.type === 'courses');
        const events = registrations.filter(r => r.eventId?.type !== 'courses');

        coursesList.innerHTML = courses.length > 0 ? courses.map(renderReg).join('') : '<div class="text-center py-4 text-gray-500 text-xs">لا يوجد كورسات مسجلة</div>';
        eventsList.innerHTML = events.length > 0 ? events.map(renderReg).join('') : '<div class="text-center py-4 text-gray-500 text-xs">لا يوجد فعاليات مسجلة</div>';

    } catch (error) {
        console.error('Error loading registrations:', error);
        const errorMsg = '<div class="text-center py-6 text-red-400">فشل تحميل التسجيلات</div>';
        coursesList.innerHTML = errorMsg;
        eventsList.innerHTML = errorMsg;
    }
}


async function handleProfileUpdate() {
    const username = document.getElementById('accountUsername').value;
    const email = document.getElementById('accountEmail').value;
    const bio = document.getElementById('accountBio').value;
     const phone = document.getElementById('accountPhone').value;
     const socialLinks = {
         facebook: document.getElementById('social-facebook')?.value || '',
         twitter: document.getElementById('social-twitter')?.value || '',
         instagram: document.getElementById('social-instagram')?.value || '',
         linkedin: document.getElementById('social-linkedin')?.value || '',
         website: document.getElementById('social-website')?.value || ''
     };
     const token = localStorage.getItem('token');
 
     try {
         const response = await fetch(`${apiBaseUrl}/user/update`, {
             method: 'PUT',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify({ username, email, bio, phone, socialLinks })
         });

        const data = await response.json();
        if (response.ok) {
            showNotification('تم تحديث البيانات بنجاح', 'success');
            loadProfileData();
            updateNavbar();
        } else {
            showNotification('فشل التحديث', 'error');
        }
    } catch (error) {
        showNotification('حدث خطأ في الاتصال', 'error');
    }
}

async function handlePasswordChange(event) {
    event.preventDefault();
    
    try {
        const token = localStorage.getItem('token');
        const user = await loadCurrentUser();
        
        if (!token || !user) {
            return;
        }

        async function updateRegistrationStatus(registrationId, status) {
            const actionDesc = status === 'approved' ? 'قبول' : (status === 'rejected' ? 'رفض' : 'تحديث');
            showConfirmModal(`تأكيد ال${actionDesc}`, `هل أنت متأكد من ${actionDesc} هذا الطلب؟`, async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${apiBaseUrl}/registrations/${registrationId}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ status })
                    });

                    if (res.ok) {
                        showNotification('تم تحديث حالة التسجيل', 'success');
                        showRegistrationsModal(currentEventId); // Refresh modal
                    } else {
                        showNotification('فشل التحديث', 'error');
                    }
                } catch (error) {
                    console.error(error);
                    showNotification('خطأ في الاتصال', 'error');
                }
            }, status === 'rejected' ? 'danger' : 'warning');
        }
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('جميع الحقول مطلوبة', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري التحديث...';
        submitBtn.disabled = true;

        const response = await fetch(`${apiBaseUrl}/user/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'حدث خطأ في تغيير كلمة المرور');
        }

        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        if (typeof updatePasswordStrength === 'function') {
            updatePasswordStrength('');
        }

        showNotification('تم تغيير كلمة المرور بنجاح', 'success');

    } catch (error) {
        console.error('Error changing password:', error);
        showNotification(error.message || 'حدث خطأ في تغيير كلمة المرور', 'error');
    } finally {
        const submitBtn = document.querySelector('#passwordForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-key ml-2"></i> تحديث كلمة المرور';
            submitBtn.disabled = false;
        }
    }
}

function updatePasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthIndicator');

    console.log('Bar element:', strengthIndicator);
    console.log(document.getElementById('passwordStrengthIndicator'));
    
    if (!strengthIndicator || !strengthText) return;
    
    let strength = 0;
    let width = '0%';
    let color = 'from-red-400 to-red-500';
    let text = 'ضعيفة';
    let textColor = 'text-red-500';
    
    if (password.length > 0) {
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        
        if (strength <= 2) {
            width = '25%';
            color = 'from-red-400 to-red-500';
            text = 'ضعيفة';
            textColor = 'text-red-500';
        } else if (strength <= 3) {
            width = '50%';
            color = 'from-yellow-400 to-yellow-500';
            text = 'متوسطة';
            textColor = 'text-yellow-500';
        } else if (strength <= 4) {
            width = '75%';
            color = 'from-green-400 to-green-500';
            text = 'قوية';
            textColor = 'text-green-500';
        } else {
            width = '100%';
            color = 'from-green-500 to-green-600';
            text = 'قوية جداً';
            textColor = 'text-green-600';
        }
    }
    
    strengthIndicator.style.width = width;
    strengthIndicator.className = `h-full bg-gradient-to-r ${color} rounded-full`;
    
    strengthText.textContent = text;
    strengthText.className = `${textColor} text-sm`;
}

document.addEventListener('DOMContentLoaded', function() {

    loadProfileData();
    
    const accountForm = document.getElementById('accountForm');
    if (accountForm) {
        accountForm.addEventListener('submit', handleProfileUpdate);
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function(e) {
            updatePasswordStrength(e.target.value);
        });
    }
});

function getUserTypeBadge(userType) {
    const badges = {
        'الرئيس': { color: 'purple', icon: 'fa-crown' },
        'عضو إدارة': { color: 'blue', icon: 'fa-user-tie' },
        'أصدقاء الملتقى': { color: 'green', icon: 'fa-users' },
        'مستخدم عادي': { color: 'gray', icon: 'fa-user' }
    };
    const badge = badges[userType] || badges['مستخدم عادي'];
    return `
        <span class="bg-${badge.color}-500/20 text-${badge.color}-400 text-xs px-2 py-0.5 rounded-full border border-${badge.color}-500/30">
            <i class="fas ${badge.icon} ml-1"></i> ${userType || 'مستخدم عادي'}
        </span>`
    ;
}

function setUserTypeBadge(stUserType) {
    const badges = {
        'الرئيس': { icon: 'fa-crown' },
        'عضو إدارة': { icon: 'fa-user-tie' },
        'أصدقاء الملتقى': { icon: 'fa-users' },
        'مستخدم عادي': { icon: 'fa-user' }
    };
    const badge = badges[stUserType] || badges['مستخدم عادي'];
    return `
        <p class="text-[var(--text-primary)] font-medium" id="settingsUserType">${stUserType || 'مستخدم عادي'}</p>`
    ;
}

function setUserJoinDate(createdAt) {
    if (!createdAt) return `
        <p class="text-[var(--text-primary)] font-medium" id="settingsJoinDate">غير محدد</p>
    `;

    const joinDate = new Date(createdAt);
    const formattedDate = joinDate.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <p class="text-[var(--text-primary)] font-medium" id="settingsJoinDate">${formattedDate}</p>
    `;
}

const state = {
    events: [],
    currentType: 'all',
    myRegistrations: [] // Stores event IDs the user is registered for
};

const EventsService = {
    async fetchEvents() {
        const response = await fetch(`${apiBaseUrl}/events`);
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        return await response.json();
    },

    async register(data) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${apiBaseUrl}/registrations`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'فشل التسجيل');
        }

        return responseData;
    }
};

function getTypeBadgeClass(type) {
    const classes = {
        'courses': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'events': 'bg-green-500/20 text-green-400 border-green-500/30',
        'workshops': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'upcoming': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return classes[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

function getTypeName(type) {
    const names = {
        courses: 'كورس',
        events: 'فعالية',
        workshops: 'ورشة',
        upcoming: 'قريباً'
    };
    return names[type] || type;
}

function getDurationIcon(type) {
    const icons = {
        courses: 'fa-clock',
        events: 'fa-calendar',
        workshops: 'fa-clock',
        upcoming: 'fa-calendar'
    };
    return icons[type] || 'fa-clock';
}

function getTypeIcon(type) {
    const icons = {
        'courses': 'fa-graduation-cap',
        'events': 'fa-calendar-alt',
        'workshops': 'fa-chalkboard-user',
        'upcoming': 'fa-clock'
    };
    return icons[type] || 'fa-tag';
}

const EventsRenderer = {
    render(events) {
        const container = document.getElementById('events-container');
        container.innerHTML = '';

        if (!events || events.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <div class="elegant-card p-12 inline-block mx-auto">
                        <i class="fas fa-calendar-xmark text-4xl text-gray-500 mb-3"></i>
                        <p class="text-gray-400">لا توجد فعاليات في هذا القسم حالياً</p>
                        <button onclick="state.currentType='all'; EventsController.updateView();" 
                                class="mt-4 btn-gradient px-6 py-2 text-sm">
                            <i class="fas fa-border-all ml-1"></i>
                            عرض الكل
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        events.forEach(event => {

            const card = document.createElement('div');
            card.className = `
                course-card group
                bg-secondary
                rounded-2xl
                border border-gray-800
                shadow-lg
                hover:shadow-xl
                transition-all duration-300
                overflow-hidden
            `;

            card.innerHTML = `
                <div class="relative h-36 bg-gradient-to-br ${event.bgColor || 'from-sky-500 to-teal-500'}">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <i class="fas ${event.icon || 'fa-code'} 
                           text-white text-5xl opacity-50 
                           group-hover:scale-110 group-hover:opacity-100 
                           transition-all duration-500"></i>
                    </div>

                    <span class="absolute top-3 right-3 text-xs px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1
                        ${getTypeBadgeClass ? getTypeBadgeClass(event.type) : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'}">
                        <i class="fas ${getTypeIcon ? getTypeIcon(event.type) : 'fa-star'} text-[0.6rem]"></i>
                        ${getTypeName ? getTypeName(event.type) : event.type}
                    </span>

                    ${event.isFree ? `
                        <span class="absolute top-3 left-3 bg-green-500/20 text-green-400 border border-green-500/30 
                            text-xs px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                            <i class="fas fa-gift text-[0.6rem]"></i>
                            مجاني
                        </span>
                    ` : ''}
                </div>

                <div class="p-5">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-lg font-bold text-[var(--text-primary)] 
                                   group-hover:gradient-text transition-all duration-300">
                            ${escapeHTML(event.title)}
                        </h3>

                        <span class="text-xs text-sky-400 bg-sky-400/10 px-2 py-1 rounded-full">
                            <i class="fas ${getDurationIcon ? getDurationIcon(event.type) : 'fa-clock'} ml-1"></i>
                            ${escapeHTML(event.duration || '')}
                        </span>
                    </div>

                    <p class="text-gray-400 text-sm mb-4 flex items-center gap-2">
                        <i class="fas fa-chalkboard-user text-teal-400"></i>
                        ${escapeHTML(event.instructor || '')}
                    </p>

                    <div class="flex justify-between items-center">
                        <span class="text-gray-500 text-sm flex items-center gap-1">
                            <i class="fas fa-users text-sky-400"></i>
                            ${event.seats || 0} مقعد متبقي
                        </span>

                        ${
                            event.type === 'upcoming'
                                ? `
                                    <span class="bg-gray-500/20 text-gray-400 border border-gray-500/30 
                                        px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                                        <i class="fas fa-hourglass-half"></i>
                                        قريباً
                                    </span>
                                  `
                                : (() => {
                                    const reg = state.myRegistrations.find(r => String(r.eventId) === String(event._id));
                                    if (reg) {
                                        const statusConfig = {
                                            'pending': { text: 'قيد المراجعة', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
                                            'approved': { text: 'تم القبول', class: 'bg-green-500/20 text-green-400 border-green-500/30' },
                                            'rejected': { text: 'تم الرفض', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
                                            'waitlist': { text: 'قائمة الانتظار', class: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
                                        };
                                        const config = statusConfig[reg.status] || { text: 'مسجل', class: 'bg-green-500/20 text-green-400 border-green-500/30' };
                                        
                                        return `
                                            <button 
                                                class="px-4 py-2 text-sm ${config.class} rounded-lg cursor-default flex items-center gap-2"
                                                disabled title="حالة الطلب: ${config.text}">
                                                <i class="fas ${reg.status === 'approved' ? 'fa-check-circle' : 'fa-clock'}"></i>
                                                ${config.text}
                                            </button>
                                        `;
                                    }
                                    return `
                                        <button 
                                            class="register-btn btn-gradient px-4 py-2 text-sm"
                                            data-id="${event._id}"
                                            data-title="${escapeHTML(event.title)}"
                                            data-instructor="${escapeHTML(event.instructor)}">
                                            <i class="fas fa-pen ml-1"></i>
                                            سجل الآن
                                        </button>
                                    `;
                                })()
                        }
                    </div>
                </div>
            `;

            fragment.appendChild(card);
        });

        container.appendChild(fragment);
    }
};

const EventsController = {

    filterEvents() {
        if (state.currentType === 'all') {
            return state.events;
        }
        return state.events.filter(e => e.type === state.currentType);
    },

    async init() {
        try {
            const loading = document.getElementById('loading-spinner');
            const error = document.getElementById('error-message');

            loading.classList.remove('hidden');
            error.classList.add('hidden');

            const data = await EventsService.fetchEvents();

            state.events = data.filter(e => e.status === true);

            // Fetch user registrations to check if already registered
            state.myRegistrations = [];
            const user = await loadCurrentUser();
            if (user && user._id) {
                try {
                    const token = localStorage.getItem('token');
                    const regRes = await fetch(`${apiBaseUrl}/registrations/user/${user._id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (regRes.ok) {
                        const regs = await regRes.json();
                        // Store objects with eventId and status
                        state.myRegistrations = regs
                            .filter(r => r.eventId) 
                            .map(r => ({
                                eventId: r.eventId._id || r.eventId,
                                status: r.status
                            }));
                    }
                } catch (e) {
                    console.error("Failed to fetch user registrations for state", e);
                }
            }

            loading.classList.add('hidden');

            this.updateView();
            this.bindEvents();

        } catch (err) {
            console.error(err);
            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('error-message').classList.remove('hidden');
        }
    },

    updateView() {
        const filtered = this.filterEvents();
        EventsRenderer.render(filtered);
    },

    bindEvents() {

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentType = btn.dataset.tab;
                this.updateView();
            });
        });

        document
            .getElementById('events-container')
            .addEventListener('click', (e) => {

                if (e.target.classList.contains('register-btn')) {
                    const id = e.target.dataset.id;
                    const title = e.target.dataset.title;
                    const instructor = e.target.dataset.instructor;

                    this.openModal(id, title, instructor);
                }
            });

        const form = document.getElementById('registrationForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                eventId: document.getElementById('programId').value,
                eventName: document.getElementById('modal-program-title').textContent,
                status: 'pending'
            };

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            try {
                // Disable button and show loader
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري الإرسال...';

                const response = await EventsService.register(formData);
                showNotification('تم إرسال طلبك بنجاح! حالة الطلب الحالية: قيد المراجعة', 'success');
                
                // Proactively update local state so UI updates immediately
                if (response && response.eventId) {
                    state.myRegistrations.push({
                        eventId: response.eventId._id || response.eventId,
                        status: response.status || 'pending'
                    });
                    this.updateView();
                }

                this.closeModal();
            } catch (err) {
                console.error(err);
                
                // Re-enable button on error
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                const msg = err.message || '';
                // Check for specific backend marker or the Arabic translation which might still come from older backend versions
                if (msg === 'registration_already_exists' || msg.includes('أنت مسجل بالفعل')) {
                    showNotification('أنت مسجل بالفعل في هذه الفعالية!', 'error');
                } else if (msg.includes('معلق') || msg.includes('suspended')) {
                    showNotification('حسابك معلق ولا يمكنك التسجيل حالياً', 'error');
                } else {
                    showNotification('حدث خطأ أثناء التسجيل: ' + (msg || 'يرجى المحاولة لاحقاً'), 'error');
                }
            }
        });

        const modal = document.getElementById('registrationModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    },

    openModal(id, title, instructor) {
        document.getElementById('programId').value = id;
        document.getElementById('modal-program-title').textContent = title;
        document.getElementById('modal-program-instructor').textContent = instructor;

        const modal = document.getElementById('registrationModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeModal() {
        const modal = document.getElementById('registrationModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.getElementById('registrationForm').reset();
    }
};

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

let searchTimeout;
function searchUsers(query) {
    clearTimeout(searchTimeout);
    const container = document.getElementById('searchResults');
    if (!container) return;

    if (!query || query.length < 1) {
        container.innerHTML = `            <div class="col-span-full text-center py-16">
                <div class="elegant-card p-12 inline-block mx-auto">
                    <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
                        <i class="fas fa-users text-5xl text-sky-400/50"></i>
                    </div>
                    <p class="text-gray-400 text-lg mb-2">ابدأ الكتابة للبحث عن أصدقاء...</p>
                    <p class="text-gray-500 text-sm">اكتشف أعضاء جدد وتواصل مع المجتمع</p>
                </div>
            </div>`;
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            container.innerHTML = '<div class="text-center col-span-full py-12"><i class="fas fa-spinner fa-spin text-2xl text-sky-400"></i></div>';

            const response = await fetch(`${apiBaseUrl}/user/search?q=${encodeURIComponent(query)}`);
            const users = await response.json();

            if (users.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-400 col-span-full py-12">لا يوجد نتائج</div>';
                return;
            }

            container.innerHTML = users.map(user => `
                <div class="elegant-card p-4 cursor-pointer transition-all hover:border-sky-400 group" onclick="viewUserProfile('${user._id}')">
                    <div class="flex items-center gap-4">
                        <img src="${user.profilePhoto || 'https://ui-avatars.com/api/?name=' + user.username}" 
                             class="w-14 h-14 rounded-full object-cover group-hover:scale-105 transition border-2 border-transparent group-hover:border-sky-400"
                             onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${user.username}')">
                        
                         <div class="flex-1 text-right">
                             <h4 class="text-[var(--text-primary)] font-bold text-lg">${escapeHTML(user.username)}</h4>
                             <p class="text-sky-400 font-mono text-sm mt-1">رقم العضوية: ${user.customId || ''}</p>
                             <p class="text-gray-400 text-sm">${user.userType || 'عضو'}</p>
                             ${user.phone ? `<p class="text-gray-500 text-xs mt-1"><i class="fas fa-phone-alt ml-1"></i> ${user.phone}</p>` : ''}
                             <div class="flex gap-2 mt-2">
                                 ${user.socialLinks?.facebook ? `<a href="${user.socialLinks.facebook}" target="_blank" onclick="event.stopPropagation()" class="text-gray-500 hover:text-sky-400"><i class="fab fa-facebook"></i></a>` : ''}
                                 ${user.socialLinks?.twitter ? `<a href="${user.socialLinks.twitter}" target="_blank" onclick="event.stopPropagation()" class="text-gray-500 hover:text-sky-400"><i class="fab fa-twitter"></i></a>` : ''}
                                 ${user.socialLinks?.instagram ? `<a href="${user.socialLinks.instagram}" target="_blank" onclick="event.stopPropagation()" class="text-gray-500 hover:text-sky-400"><i class="fab fa-instagram"></i></a>` : ''}
                                 ${user.socialLinks?.linkedin ? `<a href="${user.socialLinks.linkedin}" target="_blank" onclick="event.stopPropagation()" class="text-gray-500 hover:text-sky-400"><i class="fab fa-linkedin"></i></a>` : ''}
                                 ${user.socialLinks?.website ? `<a href="${user.socialLinks.website}" target="_blank" onclick="event.stopPropagation()" class="text-gray-500 hover:text-sky-400"><i class="fas fa-globe"></i></a>` : ''}
                             </div>
                         </div>
                        
                        <div class="flex flex-col items-center gap-1">
                            <div class="gradient-text font-bold bg-sky-400/10 px-3 py-1 rounded-full text-sm">
                                <i class="fas fa-star text-yellow-400 text-xs"></i> ${(user.points || 0) + (user.quizPoints || 0)}
                            </div>
                            <span class="text-gray-500 text-xs">نقاط</span>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Search error:', error);
            container.innerHTML = '<div class="text-center text-red-400 col-span-full py-12">حدث خطأ في البحث</div>';
        }
    }, 500);
}

async function viewUserProfile(userId) {
    loadPage('userProfile');
    const currentUser = await loadCurrentUser();

    const container = document.getElementById('publicProfileContainer');
    if (!container) return;

    try {
        const response = await fetch(`${apiBaseUrl}/user/${userId}/profile`);
        if (!response.ok) throw new Error('User not found');

        const user = await response.json();

        container.innerHTML = `
            <div class="elegant-card pt-24 pb-8 px-8 relative overflow-hidden max-w-2xl mx-auto">
                <!-- Background Decoration -->
                <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-sky-500/20 to-teal-500/20"></div>
                
                <div class="relative text-center -mt-10 mb-8">
                    <div class="w-32 h-32 mx-auto rounded-full p-[3px] bg-gradient-to-r from-sky-500 to-teal-500 relative shadow-xl">
                        <div class="w-full h-full rounded-full overflow-hidden bg-[var(--bg-primary)]">
                            <img src="${user.profilePhoto || 'https://ui-avatars.com/api/?name=' + user.username}" 
                                 class="w-full h-full object-cover"
                                 onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${user.username}')">
                        </div>
                    </div>
                     <h2 class="text-3xl font-bold text-[var(--text-primary)] mt-4">${escapeHTML(user.username)}</h2>
                     <p class="text-sky-400 font-mono text-sm mt-1">رقم العضوية: ${user.customId || 'غير متوفر'}</p>
                     <div class="flex justify-center gap-4 mt-4">
                         ${user.socialLinks?.facebook ? `<a href="${user.socialLinks.facebook}" target="_blank" onclick="event.stopPropagation()" class="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-sky-400 hover:bg-sky-400 hover:text-white transition-all"><i class="fab fa-facebook-f"></i></a>` : ''}
                         ${user.socialLinks?.twitter ? `<a href="${user.socialLinks.twitter}" target="_blank" onclick="event.stopPropagation()" class="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-sky-400 hover:bg-sky-400 hover:text-white transition-all"><i class="fab fa-twitter"></i></a>` : ''}
                         ${user.socialLinks?.instagram ? `<a href="${user.socialLinks.instagram}" target="_blank" onclick="event.stopPropagation()" class="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-sky-400 hover:bg-sky-400 hover:text-white transition-all"><i class="fab fa-instagram"></i></a>` : ''}
                         ${user.socialLinks?.linkedin ? `<a href="${user.socialLinks.linkedin}" target="_blank" onclick="event.stopPropagation()" class="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-sky-400 hover:bg-sky-400 hover:text-white transition-all"><i class="fab fa-linkedin-in"></i></a>` : ''}
                         ${user.socialLinks?.website ? `<a href="${user.socialLinks.website}" target="_blank" onclick="event.stopPropagation()" class="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-sky-400 hover:bg-sky-400 hover:text-white transition-all"><i class="fas fa-globe"></i></a>` : ''}
                     </div>
                     ${user.phone ? `<p class="text-gray-400 text-sm mt-3"><i class="fas fa-phone-alt ml-1"></i> ${user.phone}</p>` : ''}
                     <span class="inline-block px-4 py-1 bg-sky-400/10 text-sky-400 rounded-full text-sm mt-4 border border-sky-400/30">
                         ${user.userType || 'عضو'}
                     </span>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-8 text-center bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-light)]">
                    <div>
                        <div class="text-2xl font-bold gradient-text">${user.quizPoints || 0}</div>
                        <div class="text-gray-400 text-xs mt-1">نقاط</div>
                    </div>
                    <div class="cursor-pointer hover:bg-sky-400/5 p-2 rounded-lg transition" onclick="showFollowersModal('${user._id}', 'followers')">
                        <div class="text-2xl font-bold text-[var(--text-primary)]">${user.followers ? user.followers.length : 0}</div>
                        <div class="text-gray-400 text-xs mt-1">متابع</div>
                    </div>
                    <div class="cursor-pointer hover:bg-teal-400/5 p-2 rounded-lg transition" onclick="showFollowersModal('${user._id}', 'following')">
                        <div class="text-2xl font-bold text-[var(--text-primary)]">${user.following ? user.following.length : 0}</div>
                        <div class="text-gray-400 text-xs mt-1">يتابع</div>
                    </div>
                </div>

                ${user.bio ? `
                <div class="bg-[var(--bg-primary)] p-6 rounded-2xl mb-8 text-center border border-[var(--border-light)]">
                    <p class="text-gray-300 italic">"${escapeHTML(user.bio)}"</p>
                </div>
                ` : ''}

                <div class="flex justify-center gap-4">
                    ${currentUser && currentUser._id !== user._id ? `
                        <button onclick="toggleFollow('${user._id}')" id="followBtn" 
                                class="${user.followers && user.followers.includes(currentUser._id) ? 'btn-outline border-gray-500 text-gray-300 hover:border-gray-400' : 'btn-gradient'} px-8 py-3 text-base flex items-center gap-2">
                            <i class="fas ${user.followers && user.followers.includes(currentUser._id) ? 'fa-user-minus' : 'fa-user-plus'}"></i> 
                            ${user.followers && user.followers.includes(currentUser._id) ? 'إلغاء المتابعة' : 'متابعة'}
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="text-center mt-8">
                <button onclick="loadPage('userSearch')" class="text-gray-400 hover:text-sky-400 transition-colors flex items-center gap-2 mx-auto group">
                    <i class="fas fa-arrow-right group-hover:-translate-x-1 transition-transform"></i>
                    العودة للبحث
                </button>
            </div>
        `;

    } catch (error) {
        container.innerHTML = `
            <div class="text-center py-20">
                <div class="elegant-card p-12 inline-block mx-auto border-red-500/20">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                    <h3 class="text-xl text-[var(--text-primary)] mb-2">المستخدم غير موجود</h3>
                    <p class="text-gray-400 text-sm mb-6">عذراً، لم نتمكن من العثور على هذا المستخدم</p>
                    <button onclick="loadPage('userSearch')" class="btn-gradient px-6 py-2 text-sm flex items-center gap-2 mx-auto">
                        <i class="fas fa-search"></i>
                        العودة للبحث
                    </button>
                </div>
            </div>
        `;
    }
}

async function toggleFollow(userId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('يرجى تسجيل الدخول للمتابعة', 'error');
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/user/${userId}/follow`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            showNotification(data.isFollowing ? 'تمت المتابعة' : 'تم إلغاء المتابعة', 'success');

            const followersBtn = document.getElementById('followers-btn');
            if (followersBtn) {
                const countEl = followersBtn.querySelector('.font-bold');
                if (countEl) countEl.textContent = data.followersCount;
            }

            const followBtn = document.getElementById('followBtn');
            if (followBtn) {
                const icon = followBtn.querySelector('i');
                const text = followBtn.childNodes[followBtn.childNodes.length - 1];

                if (data.isFollowing) {
                    followBtn.classList.replace('bg-accent', 'bg-gray-700');
                    if (icon) icon.className = 'fas fa-user-minus';
                    if (text) text.textContent = ' إلغاء المتابعة';
                } else {
                    followBtn.classList.replace('bg-gray-700', 'bg-accent');
                    if (icon) icon.className = 'fas fa-user-plus';
                    if (text) text.textContent = ' متابعة';
                }
            } else {
                viewUserProfile(userId);
            }
        } else {
            showNotification(data.message || 'فشل تنفيذ العملية', 'error');
        }
    } catch (error) {
        console.error('Follow error:', error);
        showNotification('خطأ في الاتصال', 'error');
    }
}

let newsInterval;
async function fetchNews() {
    try {
        const response = await fetch(`${apiBaseUrl}/news`);
        const news = await response.json();
        const container = document.getElementById('dashboard-news');
        if (!container) return;

        if (news.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-center col-span-full">لا توجد أخبار حالياً</p>';
            return;
        }

        const featured = news
            .filter(n => n.isFeatured)
            .sort((a, b) => a.featuredOrder - b.featuredOrder)
            .slice(0, 3);

        const others = news
            .filter(n => !n.isFeatured)
            .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));


        container.innerHTML = '';
        
        // --- Featured News Carousel ---
        if (featured.length > 0) {
            const carouselWrapper = document.createElement('div');
            carouselWrapper.className = 'relative h-[300px] md:h-[500px] rounded-2xl overflow-hidden mb-8 md:mb-12 group';
            
            const carouselTrack = document.createElement('div');
            carouselTrack.id = 'featured-carousel';
            carouselTrack.className = 'h-full flex w-full transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)';
            
            featured.forEach(item => {
                const slide = document.createElement('div');
                slide.className = 'min-w-full h-full relative flex-shrink-0';
                
                const img = document.createElement('img');
                img.src = item.imageUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f';
                img.className = 'w-full h-full object-cover';
                
                const overlay = document.createElement('div');
                overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-10';
                
                const badge = document.createElement('span');
                badge.className = 'bg-sky-400/20 text-sky-400 border border-sky-400/30 text-xs px-3 py-1.5 rounded-full w-fit mb-4 backdrop-blur-sm';
                badge.textContent = item.category;
                
                const title = document.createElement('h2');
                title.className = 'text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 line-clamp-2 leading-tight';
                title.textContent = item.title;
                
                const desc = document.createElement('p');
                desc.className = 'text-gray-300 max-w-2xl mb-4 md:mb-6 line-clamp-2 text-sm md:text-lg';
                desc.textContent = item.description;
                
                const btn = document.createElement('button');
                btn.className = 'btn-gradient px-6 py-2 md:px-8 md:py-3 text-sm md:text-base w-fit';
                btn.innerHTML = '<i class="fas fa-book-open ml-2"></i> اقرأ التفاصيل';
                btn.onclick = () => openNews(item._id);
                
                overlay.appendChild(badge);
                overlay.appendChild(title);
                overlay.appendChild(desc);
                overlay.appendChild(btn);
                
                slide.appendChild(img);
                slide.appendChild(overlay);
                carouselTrack.appendChild(slide);
            });
            
            const dotsWrapper = document.createElement('div');
            dotsWrapper.className = 'absolute bottom-5 right-1/2 translate-x-1/2 flex gap-2';
            featured.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = 'w-8 h-1.5 rounded-full bg-white/30 carousel-dot transition-all cursor-pointer hover:bg-white/50';
                dot.dataset.index = i;
                dotsWrapper.appendChild(dot);
            });
            
            carouselWrapper.appendChild(carouselTrack);
            carouselWrapper.appendChild(dotsWrapper);
            container.appendChild(carouselWrapper);
        }

        // --- News Grid ---
        const grid = document.createElement('div');
        grid.id = 'news-grid';
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
        
        others.forEach(item => {
            const card = document.createElement('div');
            card.className = 'elegant-card p-5 hover:border-sky-400/50 transition-all duration-300 group flex flex-col h-full';
            
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'relative h-44 rounded-xl overflow-hidden mb-4 flex-shrink-0';
            
            const img = document.createElement('img');
            img.src = item.imageUrl || 'https://images.unsplash.com/photo-1556761175-b413da4baf72';
            img.className = 'w-full h-full object-cover group-hover:scale-110 transition duration-500';
            
            const badge = document.createElement('span');
            badge.className = 'absolute top-3 right-3 bg-[var(--bg-card)] backdrop-blur-md text-sky-400 text-xs px-3 py-1.5 rounded-full border border-sky-400/30';
            badge.innerHTML = `<i class="fas fa-tag ml-1 text-[0.6rem]"></i> `;
            const badgeText = document.createTextNode(item.category);
            badge.appendChild(badgeText);
            
            imgWrapper.appendChild(img);
            imgWrapper.appendChild(badge);
            
            const title = document.createElement('h4');
            title.className = 'text-[var(--text-primary)] font-bold text-lg mb-2 line-clamp-1 group-hover:gradient-text transition-all';
            title.textContent = item.title;
            
            const desc = document.createElement('p');
            desc.className = 'text-gray-400 text-sm mb-4 line-clamp-2 flex-grow';
            desc.textContent = item.description;
            
            const footer = document.createElement('div');
            footer.className = 'mt-auto pt-3 border-t border-[var(--border-light)]';
            
            const meta = document.createElement('div');
            meta.className = 'flex items-center justify-between mb-3';
            
            const dateSpan = document.createElement('span');
            dateSpan.className = 'text-gray-500 text-xs flex items-center gap-1';
            dateSpan.innerHTML = '<i class="far fa-calendar text-sky-400"></i> ';
            dateSpan.appendChild(document.createTextNode(new Date(item.date || item.createdAt).toLocaleDateString('ar-EG')));
            
            const readBtn = document.createElement('button');
            readBtn.className = 'text-sky-400 font-medium text-sm hover:text-teal-400 transition-all flex items-center gap-1 group/btn';
            readBtn.innerHTML = '<span>اقرأ</span> <i class="fas fa-arrow-left text-xs group-hover/btn:-translate-x-1 transition-transform"></i>';
            readBtn.onclick = () => openNews(item._id);
            
            meta.appendChild(dateSpan);
            meta.appendChild(readBtn);
            footer.appendChild(meta);
            
            card.appendChild(imgWrapper);
            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(footer);
            grid.appendChild(card);
        });
        
        container.appendChild(grid);


        let index = 0;
        const carousel = document.getElementById('featured-carousel');
        const dots = document.querySelectorAll('.carousel-dot');

        if (dots.length > 0) {
            dots.forEach(dot => dot.classList.replace('bg-white', 'bg-white/30')); // Reset all
            dots[0].classList.add('bg-white', 'w-12');
            dots[0].classList.remove('bg-white/30', 'w-8');
        }

        if (newsInterval) clearInterval(newsInterval);
        if (!carousel || featured.length <= 1) return;
        
        newsInterval = setInterval(() => {
            if (!document.getElementById('featured-carousel')) {
                clearInterval(newsInterval);
                return;
            }
            index = (index + 1) % featured.length;
            const isLtr = document.documentElement.dir === 'ltr';
            carousel.style.transform = isLtr ? `translateX(-${index * 100}%)` : `translateX(${index * 100}%)`;
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('bg-white', i === index);
                dot.classList.toggle('w-12', i === index);
                dot.classList.toggle('bg-white/30', i !== index);
                dot.classList.toggle('w-8', i !== index);
            });
        }, 5000);

    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

function openNews(id) {
    if (newsInterval) clearInterval(newsInterval);
    loadPage('singleNews');
    loadSingleNews(id);
}

async function loadSingleNews(id) {
    try {
        const res = await fetch(`${apiBaseUrl}/news/${id}`);
        if (!res.ok) throw new Error('News not found');

        const news = await res.json();
        const currentUser = await loadCurrentUser();

        const container = document.getElementById('single-news-container');

        container.innerHTML = `
    <!-- عناصر زخرفية -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
        <!-- زر العودة -->
        <div class="mb-6">
            <button onclick="loadPage('news')" class="flex items-center gap-2 text-gray-400 hover:text-sky-400 transition-colors group">
                <i class="fas fa-arrow-right group-hover:-translate-x-1 transition-transform"></i>
                <span>عودة للأخبار</span>
            </button>
        </div>

        <!-- الصورة الرئيسية -->
        <div class="relative mb-8 group">
            <div class="absolute -inset-1 bg-gradient-to-r from-sky-500 to-teal-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <img src="${news.imageUrl}" 
                 class="relative w-full h-[400px] object-cover rounded-2xl border border-[var(--border-light)]">
            
            <!-- شارة التصنيف (إذا كان موجود) -->
            ${news.category ? `
                <span class="absolute top-4 right-4 bg-[var(--bg-card)] backdrop-blur-md text-sky-400 text-sm px-4 py-2 rounded-full border border-sky-400/30">
                    <i class="fas fa-tag ml-2 text-xs"></i>
                    ${news.category}
                </span>
            ` : ''}
        </div>

        <!-- عنوان الخبر -->
        <div class="text-center mb-8">
            <h1 class="text-4xl md:text-5xl font-bold mb-4 hero-title-animation">
                <span class="gradient-text">${news.title}</span>
            </h1>
            
            <!-- معلومات النشر -->
            <div class="flex flex-wrap items-center justify-center gap-6 text-gray-400">
                <span class="flex items-center gap-2">
                    <i class="fas fa-calendar text-sky-400"></i>
                    ${new Date(news.date).toLocaleDateString('ar-EG')}
                </span>
                <span class="flex items-center gap-2">
                    <i class="fas fa-clock text-teal-400"></i>
                    ${news.time}
                </span>
                ${news.author ? `
                    <span class="flex items-center gap-2">
                        <i class="fas fa-user text-sky-400"></i>
                        ${news.author}
                    </span>
                ` : ''}
            </div>
        </div>

        <!-- المحتوى الرئيسي -->
        <div class="elegant-card p-8 mb-8">
            <!-- الوصف الطويل / التفاصيل -->
            <div class="prose prose-invert max-w-none mb-8">
                <p class="text-lg leading-relaxed text-gray-300 whitespace-pre-line">
                    ${news.Details || news.description || ''}
                </p>
            </div>
        </div>

        <!-- قسم التعليقات -->
        <div class="elegant-card p-8">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold flex items-center gap-2">
                    <i class="fas fa-comments text-teal-400"></i>
                    <span class="gradient-text">التعليقات</span>
                </h3>
                <span class="bg-sky-400/10 text-sky-400 px-3 py-1 rounded-full text-sm border border-sky-400/30">
                    ${news.comments ? news.comments.length : 0} تعليق
                </span>
            </div>

            <!-- إضافة تعليق جديد -->
            <div class="mb-8">
                <div class="flex gap-3">
                    <div class="flex-1 relative">
                        <textarea id="new-comment-${news._id}" 
                                  placeholder="اكتب تعليقك..." 
                                  rows="3"
                                  class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-sky-400 focus:outline-none transition-all placeholder:text-gray-500 resize-none"></textarea>
                    </div>
                    <button onclick="postComment('${news._id}')" 
                            class="self-end w-12 h-12 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>

            <!-- قائمة التعليقات -->
            <div id="comments-list-${news._id}" class="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                ${news.comments && news.comments.length > 0 ? 
                    news.comments.map(comment => {
                        const isOwner = currentUser && (comment.userId === currentUser._id || currentUser.role === 'admin');
                        
                        return `
                            <div class="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-light)] group/comment relative">
                                <!-- رأس التعليق -->
                                <div class="flex items-start gap-3 mb-2">
                                    <img src="${comment.profilePhoto || 'https://ui-avatars.com/api/?name=' + comment.username}" 
                                         class="w-8 h-8 rounded-full object-cover border-2 border-sky-400/30">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="font-bold text-[var(--text-primary)]">${escapeHTML(comment.username)}</span>
                                            ${comment.userType === 'admin' ? 
                                                '<span class="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">مشرف</span>' : 
                                                comment.userType === 'vip' ? 
                                                '<span class="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">VIP</span>' : ''
                                            }
                                            <span class="text-[10px] text-gray-500 mr-auto">${new Date(comment.createdAt).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                        <p class="text-gray-400 text-sm leading-relaxed">${escapeHTML(comment.text || comment.content || '')}</p>
                                    </div>
                                    
                                    ${isOwner ? `
                                        <button onclick="deleteComment('${news._id}', '${comment._id}')" 
                                                class="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover/comment:opacity-100" 
                                                title="حذف التعليق">
                                            <i class="fas fa-trash-alt text-sm"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('') 
                    : `
                    <div class="text-center py-12">
                        <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
                            <i class="fas fa-comments text-3xl text-sky-400/50"></i>
                        </div>
                        <p class="text-gray-400">لا توجد تعليقات بعد</p>
                        <p class="text-gray-500 text-sm mt-1">كن أول من يعلق على هذا الخبر</p>
                    </div>
                `}
            </div>
        </div>
    </div>
`;
    } catch (err) {
        console.error(err);
    }
}

async function postComment(newsId) {
    const input = document.getElementById(`new-comment-${newsId}`);
    const text = input.value.trim();

    if (!text) {
        showNotification('الرجاء كتابة تعليق أولاً', 'info');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('يرجى تسجيل الدخول لتتمكن من إضافة تعليق', 'error');
        return;
    }

    // Cooldown check (30 seconds)
    const lastCommentTime = localStorage.getItem('lastNewsCommentTime');
    const now = Date.now();
    if (lastCommentTime && (now - lastCommentTime) < 30000) {
        const remaining = Math.ceil((30000 - (now - lastCommentTime)) / 1000);
        showNotification(`يرجى الانتظار ${remaining} ثانية قبل إضافة تعليق آخر`, 'warning');
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/news/${newsId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            input.value = '';
            localStorage.setItem('lastNewsCommentTime', Date.now());
            showNotification('تم إضافة التعليق بنجاح', 'success');
            loadSingleNews(newsId);
            updateAdminStats();
        } else {
            const data = await response.json();
            showNotification(data.message || 'فشل نشر التعليق', 'error');
        }
    } catch (error) {
        showNotification('حدث خطأ في إضافة التعليق', 'error');
        console.error('Error posting comment:', error);
    }
}

async function deleteComment(newsId, commentId) {
    showConfirmModal('حذف التعليق', 'هل أنت متأكد من حذف هذا التعليق؟', async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiBaseUrl}/news/${newsId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                showNotification('تم حذف التعليق بنجاح', 'success');
                loadSingleNews(newsId);
                updateAdminStats();
            } else {
                const data = await res.json();
                showNotification(data.message || 'فشل حذف التعليق', 'error');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            showNotification('خطأ في الاتصال بالسيرفر', 'error');
        }
    }, 'danger');
}

let chatPollingInterval;
let chatCurrentUserId = null;
let chatCurrentGroupId = null;
let chatCurrentType = 'private';
let chatUnreadInterval;

function initChat() {
    if (chatPollingInterval) clearInterval(chatPollingInterval);
    chatCurrentUserId = null;
    chatCurrentGroupId = null;
    chatCurrentType = 'private';
    loadConversations();
    chatPollingInterval = setInterval(() => {
        if (chatCurrentType === 'private' && chatCurrentUserId) loadMessages(chatCurrentUserId, false);
        else if (chatCurrentType === 'group' && chatCurrentGroupId) loadMessages(chatCurrentGroupId, false);
        loadConversations(false);
    }, 3000);
}

let chatSearchTimeout;
function searchChatUsers(query) {
    clearTimeout(chatSearchTimeout);
    const container = document.getElementById('chatSearchResults');
    const list = document.getElementById('conversationsList');

    if (!query || query.length < 1) {
        container.classList.add('hidden');
        list.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    list.classList.add('hidden');
    container.innerHTML = '<div class="p-4 text-center text-gray-500"><i class="fas fa-spinner fa-spin"></i></div>';

    chatSearchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/user/search?q=${encodeURIComponent(query)}`);
            const users = await response.json();

            if (users.length === 0) {
                container.innerHTML = '<div class="p-4 text-center text-gray-500">لا يوجد نتائج</div>';
                return;
            }

            const currentUser = await loadCurrentUser();
            container.innerHTML = '';
            users.filter(u => u._id !== currentUser._id).forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.className = 'flex items-center gap-3 p-3 hover:bg-[var(--bg-card)] cursor-pointer border-b border-[var(--border-light)] transition-all duration-300 group';
                userDiv.onclick = () => openChat(user._id, user.username, user.userType || 'عضو');

                const safeUsername = user.username.replace(/'/g, "\\'");
                const photo = user.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username);

                userDiv.innerHTML = `
                    <div class="relative">
                        <div class="w-10 h-10 rounded-full p-[1px] bg-gradient-to-br from-sky-500 to-teal-500">
                            <img src="${photo}" 
                                 class="w-full h-full rounded-full object-cover bg-[var(--bg-primary)]">
                        </div>
                    </div>

                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-0.5">
                            <h4 class="text-[var(--text-primary)] font-bold text-sm group-hover:text-sky-400 transition-colors user-name-label"></h4>
                            ${user.userType === 'admin' ? '<span class="text-[8px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">مشرف</span>' : ''}
                        </div>
                        <p class="text-gray-500 text-xs">${user.userType || 'عضو'}</p>
                    </div>

                    <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="fas fa-comment text-sky-400 text-sm"></i>
                    </div>
                `;
                userDiv.querySelector('.user-name-label').textContent = user.username;
                container.appendChild(userDiv);
            });
        } catch (error) {
            console.error('Chat search error:', error);
            container.innerHTML = '<div class="p-4 text-center text-red-500">خطأ</div>';
        }
    }, 500);
}

async function loadConversations(showLoading = true) {
    const list = document.getElementById('conversationsList');
    const user = await loadCurrentUser();
    if (!list) return;

    if (showLoading) list.innerHTML = `
        <div class="p-8 text-center">
            <div class="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
                <i class="fas fa-spinner fa-spin text-2xl text-sky-400"></i>
            </div>
            <p class="text-gray-400 text-sm">جاري التحميل...</p>
        </div>`;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiBaseUrl}/chat/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const conversations = await res.json();

        if (conversations.length === 0) {
            if (showLoading) list.innerHTML = '<div class="p-8 text-center text-gray-500 text-sm">لا توجد محادثات سابقة<br>ابدأ البحث عن صديق!</div>';
            return;
        }

        list.innerHTML = '';
        conversations.forEach(c => {
            const isGroup = c.type === 'group';
            const id = c.id;
            const lastMessage = c.lastMessage;
            if (!lastMessage) return;

            const time = lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';
            const username = isGroup ? c.group.name : (c.user.username || 'مستخدم');
            const lastContent = lastMessage.content || '';
            const isFromMe = lastMessage.sender === (user._id || user.id);
            const photo = isGroup ? 'https://ui-avatars.com/api/?background=0ea5e9&color=fff&name=' + encodeURIComponent(username) : (c.user.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(username));
            const isActive = isGroup ? (chatCurrentGroupId === id) : (chatCurrentUserId === id);

            const convDiv = document.createElement('div');
            convDiv.className = `flex items-center gap-3 p-3 hover:bg-[var(--bg-card)] cursor-pointer transition-all duration-300 group ${isActive ? 'bg-gradient-to-r from-sky-500/10 to-teal-500/10 border-r-2 border-sky-400' : ''}`;
            convDiv.onclick = () => openChat(id, username, isGroup ? 'مجموعة' : (c.user.userType || 'عضو'), isGroup ? 'group' : 'private');
            
            convDiv.innerHTML = `
                <div class="relative">
                    <div class="w-12 h-12 rounded-full p-[2px] ${isGroup ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-sky-500 to-teal-500'}">
                        <div class="w-full h-full rounded-full overflow-hidden bg-[var(--bg-primary)]">
                            <img src="${photo}" class="w-full h-full object-cover">
                        </div>
                    </div>
                    ${c.unreadCount > 0 ? `
                        <div class="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 border-2 border-[var(--bg-card)] shadow-lg">
                            ${c.unreadCount > 99 ? '99+' : c.unreadCount}
                        </div>
                    ` : ''}
                    ${isGroup ? `
                        <div class="absolute -bottom-1 -left-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center border-2 border-[var(--bg-card)] text-[8px]">
                            <i class="fas fa-users"></i>
                        </div>
                    ` : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-1">
                        <h4 class="text-[var(--text-primary)] font-bold text-sm truncate group-hover:gradient-text transition-all conv-name"></h4>
                        <span class="text-gray-500 text-[10px]">${time}</span>
                    </div>
                    <p class="text-gray-400 text-xs truncate ${c.unreadCount > 0 ? 'font-bold text-[var(--text-primary)]' : ''} flex items-center gap-1">
                        ${isFromMe ? '<span class="text-sky-400 text-[10px]"><i class="fas fa-reply ml-1"></i>أنت:</span>' : ''} 
                        <span class="last-msg-content"></span>
                    </p>
                </div>
            `;
            convDiv.querySelector('.conv-name').textContent = username;
            convDiv.querySelector('.last-msg-content').textContent = lastContent;
            list.appendChild(convDiv);
        });
    } catch (error) {
        console.error('Load conversations error:', error);
    }
}

async function openChat(id, username, userType, type = 'private') {
    chatCurrentType = type;
    if (type === 'private') {
        chatCurrentUserId = id;
        chatCurrentGroupId = null;
    } else {
        chatCurrentGroupId = id;
        chatCurrentUserId = null;
    }

    document.getElementById('chatWithName').textContent = username;
    document.getElementById('chatWithType').textContent = userType;
    document.getElementById('chatInput').disabled = false;
    document.getElementById('chatSendBtn').disabled = false;
    document.getElementById('chatInput').focus();

    const searchInput = document.getElementById('chatUserSearch');
    if (searchInput) searchInput.value = '';

    const searchResults = document.getElementById('chatSearchResults');
    if (searchResults) searchResults.classList.add('hidden');

    const conversationsList = document.getElementById('conversationsList');
    if (conversationsList) conversationsList.classList.remove('hidden');

    // On mobile, show the chat window and hide the list
    toggleChatListView(false);

    loadConversations(false);
    loadMessages(id, true);
}

function toggleChatListView(showList) {
    const listContainer = document.getElementById('chatListContainer');
    const windowContainer = document.getElementById('chatWindowContainer');
    if (!listContainer || !windowContainer) return;

    if (window.innerWidth < 768) { // md breakpoint is 768px
        if (showList) {
            listContainer.classList.remove('hidden');
            windowContainer.classList.add('hidden');
        } else {
            listContainer.classList.add('hidden');
            windowContainer.classList.remove('hidden');
        }
    } else {
        // Desktop: always show both
        listContainer.classList.remove('hidden');
        windowContainer.classList.remove('hidden');
    }
}

async function loadMessages(id, scrollToBottom = false) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    try {
        const token = localStorage.getItem('token');
        const url = chatCurrentType === 'group'
            ? `${apiBaseUrl}/chat/group-messages/${id}`
            : `${apiBaseUrl}/chat/messages/${id}`;

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const messages = await res.json();

        const currentUser = await loadCurrentUser();
        if (!currentUser) return;

        container.innerHTML = '';
        if (messages.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500 mt-10">ابدأ المحادثة الآن!</div>';
        } else {
            messages.forEach(msg => {
                const senderObj = msg.sender || {};
                const isMe = (senderObj._id || senderObj) === (currentUser._id || currentUser.id);
                const senderName = isMe ? 'أنت' : (senderObj.username || 'عضو');

                const msgDiv = document.createElement('div');
                msgDiv.className = `flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`;
                
                msgDiv.innerHTML = `
                    <div class="max-w-[70%] ${isMe 
                        ? 'bg-gradient-to-r from-sky-500/90 to-teal-500/90 text-white rounded-br-none' 
                        : 'bg-[var(--bg-primary)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-bl-none'} 
                        px-4 py-2.5 rounded-2xl shadow-sm relative group backdrop-blur-sm">

                        ${chatCurrentType === 'group' && !isMe ? `
                            <p class="text-[10px] font-bold text-sky-400 mb-1 sender-name-label"></p>
                        ` : ''}

                        ${msg.imageUrl ? `
                            <div class="mb-2 overflow-hidden rounded-lg border border-white/10">
                                <img src="${msg.imageUrl}" alt="صورة" 
                                     class="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" 
                                     onclick="window.open('${msg.imageUrl}', '_blank')">
                            </div>
                        ` : ''}

                        ${msg.content ? `<p class="text-sm leading-relaxed break-words msg-content-p"></p>` : ''}

                        <div class="flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/70' : 'text-gray-500'} text-[10px]">
                            <span>${new Date(msg.createdAt || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                            ${isMe && chatCurrentType === 'private' ? (
                                msg.read 
                                    ? '<i class="fas fa-check-double text-blue-300/70 text-[10px]"></i>' 
                                    : '<i class="fas fa-check text-white/50 text-[10px]"></i>'
                            ) : ''}
                        </div>
                    </div>
                `;
                if (msgDiv.querySelector('.sender-name-label')) {
                    msgDiv.querySelector('.sender-name-label').textContent = senderName;
                }
                if (msgDiv.querySelector('.msg-content-p')) {
                    msgDiv.querySelector('.msg-content-p').textContent = msg.content;
                }
                container.appendChild(msgDiv);
            });
        }

        if (scrollToBottom) {
            container.scrollTop = container.scrollHeight;
        }
    } catch (error) {
        console.error('Load messages error:', error);
    }
}

let selectedChatImageFile = null;

function previewChatImage(input) {
    if (input.files && input.files[0]) {
        selectedChatImageFile = input.files[0];
        document.getElementById('chatImageName').innerText = selectedChatImageFile.name;
        document.getElementById('chatImagePreview').classList.remove('hidden');
        document.getElementById('chatImagePreview').classList.add('flex');
        document.getElementById('chatSendBtn').disabled = false;
    }
}

function clearChatImage() {
    selectedChatImageFile = null;
    document.getElementById('chatImageInput').value = '';
    document.getElementById('chatImagePreview').classList.add('hidden');
    document.getElementById('chatImagePreview').classList.remove('flex');
    const input = document.getElementById('chatInput');
    if (!input.value.trim()) {
        document.getElementById('chatSendBtn').disabled = true;
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    const currentId = chatCurrentType === 'group' ? chatCurrentGroupId : chatCurrentUserId;
    
    // Allow sending if there's either text OR an image
    if ((!content && !selectedChatImageFile) || !currentId) return;

    input.value = '';
    
    const container = document.getElementById('chatMessages');
    const tempId = Date.now();

    const tempMsg = `
        <div class="flex justify-end mb-3" id="temp-${tempId}">
            <div class="max-w-[70%] bg-gradient-to-r from-sky-500/50 to-teal-500/50 text-white rounded-br-none px-4 py-2.5 rounded-2xl shadow-sm backdrop-blur-sm animate-pulse">
                ${selectedChatImageFile ? '<div class="mb-2 text-[10px]"><i class="fas fa-image"></i> إرسال صورة...</div>' : ''}
                ${content ? `<p class="text-sm leading-relaxed break-words">${content}</p>` : ''}
                <div class="flex items-center justify-end gap-1 mt-1 text-white/50 text-[10px]">
                    <i class="fas fa-circle-notch fa-spin text-[8px]"></i>
                    <span>جاري الإرسال</span>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', tempMsg);
    container.scrollTop = container.scrollHeight;

    try {
        const token = localStorage.getItem('token');
        const url = chatCurrentType === 'group'
            ? `${apiBaseUrl}/chat/send-group`
            : `${apiBaseUrl}/chat/send`;

        const formData = new FormData();
        
        if (chatCurrentType === 'group') {
            formData.append('groupId', currentId);
        } else {
            formData.append('receiverId', currentId);
        }
        
        if (content) formData.append('content', content);
        if (selectedChatImageFile) formData.append('image', selectedChatImageFile);

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            clearChatImage();
            loadMessages(currentId, true);
            loadConversations(false);
        } else {
            const data = await res.json().catch(() => ({}));
            document.getElementById(`temp-${tempId}`).remove();
            showNotification(data.message || 'فشل الإرسال', 'error');
            input.value = content;
        }
    } catch (error) {
        document.getElementById(`temp-${tempId}`).remove();
        console.error('Send error:', error);
    }
}

function startUnreadBadgePolling() {
    updateUnreadBadge();
    chatUnreadInterval = setInterval(updateUnreadBadge, 10000);
}

let selectedGroupMembers = [];

async function showCreateGroupModal() {
    const oldModal = document.getElementById('createGroupModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'createGroupModal';
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4';
    modal.setAttribute('dir', 'rtl');
    modal.innerHTML = `
        <div class="elegant-card max-w-md w-full overflow-hidden">
            <div class="p-6 border-b border-[var(--border-light)] flex justify-between items-center">
                <h3 class="text-xl font-bold">
                    <span class="gradient-text">إنشاء مجموعة جديدة</span>
                </h3>
                <button onclick="this.closest('#createGroupModal').remove()" class="w-8 h-8 rounded-lg bg-[var(--bg-primary)] hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 flex items-center justify-center group">
                    <i class="fas fa-times text-gray-400 group-hover:text-red-400"></i>
                </button>
            </div>

            <div class="p-6 space-y-4">
                <div class="group">
                    <label class="block text-sm mb-2 text-gray-400">
                        <i class="fas fa-users text-sky-400 ml-1"></i>
                        اسم المجموعة
                    </label>
                    <input type="text" id="groupName" placeholder="مثلاً: فريق التطوير" 
                        class="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none transition-all duration-300 placeholder:text-gray-500">
                </div>

                <div>
                    <label class="block text-sm mb-2 text-gray-400">
                        <i class="fas fa-user-plus text-teal-400 ml-1"></i>
                        اختر الأعضاء
                    </label>
                    <div class="relative group mb-2">
                        <input type="text" oninput="searchGroupUsers(this.value)" placeholder="ابحث عن أعضاء..." 
                            class="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] text-sm focus:border-sky-400 focus:outline-none transition-all duration-300 pr-10">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors text-sm"></i>
                    </div>

                    <div id="groupUserResults" class="max-h-48 overflow-y-auto space-y-2 border border-[var(--border-light)] rounded-xl p-2 bg-[var(--bg-primary)] custom-scrollbar">
                        <div class="text-center py-6">
                            <i class="fas fa-search text-gray-600 text-xl mb-2"></i>
                            <p class="text-gray-500 text-xs italic">ابدأ البحث لإضافة أعضاء</p>
                        </div>
                    </div>

                    <div id="selectedMembersList" class="flex flex-wrap gap-2 mt-3 min-h-[40px]"></div>
                </div>
            </div>

            <div class="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-light)] flex gap-3">
                <button onclick="handleCreateGroup()" class="flex-1 btn-gradient py-3">
                    <i class="fas fa-plus-circle ml-2"></i>
                    إنشاء المجموعة
                </button>
                <button onclick="this.closest('#createGroupModal').remove()" class="btn-outline px-6 py-3">
                    إلغاء
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    selectedGroupMembers = [];
}

async function searchGroupUsers(query) {
    const container = document.getElementById('groupUserResults');
    if (!query || query.length < 1) {
        container.innerHTML = '<p class="text-center text-gray-600 text-xs py-4 italic">ابدأ البحث لإضافة أعضاء</p>';
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/user/search?q=${encodeURIComponent(query)}`);
        const users = await response.json();
        const currentUser = await loadCurrentUser();

        container.innerHTML = users
            .filter(u => u._id !== (currentUser._id || currentUser.id))
            .map(user => {
                const isSelected = selectedGroupMembers.some(member => member._id === user._id);
                return `
                    <div class="flex items-center justify-between p-2 hover:bg-[var(--bg-card)] rounded-lg transition-all duration-300 cursor-pointer group" onclick="toggleGroupMember('${user._id}', '${user.username}')">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <div class="w-8 h-8 rounded-full p-[1px] bg-gradient-to-br from-sky-500 to-teal-500">
                                    <img src="${user.profilePhoto || 'https://ui-avatars.com/api/?name=' + user.username}" 
                                         class="w-full h-full rounded-full object-cover bg-[var(--bg-primary)]"
                                         onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${user.username}')">
                                </div>
                                ${user.isOnline ? '<span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[var(--bg-card)]"></span>' : ''}
                            </div>
                            <span class="text-[var(--text-primary)] text-sm group-hover:text-sky-400 transition-colors">${user.username}</span>
                        </div>
                        <i class="fas ${isSelected ? 'fa-check-circle text-teal-400' : 'fa-circle text-gray-600'} text-sm transition-all duration-300 ${!isSelected ? 'group-hover:text-gray-400' : ''}"></i>
                    </div>
                `;
            }).join('');
    } catch (error) {
        console.error('Search group users error:', error);
    }
}

function toggleGroupMember(userId, username) {
    const index = selectedGroupMembers.findIndex(member => member._id === userId);

    if (index > -1) {
        selectedGroupMembers.splice(index, 1);
    } else {
        selectedGroupMembers.push({
            _id: userId,
            username: username
        });
    }

    const list = document.getElementById('selectedMembersList');

    list.innerHTML = selectedGroupMembers.length > 0
        ? selectedGroupMembers.map(member => {
            return `
                <span class="bg-sky-400/10 border border-sky-400/20 text-sky-400 text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <i class="fas fa-user-check text-[8px]"></i>
                    <span class="truncate max-w-[80px]">${member.username}</span>
                </span>
            `;
        }).join('')
        : '<p class="text-gray-500 text-xs italic py-2">لم يتم اختيار أي عضو بعد</p>';

    const searchInput = document.querySelector('#createGroupModal input[oninput^="searchGroupUsers"]');
    if (searchInput) searchGroupUsers(searchInput.value);
}

async function handleCreateGroup() {
    const name = document.getElementById('groupName').value.trim();
    if (!name) return showNotification('اسم المجموعة مطلوب', 'error');

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiBaseUrl}/chat/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name, memberIds: selectedGroupMembers })
        });

        if (res.ok) {
            const group = await res.json();
            showNotification('تم إنشاء المجموعة بنجاح', 'success');
            document.getElementById('createGroupModal').remove();
            loadConversations();
            openChat(group._id, group.name, 'مجموعة', 'group');
        } else {
            showNotification('فشل إنشاء المجموعة', 'error');
        }
    } catch (error) {
        console.error('Create group error:', error);
        showNotification('حدث خطأ أثناء الاتصال', 'error');
    }
}

async function updateUnreadBadge() {
    const badge = document.getElementById('navUnreadBadge');
    const mobileBadge = document.querySelector('.mobile-nav-unread');
    if (!badge) return;

    const token = localStorage.getItem('token');
    if (!token) {
        badge.classList.add('hidden');
        return;
    }

    try {
        const res = await fetch(`${apiBaseUrl}/chat/unread-count`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) return;
        const data = await res.json();

        if (data && typeof data.count !== 'undefined') {
            badge.textContent = data.count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    startUnreadBadgePolling();
});


let quizRoomCode = null;
let quizPollingInterval = null;
let quizTimerInterval = null;
let quizMyScore = 0;
let quizAnswered = false;
let quizIsHost = false;
let quizTimerSeconds = 15;
let quizLastQuestionIndex = -1;
let quizAutoAdvanceDoneForIndex = -1;

function initQuizLobby() {
    if (quizPollingInterval) clearInterval(quizPollingInterval);
    if (quizTimerInterval) clearInterval(quizTimerInterval);
    quizRoomCode = null;
    quizMyScore = 0;
    quizAnswered = false;
    quizIsHost = false;
    quizLastQuestionIndex = -1;
    quizAutoAdvanceDoneForIndex = -1;
}

async function createQuizRoom() {
    const user = await loadCurrentUser();
    if (!user) {
        showNotification('سجل دخول أولاً', 'error');
        return;
    }
    const token = localStorage.getItem('token');
    const timer = document.getElementById('quizTimerSelect')?.value || 15;

    try {
        const res = await fetch(`${apiBaseUrl}/quiz/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ questionTimer: parseInt(timer) })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        quizRoomCode = data.code;
        quizIsHost = true;
        quizTimerSeconds = parseInt(timer);
        showNotification('تم إنشاء الغرفة!', 'success');
        showWaitingRoom();
    } catch (err) {
        showNotification(err.message || 'فشل إنشاء الغرفة', 'error');
    }
}

async function joinQuizRoom() {
    const user = await loadCurrentUser();
    if (!user) {
        showNotification('سجل دخول أولاً', 'error');
        return;
    }
    const code = document.getElementById('joinRoomCode')?.value?.trim().toUpperCase();
    if (!code || code.length < 4) {
        showNotification('أدخل كود الغرفة', 'error');
        return;
    }
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${apiBaseUrl}/quiz/join/${code}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        quizRoomCode = code;
        quizIsHost = false;
        showNotification('تم الانضمام!', 'success');
        showWaitingRoom();
    } catch (err) {
        showNotification(err.message || 'فشل الانضمام', 'error');
    }
}

function showWaitingRoom() {
    document.getElementById('quizLobby').classList.add('hidden');
    document.getElementById('quizWaitingRoom').classList.remove('hidden');
    document.getElementById('waitingRoomCode').textContent = quizRoomCode;

    loadPresetCategories();

    const customSection = document.getElementById('customQuestionSection');
    const startBtn = document.getElementById('startGameBtn');
    if (quizIsHost) {
        if (customSection) customSection.style.display = '';
        if (startBtn) startBtn.style.display = '';
    } else {
        if (customSection) customSection.style.display = 'none';
        if (startBtn) startBtn.style.display = 'none';
    }

    startPolling();
}

function startPolling() {
    if (quizPollingInterval) clearInterval(quizPollingInterval);
    pollRoomState();
    quizPollingInterval = setInterval(pollRoomState, 2000);
}

async function pollRoomState() {
    if (!quizRoomCode) return;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${apiBaseUrl}/quiz/room/${quizRoomCode}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'waiting') {
            renderWaitingPlayers(data);
        } else if (data.status === 'playing') {
            renderGamePlay(data);
        } else if (data.status === 'finished') {
            renderResults(data);
        }
    } catch (err) {
        console.error('Polling error:', err);
    }
}

async function renderWaitingPlayers(data) {
    const list = document.getElementById('waitingPlayersList');
    if (!list) return;

    const hostId = data.host?._id;
    list.innerHTML = data.players.map(p => `
        <div class="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)] hover:border-sky-400/50 transition-all duration-300 group">
            <div class="relative">
                <div class="w-10 h-10 rounded-full p-[1px] bg-gradient-to-br from-sky-500 to-teal-500">
                    <img src="${p.user?.profilePhoto || 'https://ui-avatars.com/api/?name=' + (p.user?.username || '?')}" 
                         class="w-full h-full rounded-full object-cover bg-[var(--bg-primary)]"
                         onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${p.user?.username || '?'}')">
                </div>
                ${p.user?._id === hostId ? `
                    <div class="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center border-2 border-[var(--bg-card)]">
                        <i class="fas fa-crown text-white text-[8px]"></i>
                    </div>
                ` : ''}
            </div>

            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <h4 class="text-[var(--text-primary)] font-bold text-sm group-hover:text-sky-400 transition-colors">${p.user?.username || 'لاعب'}</h4>
                    ${p.user?._id === hostId ? '<span class="text-[8px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">مضيف</span>' : ''}
                </div>
                <p class="text-gray-500 text-xs flex items-center gap-1">
                    <i class="fas fa-circle text-[0.3rem] text-green-400"></i>
                    جاهز
                </p>
            </div>

            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="fas fa-check-circle text-teal-400 text-sm"></i>
            </div>
        </div>
    `).join('');

    const countEl = document.getElementById('totalQuestionsCount');
    if (countEl) countEl.textContent = data.totalQuestions;

    const user = await loadCurrentUser();
    if (user && hostId === user._id) {
        quizIsHost = true;
        const startBtn = document.getElementById('startGameBtn');
        const customSection = document.getElementById('customQuestionSection');
        if (startBtn) startBtn.style.display = data.totalQuestions > 0 ? '' : 'none';
        if (customSection) customSection.style.display = '';
    }
}

async function loadPresetCategories() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${apiBaseUrl}/quiz/preset-questions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const container = document.getElementById('presetCategories');
        if (!container || !data.categories) return;

        const icons = { 
            'برمجة': 'fa-code', 
            'أمن سيبراني': 'fa-shield-alt', 
            'ثقافة عامة': 'fa-globe', 
            'رياضيات': 'fa-calculator' 
        };

        container.innerHTML = data.categories.map(cat => `
            <button onclick="addPresetQuestions('${cat.name}')" 
                class="flex items-center gap-2 p-3 rounded-xl border border-[var(--border-light)] hover:border-sky-400 text-gray-400 hover:text-sky-400 transition-all duration-300 text-sm group ${!quizIsHost ? 'opacity-40 cursor-not-allowed' : ''}"
                ${!quizIsHost ? 'disabled' : ''}>

                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/10 to-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i class="fas ${icons[cat.name] || 'fa-question'} text-sky-400"></i>
                </div>

                <div class="flex-1 text-right">
                    <span class="font-medium">${cat.name}</span>
                    <span class="text-xs text-gray-500 mr-2">(${cat.count/2})</span>
                </div>

                <i class="fas fa-plus-circle text-gray-500 group-hover:text-sky-400 transition-colors text-sm"></i>
            </button>
        `).join('');
    } catch (err) { console.error(err); }
}

async function addPresetQuestions(category) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${apiBaseUrl}/quiz/preset-questions?category=${encodeURIComponent(category)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.questions) return;

        const shuffled = data.questions.sort(() => Math.random() - 0.5).slice(0, 5);

        const addRes = await fetch(`${apiBaseUrl}/quiz/room/${quizRoomCode}/add-questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ questions: shuffled })
        });
        const addData = await addRes.json();
        if (!addRes.ok) throw new Error(addData.message);

        showNotification(`تم إضافة 5 أسئلة من "${category}"`, 'success');
        const countEl = document.getElementById('totalQuestionsCount');
        if (countEl) countEl.textContent = addData.totalQuestions;
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn && quizIsHost) startBtn.style.display = '';
    } catch (err) {
        showNotification(err.message || 'فشل إضافة الأسئلة', 'error');
    }
}

async function addCustomQuestion() {
    const q = document.getElementById('customQ')?.value?.trim();
    const opts = [
        document.getElementById('customOpt0')?.value?.trim(),
        document.getElementById('customOpt1')?.value?.trim(),
        document.getElementById('customOpt2')?.value?.trim(),
        document.getElementById('customOpt3')?.value?.trim()
    ];

    if (!q || opts.some(o => !o)) {
        showNotification('أكمل جميع الحقول', 'error');
        return;
    }

    const token = localStorage.getItem('token');
    const correctOpt = opts[0];
    const shuffled = [...opts].sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(correctOpt);

    try {
        const res = await fetch(`${apiBaseUrl}/quiz/room/${quizRoomCode}/add-questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                questions: [{ question: q, options: shuffled, correctAnswer: correctIndex, category: 'مخصص' }]
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showNotification('تم إضافة السؤال', 'success');
        document.getElementById('customQ').value = '';
        document.getElementById('customOpt0').value = '';
        document.getElementById('customOpt1').value = '';
        document.getElementById('customOpt2').value = '';
        document.getElementById('customOpt3').value = '';

        const countEl = document.getElementById('totalQuestionsCount');
        if (countEl) countEl.textContent = data.totalQuestions;
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn && quizIsHost) startBtn.style.display = '';
    } catch (err) {
        showNotification(err.message || 'فشل إضافة السؤال', 'error');
    }
}

var quizSearchTimeout = null;
async function searchUsersForInvite(query) {
    clearTimeout(quizSearchTimeout);
    const container = document.getElementById('inviteSearchResults');
    if (!container) return;
    if (!query || query.length < 2) { container.innerHTML = ''; return; }

    quizSearchTimeout = setTimeout(async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiBaseUrl}/quiz/search-users?q=${encodeURIComponent(query)}&t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const users = await res.json();
            container.innerHTML = users.map(u => `
                <div class="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)] hover:border-sky-400 cursor-pointer transition-all duration-300 group"
                    onclick="if(navigator.clipboard){navigator.clipboard.writeText('${quizRoomCode}'); showNotification('تم نسخ كود الغرفة: ${quizRoomCode}', 'success');} else { prompt('انسخ كود الغرفة وأرسله لـ ${u.username}', '${quizRoomCode}'); }">

                    <div class="relative">
                        <div class="w-10 h-10 rounded-full p-[1px] bg-gradient-to-br from-sky-500 to-teal-500">
                            <img src="${u.profilePhoto || 'https://ui-avatars.com/api/?name=' + u.username}" 
                                 class="w-full h-full rounded-full object-cover bg-[var(--bg-primary)]"
                                 onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${u.username}')">
                        </div>
                    </div>

                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-0.5">
                            <h4 class="text-[var(--text-primary)] font-bold text-sm group-hover:text-sky-400 transition-colors">${u.username}</h4>
                            ${u.userType === 'admin' ? '<span class="text-[8px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">مشرف</span>' : ''}
                        </div>
                        <p class="text-gray-500 text-xs">${u.userType || 'عضو'}</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded-full border border-amber-500/30">
                            <i class="fas fa-star text-[8px]"></i>
                            ${u.quizPoints || 0}
                        </span>
                        <div class="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center group-hover:bg-sky-400/20 transition-colors">
                            <i class="fas fa-paper-plane text-sky-400 text-sm"></i>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (err) { console.error(err); }
    }, 300);
}

async function startQuizGame() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${apiBaseUrl}/quiz/room/${quizRoomCode}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        showNotification('بدأت اللعبة! 🎮', 'success');
    } catch (err) {
        showNotification(err.message || 'فشل بدء اللعبة', 'error');
    }
}

async function renderGamePlay(data) {
    document.getElementById('quizLobby')?.classList.add('hidden');
    document.getElementById('quizWaitingRoom')?.classList.add('hidden');
    document.getElementById('quizResults')?.classList.add('hidden');
    document.getElementById('quizGamePlay')?.classList.remove('hidden');

    const user = await loadCurrentUser();
    const currentUserId = user?._id || user?.id;
    const hostId = data.host?._id || data.host?.id || (typeof data.host === 'string' ? data.host : null);
    const isHost = hostId && currentUserId && (hostId.toString() === currentUserId.toString());

    const currentQEl = document.getElementById('gpCurrentQ');
    const totalQEl = document.getElementById('gpTotalQ');
    if (currentQEl) currentQEl.textContent = (data.currentQuestion + 1);
    if (totalQEl) totalQEl.textContent = data.totalQuestions;

    if (data.question && data.question.index !== quizLastQuestionIndex) {
        quizLastQuestionIndex = data.question.index;
        quizAnswered = false;

        const qText = document.getElementById('gpQuestionText');
        const qCat = document.getElementById('gpCategory');
        if (qText) qText.textContent = data.question.question;
        if (qCat) qCat.textContent = data.question.category || 'عام';

        const qCard = document.getElementById('gpQuestionCard');
        if (qCard) {
            qCard.classList.remove('quiz-animate-in');
            void qCard.offsetWidth;
            qCard.classList.add('quiz-animate-in');
        }

        renderOptions(data.question.options, null, null);

        startQuizTimer(data.questionTimer || 15, data.questionStartedAt);

        // Next question is now automatic

        const optionBtns = document.querySelectorAll('#gpOptions .quiz-option-btn');
        optionBtns.forEach(btn => {
            btn.classList.add('disabled', 'opacity-50', 'cursor-not-allowed');
            btn.style.pointerEvents = 'none';
        });

        setTimeout(() => {
            const currentBtns = document.querySelectorAll('#gpOptions .quiz-option-btn');
            currentBtns.forEach(btn => {
                if (!quizAnswered) {
                    btn.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
                    btn.style.pointerEvents = 'auto';
                }
            });
        }, 3000);
    }

    if (data.allAnswered && data.question?.correctAnswer !== undefined) {
        showCorrectAnswer(data.question.correctAnswer);
        stopQuizTimer();

         if (isHost && data.status === 'playing' && quizAutoAdvanceDoneForIndex !== data.currentQuestion) {
             quizAutoAdvanceDoneForIndex = data.currentQuestion;
             setTimeout(() => {
                 if (quizRoomCode) goToNextQuestion();
             }, 1000);
         }
    }

    renderLiveScores(data.players);

    const myPlayer = data.players.find(p => p.user?._id === user?._id);
    if (myPlayer) {
        quizMyScore = myPlayer.score;
        const badge = document.getElementById('gpScoreBadge');
        if (badge) badge.textContent = quizMyScore + ' نقطة';
    }
}

function renderOptions(options, selectedIndex, correctIndex) {
    const container = document.getElementById('gpOptions');
    if (!container) return;

    const letters = ['أ', 'ب', 'ج', 'د'];
    container.innerHTML = options.map((opt, i) => {
        let classes = 'quiz-option-btn';
        if (selectedIndex !== null) classes += ' disabled';
        if (correctIndex !== null && i === correctIndex) classes += ' correct';
        if (selectedIndex === i && i !== correctIndex) classes += ' wrong';
        return `
            <button class="relative group overflow-hidden ${classes}" onclick="submitQuizAnswer(${i})" ${quizAnswered ? 'disabled' : ''}>
                <div class="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div class="relative z-10 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                        ${letters[i]}
                    </span>

                    <span class="text-base md:text-lg text-[var(--text-primary)] group-hover:text-sky-400 transition-colors">${opt}</span>
                </div>

                ${quizAnswered ? '<i class="fas fa-check-circle absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 text-sm"></i>' : ''}
            </button>
        `;
    }).join('');
}

function showCorrectAnswer(correctIndex) {
    const buttons = document.querySelectorAll('#gpOptions .quiz-option-btn');
    buttons.forEach((btn, i) => {
        btn.classList.add('disabled');
        btn.disabled = true;
        if (i === correctIndex) btn.classList.add('correct');
    });
}

function startQuizTimer(duration, startedAt) {
    if (quizTimerInterval) clearInterval(quizTimerInterval);

    const totalMs = duration * 1000;
    const startTime = new Date(startedAt).getTime();
    const circumference = 106.8;
    const timerCircle = document.getElementById('timerCircle');
    const timerText = document.getElementById('gpTimerText');

    quizTimerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));

        if (timerText) timerText.textContent = remaining;

        const ratio = elapsed / totalMs;
        if (timerCircle) {
            timerCircle.style.strokeDashoffset = circumference * ratio;
            timerCircle.classList.remove('warning', 'danger');
            if (remaining <= 5) timerCircle.classList.add('danger');
            else if (remaining <= 10) timerCircle.classList.add('warning');
        }

        if (remaining <= 0) {
            clearInterval(quizTimerInterval);
            if (!quizAnswered) {
                submitQuizAnswer(-1);
            }
            
            // Auto-advance if host and time is up
            if (quizIsHost && quizRoomCode) {
                setTimeout(() => {
                    goToNextQuestion();
                }, 2000); // 2 second buffer after timeout to allow last-second submission processing
            }
        }
    }, 200);
}

function stopQuizTimer() {
    if (quizTimerInterval) clearInterval(quizTimerInterval);
}

async function submitQuizAnswer(index) {
    if (quizAnswered) return;
    quizAnswered = true;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${apiBaseUrl}/quiz/room/${quizRoomCode}/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ answerIndex: index })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const buttons = document.querySelectorAll('#gpOptions .quiz-option-btn');
        buttons.forEach((btn, i) => {
            btn.classList.add('disabled');
            btn.disabled = true;
            if (i === data.correctAnswer) btn.classList.add('correct');
            if (i === index && !data.correct) btn.classList.add('wrong');
        });

        if (data.correct) {
            showNotification(`✅ إجابة صحيحة! +${data.points} نقطة`, 'success');

            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            currentUser.quizPoints = (currentUser.quizPoints || 0) + data.points;
            localStorage.setItem('user', JSON.stringify(currentUser));

            updateNavbar();
        } else {
            showNotification('❌ إجابة خاطئة', 'error');
        }

        quizMyScore = data.totalScore;
        const badge = document.getElementById('gpScoreBadge');
        if (badge) badge.textContent = quizMyScore + ' نقطة';
    } catch (err) {
        showNotification(err.message || 'فشل إرسال الإجابة', 'error');
        quizAnswered = false;
    }
}

async function goToNextQuestion() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${apiBaseUrl}/quiz/room/${quizRoomCode}/next`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        if (data.finished) {
            showNotification('🏆 انتهت اللعبة!', 'info');
        }
    } catch (err) {
        showNotification(err.message || 'خطأ', 'error');
    }
}

async function renderLiveScores(players) {
    const container = document.getElementById('gpLiveScores');
    if (!container) return;

    const currentUser = await loadCurrentUser();
    const userId = currentUser?._id || currentUser?.id; 
    const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
    document.getElementById('liveScoreCon')?.classList.remove('hidden');

    container.innerHTML = sorted.map(p => `
        <div class="flex items-center gap-2 bg-[var(--bg-primary)] px-3 py-2 rounded-xl border border-[var(--border-light)] hover:border-sky-400/30 transition-all duration-300 group">
        
        ...
        
<span class="flex items-center gap-1 bg-gradient-to-r 
    ${(p.user?._id === userId || p.user?.id === userId)
        ? 'from-sky-500/20 to-teal-500/20 text-sky-400 border-sky-400/30'
        : 'from-amber-500/20 to-amber-500/10 text-amber-400 border-amber-500/30'
    }
    text-sm px-2 py-1 rounded-full font-bold">
    
    <i class="fas fa-star text-[8px]"></i>
    ${p.score || 0} ${p.user?.username || "Player"}
</span>
        
        ${p.answered 
            ? '<i class="fas fa-check-circle text-teal-400 text-sm"></i>' 
            : '<i class="fas fa-hourglass-half text-gray-500 text-sm animate-pulse"></i>'
        }
    </div>
`).join('');
}

function renderResults(data) {
    if (quizPollingInterval) clearInterval(quizPollingInterval);
    if (quizTimerInterval) clearInterval(quizTimerInterval);

    document.getElementById('quizLobby')?.classList.add('hidden');
    document.getElementById('quizWaitingRoom')?.classList.add('hidden');
    document.getElementById('quizGamePlay')?.classList.add('hidden');
    document.getElementById('quizResults')?.classList.remove('hidden');
    document.getElementById('liveScoreCon')?.classList.add('hidden');

    const codeEl = document.getElementById('resultRoomCode');
    if (codeEl) codeEl.textContent = quizRoomCode;

    const leaderboard = document.getElementById('resultsLeaderboard');
    if (!leaderboard || !data.results) return;

    const medals = ['🥇', '🥈', '🥉'];
    const rankClasses = ['quiz-rank-1', 'quiz-rank-2', 'quiz-rank-3'];

    leaderboard.innerHTML = data.results.map((r, i) => `
        <div class="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)] hover:border-sky-400/50 transition-all duration-300 group quiz-animate-in" 
             style="animation-delay: ${i * 0.1}s;">

            <div class="relative w-8 h-8 flex items-center justify-center">
                ${i === 0 
                    ? '<div class="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full blur-sm opacity-50"></div>' 
                    : i === 1 
                    ? '<div class="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full blur-sm opacity-50"></div>'
                    : i === 2
                    ? '<div class="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full blur-sm opacity-50"></div>'
                    : ''
                }
                <div class="relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900' : 
                      i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-slate-900' :
                      i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                      'bg-[var(--bg-card)] border border-[var(--border-light)] text-gray-400'}">
                    ${medals[i] || (i + 1)}
                </div>
            </div>

            <div class="relative">
                <div class="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-sky-500 to-teal-500">
                    <img src="${r.user?.profilePhoto || 'https://ui-avatars.com/api/?name=' + (r.user?.username || '?')}" 
                         class="w-full h-full rounded-full object-cover bg-[var(--bg-primary)]"
                         onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${r.user?.username || '?'}')">
                </div>
                ${i === 0 ? '<div class="absolute -top-1 -right-1 text-yellow-400"><i class="fas fa-crown text-xs"></i></div>' : ''}
            </div>

            <div class="flex-1">
                <h4 class="text-[var(--text-primary)] font-bold text-base group-hover:text-sky-400 transition-colors">${r.user?.username || 'لاعب'}</h4>
                <p class="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                    <i class="fas fa-check-circle text-teal-400 text-[8px]"></i>
                    <span>${r.totalCorrect} إجابة صحيحة</span>
                </p>
            </div>

            <div class="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 text-lg px-4 py-2 rounded-xl border border-amber-500/30 font-bold">
                <i class="fas fa-star text-xs"></i>
                ${r.score}
            </div>
        </div>
    `).join('');
}

function copyRoomCode() {
    if (navigator.clipboard && quizRoomCode) {
        navigator.clipboard.writeText(quizRoomCode);
        showNotification('تم نسخ الكود!', 'success');
    }
}

let archiveLoaded = false;
let archiveLoading = false;
let currentController = null;

async function initArchivePage() {
    const archiveSection = document.getElementById('archive');
    if (!archiveSection) return;

    if (archiveLoaded || archiveLoading) return;

    await loadArchiveData();
}

function resetArchiveState() {
    archiveLoaded = false;

    if (currentController) {
        currentController.abort();
        currentController = null;
    }
}

async function loadArchiveData() {
    try {
        archiveLoading = true;
        showArchiveLoading();

        currentController = new AbortController();

        const response = await fetch(`${apiBaseUrl}/archive`, {
            signal: currentController.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'فشل التحميل');
        }

        if (!document.getElementById('archive')) return;

        renderStatistics(result.data.statistics);
        renderTimeline(result.data.groupedItems);

        hideArchiveLoading();
        archiveLoaded = true;

    } catch (error) {
        if (error.name === 'AbortError') return;

        console.error(error);
        showError('حدث خطأ أثناء تحميل الأرشيف');
    } finally {
        archiveLoading = false;
        currentController = null;
    }
}

function showArchiveLoading() {
    const loading = document.getElementById('archive-loading');
    const content = document.getElementById('archive-content');
    
    if (loading) loading.style.display = 'flex';
    if (content) content.style.display = 'none';
}

function hideArchiveLoading() {
    const loading = document.getElementById('archive-loading');
    const content = document.getElementById('archive-content');
    
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }
    
    if (content) {
        content.style.display = 'block';
        setTimeout(() => {
            content.style.opacity = '1';
        }, 100);
    }
}

function renderStatistics(statistics) {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = '';
    
    const template = document.getElementById('stat-card-template');
    if (!template) return;
    
    statistics.forEach(stat => {
        const clone = document.importNode(template.content, true);
        clone.querySelector('.stat-value').textContent = stat.value;
        clone.querySelector('.stat-label').textContent = stat.label;
        statsContainer.appendChild(clone);
    });
}

function renderTimeline(groupedItems) {
    const timelineContainer = document.getElementById('archive-timeline');
    if (!timelineContainer) return;
    
    timelineContainer.innerHTML = '';
    
    const monthTemplate = document.getElementById('month-group-template');
    const cardTemplate = document.getElementById('archive-card-template');
    
    if (!monthTemplate || !cardTemplate) return;
    
    groupedItems.forEach(group => {
        const monthClone = document.importNode(monthTemplate.content, true);
        
        monthClone.querySelector('.month-number').textContent = getMonthNumber(group.month);
        monthClone.querySelector('.month-name').textContent = `${group.month} ${group.year}`;
        
        const eventsGrid = monthClone.querySelector('.events-grid');
        
        group.items.forEach(item => {
            const cardClone = document.importNode(cardTemplate.content, true);
            
            cardClone.querySelector('.item-image').src = item.imageUrl;
            cardClone.querySelector('.category-name').textContent = item.category;
            cardClone.querySelector('.item-title').textContent = item.title;
            cardClone.querySelector('.item-description').textContent = 
                item.description.length > 100 ? 
                item.description.substring(0, 100) + '...' : 
                item.description;
            cardClone.querySelector('.item-date').textContent = `${item.month} ${item.year}`;
            cardClone.querySelector('.participants-count').textContent = item.participants;
            
            const detailsBtn = cardClone.querySelector('.view-details');
            detailsBtn.addEventListener('click', () => showItemDetails(item._id));
            
            eventsGrid.appendChild(cardClone);
        });
        
        timelineContainer.appendChild(monthClone);
    });
}

function getMonthNumber(monthName) {
    const months = {
        'يناير': '١', 'فبراير': '٢', 'مارس': '٣', 'إبريل': '٤',
        'مايو': '٥', 'يونيو': '٦', 'يوليو': '٧', 'أغسطس': '٨',
        'سبتمبر': '٩', 'أكتوبر': '١٠', 'نوفمبر': '١١', 'ديسمبر': '١٢'
    };
    return months[monthName] || monthName;
}

async function showItemDetails(itemId) {
    try {
        const response = await fetch(`/api/archive/${itemId}`);
        const result = await response.json();
        if (result.success) {
            showDetailsModal(result.data);
        }
    } catch (error) {
        console.error('خطأ:', error);
    }
}

function showError(message) {
    const loading = document.getElementById('archive-loading');
    const content = document.getElementById('archive-content');
    
    if (loading) {
        loading.innerHTML = `
            <div class="text-center py-20">
                <div class="text-red-500 text-6xl mb-4">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <p class="text-gray-400 text-xl mb-4">${message}</p>
                <button onclick="location.reload()" 
                        class="px-6 py-2 bg-[#38bdf8] text-white rounded-lg hover:bg-[#0ea5e9] transition">
                    إعادة المحاولة
                </button>
            </div>
        `;
    }
    
    if (content) content.style.display = 'none';
}

function showDetailsModal(item) {
    const oldModal = document.getElementById('details-modal');
    if (oldModal) oldModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'details-modal';
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    modal.setAttribute('dir', 'rtl');
    
    modal.innerHTML = `
        <div class="relative max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div class="absolute -inset-1 bg-gradient-to-r from-sky-500 to-teal-500 rounded-3xl blur opacity-30"></div>

            <div class="relative elegant-card overflow-y-auto max-h-[90vh]">
                <div class="relative h-64 overflow-hidden">
                    <img src="${item.imageUrl}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent"></div>

                    <button onclick="this.closest('#details-modal').remove()" 
                            class="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-red-500/70 transition-all duration-300 flex items-center justify-center group border border-white/20">
                        <i class="fas fa-times group-hover:scale-110 transition-transform"></i>
                    </button>

                    <div class="absolute top-4 right-4">
                        <span class="px-4 py-2 bg-[var(--bg-card)] backdrop-blur-md text-sky-400 rounded-full text-sm border border-sky-400/30 flex items-center gap-2">
                            <i class="fas fa-tag text-[0.7rem]"></i>
                            ${item.category}
                        </span>
                    </div>

                    <div class="absolute bottom-4 left-4">
                        <span class="text-white/80 text-sm flex items-center gap-2">
                            <i class="fas fa-calendar text-teal-400"></i>
                            ${item.month} ${item.year}
                        </span>
                    </div>
                </div>

                <div class="p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl font-bold text-[var(--text-primary)]">${item.title}</h3>
                        <div class="flex items-center gap-2 bg-sky-400/10 px-3 py-1.5 rounded-full border border-sky-400/30">
                            <i class="fas fa-users text-sky-400 text-sm"></i>
                            <span class="text-gray-300 text-sm">${item.participants} مشارك</span>
                        </div>
                    </div>

                    <div class="border-t border-[var(--border-light)]"></div>

                    <p class="text-gray-300 leading-relaxed">${item.description}</p>

                    <button onclick="this.closest('#details-modal').remove()" 
                            class="w-full btn-gradient py-3 mt-2">
                        <i class="fas fa-times ml-2"></i>
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

async function loadCertificates() {
    const container = document.querySelector("#certificates-section .grid.grid-cols-1");
    // Also support the ID for the account page version
    const accountContainer = document.getElementById('user-certificates-container');
    const targetContainer = container || accountContainer;
    
    const stats = {
        completed: 0,
        inProgress: 0,
        total: 0
    };
    
    try {
        if (!targetContainer) return;
        
        targetContainer.innerHTML = '<div class="col-span-1 md:col-span-2 py-8 text-center text-gray-400"><i class="fas fa-spinner fa-spin text-2xl text-accent mb-2"></i> جاري التحميل... </div>';
        
        const res = await fetch(`${apiBaseUrl}/certificates/my-certificates`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!res.ok) throw new Error('فشل في تحميل الشهادات');

        const certificates = await res.json();
        targetContainer.innerHTML = ''; 

        if (certificates.length === 0) {
            container.innerHTML = `
                <div class="col-span-1 md:col-span-2 py-12 text-center text-gray-500">
                    <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center opacity-50">
                        <i class="fas fa-certificate text-white text-2xl"></i>
                    </div>
                    <p>لا تمتلك أي شهادات حتى الآن.</p>
                </div>
            `;
            return;
        }

        certificates.forEach(cert => {
            stats.total++;

            let statusLabel = 'مستلمة';
            let statusColor = 'green';
            let isProgress = false;
            if(cert.description?.toLowerCase().includes('قيد الإنجاز') || cert.progress < 100) {
                statusLabel = 'قيد الإنجاز';
                statusColor = 'yellow';
                stats.inProgress++;
                isProgress = true;
            } else {
                stats.completed++;
            }

            const card = document.createElement('div');
            card.className = `bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border-light)] hover:border-${statusColor}-400/30 transition-all duration-300 group`;
            
            const header = document.createElement('div');
            header.className = 'flex justify-between items-start mb-4';
            
            const iconBox = document.createElement('div');
            iconBox.className = `w-16 h-16 bg-gradient-to-br from-${statusColor}-500 to-teal-500 rounded-2xl flex items-center justify-center`;
            iconBox.innerHTML = '<i class="fas fa-certificate text-white text-2xl"></i>';
            
            const badge = document.createElement('span');
            badge.className = `bg-${statusColor}-500/20 text-${statusColor}-400 text-xs px-3 py-1 rounded-full border border-${statusColor}-500/30`;
            badge.textContent = statusLabel;
            
            header.appendChild(iconBox);
            header.appendChild(badge);
            
            const title = document.createElement('h4');
            title.className = 'text-[var(--text-primary)] font-bold text-lg mb-2';
            title.textContent = cert.title;
            
            const desc = document.createElement('p');
            desc.className = 'text-gray-400 text-sm mb-4';
            desc.textContent = cert.description || 'بتقدير: ممتاز';
            
            const meta = document.createElement('div');
            meta.className = 'flex items-center justify-between mb-4';
            
            const dateBox = document.createElement('div');
            dateBox.className = 'flex items-center gap-2';
            dateBox.innerHTML = `<i class="fas fa-calendar text-${statusColor}-400 text-xs"></i> `;
            dateBox.appendChild(document.createTextNode(new Date(cert.dateIssued).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })));
            
            const hashBox = document.createElement('div');
            hashBox.className = 'flex items-center gap-2';
            hashBox.innerHTML = '<i class="fas fa-hashtag text-teal-400 text-xs"></i> ';
            hashBox.appendChild(document.createTextNode(`EYF-${cert._id.slice(0,6)}`));
            
            meta.appendChild(dateBox);
            meta.appendChild(hashBox);
            
            card.appendChild(header);
            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(meta);
            
            if (isProgress) {
                const progressWrapper = document.createElement('div');
                progressWrapper.className = 'mb-4';
                const progressBg = document.createElement('div');
                progressBg.className = 'h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden';
                const progressBar = document.createElement('div');
                progressBar.className = 'h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full';
                progressBar.style.width = `${cert.progress || 60}%`;
                progressBg.appendChild(progressBar);
                progressWrapper.appendChild(progressBg);
                card.appendChild(progressWrapper);
            }
            
            const actions = document.createElement('div');
            actions.className = 'flex gap-3';
            
            const viewBtn = document.createElement('button');
            viewBtn.className = 'flex-1 btn-gradient py-2 text-sm';
            viewBtn.innerHTML = '<i class="fas fa-eye ml-1"></i> عرض';
            viewBtn.onclick = () => window.open(cert.certificateUrl, '_blank');
            
            const dlBtn = document.createElement('button');
            dlBtn.className = 'flex-1 btn-outline py-2 text-sm';
            dlBtn.innerHTML = '<i class="fas fa-download"></i>';
            dlBtn.onclick = () => downloadCertificate(cert.certificateUrl);
            
            actions.appendChild(viewBtn);
            actions.appendChild(dlBtn);
            card.appendChild(actions);
            
            targetContainer.appendChild(card);
        });

        // تحديث الإحصائيات إذا كانت موجودة
        const statCards = document.querySelectorAll("#certificates-section .stat-card");
        if (statCards.length >= 3) {
            statCards[0].querySelector('div').textContent = stats.completed;
            statCards[1].querySelector('div').textContent = stats.inProgress;
            statCards[2].querySelector('div').textContent = stats.total;
        }

    } catch (err) {
        console.error(err);
        targetContainer.innerHTML = `<p class="text-center text-gray-500 py-4">${err.message}</p>`;
    }
}

function downloadCertificate(url) {
    if(!url) return showNotification("لا يوجد رابط للتحميل", 'error');
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

async function updateAdminStats() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        // Fetch Users
        const userRes = await fetch(`${apiBaseUrl}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await userRes.json();
        const usersTotal = Array.isArray(users) ? users.length : 0;
        
        // Fetch Events & Count by Type
        const eventRes = await fetch(`${apiBaseUrl}/events`);
        const events = await eventRes.json();
        const coursesCount = events.filter(e => e.type === 'courses').length;
        const eventsCount = events.filter(e => e.type === 'events' || e.type === 'workshops' || e.type === 'upcoming').length;

        // Fetch News
        const newsRes = await fetch(`${apiBaseUrl}/news`);
        const news = await newsRes.json();
        const newsTotal = Array.isArray(news) ? news.length : 0;

        // Update DOM
        const els = {
            'admin-total-users': usersTotal,
            'admin-total-courses': coursesCount,
            'admin-total-events': eventsCount,
            'admin-total-news': newsTotal
        };

        for (const [id, count] of Object.entries(els)) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = count.toLocaleString('ar-EG');
                // Update progress bar width based on some arbitrary max for visual effect
                const bar = el.parentElement.querySelector('.h-1.5 div');
                if (bar) {
                    const percentage = Math.min(100, (count / (count > 50 ? 200 : 50)) * 100);
                    bar.style.width = `${percentage}%`;
                }
            }
        }
    } catch (err) {
        console.error('Error updating admin stats:', err);
    }
}

async function showAdminSection(sectionId, btn) {
    document.querySelectorAll('.admin-section').forEach(el => el.classList.add('hidden'));
    
    // Support both ID formats for compatibility between dashboard.html and app.js
    let section = document.getElementById(`${sectionId}-section-admin`) || document.getElementById(`${sectionId}-section`);
    if (section) section.classList.remove('hidden');

    // Update button active states if a button was passed
    if (btn) {
        document.querySelectorAll('.admin-nav-btn').forEach(b => {
            b.classList.remove('bg-yellow-500/10', 'border-yellow-500/30', 'bg-red-500/10', 'border-red-500/30', 'bg-[#1794E8]/10', 'border-[#1794E8]/30', 'text-white');
            b.classList.add('text-[#94CEF4]', 'border-transparent');
        });
        
        if (sectionId === 'pending-users') {
            btn.classList.add('bg-yellow-500/10', 'border-yellow-500/30', 'text-white');
        } else if (sectionId === 'banned-users') {
            btn.classList.add('bg-red-500/10', 'border-red-500/30', 'text-white');
        } else {
            btn.classList.add('bg-[#1794E8]/10', 'border-[#1794E8]/30', 'text-white');
        }
    }

    if (sectionId === 'logs') {
        fetchLogs();
    } else if (sectionId === 'events') {
        loadEvents();
    } else if (sectionId === 'users') {
        fetchUsers();
    } else if (sectionId === 'pending-users') {
        fetchPendingUsers();
    } else if (sectionId === 'banned-users') {
        fetchBannedUsers();
    } else if (sectionId === 'certs') {
        fetchAdminCertificates();
    } else if (sectionId === 'news') {
        loadNewsAdmin();
    }
}

async function fetchLogs() {
    const token = localStorage.getItem('token');
    const tableBody = document.getElementById('logs-table-body');
    if (!tableBody) return;

    const actionLabels = {
        'LOGIN': 'تسجيل دخول', 'LOGOUT': 'تسجيل خروج', 'REGISTER': 'تسجيل جديد',
        'UPDATE_PROFILE': 'تحديث الملف', 'CHANGE_PASSWORD': 'تغيير كلمة المرور',
        'CREATE_EVENT': 'إنشاء فعالية', 'UPDATE_EVENT': 'تعديل فعالية', 'DELETE_EVENT': 'حذف فعالية',
        'APPROVE_REGISTRATION': 'قبول تسجيل', 'REJECT_REGISTRATION': 'رفض تسجيل',
        'SUSPEND_USER': 'تعليق مستخدم', 'UNSUSPEND_USER': 'رفع تعليق',
        'APPROVE_USER': 'تفعيل مستخدم', 'REJECT_USER': 'رفض مستخدم',
        'DELETE_USER': 'حذف مستخدم', 'BULK_UPDATE_REGISTRATIONS': 'تحديث جماعي'
    };

    try {
        tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-gray-400"><i class="fas fa-spinner fa-spin ml-2"></i> جاري تحميل السجلات...</td></tr>`;

        const response = await fetch(`${apiBaseUrl}/logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) {
            tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-400">فشل تحميل السجلات: ${data.message || ''}</td></tr>`;
            return;
        }

        const logs = Array.isArray(data) ? data : (data.logs || []);

        if (logs.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-12 text-center text-gray-500">لا توجد سجلات بعد</td></tr>`;
            return;
        }

        tableBody.innerHTML = '';
        logs.forEach(log => {
            const dateStr = log.createdAt ? new Date(log.createdAt).toLocaleString('ar-JO') : '-';
            const row = document.createElement('tr');
            row.className = 'hover:bg-white/5 transition-colors border-b border-white/5';
            
            row.innerHTML = `
                <td class="px-6 py-4 text-gray-300 text-[10px] whitespace-nowrap">${dateStr}</td>
                <td class="px-6 py-4">
                    <div class="font-bold text-white text-sm log-username"></div>
                </td>
                <td class="px-6 py-4">
                    <span class="bg-accent/20 text-accent px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap">
                        ${actionLabels[log.action] || log.action || '-'}
                    </span>
                </td>
                <td class="px-6 py-4 text-gray-400 text-xs min-w-[200px] log-details"></td>
                <td class="px-6 py-4 text-gray-500 text-[10px] tabular-nums">${log.ip || '-'}</td>
            `;
            row.querySelector('.log-username').textContent = log.userId?.username || log.userId?.email || 'مجهول';
            row.querySelector('.log-details').textContent = log.details || '-';
            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error('Error fetching logs:', err);
        tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-400"><i class="fas fa-exclamation-circle ml-2"></i> خطأ في الاتصال بالخادم</td></tr>`;
    }
}

async function fetchAdminCertificates() {
    const token = localStorage.getItem('token');
    const tableBody = document.getElementById('admin-certs-table-body');
    if (!tableBody) return;

    try {
        tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400"><i class="fas fa-spinner fa-spin ml-2"></i> جاري تحميل الشهادات...</td></tr>`;

        const response = await fetch(`${apiBaseUrl}/certificates/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const certificates = await response.json();

        if (!response.ok) {
            tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-red-400">فشل تحميل الشهادات: ${certificates.message || ''}</td></tr>`;
            return;
        }

        if (certificates.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">لا توجد شهادات مصدرة بعد</td></tr>`;
            return;
        }

        tableBody.innerHTML = certificates.map(cert => {
            const dateStr = cert.dateIssued ? new Date(cert.dateIssued).toLocaleDateString('ar-JO') : '-';
            const userDisplay = cert.userId ? `${cert.userId.username} (${cert.userId.customId})` : 'مستخدم مجهول';
            return `
            <tr class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4">
                    <div class="font-medium text-white">${userDisplay}</div>
                    <div class="text-gray-500 text-xs">${cert.userId?.email || ''}</div>
                </td>
                <td class="px-6 py-4 text-gray-300">${cert.title}</td>
                <td class="px-6 py-4 text-gray-400 text-sm">${dateStr}</td>
                <td class="px-6 py-4 text-center">
                    <div class="flex justify-center gap-2">
                        <a href="${cert.certificateUrl}" target="_blank" class="p-2 bg-sky-500/10 text-sky-400 rounded-lg hover:bg-sky-500 hover:text-white transition-all shadow-sm" title="عرض">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        <button onclick="handleDeleteCertificate('${cert._id}')" class="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm" title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');

    } catch (err) {
        console.error('Error fetching admin certificates:', err);
        tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-red-400"><i class="fas fa-exclamation-circle ml-2"></i> خطأ في الاتصال بالخادم</td></tr>`;
    }
}

window.showIssueCertificateModal = function() {
    const modalHtml = `
    <div id="issueCertificateModal" class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="bg-[var(--bg-card)] border border-[var(--border-light)] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
            <div class="p-6 border-b border-[var(--border-light)] flex justify-between items-center bg-gradient-to-r from-teal-500/10 to-sky-500/10">
                <h3 class="text-xl font-bold flex items-center gap-2">
                    <i class="fas fa-certificate text-teal-400"></i>
                    <span>إصدار شهادة جديدة</span>
                </h3>
                <button onclick="closeModal('issueCertificateModal')" class="text-gray-400 hover:text-white transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <form onsubmit="handleIssueCertificate(event)" class="p-6 space-y-4">
                <div class="grid grid-cols-1 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs text-gray-400 mr-1">رقم العضوية (Member ID) *</label>
                        <input type="text" name="userId" placeholder="مثال: EYF-001" required
                            class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-white focus:border-teal-400 focus:outline-none transition-all">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs text-gray-400 mr-1">عنوان الشهادة *</label>
                        <input type="text" name="title" placeholder="مثال: شهادة إتمام كورس البرمجة" required
                            class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-white focus:border-teal-400 focus:outline-none transition-all">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs text-gray-400 mr-1">جهة الإصدار *</label>
                        <input type="text" name="issuer" value="ملتقى شباب التميز" required
                            class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-white focus:border-teal-400 focus:outline-none transition-all">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs text-gray-400 mr-1">رابط الشهادة (PDF or Link) *</label>
                        <input type="url" name="certificateUrl" placeholder="https://example.com/cert.pdf" required
                            class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-white focus:border-teal-400 focus:outline-none transition-all">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs text-gray-400 mr-1">وصف قصير</label>
                        <textarea name="description" placeholder="تفاصيل إضافية..." rows="2"
                            class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-white focus:border-teal-400 focus:outline-none transition-all"></textarea>
                    </div>
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="submit" class="flex-1 btn-gradient py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                        <i class="fas fa-check-circle"></i>
                        <span>إصدار الشهادة</span>
                    </button>
                     <button type="button" onclick="document.getElementById('issueCertificateModal').remove()" class="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-all">
                         إلغاء
                     </button>
                </div>
            </form>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.handleIssueCertificate = async function(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const token = localStorage.getItem('token');
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري المعالجة...';

        const response = await fetch(`${apiBaseUrl}/certificates/issue`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('تم إصدار الشهادة بنجاح', 'success');
            closeModal('issueCertificateModal');
            fetchAdminCertificates();
        } else {
            showNotification(result.message || 'فشل إصدار الشهادة', 'error');
        }
    } catch (err) {
        console.error('Error issuing certificate:', err);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle ml-2"></i> إصدار الشهادة';
    }
};

window.handleDeleteCertificate = function(id) {
    showConfirmModal(
        'حذف الشهادة',
        'هل أنت متأكد من رغبتك في حذف هذه الشهادة؟ لا يمكن التراجع عن هذا الإجراء.',
        async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${apiBaseUrl}/certificates/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    showNotification('تم حذف الشهادة بنجاح', 'success');
                    fetchAdminCertificates();
                } else {
                    const result = await response.json();
                    showNotification(result.message || 'فشل حذف الشهادة', 'error');
                }
            } catch (err) {
                console.error('Error deleting certificate:', err);
                showNotification('خطأ في التواصل مع الخادم', 'error');
            }
        },
        'danger',
        'حذف نهائي'
    );
};

async function fetchPendingUsers() {
    const token = localStorage.getItem('token');
    const tableBody = document.getElementById('pending-users-table-body');
    if (!tableBody) return;

    try {
        tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400">جاري تحميل الطلبات...</td></tr>';
        const response = await fetch(`${apiBaseUrl}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        
        if (response.ok) {
            const pendingOnes = users.filter(u => u.status === 'pending');
            if (pendingOnes.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">لا يوجد طلبات تفعيل حالياً</td></tr>';
                return;
            }
            tableBody.innerHTML = '';
            pendingOnes.forEach(user => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-white/5 transition-colors border-b border-white/5';
                row.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="font-bold text-white user-name"></div>
                        <div class="text-xs text-gray-500">${user.email}</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">${new Date(user.createdAt).toLocaleDateString('ar-JO')}</td>
                    <td class="px-6 py-4">
                        <span class="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">قيد الانتظار</span>
                    </td>
                    <td class="px-6 py-4 flex gap-2 justify-center">
                        <button class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all approve-btn">تفعيل</button>
                        <button class="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-red-600/30 transition-all reject-btn">رفض</button>
                    </td>
                `;
                row.querySelector('.user-name').textContent = user.username;
                row.querySelector('.approve-btn').onclick = () => approveUser(user._id);
                row.querySelector('.reject-btn').onclick = () => rejectUser(user._id);
                tableBody.appendChild(row);
            });
        }
    } catch (e) {
        console.error(e);
        tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-red-500">حدث خطأ في تحميل البيانات</td></tr>';
    }
}

async function approveUser(userId) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${apiBaseUrl}/user/${userId}/approve`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showNotification('تم تفعيل الحساب بنجاح', 'success');
            fetchPendingUsers();
            if (typeof fetchUsers === 'function') fetchUsers();
            updateAdminStats();
        } else {
            const data = await res.json();
            showNotification(data.message || 'فشل تفعيل الحساب', 'error');
        }
    } catch (e) {
        showNotification('خطأ في الاتصال', 'error');
    }
}

async function rejectUser(userId) {
    showConfirmModal(
        'تأكيد الرفض',
        'هل أنت متأكد من رفض هذا الطلب؟',
        async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${apiBaseUrl}/user/${userId}/reject`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    showNotification('تم رفض الطلب', 'info');
                    fetchPendingUsers();
                    updateAdminStats();
                } else {
                    const data = await res.json();
                    showNotification(data.message || 'فشل رفض الطلب', 'error');
                }
            } catch (e) {
                showNotification('خطأ في الاتصال', 'error');
            }
        },
        'danger',
        'تأكيد الرفض'
    );
}

async function fetchBannedUsers() {
    const token = localStorage.getItem('token');
    const list = document.getElementById('banned-users-list');
    if (!list) return;

    try {
        list.innerHTML = '<div class="text-center text-red-400 py-8"><i class="fas fa-spinner fa-spin ml-2"></i> جاري تحميل القائمة...</div>';
        const response = await fetch(`${apiBaseUrl}/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        
        if (response.ok) {
            const bannedOnes = users.filter(u => u.suspendedUntil && new Date(u.suspendedUntil) > new Date());
            if (bannedOnes.length === 0) {
                list.innerHTML = '<div class="text-center text-gray-500 py-12 bg-white/5 rounded-2xl border border-white/10">لا يوجد مستخدمين محظورين</div>';
                return;
            }
            list.innerHTML = '';
            bannedOnes.forEach(user => {
                const item = document.createElement('div');
                item.className = 'bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4';
                item.innerHTML = `
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white"><i class="fas fa-user-slash"></i></div>
                        <div>
                            <h5 class="text-white font-bold banned-user-name"></h5>
                            <p class="text-red-400 text-xs ban-reason-text"></p>
                            <p class="text-red-400 text-[10px] opacity-70">محظور لغاية: ${new Date(user.suspendedUntil).toLocaleDateString('ar-JO')}</p>
                        </div>
                    </div>
                    <button onclick="unsuspendUser('${user._id}')" class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">رفع الحظر</button>
                `;
                item.querySelector('.banned-user-name').textContent = user.username;
                item.querySelector('.ban-reason-text').textContent = `السبب: ${user.banReason || 'غير محدد'}`;
                list.appendChild(item);
            });
        }
    } catch (e) {
        list.innerHTML = '<div class="text-center text-red-500 py-8">خطأ في تحميل البيانات</div>';
    }
}

async function unsuspendUser(userId) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${apiBaseUrl}/user/${userId}/unsuspend`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showNotification('تم رفع الحظر بنجاح', 'success');
            fetchBannedUsers();
            if (typeof fetchUsers === 'function') fetchUsers();
            updateAdminStats();
        } else {
            showNotification('فشل رفع الحظر', 'error');
        }
    } catch (e) {
        showNotification('خطأ في الاتصال', 'error');
    }
}


function toggleAdminNotifications() {
    showAdminSection('logs');
    showNotification('تم فتح سجل النشاطات للتنبيهات', 'info');
}


async function loadEvents() {
            console.log('🔄 بدء تحميل الفعاليات...');

            const container = document.getElementById('events-list-container');
            const countSpan = document.getElementById('eventsCount');

            if (!container) {
                console.log('❌ عنصر events-list-container غير موجود');
                return;
            }
            // عرض مؤشر التحميل
            container.innerHTML = `
        <div class="text-center text-gray-400 py-8">
            <i class="fas fa-spinner fa-spin text-accent text-3xl mb-3"></i>
            <p>جاري تحميل الفعاليات...</p>
        </div>
    `;

            try {
                const response = await fetch(`${apiBaseUrl}/events`);

                if (!response.ok) {
                    throw new Error(`فشل في تحميل البيانات: ${response.status}`);
                }

                const events = await response.json();
                console.log(`✅ تم تحميل ${events.length} فعالية`);

                // تحديث العداد
                if (countSpan) {
                    countSpan.textContent = `(${events.length})`;
                }

                // عرض الفعاليات
                displayEvents(events);

            } catch (error) {
                console.error('❌ خطأ:', error);
                container.innerHTML = `
            <div class="text-center text-red-500 py-8 bg-red-500/10 rounded-lg">
                <i class="fas fa-exclamation-circle text-3xl mb-3"></i>
                <p class="mb-2">فشل تحميل الفعاليات</p>
                <p class="text-sm text-gray-400">${error.message}</p>
                <button onclick="loadEvents()" 
                    class="mt-4 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition">
                    <i class="fas fa-sync-alt ml-2"></i>
                    إعادة المحاولة
                </button>
            </div>
        `;
            }
        }

        // ==================== 2. عرض الفعاليات ====================
        function displayEvents(events) {
            const container = document.getElementById('events-list-container');

            if (!container) return;

            if (!events || events.length === 0) {
                container.innerHTML = `
            <div class="text-center text-gray-400 py-8 bg-primary rounded-lg">
                <i class="fas fa-calendar-times text-4xl mb-3 text-gray-500"></i>
                <p>لا توجد فعاليات حالياً</p>
                <button onclick="toggleEventForm()" 
                    class="mt-4 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition">
                    <i class="fas fa-plus ml-2"></i>
                    إضافة أول فعالية
                </button>
            </div>
        `;
                return;
            }

            container.innerHTML = '';
            events.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.className = `bg-primary p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${!event.status ? 'opacity-80' : ''}`;
                
                eventDiv.innerHTML = `
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-gradient-to-r ${event.bgColor || 'from-accent to-[#0b446b]'} rounded-xl flex items-center justify-center">
                            <i class="fas ${event.icon || 'fa-code'} text-white text-2xl"></i>
                        </div>
                        <div class="flex-1">
                            <h5 class="text-white font-bold mb-1 event-title-h"></h5>
                            <div class="flex flex-wrap gap-3 text-xs">
                                <span class="text-gray-400"><i class="fas fa-calendar ml-1 text-accent"></i> ${event.date || 'غير محدد'}</span>
                                <span class="text-gray-400"><i class="fas fa-users ml-1 text-accent"></i> ${event.seats} مقعد</span>
                                <span class="text-gray-400 font-medium whitespace-nowrap"><i class="fas fa-user ml-1 text-accent"></i> <span class="instructor-span"></span></span>
                                <span class="text-gray-400"><i class="fas fa-clock ml-1 text-accent"></i> ${event.duration}</span>
                            </div>
                            <div class="flex gap-2 mt-2">
                                <span class="inline-block ${event.status ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'} text-xs px-2 py-1 rounded-full border">
                                    <i class="fas ${event.status ? 'fa-check-circle' : 'fa-clock'} ml-1"></i> 
                                    ${event.status ? 'منشور' : 'مسودة'}
                                </span>
                                <span class="inline-block bg-accent/20 text-accent text-xs px-2 py-1 rounded-full border border-accent/30">
                                    <i class="fas fa-tag ml-1"></i>
                                    ${getTypeArabic(event.type)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2 mr-0 md:mr-4">
                        <button class="bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-sm hover:bg-blue-500 hover:text-white transition group relative reg-modal-btn" title="عرض المسجلين">
                            <i class="fas fa-users"></i>
                            <span class="mr-1 hidden md:inline">المسجلين</span>
                        </button>
                        <button class="bg-accent text-white px-3 py-2 rounded-lg text-sm hover:bg-accent-hover transition edit-btn" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="${event.status ? 'bg-green-500/20 text-green-400 hover:bg-green-500' : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500'} px-3 py-2 rounded-lg text-sm hover:text-white transition status-btn" title="${event.status ? 'إلغاء النشر' : 'نشر'}">
                            <i class="fas ${event.status ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        </button>
                        <button class="border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition delete-btn" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                eventDiv.querySelector('.event-title-h').textContent = event.title;
                eventDiv.querySelector('.instructor-span').textContent = event.instructor;
                eventDiv.querySelector('.reg-modal-btn').onclick = () => showRegistrationsModal(event._id, event.title, event.seats);
                eventDiv.querySelector('.edit-btn').onclick = () => editEvent(event._id);
                eventDiv.querySelector('.status-btn').onclick = () => updateEventStatus(event._id, !event.status);
                eventDiv.querySelector('.delete-btn').onclick = () => deleteEvent(event._id);
                container.appendChild(eventDiv);
            });
        }
        // ==================== 3. دوال المسجلين ====================
        async function showRegistrationsModal(eventId, eventTitle, totalSeats) {
            console.log('📋 فتح نافذة المسجلين:', { eventId, eventTitle, totalSeats });

            currentEventId = eventId;
            currentEventSeats = totalSeats;

            // إنشاء المودال إذا لم يكن موجوداً
            let modal = document.getElementById('registrationsModal');
            if (!modal) {
                modal = createRegistrationsModal();
                document.body.appendChild(modal);
            }

            // تحديث عنوان المودال
            const titleElement = document.getElementById('modalEventTitle');
            if (titleElement) {
                titleElement.textContent = eventTitle;
            }

            // إظهار المودال
            modal.classList.remove('hidden');
            modal.classList.add('flex');

            // تحميل المسجلين
            await loadEventRegistrations(eventId);
        }

        function createRegistrationsModal() {
            const modal = document.createElement('div');
            modal.id = 'registrationsModal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50';
            modal.innerHTML = `
<div class="elegant-card max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
    <!-- رأس المودال (ثابت) -->
    <div class="sticky top-0 bg-[var(--bg-card)] backdrop-blur-md z-10 px-6 py-4 border-b border-[var(--border-light)] flex justify-between items-center">
        <div>
            <h3 class="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <i class="fas fa-users text-sky-400"></i>
                المسجلين في: <span id="modalEventTitle" class="gradient-text"></span>
            </h3>
            <div id="seatsInfo" class="text-sm text-gray-400 mt-1 flex items-center gap-1">
                <i class="fas fa-chair text-teal-400 text-xs"></i>
                <span></span>
            </div>
        </div>
        <button onclick="closeRegistrationsModal()" class="w-10 h-10 rounded-lg bg-[var(--bg-primary)] hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 flex items-center justify-center group">
            <i class="fas fa-times text-gray-400 group-hover:text-red-400"></i>
        </button>
    </div> 
    
    <div class="p-6">
        <!-- إحصائيات سريعة -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="stat-card p-4 text-center">
                <div class="text-2xl font-bold gradient-text" id="totalCount">0</div>
                <div class="text-xs text-gray-400">إجمالي المسجلين</div>
            </div>
            <div class="stat-card p-4 text-center">
                <div class="text-2xl font-bold text-amber-400" id="pendingCount">0</div>
                <div class="text-xs text-gray-400">قيد الانتظار</div>
            </div>
            <div class="stat-card p-4 text-center">
                <div class="text-2xl font-bold text-green-400" id="approvedCount">0</div>
                <div class="text-xs text-gray-400">تم القبول</div>
            </div>
            <div class="stat-card p-4 text-center">
                <div class="text-2xl font-bold text-red-400" id="rejectedCount">0</div>
                <div class="text-xs text-gray-400">مرفوض</div>
            </div>
        </div>
        
        <!-- قائمة المسجلين -->
        <div id="registrationsList" class="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
            <div class="flex flex-col items-center justify-center py-12">
                <div class="relative mb-4">
                    <div class="w-16 h-16 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <i class="fas fa-users text-2xl text-sky-400"></i>
                    </div>
                </div>
                <p class="text-gray-400 text-sm">جاري تحميل المسجلين...</p>
            </div>
        </div>
    </div>
</div>
    `;

            // إغلاق المودال عند الضغط خارجه
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeRegistrationsModal();
                }
            });

            return modal;
        }
        function closeRegistrationsModal() {
            const modal = document.getElementById('registrationsModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
            currentEventId = null;
        }
        async function loadEventRegistrations(eventId) {
            try {
                const response = await fetch(`${apiBaseUrl}/registrations/event/${eventId}`);

                if (!response.ok) {
                    throw new Error('فشل في تحميل المسجلين');
                }

                const data = await response.json();
                console.log('✅ تم تحميل المسجلين:', data);

                // تحديث الإحصائيات
                updateStats(data);

                // عرض المسجلين
                displayRegistrations(data.registrations || []);

            } catch (error) {
                console.error('❌ خطأ في تحميل المسجلين:', error);
                document.getElementById('registrationsList').innerHTML = `
            <div class="text-center text-red-500 py-8 bg-red-500/10 rounded-lg">
                <i class="fas fa-exclamation-circle text-3xl mb-3"></i>
                <p>فشل تحميل المسجلين</p>
                <button onclick="loadEventRegistrations('${eventId}')" 
                    class="mt-4 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition">
                    إعادة المحاولة
                </button>
            </div>
        `;
            }
        }

        function displayRegistrations(registrations) {
            const container = document.getElementById('registrationsList');

            if (!container) return;

            if (!registrations || registrations.length === 0) {
                container.innerHTML = `
            <div class="text-center text-gray-400 py-8 bg-primary rounded-lg">
                <i class="fas fa-user-slash text-4xl mb-3 text-gray-500"></i>
                <p>لا يوجد مسجلين بعد</p>
            </div>
        `;
                return;
            }

            container.innerHTML = '';
            registrations.forEach(reg => {
                const regDiv = document.createElement('div');
                regDiv.className = 'bg-primary p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-700';
                
                regDiv.innerHTML = `
<div class="flex items-start gap-3 flex-1">
    <div class="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-sky-500 to-teal-500">
        <div class="w-full h-full rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
            <i class="fas fa-user text-sky-400"></i>
        </div>
    </div>
    <div>
        <h6 class="text-[var(--text-primary)] font-medium reg-name-h"></h6>
        <p class="text-gray-400 text-sm reg-email-p"></p>
        <p class="text-gray-500 text-xs mt-1">
            <i class="fas fa-clock ml-1 text-teal-400"></i>
            ${new Date(reg.registeredAt).toLocaleDateString('ar-JO')}
        </p>
    </div>
</div>

<div class="flex items-center gap-3">
    <span class="px-3 py-1 rounded-full text-xs ${getStatusBadgeClass(reg.status)}">
        ${getStatusText(reg.status)}
    </span>
    <div class="flex gap-2">
        ${reg.status !== 'approved' ? `
            <button class="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm hover:bg-green-500 hover:text-white transition approve-btn"
                title="قبول">
                <i class="fas fa-check"></i>
            </button>
        ` : ''}
        
        ${reg.status !== 'rejected' ? `
            <button class="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition reject-btn"
                title="رفض">
                <i class="fas fa-times"></i>
            </button>
        ` : ''}

        <button class="bg-gray-500/10 text-gray-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition delete-btn"
            title="حذف التسجيل">
            <i class="fas fa-trash-alt"></i>
        </button>
    </div>
</div>
                `;
                regDiv.querySelector('.reg-name-h').textContent = reg.name;
                regDiv.querySelector('.reg-email-p').textContent = reg.email;
                if (regDiv.querySelector('.approve-btn')) regDiv.querySelector('.approve-btn').onclick = () => approveRegistration(reg._id);
                if (regDiv.querySelector('.reject-btn')) regDiv.querySelector('.reject-btn').onclick = () => rejectRegistration(reg._id);
                regDiv.querySelector('.delete-btn').onclick = () => deleteRegistrationByAdmin(reg._id);
                container.appendChild(regDiv);
            }); 
        }

        function updateStats(data) {
            const total = data.total || 0;
            const pending = data.pending || 0;
            const approved = data.approved || 0;
            const rejected = data.rejected || 0;

            const totalEl = document.getElementById('totalCount');
            const pendingEl = document.getElementById('pendingCount');
            const approvedEl = document.getElementById('approvedCount');
            const rejectedEl = document.getElementById('rejectedCount');

            if (totalEl) totalEl.textContent = total;
            if (pendingEl) pendingEl.textContent = pending;
            if (approvedEl) approvedEl.textContent = approved;
            if (rejectedEl) rejectedEl.textContent = rejected;

            // تحديث معلومات المقاعد
            const seatsInfo = document.getElementById('seatsInfo');
            if (seatsInfo) {
                const remaining = currentEventSeats - approved;
                seatsInfo.innerHTML = `
            <i class="fas fa-chair ml-1"></i>
            المقاعد: ${approved} / ${currentEventSeats} 
            ${remaining > 0 ?
                        `<span class="text-green-400 mr-2">(${remaining} متبقي)</span>` :
                        `<span class="text-red-400 mr-2">(اكتمل العدد)</span>`
                    }
        `;
            }
        }

        // ==================== 4. دوال القبول والرفض ====================
        async function approveRegistration(registrationId) {
            showConfirmModal('تأكيد القبول', 'هل أنت متأكد من قبول هذا التسجيل؟', async () => {
                try {
                    const token = localStorage.getItem('token');
                    const headers = { 'Content-Type': 'application/json' };
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    const response = await fetch(`${apiBaseUrl}/registrations/${registrationId}/approve`, {
                        method: 'PATCH',
                        headers: headers
                    });

                    if (response.ok) {
                        showNotification('تم قبول المشترك بنجاح', 'success');
                        if (currentEventId) await loadEventRegistrations(currentEventId);
                    } else {
                        const error = await response.json();
                        showNotification(error.message || 'حدث خطأ في قبول التسجيل', 'error');
                    }
                } catch (error) {
                    console.error('❌ خطأ:', error);
                    showNotification('فشل في قبول التسجيل', 'error');
                }
            }, 'success', 'تأكيد');
        }

        async function rejectRegistration(registrationId) {
            showConfirmModal('تأكيد الرفض', 'هل أنت متأكد من رفض هذا التسجيل؟', async () => {
                try {
                    const token = localStorage.getItem('token');
                    const headers = { 'Authorization': `Bearer ${token}` };

                    const response = await fetch(`${apiBaseUrl}/registrations/${registrationId}/reject`, {
                        method: 'PATCH',
                        headers: headers
                    });

                    if (response.ok) {
                        showNotification('تم رفض الطلب بنجاح', 'success');
                        if (currentEventId) await loadEventRegistrations(currentEventId);
                    } else {
                        const error = await response.json();
                        showNotification(error.message || 'حدث خطأ في رفض التسجيل', 'error');
                    }
                } catch (error) {
                    console.error('❌ خطأ:', error);
                    showNotification('فشل في رفض التسجيل', 'error');
                }
            }, 'danger', 'تأكيد');
        }

        async function deleteRegistrationByAdmin(registrationId) {
            showConfirmModal('تأكيد الحذف', 'هل أنت متأكد من حذف هذا التسجيل؟', async () => {
                try {
                    const token = localStorage.getItem('token');
                    const headers = { 'Authorization': `Bearer ${token}` };

                    const response = await fetch(`${apiBaseUrl}/registrations/${registrationId}`, {
                        method: 'DELETE',
                        headers: headers
                    });

                    if (response.ok) {
                        showNotification('تم حذف التسجيل بنجاح', 'success');
                        if (currentEventId) await loadEventRegistrations(currentEventId);
                    } else {
                        const error = await response.json();
                        showNotification(error.message || 'فشل في حذف التسجيل', 'error');
                    }
                } catch (error) {
                    console.error('❌ خطأ:', error);
                    showNotification('فشل في حذف التسجيل', 'error');
                }
            }, 'danger', 'حذف');
        }

        // ==================== 5. دوال إدارة الفعاليات ====================
        function toggleEventForm() {
            const form = document.getElementById('eventFormContainer');
            const toggleText = document.getElementById('eventFormToggleText');

            if (form.classList.contains('hidden')) {
                form.classList.remove('hidden');
                if (toggleText) toggleText.textContent = 'إلغاء';

                // إعادة تعيين عنوان النموذج للوضع الطبيعي
                document.getElementById('eventFormTitle').textContent = 'إضافة فعالية جديدة';

                // إعادة نص زر الحفظ
                const saveBtn = document.querySelector('#eventFormContainer button[onclick="saveEvent()"]');
                if (saveBtn) {
                    saveBtn.innerHTML = '<i class="fas fa-save ml-2"></i> حفظ الفعالية';
                }

                // حذف hidden ID إذا موجود
                const hiddenId = document.getElementById('editingEventId');
                if (hiddenId) hiddenId.remove();

            } else {
                form.classList.add('hidden');
                if (toggleText) toggleText.textContent = 'إضافة فعالية جديدة';
                resetEventForm();
            }
        }

        function resetEventForm() {
            document.getElementById('eventTitle').value = '';
            document.getElementById('eventType').value = 'courses';
            document.getElementById('eventDate').value = '';
            document.getElementById('eventSeats').value = '';
            document.getElementById('eventInstructor').value = '';
            document.getElementById('eventDuration').value = '';
            document.getElementById('eventIcon').value = 'fa-code';
            document.getElementById('eventBgColor').value = 'from-accent to-[#0b446b]';
            document.getElementById('eventDescription').value = '';
            document.getElementById('eventStatus').checked = true;

            // حذف hidden ID إذا موجود
            const hiddenId = document.getElementById('editingEventId');
            if (hiddenId) hiddenId.remove();
        }

        async function editEvent(eventId) {
            console.log('🔄 جاري تحميل بيانات الفعالية:', eventId);

            try {
                const token = localStorage.getItem('token');
                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(`${apiBaseUrl}/events/${eventId}`, {
                    headers: headers
                });

                if (!response.ok) {
                    throw new Error('فشل في تحميل بيانات الفعالية');
                }

                const event = await response.json();
                console.log('✅ تم تحميل البيانات:', event);

                // تعبئة النموذج بالبيانات
                document.getElementById('eventTitle').value = event.title || '';
                document.getElementById('eventType').value = event.type || 'courses';
                document.getElementById('eventDate').value = event.date || '';
                document.getElementById('eventSeats').value = event.seats || '';
                document.getElementById('eventInstructor').value = event.instructor || '';
                document.getElementById('eventDuration').value = event.duration || '';
                document.getElementById('eventIcon').value = event.icon || 'fa-code';
                document.getElementById('eventBgColor').value = event.bgColor || 'from-accent to-[#0b446b]';
                document.getElementById('eventDescription').value = event.description || '';
                document.getElementById('eventStatus').checked = event.status === true || event.status === 'true';

                // تغيير عنوان النموذج
                document.getElementById('eventFormTitle').textContent = 'تعديل الفعالية';

                // إضافة حقل مخفي لتخزين ID الفعالية
                let hiddenIdField = document.getElementById('editingEventId');
                if (!hiddenIdField) {
                    hiddenIdField = document.createElement('input');
                    hiddenIdField.type = 'hidden';
                    hiddenIdField.id = 'editingEventId';
                    document.getElementById('eventFormContainer').appendChild(hiddenIdField);
                }
                hiddenIdField.value = eventId;

                // تغيير نص زر الحفظ
                const saveBtn = document.querySelector('#eventFormContainer button[onclick="saveEvent()"]');
                if (saveBtn) {
                    saveBtn.innerHTML = '<i class="fas fa-edit ml-2"></i> تحديث الفعالية';
                }

                // إظهار النموذج
                const form = document.getElementById('eventFormContainer');
                form.classList.remove('hidden');
                document.getElementById('eventFormToggleText').textContent = 'إلغاء';

                // التمرير للنموذج
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });

            } catch (error) {
                console.error('❌ خطأ في تحميل بيانات الفعالية:', error);
                showNotification('فشل في تحميل بيانات الفعالية للتعديل', 'error');
            }
        }

        async function saveEvent() {
            // التحقق من وجود ID للتعديل
            const editingId = document.getElementById('editingEventId')?.value;

            const eventData = {
                title: document.getElementById('eventTitle').value,
                type: document.getElementById('eventType').value,
                date: document.getElementById('eventDate').value,
                seats: parseInt(document.getElementById('eventSeats').value),
                instructor: document.getElementById('eventInstructor').value,
                duration: document.getElementById('eventDuration').value,
                icon: document.getElementById('eventIcon').value,
                bgColor: document.getElementById('eventBgColor').value,
                description: document.getElementById('eventDescription').value,
                status: document.getElementById('eventStatus').checked
            }; 

            // التحقق من الحقول المطلوبة
            if (!eventData.title || !eventData.instructor || !eventData.duration || !eventData.seats) {
                showNotification('الرجاء تعبئة جميع الحقول المطلوبة', 'error');
                return;
            }

            const saveBtn = document.querySelector('#eventFormContainer button[onclick="saveEvent()"]');
            const originalBtnText = saveBtn ? saveBtn.innerHTML : '';

            try {
                const token = localStorage.getItem('token');
                const headers = {
                    'Content-Type': 'application/json'
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                } else {
                    showNotification('أنت غير مسجل دخول! الرجاء تسجيل الدخول أولاً', 'error');
                    return;
                }

                // Disable button and show spinner
                if (saveBtn) {
                    saveBtn.disabled = true;
                    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري الحفظ...';
                }

                // تحديد الرابط والطريقة حسب وجود editingId
                let url = `${apiBaseUrl}/events`;
                let method = 'POST';

                if (editingId) {
                    url = `${apiBaseUrl}/events/${editingId}`;
                    method = 'PUT';
                }

                const response = await fetch(url, {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(eventData)
                });

                if (response.ok) {
                    showNotification(`تم ${editingId ? 'تحديث' : 'إضافة'} الفعالية بنجاح`, 'success');
                    toggleEventForm(); // إخفاء النموذج
                    loadEvents(); // إعادة تحميل القائمة
                    resetEventForm(); // تصفير النموذج
                    
                    if (document.getElementById('editingEventId')) {
                        document.getElementById('editingEventId').remove();
                    }
                    updateAdminStats();

                } else if (response.status === 401) {
                    showNotification('غير مصرح لك بالقيام بهذا الإجراء', 'error');
                } else {
                    showNotification('حدث خطأ أثناء الحفظ', 'error');
                }

    } catch (error) {
        console.error('Error submitting event:', error);
        showNotification('خطأ في الاتصال بالسيرفر', 'error');
    }
}

async function deleteEvent(id) {
    showConfirmModal(
        'حذف الفعالية',
        'هل أنت متأكد من رغبتك في حذف هذه الفعالية نهائياً؟ ستفقد كافة بيانات المسجلين فيها أيضاً.',
        async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${apiBaseUrl}/events/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    showNotification('تم حذف الفعالية بنجاح', 'success');
                    loadEvents();
                    updateAdminStats();
                } else {
                    const data = await response.json();
                    showNotification(data.message || 'فشل حذف الفعالية', 'error');
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                showNotification('خطأ في الاتصال بالخادم', 'error');
            }
        },
        'danger',
        'حذف نهائي'
    );
}

async function updateEventStatus(id, status) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiBaseUrl}/events/${id}/toggle-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showNotification(status ? 'تم نشر الفعالية' : 'تم تحويل الفعالية لمسودة', 'success');
            loadEvents();
            updateAdminStats();
        } else {
            showNotification('فشل تحديث حالة الفعالية', 'error');
        }
    } catch (error) {
        console.error('Error updating event status:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}



// --- News Administration Functions ---

function toggleNewsForm() {
    const container = document.getElementById('newsFormContainer');
    if (!container) return;
    container.classList.toggle('hidden');
    
    // Reset form if opening for new entry
    if (!container.classList.contains('hidden')) {
        document.getElementById('formTitle').textContent = 'إضافة خبر جديد';
        document.getElementById('newsTitle').value = '';
        document.getElementById('newsCategory').value = '';
        document.getElementById('newsDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('newsTime').value = new Date().toTimeString().split(' ')[0].substring(0, 5);
        document.getElementById('newsImage').value = '';
        document.getElementById('newsDescription').value = '';
        document.getElementById('newsDetails').value = '';
        document.getElementById('newsIsFeatured').checked = false;
        document.getElementById('newsFeaturedOrder').value = '0';
        
        // Remove editing ID if exists
        const editingId = document.getElementById('editingNewsId');
        if (editingId) editingId.remove();
    }
}

async function loadNewsAdmin() {
    const container = document.getElementById('newsList');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center text-gray-500 py-8"><i class="fas fa-spinner fa-spin ml-2"></i> جاري تحميل الأخبار...</div>';
    
    try {
        const response = await fetch(`${apiBaseUrl}/news`);
        const news = await response.json();
        
        const countSpan = document.getElementById('newsCount');
        if (countSpan) countSpan.textContent = `(${news.length})`;
        
        if (news.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500 py-8">لا توجد أخبار حالياً</div>';
            return;
        }
        
        container.innerHTML = '';
        news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(item => {
            const div = document.createElement('div');
            div.className = 'bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-light)] flex flex-col md:flex-row md:items-center justify-between gap-4';
            
            const content = document.createElement('div');
            content.className = 'flex items-center gap-4';
            
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'w-16 h-16 rounded-lg overflow-hidden shrink-0';
            const img = document.createElement('img');
            img.src = item.imageUrl || 'https://images.unsplash.com/photo-1556761175-b413da4baf72';
            img.className = 'w-full h-full object-cover';
            imgWrapper.appendChild(img);
            
            const info = document.createElement('div');
            const title = document.createElement('h5');
            title.className = 'text-[var(--text-primary)] font-bold text-sm mb-1';
            title.textContent = item.title;
            
            const meta = document.createElement('div');
            meta.className = 'flex flex-wrap items-center gap-3 text-xs text-gray-500';
            
            const categorySpan = document.createElement('span');
            categorySpan.innerHTML = '<i class="fas fa-tag ml-1 text-teal-400"></i> ';
            categorySpan.appendChild(document.createTextNode(item.category));
            
            const dateSpan = document.createElement('span');
            dateSpan.innerHTML = '<i class="far fa-calendar ml-1 text-teal-400"></i> ';
            dateSpan.appendChild(document.createTextNode(new Date(item.date || item.publishedAt || item.createdAt).toLocaleDateString('ar-EG')));
            
            meta.appendChild(categorySpan);
            meta.appendChild(dateSpan);
            
            if (item.isFeatured) {
                const featuredSpan = document.createElement('span');
                featuredSpan.className = 'text-yellow-500 font-bold';
                featuredSpan.innerHTML = `<i class="fas fa-star ml-1"></i> مميز (${item.featuredOrder})`;
                meta.appendChild(featuredSpan);
            }
            
            info.appendChild(title);
            info.appendChild(meta);
            content.appendChild(imgWrapper);
            content.appendChild(info);
            
            const actions = document.createElement('div');
            actions.className = 'flex gap-2';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.onclick = () => editNews(item);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.onclick = () => deleteNews(item._id);
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            div.appendChild(content);
            div.appendChild(actions);
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading news admin:', error);
        container.innerHTML = '<div class="text-center text-red-500 py-8">فشل تحميل الأخبار</div>';
    }
}

async function handleCreateNews() {
    const editingIdInput = document.getElementById('editingNewsId');
    const editingId = editingIdInput ? editingIdInput.value : null;
    
    const newsData = {
        title: document.getElementById('newsTitle').value,
        category: document.getElementById('newsCategory').value,
        date: document.getElementById('newsDate').value,
        time: document.getElementById('newsTime').value,
        imageUrl: document.getElementById('newsImage').value,
        description: document.getElementById('newsDescription').value,
        details: document.getElementById('newsDetails').value,
        isFeatured: document.getElementById('newsIsFeatured').checked,
        featuredOrder: parseInt(document.getElementById('newsFeaturedOrder').value) || 0
    };
    
    if (!newsData.title || !newsData.category || !newsData.description || !newsData.imageUrl) {
        showNotification('يرجى ملء الحقول المطلوبة (بما في ذلك رابط الصورة)', 'error');
        return;
    }
    
    const token = localStorage.getItem('token');
    const btn = document.querySelector('button[onclick="handleCreateNews()"]');
    const originalText = btn.innerHTML;
    
    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الحفظ...';
        
        const url = editingId ? `${apiBaseUrl}/news/${editingId}` : `${apiBaseUrl}/news`;
        const method = editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newsData)
        });
        
        if (response.ok) {
            showNotification(editingId ? 'تم تحديث الخبر بنجاح' : 'تم نشر الخبر بنجاح', 'success');
            toggleNewsForm();
            loadNewsAdmin();
            updateAdminStats();
        } else {
            const data = await response.json();
            showNotification(data.message || 'فشل حفظ الخبر', 'error');
        }
    } catch (error) {
        console.error('Error saving news:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function editNews(item) {
    const container = document.getElementById('newsFormContainer');
    if (container.classList.contains('hidden')) toggleNewsForm();
    
    document.getElementById('formTitle').textContent = 'تعديل الخبر';
    document.getElementById('newsTitle').value = item.title;
    document.getElementById('newsCategory').value = item.category;
    
    const date = new Date(item.date || item.publishedAt || item.createdAt);
    document.getElementById('newsDate').value = date.toISOString().split('T')[0];
    document.getElementById('newsTime').value = item.time || date.toTimeString().split(' ')[0].substring(0, 5);
    
    document.getElementById('newsImage').value = item.imageUrl || '';
    document.getElementById('newsDescription').value = item.description;
    document.getElementById('newsDetails').value = item.details || '';
    document.getElementById('newsIsFeatured').checked = item.isFeatured;
    document.getElementById('newsFeaturedOrder').value = item.featuredOrder || 0;
    
    let editingIdInput = document.getElementById('editingNewsId');
    if (!editingIdInput) {
        editingIdInput = document.createElement('input');
        editingIdInput.type = 'hidden';
        editingIdInput.id = 'editingNewsId';
        container.appendChild(editingIdInput);
    }
    editingIdInput.value = item._id;
    
    container.scrollIntoView({ behavior: 'smooth' });
}

function deleteNews(id) {
    showConfirmModal(
        'حذف الخبر',
        'هل أنت متأكد من رغبتك في حذف هذا الخبر نهائياً؟',
        async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${apiBaseUrl}/news/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    showNotification('تم حذف الخبر بنجاح', 'success');
                    loadNewsAdmin();
                    updateAdminStats();
                } else {
                    const data = await response.json();
                    showNotification(data.message || 'فشل حذف الخبر', 'error');
                }
            } catch (error) {
                console.error('Error deleting news:', error);
                showNotification('خطأ في الاتصال بالخادم', 'error');
            }
        },
        'danger',
        'حذف نهائي'
    );
}


async function loadUserRegistrations() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const user = await loadCurrentUser();
        if (!user || !user._id) throw new Error('User not found');

        const response = await fetch(`${apiBaseUrl}/registrations/user/${user._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load registrations');
        }

        const data = await response.json();
        const registrations = Array.isArray(data) ? data : [];

        const countDisplay = document.getElementById('total-registrations-count');

        if (countDisplay) {
            countDisplay.innerText = `${registrations.length} تسجيل في الكورسات، الفعاليات وورش العمل`;
        }

        const renderItems = (items, container, emptyMsg) => {
            if (!container) return;
            if (items.length === 0) {
                container.innerHTML = '';
                const p = document.createElement('p');
                p.className = 'py-6 text-gray-500 text-center col-span-full';
                p.innerHTML = '<i class="fas fa-info-circle ml-2"></i> ';
                p.appendChild(document.createTextNode(emptyMsg));
                container.appendChild(p);
                return;
            }

            container.innerHTML = '';
            items.forEach(reg => {
                const event = reg.eventId || {};
                const statusColors = {
                    'pending': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                    'approved': 'bg-green-500/10 text-green-400 border-green-500/20',
                    'rejected': 'bg-red-500/10 text-red-500 border-red-500/20'
                };
                const statusLabels = {
                    'pending': 'قيد الانتظار',
                    'approved': 'مقبول',
                    'rejected': 'مرفوض'
                };

                const dateStr = new Date(reg.registeredAt || reg.createdAt).toLocaleDateString('ar-JO');

                const card = document.createElement('div');
                card.className = 'elegant-card p-4 flex flex-col gap-3 group text-right';
                
                const top = document.createElement('div');
                top.className = 'flex items-center gap-4';
                
                const iconBox = document.createElement('div');
                iconBox.className = `w-12 h-12 rounded-xl bg-gradient-to-br ${event.bgColor || 'from-sky-500 to-teal-500'} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform`;
                iconBox.innerHTML = `<i class="fas ${event.icon || 'fa-calendar-alt'}"></i>`;
                
                const info = document.createElement('div');
                info.className = 'flex-1';
                
                const title = document.createElement('h4');
                title.className = 'text-white font-bold text-sm';
                title.textContent = event.title || reg.eventName || 'تسجيل';
                
                const meta = document.createElement('div');
                meta.className = 'flex flex-wrap gap-3 mt-1';
                
                const dateSpan = document.createElement('span');
                dateSpan.className = 'text-gray-400 text-[10px]';
                dateSpan.innerHTML = '<i class="fas fa-calendar-alt ml-1"></i> ';
                dateSpan.appendChild(document.createTextNode(dateStr));
                
                const statusSpan = document.createElement('span');
                statusSpan.className = `px-2 py-0.5 rounded-full text-[10px] border ${statusColors[reg.status] || statusColors.pending}`;
                statusSpan.textContent = statusLabels[reg.status] || reg.status;
                
                meta.appendChild(dateSpan);
                meta.appendChild(statusSpan);
                info.appendChild(title);
                info.appendChild(meta);
                
                top.appendChild(iconBox);
                top.appendChild(info);
                card.appendChild(top);
                
                container.appendChild(card);
            });
        };

        const listContainer = document.getElementById('user-courses-list') || document.getElementById('user-events-list');
        if (listContainer) {
            renderItems(registrations, listContainer, 'لا توجد تسجيلات بعد');
        }
        
        // Hide the other container/title if both exist and one is being used
        const coursesList = document.getElementById('user-courses-list');
        const eventsList = document.getElementById('user-events-list');
        if (coursesList && eventsList) {
            eventsList.style.display = 'none';
            const eventsHeading = eventsList.previousElementSibling;
            if (eventsHeading && eventsHeading.tagName === 'H3') eventsHeading.style.display = 'none';
        }

    } catch (error) {
        console.error('Error loading registrations:', error);
        const container = document.getElementById('user-courses-list') || document.getElementById('user-events-list');
        if (container) container.innerHTML = '<p class="text-red-400 py-4"><i class="fas fa-exclamation-circle ml-1"></i> فشل تحميل التسجيلات.</p>';
    }
}

async function loadUserCertificates() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${apiBaseUrl}/certificates/my-certificates`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load certificates');
        }

        const data = await response.json();
        const certificates = Array.isArray(data) ? data : [];
        const container = document.getElementById('user-certificates-container');

        if (!container) return;

        if (certificates.length === 0) {
            container.innerHTML = `
                <div class="col-span-1 md:col-span-2 py-12 text-center text-gray-500">
                    <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center opacity-50">
                        <i class="fas fa-certificate text-white text-2xl"></i>
                    </div>
                    <p>لا تمتلك أي شهادات حتى الآن.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = certificates.map(cert => {
            const courseTitle = cert.title || 'شهادة إتمام';
            const issueDate = new Date(cert.dateIssued || cert.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
            const mockCertId = 'EYF-' + (cert._id ? cert._id.toString().slice(-6).toUpperCase() : '001');
            const certUrl = cert.certificateUrl || '#';
            
            return `
                <div class="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border-light)] hover:border-teal-400/30 transition-all duration-300 group text-right">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-sky-500 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-award text-white text-2xl"></i>
                        </div>
                        <span class="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
                            مستلمة
                        </span>
                    </div>
                    <h4 class="text-[var(--text-primary)] font-bold text-lg mb-2">${courseTitle}</h4>
                    <p class="text-gray-400 text-sm mb-4">الجهة المانحة: ${cert.issuer || 'EYF'}</p>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-calendar text-teal-400 text-xs"></i>
                            <span class="text-gray-500 text-sm">${issueDate}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fas fa-hashtag text-sky-400 text-xs"></i>
                            <span class="text-gray-500 text-sm" style="direction: ltr;">${mockCertId}</span>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <a href="${certUrl}" target="_blank" class="flex-1 btn-gradient py-2 text-sm text-center">
                            <i class="fas fa-eye ml-1"></i> عرض
                        </a>
                        <a href="${certUrl}" download class="flex-1 btn-outline py-2 text-sm text-center">
                            <i class="fas fa-download"></i> تحميل
                        </a>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading certificates:', error);
        const container = document.getElementById('user-certificates-container');
        if (container) {
            container.innerHTML = '<div class="col-span-1 md:col-span-2 text-red-400 py-4 text-center"><p><i class="fas fa-exclamation-circle ml-1"></i> فشل تحميل الشهادات.</p></div>';
        }
    }
}

         let allAdminUsers = [];

         async function fetchUsers() {
            const token = localStorage.getItem('token');
            const tbody = document.getElementById('users-table-body');
            if (!tbody) return;

            try {
                tbody.innerHTML = '<div class="text-center text-gray-400 py-8"><i class="fas fa-spinner fa-spin ml-2"></i> جاري التحميل...</div>';

                const response = await fetch(`${apiBaseUrl}/user`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const users = await response.json();

                 if (response.ok) {
                     allAdminUsers = users;
                     renderAdminUsers(users);
                 } else {
                     tbody.innerHTML = `<div class="text-center text-red-400 py-8">${users.message || 'فشل تحميل المستخدمين'}</div>`;
                 }
             } catch (error) {
                 console.error('Error fetching users:', error);
                 tbody.innerHTML = `<div class="text-center text-red-400 py-8">خطأ في الاتصال</div>`;
             }
         }

         window.filterAdminUsers = function(term) {
             if (!term) {
                 renderAdminUsers(allAdminUsers);
                 return;
             }
             const filtered = allAdminUsers.filter(u => 
                 u.username.toLowerCase().includes(term.toLowerCase()) || 
                 u.email.toLowerCase().includes(term.toLowerCase()) ||
                 (u.phone && u.phone.includes(term)) ||
                 (u.customId && u.customId.toLowerCase().includes(term.toLowerCase()))
             );
             renderAdminUsers(filtered);
         };

         function renderAdminUsers(users) {
             const tbody = document.getElementById('users-table-body');
             if (!tbody) return;

             if (users.length === 0) {
                 tbody.innerHTML = '<div class="text-center text-gray-400 py-8">لا يوجد مستخدمين يطابقون بحثك</div>';
                 return;
             }

             tbody.innerHTML = users.map(user => `
                 <div class="bg-primary p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div class="flex items-center gap-4">
                         <div class="w-12 h-12 bg-gradient-to-r ${user.role === 'admin' ? 'from-accent-hover to-accent' : 'from-gray-700 to-gray-600'} rounded-full flex items-center justify-center overflow-hidden">
                             ${user.profilePhoto
                                 ? `<img src="${user.profilePhoto}" alt="${user.username}" class="w-full h-full object-cover">`
                                 : `<i class="fas ${user.role === 'admin' ? 'fa-user-shield' : 'fa-user'} text-white"></i>`}
                         </div>
                         <div>
                             <h5 class="text-white font-bold">${user.username}</h5>
                             <p class="text-sky-400 text-xs font-mono">${user.customId || ''}</p>
                             <p class="text-gray-400 text-sm">${user.email}</p>
                             ${user.phone ? `<p class="text-gray-500 text-xs mt-1"><i class="fas fa-phone-alt ml-1"></i> ${user.phone}</p>` : ''}
                             <div class="flex gap-2 mt-1 flex-wrap">
                                 ${getUserTypeBadge(user.userType)}
                             </div>
                         </div>
                     </div>
                     <div class="flex gap-2 flex-wrap items-center">
                         <select onchange="updateUserType('${user._id}', this.value)" class="bg-secondary border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:border-accent focus:outline-none">
                             <option value="مستخدم عادي" ${user.userType === 'مستخدم عادي' ? 'selected' : ''}>مستخدم عادي</option>
                             <option value="عضو إدارة" ${user.userType === 'عضو إدارة' ? 'selected' : ''}>عضو إدارة</option>
                             <option value="أصدقاء الملتقى" ${user.userType === 'أصدقاء الملتقى' ? 'selected' : ''}>أصدقاء الملتقى</option>
                             <option value="الرئيس" ${user.userType === 'الرئيس' ? 'selected' : ''}>الرئيس</option>
                         </select>
                         ${user.role === 'admin' ? `
                             <button onclick="updateUserRole('${user._id}', 'admin')" class="border border-purple-500/30 text-purple-400 px-3 py-2 rounded-lg text-sm hover:bg-purple-500 hover:text-white transition" title="تعيين كمستخدم">
                                 <i class="fas fa-crown"></i>
                             </button>
                         ` : ''}
                         ${user.role !== 'admin' ? `
                            <button onclick="updateUserRole('${user._id}', 'user')" class="border border-yellow-500/30 text-yellow-400 px-3 py-2 rounded-lg text-sm hover:bg-yellow-500 hover:text-white transition" title="تعيين كمشرف">
                                 <i class="fas fa-user"></i>
                             </button>
                         ` : ''}
                         <button onclick="suspendUser('${user._id}')" class="border border-red-500/30 text-red-500 px-3 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition" title="حظر">
                             <i class="fas fa-user-slash"></i>
                         </button>
                         <button onclick="deleteUser('${user._id}')" class="border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition" title="حذف المستخدم">
                             <i class="fas fa-trash"></i>
                         </button>
                     </div>
                 </div>
             `).join('');
         }

        async function suspendUser(userId) {
            showPromptModal('يرجى إدخال سبب الحظر:', 'اكتب السبب هنا...', async (reason) => {
                if (!reason) return; // User cancelled or left empty

                const token = localStorage.getItem('token');
                try {
                    const res = await fetch(`${apiBaseUrl}/user/${userId}/suspend`, {
                        method: 'PUT',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                    body: JSON.stringify({ reason: reason || 'لا يوجد سبب محدد' })
                });
                if (res.ok) {
                    showNotification('تم حظر المستخدم لمدة شهر', 'success');
                    fetchUsers();
                    if (typeof fetchBannedUsers === 'function') fetchBannedUsers();
                } else {
                        showNotification('فشل حظر المستخدم', 'error');
                    }
                } catch (e) {
                    showNotification('خطأ في الاتصال', 'error');
                }
            });
        }


        async function updateUserType(userId, userType) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${apiBaseUrl}/user/${userId}/role`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ userType })
                });
                if (response.ok) {
                    showNotification('تم تحديث نوع المستخدم بنجاح', 'success');
                    fetchUsers();
                } else {
                    showNotification('فشل تحديث نوع المستخدم', 'error');
                }
            } catch (error) {
                console.error('Error updating user type:', error);
                showNotification('خطأ في الاتصال', 'error');
            }
        }

        async function updateUserCustomId(userId) {
            const customId = document.getElementById(`custom-id-${userId}`).value.trim();
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${apiBaseUrl}/user/${userId}/update-custom-id`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ customId })
                });
                if (response.ok) {
                    showNotification('تم تحديث رقم العضوية', 'success');
                    fetchUsers();
                } else {
                    showNotification('فشل تحديث رقم العضوية', 'error');
                }
            } catch (error) {
                console.error('Error updating customId:', error);
                showNotification('خطأ في الاتصال', 'error');
            }
        }

        async function deleteUser(id) {
            showConfirmModal(
                'حذف المستخدم',
                'هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.',
                async () => {
                    const token = localStorage.getItem('token');
                    try {
                        const response = await fetch(`${apiBaseUrl}/user/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (response.ok) {
                            showNotification('تم حذف المستخدم بنجاح', 'success');
                            fetchUsers();
                        } else {
                            showNotification('فشل حذف المستخدم', 'error');
                        }
                    } catch (error) {
                        console.error('Error deleting user:', error);
                        showNotification('خطأ في الاتصال', 'error');
                    }
                },
                'danger',
                'حذف نهائي'
            );
        }

        async function updateUserRole(id, role) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${apiBaseUrl}/user/${id}/role`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role })
                });

                if (response.ok) {
                    showNotification('تم تحديث صلاحيات المستخدم', 'success');
                    fetchUsers();
                } else {
                    showNotification('فشل تحديث الصلاحيات', 'error');
                }
            } catch (error) {
                console.error('Error updating role:', error);
                showNotification('خطأ في الاتصال', 'error');
            }
        }

// pgaes
const pages = {

home: `<!-- Hero Section -->
        <section class="min-h-screen flex items-center py-12 home-animate">
            <div class="w-full">
                <div class="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
                    <!-- المحتوى -->
                    <div class="lg:w-1/2 text-center lg:text-right">
                        <!-- أيقونات علوية -->
                        <div class="flex justify-center lg:justify-start items-center gap-4 mb-6">
                            <i class="fas fa-laptop-code text-4xl text-sky-400 icon-sky-glow"></i>
                            <i class="fas fa-users text-5xl text-teal-400 icon-glow"></i>
                            <i class="fas fa-futbol text-4xl text-sky-400  icon-sky-glow" style="transform: scaleX(-1);"></i>
                        </div>
                        
                        <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight hero-title-animation">
                            <span class="gradient-text">ملتقى شباب التميز</span>
                        </h1>

                        <p class="text-2xl text-gray-300 mb-10 leading-relaxed">
                            البيت الأول والعائلة الواحدة
                        </p>

                        <div class="flex flex-wrap gap-4 mb-12 justify-center lg:justify-start" id="homeButtons"></div>

                        <!-- الإحصائيات -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="stat-card p-5 text-center">
                                <div class="text-3xl font-bold gradient-text mb-2">١٠٠+</div>
                                <div class="text-sm">أعضاء</div>
                            </div>
                            <div class="stat-card p-5 text-center">
                                <div class="text-3xl font-bold gradient-text mb-2">٢٠+</div>
                                <div class="text-sm">فعاليات</div>
                            </div>
                            <div class="stat-card p-5 text-center">
                                <div class="text-3xl font-bold gradient-text mb-2">٣٠+</div>
                                <div class="text-sm">مدربين</div>
                            </div>
                            <div class="stat-card p-5 text-center">
                                <div class="text-3xl font-bold gradient-text mb-2">١٠٠+</div>
                                <div class="text-sm">مشاريع</div>
                            </div>
                        </div>
                    </div>

                    <!-- الصورة -->
                    <div class="lg:w-1/2 relative mt-10 lg:mt-0 home-animate" style="animation-delay:0.2s">
                        <div class="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
                            <!-- الخلفية المتدرجة -->
                            <div class="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-full blur-3xl"></div>

                            <!-- الدائرة الرئيسية -->
                            <div class="absolute inset-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl floating">
                                <div class="text-center p-8">
                                    <i class="fas fa-users text-white text-8xl mb-6"></i>
                                    <div class="text-white text-2xl font-bold">معًا نرتقي</div>
                                </div>
                            </div>

                            <!-- العناصر العائمة -->
                            <div class="absolute -top-4 -left-4 w-20 h-20 elegant-card rounded-full flex items-center justify-center floating" style="animation-delay: 0.2s">
                                <i class="fas fa-trophy text-sky-400 text-3xl"></i>
                            </div>
                            <div class="absolute -bottom-4 -right-4 w-20 h-20 elegant-card rounded-full flex items-center justify-center floating" style="animation-delay: 0.4s">
                                <i class="fas fa-lightbulb text-teal-400 text-3xl"></i>
                            </div>
                            <div class="absolute top-1/4 -right-8 w-16 h-16 elegant-card rounded-full flex items-center justify-center floating" style="animation-delay: 0.6s">
                                <i class="fas fa-graduation-cap text-sky-400 text-2xl"></i>
                            </div>
                            <div class="absolute bottom-1/4 -left-8 w-16 h-16 elegant-card rounded-full flex items-center justify-center floating" style="animation-delay: 0.8s">
                                <i class="fas fa-hands-helping text-teal-400 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- فاصل -->
        <hr class="divider">

        <!-- قسم الفيديو -->
        <section class="py-16 home-animate" style="animation-delay:0.4s">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="text-4xl md:text-5xl font-bold mb-4">
                        <span class="gradient-text">ماذا يقولون</span> عن الملتقى؟
                    </h2>
                    <p class="text-lg max-w-2xl mx-auto">
                        شاهد قصص نجاح وتجارب حقيقية لشباب استفادوا من برامجنا وتطوروا معنا
                    </p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <!-- مساحة الفيديو -->
                    <div class="relative">
                        <div class="elegant-card rounded-3xl overflow-hidden relative group">
                            <div id="videoPlayer" class="aspect-video bg-black overflow-hidden relative">
                                <video 
                                    width="100%" 
                                    height="100%" 
                                    controls
                                    title="EYFV"
                                    class="w-full h-full object-cover">
                                    <source src="EYFV.mp4" type="video/mp4">
                                    متصفحك لا يدعم تشغيل الفيديو.
                                </video>
                            </div>
                        </div>
                        <!-- زخارف حول الفيديو -->
                        <div class="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-sky-400 rounded-tr-lg"></div>
                        <div class="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-teal-400 rounded-bl-lg"></div>
                    </div>

                    <!-- معلومات عن الفيديو -->
                    <div>
                        <div class="mb-8">
                            <h3 class="text-2xl font-bold mb-4">لقاء خاص مع خريجي برنامج القيادة</h3>
                            <p class="leading-relaxed">
                                في هذا الفيديو، يشارك مجموعة من خريجي برنامج القيادة الشامل تجاربهم الشخصية وكيف ساعدهم الملتقى في تطوير مهاراتهم.
                            </p>
                        </div>
                        <div class="space-y-4">
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-white text-sm"></i></div>
                                <div><h4 class="font-medium mb-1">قصص نجاح حقيقية</h4><p class="text-sm">شهادات من شباب تحولت حياتهم بعد الانضمام</p></div>
                            </div>
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center"><i class="fas fa-check text-white text-sm"></i></div>
                                <div><h4 class="font-medium mb-1">نصائح قيمة</h4><p class="text-sm">نصائح عملية من خبراء في مجالات مختلفة</p></div>
                            </div>
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center"><i class="fas fa-check text-white text-sm"></i></div>
                                <div><h4 class="font-medium mb-1">رؤى مستقبلية</h4><p class="text-sm">تطلعات الشباب وأحلامهم المستقبلية</p></div>
                            </div>
                        </div>
                        <button class="mt-8 px-8 py-3 elegant-card rounded-full hover:border-sky-400 transition-all flex items-center gap-2 group" onclick="window.open('https://forms.gle/39rwVUJaqenBPRSQA', '_blank')">
                            <span>انضم إلينا الان</span>
                            <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- فاصل -->
        <hr class="divider">

        <!-- شجرة الأهداف العمودية -->
        <section class="py-20 home-animate" style="animation-delay:0.6s">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-4xl md:text-5xl font-bold mb-4">
                        <span class="gradient-text">أهداف</span> المنتدى
                    </h2>
                    <p class="text-lg">الركائز الأساسية التي نبني عليها رؤيتنا لتمكين الشباب</p>
                </div>

                <div class="relative">
                    <!-- الخط العمودي الرئيسي -->
                    <div class="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-[-50px] w-0.5 bg-gradient-to-b from-sky-400 via-teal-400 to-sky-400"></div>

                    <!-- الأهداف -->
                    <div class="relative mb-16 md:mb-28">
                        <div class="flex flex-col md:flex-row md:items-center">
                            <div class="md:w-1/2 md:pl-12 md:text-right">
                                <div class="timeline-card p-6 md:p-8 rounded-2xl relative">
                                    <div class="hidden md:block absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2 w-16 h-0.5 bg-gradient-to-l from-teal-400 to-transparent"></div>
                                    <div class="flex flex-col md:items-end gap-6">
                                        <div class="w-20 h-20 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center"><i class="fas fa-brain text-white text-3xl"></i></div>
                                        <div><h3 class="text-2xl font-bold mb-4">تنمية المهارات</h3><p>تطوير قدرات الشباب المعرفية والعملية من خلال برامج تدريبية متخصصة.</p></div>
                                    </div>
                                </div>
                            </div>
                            <div class="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[var(--bg-primary)] border-4 border-sky-400 rounded-full z-20"><div class="w-2 h-2 bg-teal-400 rounded-full"></div></div>
                            <div class="md:w-1/2"></div>
                        </div>
                    </div>

                    <div class="relative mb-16 md:mb-28">
                        <div class="flex flex-col md:flex-row md:items-center">
                            <div class="md:w-1/2"></div>
                            <div class="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[var(--bg-primary)] border-4 border-sky-400 rounded-full z-20"><div class="w-2 h-2 bg-teal-400 rounded-full"></div></div>
                            <div class="md:w-1/2 md:pr-12">
                                <div class="timeline-card p-6 md:p-8 rounded-2xl relative">
                                    <div class="hidden md:block absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-teal-400 to-transparent"></div>
                                    <div class="flex flex-col gap-6">
                                        <div class="w-20 h-20 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center"><i class="fas fa-network-wired text-white text-3xl"></i></div>
                                        <div><h3 class="text-2xl font-bold mb-4">بناء الشبكات</h3><p>خلق بيئة تواصلية تتيح للشباب بناء علاقات مهنية قوية.</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="relative mb-16 md:mb-28">
                        <div class="flex flex-col md:flex-row md:items-center">
                            <div class="md:w-1/2 md:pl-12 md:text-right">
                                <div class="timeline-card p-6 md:p-8 rounded-2xl relative">
                                    <div class="hidden md:block absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2 w-16 h-0.5 bg-gradient-to-l from-teal-400 to-transparent"></div>
                                    <div class="flex flex-col md:items-end gap-6">
                                        <div class="w-20 h-20 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center"><i class="fas fa-lightbulb text-white text-3xl"></i></div>
                                        <div><h3 class="text-2xl font-bold mb-4">تشجيع الابتكار</h3><p>تحفيز التفكير الإبداعي ودعم المشاريع الريادية.</p></div>
                                    </div>
                                </div>
                            </div>
                            <div class="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[var(--bg-primary)] border-4 border-sky-400 rounded-full z-20"><div class="w-2 h-2 bg-teal-400 rounded-full"></div></div>
                            <div class="md:w-1/2"></div>
                        </div>
                    </div>

                    <div class="relative">
                        <div class="flex flex-col md:flex-row md:items-center">
                            <div class="md:w-1/2"></div>
                            <div class="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[var(--bg-primary)] border-4 border-sky-400 rounded-full z-20"><div class="w-2 h-2 bg-teal-400 rounded-full"></div></div>
                            <div class="md:w-1/2 md:pr-12">
                                <div class="timeline-card p-6 md:p-8 rounded-2xl relative">
                                    <div class="hidden md:block absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-teal-400 to-transparent"></div>
                                    <div class="flex flex-col gap-6">
                                        <div class="w-20 h-20 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center"><i class="fas fa-hands-helping text-white text-3xl"></i></div>
                                        <div><h3 class="text-2xl font-bold mb-4">المسؤولية المجتمعية</h3><p>تعزيز روح العطاء والمساهمة في تنمية المجتمع.</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- البوكس الأخير للإنجازات -->
                <div class="relative mt-32">
                    <div class="hidden md:block absolute left-1/2 transform -translate-x-1/2 -top-24 h-24 w-0.5 bg-gradient-to-b from-teal-400 to-sky-400"></div>
                    <div class="flex justify-center">
                        <div class="w-full max-w-2xl">
                            <div class="elegant-card p-10 rounded-2xl border-2 border-dashed border-sky-400/30 relative">
                                <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                                    <i class="fas fa-trophy text-white"></i></div>
                                <div class="text-center">
                                    <h3 class="text-2xl md:text-3xl font-bold mb-4"><span class="gradient-text">إنجازات</span> الملتقى</h3>
                                    <p class="mb-8">اكتشف رحلة التميز والإنجازات التي حققها أعضاء المنتدى على مر السنوات.</p>
                                    <button class="btn-gradient px-8 py-4 text-lg mx-auto" onclick="loadPage('archive')">
                                        <span>تعرف على ارشيف الملتقى</span>
                                        <i class="fas fa-arrow-left"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
`,

news: `
<!-- قسم الإبديتات والأخبار -->
<section id="newsPage" class="min-h-screen py-20 px-6 relative overflow-hidden home-animate">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
        <!-- العنوان -->
        <div class="text-center mb-12">
            <div class="flex justify-center gap-2 mb-4">
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
                <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.15s"></i>
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating" style="animation-delay:0.3s"></i>
            </div>

            <!-- أيقونات علوية -->
            <div class="flex justify-center items-center gap-4 mb-6">
                <i class="fas fa-newspaper text-4xl text-sky-400 icon-sky-glow floating"></i>
                <i class="fas fa-bullhorn text-5xl text-teal-400 icon-glow floating" style="animation-delay:0.2s"></i>
                <i class="fas fa-star text-4xl text-sky-400 icon-sky-glow floating" style="animation-delay:0.4s"></i>
            </div>

            <h2 class="text-4xl md:text-5xl font-bold mb-4 hero-title-animation">
                <span class="gradient-text">أحدث</span> الأخبار والتحديثات
            </h2>
            <p class="text-gray-400 text-lg max-w-2xl mx-auto">
                تابع آخر المستجدات، الإعلانات، والإنجازات في رحلتنا معًا
            </p>
        </div>

        <!-- الحاوية الرئيسية للأخبار الديناميكية -->
        <div id="dashboard-news">
            <!-- حالة التحميل -->
            <div class="col-span-full text-center py-16">
                <div class="elegant-card p-12 inline-block mx-auto">
                    <div class="w-16 h-16 mx-auto mb-4 border-4 border-[var(--border-light)] border-t-sky-400 rounded-full animate-spin"></div>
                    <p class="text-gray-400">جاري تحميل الأخبار...</p>
                </div>
            </div>
        </div>
    </div>
</section>`,

singleNews: `
    <div id="single-news-container" class="min-h-screen py-20 px-6 relative overflow-hidden home-animate"></div>
`,

events: `
<!-- قسم الكورسات والفعاليات -->
<section class="min-h-screen py-20 px-6 relative overflow-hidden home-animate" id="events-section">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
        <!-- العنوان -->
        <div class="text-center mb-12">
            <div class="flex justify-center gap-2 mb-4">
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
                <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.15s"></i>
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating" style="animation-delay:0.3s"></i>
            </div>

            <!-- أيقونات علوية -->
            <div class="flex justify-center items-center gap-4 mb-6">
                <i class="fas fa-graduation-cap text-4xl text-sky-400 icon-sky-glow floating"></i>
                <i class="fas fa-calendar-alt text-5xl text-teal-400 icon-glow floating" style="animation-delay:0.2s"></i>
                <i class="fas fa-laptop-code text-4xl text-sky-400 icon-sky-glow floating" style="animation-delay:0.4s"></i>
            </div>

            <h2 class="text-4xl md:text-5xl font-bold mb-4 hero-title-animation">
                <span class="gradient-text">الكورسات</span> والفعاليات
            </h2>
            <p class="text-gray-400 max-w-2xl mx-auto">
                اختر ما يناسبك من برامجنا المتنوعة وسجل الآن مجاناً
            </p>
        </div>

        <!-- التبويبات -->
        <div class="flex flex-wrap justify-center gap-2 mb-10">
            <button onclick="showTab('all')" class="tab-btn group relative px-6 py-3 rounded-xl transition-all duration-300 overflow-hidden" data-tab="all">
                <span class="relative z-10 flex items-center gap-2">
                    <i class="fas fa-border-all"></i>
                    الكل
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-sky-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button onclick="showTab('courses')" class="tab-btn group relative px-6 py-3 rounded-xl transition-all duration-300 overflow-hidden" data-tab="courses">
                <span class="relative z-10 flex items-center gap-2">
                    <i class="fas fa-graduation-cap"></i>
                    كورسات
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-sky-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button onclick="showTab('events')" class="tab-btn group relative px-6 py-3 rounded-xl transition-all duration-300 overflow-hidden" data-tab="events">
                <span class="relative z-10 flex items-center gap-2">
                    <i class="fas fa-calendar-alt"></i>
                    فعاليات
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-sky-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button onclick="showTab('workshops')" class="tab-btn group relative px-6 py-3 rounded-xl transition-all duration-300 overflow-hidden" data-tab="workshops">
                <span class="relative z-10 flex items-center gap-2">
                    <i class="fas fa-chalkboard-user"></i>
                    ورش عمل
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-sky-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button onclick="showTab('upcoming')" class="tab-btn group relative px-6 py-3 rounded-xl transition-all duration-300 overflow-hidden" data-tab="upcoming">
                <span class="relative z-10 flex items-center gap-2">
                    <i class="fas fa-clock"></i>
                    قريباً
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-sky-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
        </div>

        <!-- عناصر التحميل -->
        <div id="loading-spinner" class="text-center py-10 hidden">
            <div class="inline-block">
                <div class="w-12 h-12 border-4 border-[var(--border-light)] border-t-sky-400 rounded-full animate-spin"></div>
            </div>
            <p class="text-gray-400 mt-3">جاري تحميل البرامج...</p>
        </div>

        <!-- رسالة الخطأ -->
        <div id="error-message" class="text-center py-10 hidden">
            <div class="elegant-card p-8 inline-block mx-auto">
                <i class="fas fa-exclamation-circle text-red-400 text-4xl mb-3"></i>
                <p class="text-red-400">عذراً، حدث خطأ في تحميل البيانات</p>
                <button onclick="location.reload()" class="mt-4 btn-gradient px-6 py-2 text-sm">
                    <i class="fas fa-redo ml-1"></i>
                    إعادة المحاولة
                </button>
            </div>
        </div>

        <!-- حاوية العناصر -->
        <div id="events-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- سيتم إضافة العناصر هنا عبر JavaScript -->
        </div>
    </div>
</section>

<!-- Modal للتسجيل -->
<div id="registrationModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden items-center justify-center z-50">
    <div class="elegant-card p-8 max-w-md w-full mx-4 relative animate-slideUp">
        <!-- زخارف ناعمة -->
        <div class="absolute -top-3 -right-3 w-16 h-16">
            <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sky-400/20 rounded-tr-lg"></div>
        </div>
        <div class="absolute -bottom-3 -left-3 w-16 h-16">
            <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-teal-400/20 rounded-bl-lg"></div>
        </div>

        <!-- رأس المودال -->
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <i class="fas fa-pen-to-square text-white text-xl"></i>
                </div>
                <h3 class="text-xl font-bold">
                    <span class="gradient-text">التسجيل</span> في البرنامج
                </h3>
            </div>
            <button onclick="window.closeModal()" class="w-10 h-10 rounded-lg bg-[var(--bg-primary)] hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 flex items-center justify-center group">
                <i class="fas fa-times text-gray-400 group-hover:text-red-400"></i>
            </button>
        </div>
        
        <!-- معلومات البرنامج -->
        <div id="modal-program-info" class="mb-6 p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)]">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                    <i class="fas fa-info-circle text-teal-400"></i>
                </div>
                <div>
                    <h4 id="modal-program-title" class="text-[var(--text-primary)] font-bold"></h4>
                    <p id="modal-program-instructor" class="text-gray-400 text-sm flex items-center gap-1">
                        <i class="fas fa-user-tie text-sky-400 text-xs"></i>
                        <span></span>
                    </p>
                </div>
            </div>
        </div>

        <!-- نموذج التسجيل -->
        <form id="registrationForm" class="space-y-4">
            <input type="hidden" id="programId" name="programId">
            
            <div class="group">
                <label class="block text-sm mb-2 text-gray-300">
                    <i class="fas fa-user text-sky-400 ml-1"></i>
                    الاسم الكامل
                </label>
                <div class="relative">
                    <i class="fas fa-user absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                    <input type="text" id="userName" name="userName" required
                        class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none transition-all duration-300"
                        placeholder="أدخل اسمك الكامل">
                </div>
            </div>
            
            <div class="group">
                <label class="block text-sm mb-2 text-gray-300">
                    <i class="fas fa-envelope text-teal-400 ml-1"></i>
                    البريد الإلكتروني
                </label>
                <div class="relative">
                    <i class="fas fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors"></i>
                    <input type="email" id="userEmail" name="userEmail" required
                        class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-teal-400 focus:outline-none transition-all duration-300"
                        placeholder="example@domain.com">
                </div>
            </div>

            <!-- خيارات إضافية -->
            <div class="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)]">
                <i class="fas fa-bell text-sky-400"></i>
                <span class="text-sm text-gray-300">أرغب في استلام إشعارات التذكير</span>
                <label class="relative inline-flex items-center cursor-pointer mr-auto">
                    <input type="checkbox" checked class="sr-only peer">
                    <div class="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-teal-500"></div>
                </label>
            </div>
            
            <!-- أزرار المودال -->
            <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 btn-gradient py-3">
                    <i class="fas fa-check-circle ml-1"></i>
                    تأكيد التسجيل
                </button>
                <button type="button" onclick="closeModal()" class="flex-1 btn-outline py-3">
                    <i class="fas fa-times ml-1"></i>
                    إلغاء
                </button>
            </div>
        </form>
    </div>
</div>

<!-- رسالة نجاح مؤقتة (Toast) -->
<div id="successToast" class="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 hidden">
    <div class="elegant-card px-6 py-4 flex items-center gap-3 border-green-500/30">
        <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <i class="fas fa-check-circle text-green-400"></i>
        </div>
        <div>
            <h4 class="text-[var(--text-primary)] font-bold">تم التسجيل بنجاح!</h4>
            <p class="text-gray-400 text-sm">سيصلك تأكيد على بريدك الإلكتروني</p>
        </div>
    </div>
</div>
`,

contact: `
    <section class="min-h-screen py-20 px-6 relative overflow-hidden home-animate">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <div class="max-w-5xl mx-auto relative z-10">
        <!-- العنوان -->
        <div class="text-center mb-12">
            <div class="flex justify-center gap-2 mb-4">
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
                <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.15s"></i>
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating" style="animation-delay:0.3s"></i>
            </div>
            
            <!-- أيقونات تواصل -->
            <div class="flex justify-center items-center gap-4 mb-6">
                <i class="fas fa-comment-dots text-4xl text-sky-400 icon-sky-glow floating"></i>
                <i class="fas fa-headset text-5xl text-teal-400 icon-glow floating" style="animation-delay:0.2s"></i>
                <i class="fas fa-message text-4xl text-sky-400 icon-sky-glow floating" style="animation-delay:0.4s"></i>
            </div>

            <h2 class="text-4xl md:text-5xl font-bold mb-4 hero-title-animation">
                <span class="gradient-text">تواصل</span> معنا
            </h2>
            <p class="text-gray-400 max-w-2xl mx-auto">
                يسعدنا استفساراتك واقتراحاتك، فريقنا المتخصص جاهز للرد عليك في أقرب وقت
            </p>
        </div>

        <!-- بطاقة التواصل -->
        <div class="elegant-card p-8 md:p-10 mb-12 relative">
            <!-- زخارف ناعمة على الزوايا -->
            <div class="absolute -top-3 -right-3 w-20 h-20">
                <div class="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-sky-400/20 rounded-tr-lg"></div>
            </div>
            <div class="absolute -bottom-3 -left-3 w-20 h-20">
                <div class="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-teal-400/20 rounded-bl-lg"></div>
            </div>

            <form id="contactForm" onsubmit="handleContact(event)" class="space-y-6">
                <!-- رسالة نجاح/خطأ -->
                <div id="contactFormMessage" class="hidden p-4 rounded-xl text-white text-center transition-all duration-300"></div>

                <!-- الاسم الكامل -->
                <div class="group">
                    <label for="fullName" class="block text-sm mb-2 text-gray-300">
                        <i class="fas fa-user text-sky-400 ml-2"></i>
                        الاسم الكامل
                    </label>
                    <div class="relative">
                        <i class="fas fa-user absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                        <input type="text" id="contactfullName" name="contactfullName" placeholder="أدخل اسمك الكامل" 
                               class="w-full pr-12 px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition-all duration-300"
                               required>
                    </div>
                </div>

                <!-- البريد الإلكتروني -->
                <div class="group">
                    <label for="email" class="block text-sm mb-2 text-gray-300">
                        <i class="fas fa-envelope text-teal-400 ml-2"></i>
                        البريد الإلكتروني
                    </label>
                    <div class="relative">
                        <i class="fas fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors"></i>
                        <input type="email" id="contactEmail" name="contactEmail" placeholder="أدخل بريدك الإلكتروني" 
                               class="w-full pr-12 px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-300"
                               required>
                    </div>
                </div>

                <!-- نوع الرسالة -->
                <div class="group">
                    <label for="MessageType" class="block text-sm mb-2 text-gray-300">
                        <i class="fas fa-tag text-sky-400 ml-2"></i>
                        نوع الرسالة
                    </label>
                    <div class="relative">
                        <i class="fas fa-chevron-down absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                        <select id="contactMessageType" name="contactMessageType" 
                                class="w-full px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none transition-all duration-300 appearance-none cursor-pointer">
                            <option value="استفسار" class="bg-[var(--bg-primary)]">📝 استفسار</option>
                            <option value="شكوى" class="bg-[var(--bg-primary)]">⚠️ شكوى</option>
                            <option value="اقتراح" class="bg-[var(--bg-primary)]">💡 اقتراح</option>
                            <option value="أخرى" class="bg-[var(--bg-primary)]">🔄 أخرى</option>
                        </select>
                    </div>
                </div>

                <!-- الرسالة -->
                <div class="group">
                    <label for="message" class="block text-sm mb-2 text-gray-300">
                        <i class="fas fa-message text-teal-400 ml-2"></i>
                        الرسالة
                    </label>
                    <div class="relative">
                        <i class="fas fa-quote-right absolute right-4 top-4 text-gray-500 group-focus-within:text-teal-400 transition-colors"></i>
                        <textarea id="contactMessage" name="contactMessage" rows="5" placeholder="اكتب رسالتك هنا..." 
                                  class="w-full pr-12 px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-300 resize-none"
                                  required></textarea>
                    </div>
                </div>

                <!-- زر الإرسال -->
                <button type="submit" id="contactSubmitBtn" 
                        class="w-full btn-gradient py-4 text-lg relative overflow-hidden group">
                    <span class="relative z-10 flex items-center justify-center gap-2">
                        <i class="fas fa-paper-plane"></i>
                        <span>إرسال الرسالة</span>
                    </span>
                    <div class="absolute inset-0 bg-gradient-to-r from-sky-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <!-- معلومات إضافية -->
                <div class="flex flex-wrap justify-center gap-4 pt-4 text-sm text-gray-400">
                    <span class="flex items-center gap-2">
                        <i class="fas fa-clock text-sky-400"></i>
                        الرد خلال 24 ساعة
                    </span>
                    <span class="flex items-center gap-2">
                        <i class="fas fa-lock text-teal-400"></i>
                        معلوماتك آمنة
                    </span>
                </div>
            </form>
        </div>

        <!-- الفاصل -->
        <div class="relative my-12">
            <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-[var(--border-light)]"></div>
            </div>
            <div class="relative flex justify-center">
                <span class="px-6 py-2 bg-[var(--bg-card)] text-gray-400 text-base border border-[var(--border-light)] rounded-full backdrop-blur-sm">
                    أو تواصل عبر
                </span>
            </div>
        </div>

        <!-- روابط التواصل الاجتماعي -->
        <div class="text-center">
            <h3 class="text-xl font-bold mb-6">
                <span class="gradient-text">تابعنا على</span>
            </h3>

            <div class="flex flex-wrap justify-center gap-4">
                <!-- انستغرام -->
                <a href="javascript:void(0)" class="group relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div class="relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl hover:scale-105 transition-all duration-300">
                        <i class="fab fa-instagram text-white text-xl"></i>
                        <span class="text-white font-medium">انستغرام</span>
                    </div>
                </a>

                <!-- فيسبوك -->
                <a href="javascript:void(0)" class="group relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div class="relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl hover:scale-105 transition-all duration-300">
                        <i class="fab fa-facebook text-white text-xl"></i>
                        <span class="text-white font-medium">فيسبوك</span>
                    </div>
                </a>

            </div>

            <!-- نص ختامي -->
            <div class="mt-8 p-4 elegant-card inline-block mx-auto">
                <p class="text-gray-400 text-sm flex items-center gap-2">
                    <i class="fas fa-headset text-teal-400"></i>
                    فريقنا متاح للرد على استفساراتك خلال 24 ساعة
                    <i class="fas fa-smile text-sky-400"></i>
                </p>
            </div>
        </div>
    </div>

    <!-- عناصر زخرفية عائمة -->
    <div class="absolute left-10 bottom-20 w-20 h-20 elegant-card rounded-full flex items-center justify-center floating hidden lg:flex" style="animation-delay:0.2s">
        <i class="fas fa-envelope text-teal-400 text-2xl"></i>
    </div>
    <div class="absolute right-10 top-40 w-16 h-16 elegant-card rounded-full flex items-center justify-center floating hidden lg:flex" style="animation-delay:0.4s">
        <i class="fas fa-phone text-sky-400 text-xl"></i>
    </div>
</section>
`,

guestLanding: `
<!-- landing page-->
<!-- Landing Page - بإسلوب ملتقى شباب التميز -->
<section class="min-h-screen flex items-center justify-center py-12 home-animate">
    <div class="w-full max-w-4xl mx-auto px-6">
        <!-- إضافة عناصر زخرفية مثل الصفحة الأولى -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <div class="stars"></div>
            <div class="mosque-silhouette"></div>
        </div>
        
        <div class="elegant-card p-10 md:p-16 text-center relative z-10">
            <!-- أيقونات علوية متحركة -->
            <div class="flex justify-center items-center gap-4 mb-8">
                <i class="fas fa-rocket text-4xl text-sky-400 icon-sky-glow floating"></i>
                <i class="fas fa-users text-5xl text-teal-400 icon-glow floating" style="animation-delay:0.2s"></i>
                <i class="fas fa-star text-4xl text-sky-400 icon-sky-glow floating" style="animation-delay:0.4s"></i>
            </div>

            <!-- العنوان الرئيسي -->
            <h1 class="text-5xl md:text-6xl font-bold mb-6 hero-title-animation">
                <span class="gradient-text">مرحباً بك في</span><br>
                <span class="gradient-text">ملتقى شباب التميز</span>
            </h1>

            <!-- الوصف -->
            <p class="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                للوصول إلى كافة المميزات والفرص المتميزة، يرجى تسجيل الدخول أو إنشاء حساب جديد والانطلاق معنا في رحلة التميز.
            </p>

            <!-- الأزرار (بنفس تصميم الصفحة الأولى) -->
            <div class="flex flex-wrap justify-center gap-4 mb-12">
                <button onclick="loadPage('register')" class="btn-gradient px-8 py-4 text-lg">
                    <i class="fas fa-user-plus"></i>
                    <span>إنشاء حساب جديد</span>
                </button>
                <button onclick="loadPage('login')" class="btn-outline px-8 py-4 text-lg">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>تسجيل الدخول</span>
                </button>
            </div>

            <!-- إضافة مميزات سريعة (مثل الإحصائيات في الصفحة الأولى) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div class="stat-card p-4 text-center">
                    <div class="text-2xl font-bold gradient-text mb-1">٥٠٠+</div>
                    <div class="text-sm">عضو نشط</div>
                </div>
                <div class="stat-card p-4 text-center">
                    <div class="text-2xl font-bold gradient-text mb-1">٢٠+</div>
                    <div class="text-sm">برنامج تدريبي</div>
                </div>
                <div class="stat-card p-4 text-center">
                    <div class="text-2xl font-bold gradient-text mb-1">٣٠+</div>
                    <div class="text-sm">مدرب معتمد</div>
                </div>
            </div>

            <!-- إضافة عناصر عائمة زخرفية (مثل الصفحة الأولى) -->
            <div class="absolute -top-4 -left-4 w-16 h-16 elegant-card rounded-full flex items-center justify-center floating hidden md:flex">
                <i class="fas fa-graduation-cap text-teal-400 text-2xl"></i>
            </div>
            <div class="absolute -bottom-4 -right-4 w-16 h-16 elegant-card rounded-full flex items-center justify-center floating hidden md:flex" style="animation-delay:0.3s">
                <i class="fas fa-lightbulb text-sky-400 text-2xl"></i>
            </div>
            <div class="absolute top-1/4 -right-8 w-12 h-12 elegant-card rounded-full flex items-center justify-center floating hidden md:flex" style="animation-delay:0.6s">
                <i class="fas fa-code text-teal-400 text-xl"></i>
            </div>
        </div>
    </div>
</section>
`,

login: `<section class="min-h-screen flex items-center justify-center p-6 home-animate relative overflow-hidden padding-top-20">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-30"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>
    
    <div class="max-w-md w-full relative z-10">
        <!-- أيقونات علوية بسيطة -->
        <div class="flex justify-center gap-3 mb-6">
            <i class="fas fa-circle text-[0.5rem] text-sky-400/50 floating"></i>
            <i class="fas fa-circle text-[0.5rem] text-teal-400/50 floating" style="animation-delay:0.2s"></i>
            <i class="fas fa-circle text-[0.5rem] text-sky-400/50 floating" style="animation-delay:0.4s"></i>
        </div>

        <!-- بطاقة تسجيل الدخول -->
        <div class="elegant-card p-8 md:p-10 relative">
            <!-- عناصر زخرفية صغيرة داخل البطاقة -->
            <div class="absolute -top-3 -right-3 w-16 h-16">
                <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sky-400/30 rounded-tr-lg"></div>
            </div>
            <div class="absolute -bottom-3 -left-3 w-16 h-16">
                <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-teal-400/30 rounded-bl-lg"></div>
            </div>

            <!-- أيقونة رئيسية -->
            <div class="text-center mb-8">
                <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-full flex items-center justify-center floating">
                    <div class="w-16 h-16 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                        <i class="fas fa-user text-white text-2xl"></i>
                    </div>
                </div>
                
                <h2 class="text-3xl font-bold mb-2">
                    <span class="gradient-text">تسجيل الدخول</span>
                </h2>
                <p class="text-gray-400 text-sm">أهلاً بعودتك! سجل دخولك للمتابعة</p>
            </div>

            <!-- الفورم -->
            <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-6">
                <!-- البريد الإلكتروني -->
                <div class="group">
                    <label class="block text-sm mb-2 text-gray-300">البريد الإلكتروني</label>
                    <div class="relative">
                        <i class="fas fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                        <input type="email" id="loginEmail" placeholder="أدخل بريدك الإلكتروني" required
                            class="w-full pr-12 px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition-all duration-300">
                    </div>
                </div>

                <!-- كلمة المرور -->
                <div class="group">
                    <label class="block text-sm mb-2 text-gray-300">كلمة المرور</label>
                    <div class="relative">
                        <i class="fas fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                        <input type="password" id="loginPassword" placeholder="********" required
                            class="w-full pr-12 px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition-all duration-300">
                        <button type="button" onclick="togglePassword('loginPassword', this)" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <!-- خيارات إضافية -->
                <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer group">
                        <div class="relative">
                            <input type="checkbox" class="sr-only peer">
                            <div class="w-5 h-5 border-2 border-[var(--border-light)] rounded-md peer-checked:bg-gradient-to-br peer-checked:from-sky-500 peer-checked:to-teal-500 peer-checked:border-transparent transition-all duration-300"></div>
                            <i class="fas fa-check absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                        </div>
                        <span class="text-gray-400 text-sm">تذكرني</span>
                    </label>
                    
                    <a href="javascript:void(0)" class="text-sm text-sky-400 hover:text-teal-400 transition-colors relative group">
                        نسيت كلمة المرور؟
                        <span class="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-teal-400 group-hover:w-full transition-all duration-300"></span>
                    </a>
                </div>

                <!-- زر تسجيل الدخول -->
                <button type="submit" class="w-full btn-gradient py-4 text-lg relative overflow-hidden group">
                    <span class="relative z-10 flex items-center justify-center gap-2">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>تسجيل الدخول</span>
                    </span>
                    <div class="absolute inset-0 bg-gradient-to-r from-sky-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <!-- رابط إنشاء حساب -->
                <div class="text-center pt-6 border-t border-[var(--border-light)]">
                    <span class="text-gray-400 text-sm">ليس لديك حساب؟ </span>
                    <button onclick="loadPage('register')" class="text-sky-400 font-medium hover:text-teal-400 transition-colors relative group">
                        أنشئ حساب جديد
                        <span class="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-teal-400 group-hover:w-full transition-all duration-300"></span>
                    </button>
                </div>
            </form>

            <!-- عناصر زخرفية صغيرة -->
            <div class="absolute -left-4 top-1/4 w-8 h-8 elegant-card rounded-full flex items-center justify-center floating hidden md:flex" style="animation-delay:0.2s">
                <i class="fas fa-shield-alt text-teal-400 text-sm"></i>
            </div>
            <div class="absolute -right-4 bottom-1/4 w-8 h-8 elegant-card rounded-full flex items-center justify-center floating hidden md:flex" style="animation-delay:0.4s">
                <i class="fas fa-key text-sky-400 text-sm"></i>
            </div>
        </div>
    </div>
</section>
            `,
register: `
<section class="min-h-screen flex items-center justify-center p-6 home-animate relative overflow-hidden">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>
    
    <div class="max-w-lg w-full relative z-10">
        <!-- أيقونات علوية بسيطة -->
        <div class="flex justify-center gap-2 mb-4">
            <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
            <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.15s"></i>
            <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating" style="animation-delay:0.3s"></i>
            <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.45s"></i>
        </div>

        <!-- بطاقة إنشاء الحساب -->
        <div class="elegant-card p-8 md:p-10 relative">
            <!-- زخارف ناعمة على الزوايا -->
            <div class="absolute -top-3 -right-3 w-20 h-20">
                <div class="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-sky-400/20 rounded-tr-lg"></div>
            </div>
            <div class="absolute -bottom-3 -left-3 w-20 h-20">
                <div class="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-teal-400/20 rounded-bl-lg"></div>
            </div>

            <!-- أيقونة رئيسية -->
            <div class="text-center mb-8">
                <div class="w-24 h-24 mx-auto mb-4 relative">
                    <div class="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                    <div class="relative w-full h-full bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg floating">
                        <i class="fas fa-user-plus text-white text-3xl"></i>
                    </div>
                </div>
                
                <h2 class="text-3xl font-bold mb-2">
                    <span class="gradient-text">إنشاء حساب جديد</span>
                </h2>
                <p class="text-gray-400 text-sm">انضم إلينا وابدأ رحلة التطوير معنا</p>
            </div>

            <!-- الفورم -->
            <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-6">
                <!-- الاسم الأول والأخير -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="group">
                        <label class="block text-sm mb-2 text-gray-300">الاسم الأول</label>
                        <div class="relative">
                            <i class="fas fa-user absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors text-sm"></i>
                            <input type="text" id="regFirstName" placeholder="أحمد" required
                                class="w-full pr-10 px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition-all duration-300 text-sm">
                        </div>
                    </div>
                    
                    <div class="group">
                        <label class="block text-sm mb-2 text-gray-300">الاسم الأخير</label>
                        <div class="relative">
                            <i class="fas fa-user absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors text-sm"></i>
                            <input type="text" id="regLastName" placeholder="محمد" required
                                class="w-full pr-10 px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-300 text-sm">
                        </div>
                    </div>
                </div>

                <!-- البريد الإلكتروني -->
                <div class="group">
                    <label class="block text-sm mb-2 text-gray-300">البريد الإلكتروني</label>
                    <div class="relative">
                        <i class="fas fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                        <input type="email" id="regEmail" placeholder="example@domain.com" required
                            class="w-full pr-12 px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition-all duration-300">
                    </div>
                </div>

                <!-- كلمة المرور -->
                <div class="group">
                    <label class="block text-sm mb-2 text-gray-300">كلمة المرور</label>
                    <div class="relative">
                        <i class="fas fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors"></i>
                        <input type="password" id="regPassword" placeholder="********" required
                            class="w-full pr-12 px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-300">
                        <button type="button" onclick="togglePassword('regPassword', this)" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <!-- مؤشر قوة كلمة المرور (اختياري) -->
                    <div class="flex gap-1 mt-2">
                        <div class="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full w-0 bg-gradient-to-r from-sky-400 to-teal-400 transition-all duration-300" id="passwordStrength"></div>
                        </div>
                    </div>
                </div>

                <!-- تأكيد كلمة المرور -->
                <div class="group">
                    <label class="block text-sm mb-2 text-gray-300">تأكيد كلمة المرور</label>
                    <div class="relative">
                        <i class="fas fa-check-circle absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                        <input type="password" id="regConfirmPassword" placeholder="********" required
                            class="w-full pr-12 px-4 py-3.5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition-all duration-300">
                    </div>
                </div>

                <!-- الشروط والأحكام -->
                <div class="flex items-start gap-3">
                    <label class="relative cursor-pointer group mt-1">
                        <input type="checkbox" id="termsCheck" class="sr-only peer" required>
                        <div class="w-5 h-5 border-2 border-[var(--border-light)] rounded-md peer-checked:bg-gradient-to-br peer-checked:from-sky-500 peer-checked:to-teal-500 peer-checked:border-transparent transition-all duration-300"></div>
                        <i class="fas fa-check absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                    </label>
                    <span class="text-gray-400 text-sm">
                        أوافق على 
                        <a href="javascript:void(0)" class="text-sky-400 hover:text-teal-400 transition-colors">الشروط والأحكام</a>
                        و
                        <a href="javascript:void(0)" class="text-sky-400 hover:text-teal-400 transition-colors">سياسة الخصوصية</a>
                    </span>
                </div>

                <!-- زر إنشاء الحساب -->
                <button type="submit" class="w-full btn-gradient py-4 text-lg relative overflow-hidden group">
                    <span class="relative z-10 flex items-center justify-center gap-2">
                        <i class="fas fa-user-plus"></i>
                        <span>إنشاء حساب جديد</span>
                    </span>
                    <div class="absolute inset-0 bg-gradient-to-r from-sky-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <!-- رابط تسجيل الدخول -->
                <div class="text-center pt-6 border-t border-[var(--border-light)]">
                    <span class="text-gray-400 text-sm">لديك حساب بالفعل؟ </span>
                    <button onclick="loadPage('login')" class="text-sky-400 font-medium hover:text-teal-400 transition-colors relative group">
                        تسجيل الدخول
                        <span class="absolute -bottom-1 right-0 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-teal-400 group-hover:w-full transition-all duration-300"></span>
                    </button>
                </div>
            </form>

            <!-- عناصر زخرفية صغيرة -->
            <div class="absolute -right-3 top-1/3 w-10 h-10 elegant-card rounded-full flex items-center justify-center floating hidden md:flex" style="animation-delay:0.3s">
                <i class="fas fa-shield-alt text-teal-400 text-sm"></i>
            </div>
            <div class="absolute -left-3 bottom-1/3 w-10 h-10 elegant-card rounded-full flex items-center justify-center floating hidden md:flex" style="animation-delay:0.5s">
                <i class="fas fa-star text-sky-400 text-sm"></i>
            </div>
        </div>
    </div>
</section>
`,
account: `
<!-- صفحة الحساب الشخصي -->
<section class="min-h-screen py-20 px-6 relative overflow-hidden home-animate">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <div class="max-w-6xl mx-auto relative z-10">
        <!-- العنوان -->
        <div class="text-center mb-12">
            <div class="flex justify-center gap-2 mb-4">
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
                <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.15s"></i>
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating" style="animation-delay:0.3s"></i>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold mb-4">
                <span class="gradient-text">الحساب</span> الشخصي
            </h2>
            <p class="text-gray-400 max-w-2xl mx-auto">
                مرحباً بك! يمكنك إدارة ملفك الشخصي ومتابعة تقدمك من هنا
            </p>
        </div>

        <div id="profile-ban-status" class="hidden mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl max-w-2xl mx-auto">
            <div class="flex items-center gap-3 text-red-400 mb-2">
                <i class="fas fa-exclamation-triangle"></i>
                <span class="font-bold">حسابك معلق حالياً</span>
            </div>
            <p id="profile-ban-reason" class="text-sm text-gray-300 mb-2"></p>
            <div class="flex items-center gap-2 text-xs text-red-300/70">
                <i class="fas fa-clock"></i>
                <span>الوقت المتبقي لانتهاء الحظر:</span>
                <span id="profile-ban-countdown" class="font-mono text-lg">--:--:--</span>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- العمود الأيمن - الملف الشخصي -->
            <div class="lg:col-span-1">
                <div class="elegant-card p-6 sticky top-24">
                    <!-- الصورة والمعلومات الأساسية -->
                    <div class="text-center mb-6">
                        <div class="relative inline-block">
                            <div class="w-32 h-32 rounded-full p-[2px] bg-gradient-to-br from-sky-500 to-teal-500">
                                <div class="w-full h-full rounded-full overflow-hidden bg-[var(--bg-primary)]">
                                    <div id="profilePhotoContainer" class="w-full h-full flex items-center justify-center">
                                        <i class="fas fa-user-circle text-5xl text-sky-400/70" id="profilePhotoPlaceholder"></i>
                                        <img id="profilePhotoImg" src="" alt="Profile" class="w-full h-full object-cover hidden">
                                    </div>
                                </div>
                            </div>
                            <button onclick="document.getElementById('photoInput').click()" class="absolute bottom-0 right-4 -translate-x-1 w-8 h-8 bg-gradient-to-r from-sky-500 to-teal-500 text-white p-2 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300">
                                <i class="fas fa-camera text-sm"></i>
                            </button>
                            <input type="file" id="photoInput" accept="image/*" class="hidden" onchange="uploadProfilePhoto(this)">
                        </div>
                        <h3 class="text-xl font-bold text-[var(--text-primary)] mt-4" id="profileDisplayName">أحمد محمد</h3>
                        <p class="text-gray-400 text-sm" id="profileUserType">مستخدم عادي</p>
                    </div>

                    <!-- إحصائيات المتابعة -->
                    <div class="grid grid-cols-3 gap-2 mb-6">
                        <div class="stat-card p-3 text-center">
                            <div class="text-lg font-bold gradient-text" id="profileFollowersCount">0</div>
                            <div class="text-xs text-gray-400">متابع</div>
                        </div>
                        <div class="stat-card p-3 text-center">
                            <div class="text-lg font-bold gradient-text" id="profileFollowingCount">0</div>
                            <div class="text-xs text-gray-400">يتابع</div>
                        </div>
                        <div class="stat-card p-3 text-center">
                            <div class="text-lg font-bold gradient-text" id="profileQuizPoints">0</div>
                            <div class="text-xs text-gray-400">نقاط</div>
                        </div>
                    </div>

                    <!-- روابط سريعة -->
                    <div class="space-y-2">
                        <a href="javascript:void(0)" onclick="accountPageLoader('personal')" class="flex items-center gap-3 p-3 rounded-xl transition-all duration-300" id="profile-personal-link">
                            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                                <i class="fas fa-user text-teal-400"></i>
                            </div>
                            <span class="text-[var(--text-primary)]">المعلومات الشخصية</span>
                        </a>
                        <a href="javascript:void(0)" onclick="accountPageLoader('settings')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card)] transition-all duration-300">
                            <div class="w-8 h-8 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
                                <i class="fas fa-gear text-gray-400"></i>
                            </div>
                            <span class="text-gray-400">الإعدادات</span>
                        </a>
                        <a href="javascript:void(0)" onclick="accountPageLoader('registrations')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card)] transition-all duration-300">
                            <div class="w-8 h-8 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
                                <i class="fas fa-clock text-gray-400"></i>
                            </div>
                            <span class="text-gray-400">تسجيلاتي</span>
                        </a>
                        <a href="javascript:void(0)" onclick="accountPageLoader('certificates')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card)] transition-all duration-300">
                            <div class="w-8 h-8 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
                                <i class="fas fa-certificate text-gray-400"></i>
                            </div>
                            <span class="text-gray-400">الشهادات</span>
                        </a>
                        <a href="javascript:void(0)" onclick="loadPage('adminPanel')" class="admin-only hidden items-center gap-3 p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300">
                            <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <i class="fas fa-user-shield text-purple-400"></i>
                            </div>
                            <span class="text-purple-400">لوحة التحكم</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- العمود الأيسر - المحتوى -->
            <div class="lg:col-span-2">
                <!-- ========== المعلومات الشخصية ========== -->
                <div id="personal-section" class="account-section-content">
                    <div class="elegant-card p-8 mb-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold">
                                <i class="fas fa-user-edit text-sky-400 ml-2"></i>
                                <span class="gradient-text">المعلومات الشخصية</span>
                            </h3>
                            <button class="border border-sky-400/30 text-sky-400 px-4 py-2 rounded-xl text-sm hover:bg-sky-400/10 transition-all duration-300">
                                <i class="fas fa-pen ml-1"></i>
                                تعديل الكل
                            </button>
                        </div>

                        <form id="accountForm" onsubmit="event.preventDefault(); handleProfileUpdate();" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="group">
                                    <label class="block text-sm mb-2 text-gray-400">اسم المستخدم</label>
                                    <div class="relative">
                                        <i class="fas fa-user absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                                        <input type="text" id="accountUsername" 
                                            class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none transition-all duration-300">
                                    </div>
                                </div>
                                <div class="group">
                                    <label class="block text-sm mb-2 text-gray-400">البريد الإلكتروني</label>
                                    <div class="relative">
                                        <i class="fas fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors"></i>
                                        <input type="email" id="accountEmail" 
                                            class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-teal-400 focus:outline-none transition-all duration-300">
                                    </div>
                                </div>
                                <div class="group">
                                    <label class="block text-sm mb-2 text-gray-400">رقم الهاتف</label>
                                    <div class="relative">
                                        <i class="fas fa-phone absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                                        <input type="text" id="accountPhone" placeholder="٠٠٠ ٠٠٠ ٠٠٠"
                                            class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition-all duration-300">
                                    </div>
                                </div>
                                 <div class="group">
                                     <label class="block text-sm mb-2 text-gray-400">السيرة الذاتية</label>
                                     <div class="relative">
                                         <i class="fas fa-info-circle absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors"></i>
                                         <input type="text" id="accountBio" placeholder="أخبرنا عنك..."
                                             class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-300">
                                     </div>
                                 </div>
                             </div>

                             <div class="elegant-card p-6 bg-[var(--bg-primary)]/50 border border-[var(--border-light)]/50 mt-6">
                                 <h4 class="text-[var(--text-primary)] font-bold mb-4 flex items-center gap-2">
                                     <i class="fas fa-share-nodes text-sky-400"></i>
                                     روابط التواصل الاجتماعي
                                 </h4>
                                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div class="relative">
                                         <i class="fab fa-facebook absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                                         <input type="url" id="social-facebook" placeholder="فيسبوك (رابط كامل)"
                                             class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none">
                                     </div>
                                     <div class="relative">
                                         <i class="fab fa-twitter absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                                         <input type="url" id="social-twitter" placeholder="تويتر / X"
                                             class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none">
                                     </div>
                                     <div class="relative">
                                         <i class="fab fa-instagram absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                                         <input type="url" id="social-instagram" placeholder="إنستقرام"
                                             class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none">
                                     </div>
                                     <div class="relative">
                                         <i class="fab fa-linkedin absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                                         <input type="url" id="social-linkedin" placeholder="لينكد إن"
                                             class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none">
                                     </div>
                                     <div class="relative md:col-span-2">
                                         <i class="fas fa-globe absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                                         <input type="url" id="social-website" placeholder="الموقع الشخصي"
                                             class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none">
                                     </div>
                                 </div>
                             </div>

                            <div class="flex flex-col sm:flex-row gap-4 pt-4">
                                <button type="submit" class="flex-1 btn-gradient px-8 py-3 rounded-xl transition-all duration-300">
                                    <i class="fas fa-save ml-2"></i>
                                    حفظ التغييرات
                                </button>
                                <button type="button" onclick="loadProfileData()" class="flex-1 btn-outline px-8 py-3 rounded-xl hover:bg-white/5 transition-all duration-300">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- تغيير كلمة المرور -->
                    <div class="elegant-card p-8">
                        <h3 class="text-xl font-bold mb-6">
                            <i class="fas fa-lock text-teal-400 ml-2"></i>
                            <span class="gradient-text">تغيير كلمة المرور</span>
                        </h3>

                        <form class="space-y-6" onsubmit="event.preventDefault(); handlePasswordChange(event);">
                            <div class="group">
                                <label class="block text-sm mb-2 text-gray-400">كلمة المرور الحالية</label>
                                <div class="relative">
                                    <i class="fas fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                                    <input type="password" id="currentPassword" placeholder="********" 
                                        class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none transition-all duration-300">
                                </div>
                            </div>
                            <div class="group">
                                <label class="block text-sm mb-2 text-gray-400">كلمة المرور الجديدة</label>
                                <div class="relative">
                                    <i class="fas fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors"></i>
                                    <input type="password" id="newPassword" placeholder="********" 
                                        class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-teal-400 focus:outline-none transition-all duration-300">
                                </div>
                            </div>
                            <div class="group">
                                <label class="block text-sm mb-2 text-gray-400">تأكيد كلمة المرور</label>
                                <div class="relative">
                                    <i class="fas fa-check-circle absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                                    <input type="password" id="confirmPassword" placeholder="********" 
                                        class="w-full pr-12 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:border-sky-400 focus:outline-none transition-all duration-300">
                                </div>
                            </div>

                            <!-- مؤشر قوة كلمة المرور -->
                            <div class="space-y-2">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-400 text-sm">قوة كلمة المرور</span>
                                    <span class="text-teal-400 text-sm" id="passwordStrengthIndicator">قوية</span>
                                </div>
                                <div class="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                    <div class="w-3/4 h-full bg-gradient-to-r from-sky-400 to-teal-400 rounded-full transition-all duration-300" id="passwordStrengthBar"></div>
                                </div>
                            </div>

                            <button type="submit" class="btn-gradient px-8 py-3">
                                <i class="fas fa-key ml-2"></i>
                                تحديث كلمة المرور
                            </button>
                        </form>
                    </div>
                </div>

                <!-- ========== الإعدادات ========== -->
                <div id="settings-section" class="account-section-content hidden">
                    <!-- الإعدادات العامة -->
                    <div class="elegant-card p-8 mb-6">
                        <h3 class="text-xl font-bold mb-6">
                            <i class="fas fa-gear text-sky-400 ml-2"></i>
                            <span class="gradient-text">الإعدادات العامة</span>
                        </h3>

                        <div class="space-y-4">
                            <!-- اللغة -->
                            <div class="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)]">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                                        <i class="fas fa-language text-teal-400"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-[var(--text-primary)] font-medium">اللغة</h4>
                                        <p class="text-gray-500 text-xs">اختر اللغة المفضلة</p>
                                    </div>
                                </div>
                                <div class="relative">
                                    <select onchange="applyLanguage(this.value)" class="bg-[var(--bg-card)] text-[var(--text-primary)] text-sm px-4 py-2 rounded-xl border border-[var(--border-light)] focus:border-sky-400 focus:outline-none appearance-none cursor-pointer">
                                        <option value="ar">العربية</option>
                                        <option value="en">English</option>
                                    </select>
                                    <i class="fas fa-chevron-down absolute left-3 top-3 text-gray-500 text-xs"></i>
                                </div>
                            </div>

                            <!-- المظهر -->
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)] gap-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                                        <i class="fas fa-circle-half-stroke text-sky-400"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-[var(--text-primary)] font-medium">المظهر</h4>
                                        <p class="text-gray-500 text-xs">وضع العرض المفضل</p>
                                    </div>
                                </div>
                                <div class="flex w-full sm:w-auto p-1 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)]">
                                    <button onclick="setTheme('dark')" id="btn-dark-mode" class="flex-1 sm:flex-none theme-btn px-6 py-2 rounded-lg text-sm text-gray-400 hover:text-[var(--text-primary)] transition-all duration-300">
                                        <i class="fas fa-moon ml-1"></i>
                                        داكن
                                    </button>
                                    <button onclick="setTheme('light')" id="btn-light-mode" class="flex-1 sm:flex-none theme-btn px-6 py-2 rounded-lg text-sm text-gray-400 hover:text-[var(--text-primary)] transition-all duration-300">
                                        <i class="fas fa-sun ml-1"></i>
                                        فاتح
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- الإشعارات -->
                    <div class="elegant-card p-8 mb-6">
                        <h3 class="text-xl font-bold mb-6">
                            <i class="fas fa-bell text-teal-400 ml-2"></i>
                            <span class="gradient-text">الإشعارات</span>
                        </h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)]">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                                        <i class="fas fa-envelope text-sky-400"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-[var(--text-primary)] font-medium">إشعارات البريد</h4>
                                        <p class="text-gray-500 text-xs">استلام تحديثات عبر البريد</p>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-teal-500"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)]">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                                        <i class="fas fa-calendar-check text-teal-400"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-[var(--text-primary)] font-medium">تذكير الفعاليات</h4>
                                        <p class="text-gray-500 text-xs">تنبيهات قبل موعد الفعاليات</p>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-teal-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- الخصوصية والأمان -->
                    <div class="elegant-card p-8 mb-6">
                        <h3 class="text-xl font-bold mb-6">
                            <i class="fas fa-shield-alt text-sky-400 ml-2"></i>
                            <span class="gradient-text">الخصوصية والأمان</span>
                        </h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)]">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                                        <i class="fas fa-users text-teal-400"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-[var(--text-primary)] font-medium">عرض قائمة المتابعين</h4>
                                        <p class="text-gray-500 text-xs">السماح للآخرين برؤية من تتبعهم</p>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="privacy-showFollowers" class="sr-only peer" onchange="updatePrivacySettings(this.checked)">
                                    <div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-teal-500"></div>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)]">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                                        <i class="fas fa-eye text-sky-400"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-[var(--text-primary)] font-medium">إظهار الملف الشخصي</h4>
                                        <p class="text-gray-500 text-xs">السماح للآخرين بمشاهدة ملفك</p>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-teal-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- معلومات الحساب -->
                    <div class="elegant-card p-8 mb-6">
                        <h3 class="text-xl font-bold mb-6">
                            <i class="fas fa-info-circle text-teal-400 ml-2"></i>
                            <span class="gradient-text">معلومات الحساب</span>
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="stat-card p-4">
                                <p class="text-gray-400 text-sm mb-1">نوع العضوية</p>
                                <p class="text-[var(--text-primary)] font-medium" id="settingsUserType">مستخدم عادي</p>
                            </div>
                            <div class="stat-card p-4">
                                <p class="text-gray-400 text-sm mb-1">تاريخ التسجيل</p>
                                <p class="text-[var(--text-primary)] font-medium" id="settingsJoinDate">غير محدد</p>
                            </div>
                        </div>
                    </div>

                    <!-- منطقة الخطر -->
                    <div class="elegant-card p-8 border-2 border-red-500/20">
                        <h3 class="text-xl font-bold mb-6 text-red-400">
                            <i class="fas fa-exclamation-triangle ml-2"></i>
                            منطقة الخطر
                        </h3>

                        <div class="flex flex-col sm:flex-row gap-3">
                            <button onclick="logout()" class="flex-1 btn-outline border-red-400/30 text-red-400 hover:bg-red-500/10 hover:border-red-400 transition-all duration-300 px-6 py-3 rounded-xl flex items-center justify-center gap-2">
                                <i class="fas fa-sign-out-alt"></i>
                                تسجيل الخروج
                            </button>

                            <button onclick="deleteAccount()" class="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                                <i class="fas fa-trash-alt"></i>
                                حذف الحساب نهائياً
                            </button>
                        </div>

                        <p class="text-xs text-gray-500 mt-3">
                            <i class="fas fa-info-circle ml-1"></i>
                            تسجيل الخروج آمن، أما حذف الحساب فهو نهائي ولا يمكن التراجع عنه
                        </p>
                    </div>
                </div>

                <!-- ========== تسجيلاتي ========== -->
                <div id="registrations-section" class="account-section-content hidden">
                    <div class="elegant-card p-8">
                        <h3 class="text-xl font-bold mb-6">
                            <i class="fas fa-clock text-sky-400 ml-2"></i>
                            <span class="gradient-text">تسجيلاتي في الكورسات والفعاليات</span>
                        </h3>

                        <!-- الكورسات التدريبية -->
                        <div class="mb-8 hidden">
                            <h4 class="text-lg font-bold mb-4 pb-2 border-b border-[var(--border-light)] flex items-center gap-2">
                                <i class="fas fa-graduation-cap text-teal-400"></i>
                                <span class="text-[var(--text-primary)]">الكورسات التدريبية</span>
                            </h4>
                            <div class="space-y-4" id="user-courses-list">
                                <div class="text-center text-gray-400 py-8">
                                    <i class="fas fa-spinner fa-spin text-2xl text-accent mb-2"></i>
                                    <p>جاري تحميل تسجيلاتك...</p>
                                </div>
                            </div>
                        </div>

                        <!-- الفعاليات -->
                        <div>
                            <h4 class="text-lg font-bold mb-4 pb-2 border-b border-[var(--border-light)] flex items-center gap-2">
                                <i class="fas fa-calendar-alt text-sky-400"></i>
                                <span class="text-[var(--text-primary)]">تسجيلاتي</span>
                            </h4>
                            <div class="space-y-4" id="user-events-list">
                                <div class="text-center text-gray-400 py-8">
                                    <i class="fas fa-spinner fa-spin text-2xl text-accent mb-2"></i>
                                    <p>جاري تحميل تسجيلاتك...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ========== الشهادات ========== -->
                <div id="certificates-section" class="account-section-content hidden">
                    <div class="elegant-card p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold">
                                <i class="fas fa-certificate text-teal-400 ml-2"></i>
                                <span class="gradient-text">شهاداتي</span>
                            </h3>
                            <button class="btn-gradient px-4 py-2 text-sm">
                                <i class="fas fa-download ml-1"></i>
                                تصدير الكل
                            </button>
                        </div>

                        <div id="user-certificates-container" class="grid grid-cols-1 md:grid-cols-2 gap-6 text-center text-gray-400">
                            <div class="col-span-1 md:col-span-2 py-8">
                                <i class="fas fa-spinner fa-spin text-2xl text-accent mb-2"></i> جاري التحميل...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
`,
userSearch: `
<section class="min-h-screen py-20 px-6 relative overflow-hidden home-animate">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
        <!-- العنوان -->
        <div class="text-center mb-12">
            <div class="flex justify-center gap-2 mb-4">
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
                <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.15s"></i>
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating" style="animation-delay:0.3s"></i>
            </div>

            <!-- أيقونات علوية -->
            <div class="flex justify-center items-center gap-4 mb-6">
                <i class="fas fa-users text-4xl text-sky-400 icon-sky-glow floating"></i>
                <i class="fas fa-user-plus text-5xl text-teal-400 icon-glow floating" style="animation-delay:0.2s"></i>
                <i class="fas fa-user-friends text-4xl text-sky-400 icon-sky-glow floating" style="animation-delay:0.4s"></i>
            </div>

            <h2 class="text-4xl md:text-5xl font-bold mb-4 hero-title-animation">
                بحث عن <span class="gradient-text">الأعضاء</span>
            </h2>
            <p class="text-gray-400 max-w-2xl mx-auto">
                ابحث عن أصدقاء جدد وتواصل مع أعضاء المجتمع
            </p>
        </div>

        <!-- شريط البحث -->
        <div class="mb-10">
            <div class="elegant-card p-2 relative group">
                <div class="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div class="relative flex items-center">
                    <i class="fas fa-search absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-400 transition-colors z-10"></i>
                    <input type="text" id="userSearchInput" oninput="searchUsers(this.value)"
                        placeholder="ابحث باسم العضو..."
                        class="w-full pr-14 px-6 py-5 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition-all duration-300 text-lg">
                    
                    <!-- زر البحث السريع -->
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2">
                        <button onclick="searchUsers(document.getElementById('userSearchInput').value) " 
                                class="w-10 h-10 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 flex items-center justify-center">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                    </div>
                </div>
            </div>

        <!-- نتائج البحث -->
        <div id="searchResults" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- الحالة الافتراضية -->
            <div class="col-span-full text-center py-16">
                <div class="elegant-card p-12 inline-block mx-auto">
                    <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
                        <i class="fas fa-users text-5xl text-sky-400/50"></i>
                    </div>
                    <p class="text-gray-400 text-lg mb-2">ابدأ الكتابة للبحث عن أصدقاء...</p>
                    <p class="text-gray-500 text-sm">اكتشف أعضاء جدد وتواصل مع المجتمع</p>
                </div>
            </div>
        </div>
</section>
`,

userProfile: `
<section class="min-h-screen py-20 px-6 relative overflow-hidden home-animate">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10" id="publicProfileContainer">
        <!-- زر العودة -->
        <div class="mb-6">
            <button onclick="loadPage('userSearch')" class="flex items-center gap-2 text-gray-400 hover:text-sky-400 transition-colors group">
                <i class="fas fa-arrow-right group-hover:-translate-x-1 transition-transform"></i>
                <span>عودة</span>
            </button>
        </div>

        <!-- محتوى الملف الشخصي -->
        <div class="text-center py-20">
            <div class="elegant-card p-12 inline-block mx-auto">
                <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
                    <i class="fas fa-spinner fa-spin text-4xl text-sky-400"></i>
                </div>
                <p class="text-gray-400 text-lg">جاري تحميل الملف الشخصي...</p>
                <p class="text-gray-500 text-sm mt-2">يرجى الانتظار قليلاً</p>
            </div>
        </div>
    </div>

    <!-- عناصر زخرفية عائمة -->
    <div class="absolute left-10 bottom-20 w-20 h-20 elegant-card rounded-full flex items-center justify-center floating hidden lg:flex" style="animation-delay:0.2s">
        <i class="fas fa-user text-teal-400 text-2xl"></i>
    </div>
    <div class="absolute right-10 top-40 w-16 h-16 elegant-card rounded-full flex items-center justify-center floating hidden lg:flex" style="animation-delay:0.4s">
        <i class="fas fa-star text-sky-400 text-xl"></i>
    </div>
</section>
`,
chat:`<section class="pt-24 md:pt-32 pb-12 px-4 md:px-6 min-h-screen relative overflow-hidden home-animate">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <div class="max-w-5xl mx-auto relative z-10">
        <!-- العنوان -->
        <div class="text-center mb-8">
            <div class="flex justify-center gap-2 mb-3">
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
                <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.15s"></i>
                <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating" style="animation-delay:0.3s"></i>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold mb-3">
                <span class="gradient-text">المحادثات</span>
            </h1>
            <p class="text-gray-400">تواصل مع أصدقائك وأعضاء الملتقى</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-[75vh] min-h-[600px] overflow-hidden relative">
            <!-- قائمة المحادثات -->
            <div id="chatListContainer" class="md:col-span-1 h-full overflow-hidden transition-all duration-300">
                <div class="elegant-card overflow-hidden flex flex-col h-full">
                    <div class="p-4 border-b border-[var(--border-light)] space-y-3">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[var(--text-primary)] font-bold text-sm flex items-center gap-2">
                                <i class="fas fa-comments text-sky-400"></i>
                                المحادثات
                            </h3>
                            <button onclick="showCreateGroupModal()" class="text-sky-400 hover:text-teal-400 transition text-xs flex items-center gap-1 group">
                                <i class="fas fa-plus-circle group-hover:scale-110 transition"></i> 
                                مجموعة جديدة
                            </button>
                        </div>
                        <div class="relative group">
                            <input type="text" id="chatUserSearch" placeholder="ابحث عن مستخدم..." oninput="searchChatUsers(this.value)"
                                class="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] text-sm focus:border-sky-400 focus:outline-none transition-all pl-9">
                            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors text-sm"></i>
                        </div>
                    </div>
                    <div id="chatSearchResults" class="hidden"></div>
                    <div id="conversationsList" class="divide-y divide-[var(--border-light)] flex-1 overflow-y-auto custom-scrollbar">
                        <div class="p-8 text-center">
                            <div class="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
                                <i class="fas fa-spinner fa-spin text-2xl text-sky-400"></i>
                            </div>
                            <p class="text-gray-400 text-sm">جاري التحميل...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- نافذة المحادثة -->
            <div id="chatWindowContainer" class="hidden md:flex md:col-span-2 h-full overflow-hidden transition-all duration-300">
                <div class="elegant-card flex flex-col h-full overflow-hidden w-full">
                    <!-- رأس المحادثة -->
                    <div id="chatHeader" class="p-4 border-b border-[var(--border-light)] flex items-center gap-3">
                        <button onclick="toggleChatListView(true)" class="md:hidden w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-gray-400 hover:text-sky-400">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <div class="relative">
                            <div class="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-sky-500 to-teal-500">
                                <div class="w-full h-full rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
                                    <i class="fas fa-comments text-sky-400"></i>
                                </div>
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-[var(--text-primary)] font-bold text-sm" id="chatWithName">اختر محادثة</h3>
                            <p class="text-gray-500 text-xs flex items-center gap-1" id="chatWithType">
                            </p>
                        </div>
                        <span class="text-[10px] text-gray-500 bg-[var(--bg-primary)] px-2 py-1 rounded-full border border-[var(--border-light)]">
                            <i class="fas fa-lock text-[8px] text-teal-400 ml-1"></i>
                            مشفرة
                        </span>
                    </div>
                    
                    <!-- منطقة الرسائل -->
                    <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style="min-height: 0;">
                        <div class="flex items-center justify-center h-full">
                            <div class="text-center">
                                <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-full flex items-center justify-center">
                                    <i class="fas fa-comments text-4xl text-sky-400/50"></i>
                                </div>
                                <p class="text-gray-400 mb-1">اختر محادثة للبدء</p>
                                <p class="text-gray-500 text-xs">ستظهر الرسائل هنا</p>
                            </div>
                        </div>
                    </div>

                    <!-- منطقة الإدخال -->
                    <div class="p-4 border-t border-[var(--border-light)] flex flex-col gap-2">
                        <div id="chatImagePreview" class="hidden items-center justify-between text-xs text-sky-400 bg-[var(--bg-primary)] p-2 rounded-lg border border-sky-500/30">
                            <span id="chatImageName" class="truncate"></span>
                            <button onclick="clearChatImage()" class="text-red-400 hover:text-red-300 ml-2"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="flex gap-2 relative">
                            <div class="flex-1 relative flex items-center bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-xl focus-within:border-sky-400 transition-all">
                                <label for="chatImageInput" class="cursor-pointer px-3 text-gray-500 hover:text-sky-400 transition-colors" title="إرفاق صورة">
                                    <i class="fas fa-paperclip text-lg"></i>
                                </label>
                                <input type="file" id="chatImageInput" accept="image/*" class="hidden" onchange="previewChatImage(this)">
                                <input type="text" id="chatInput" placeholder="اكتب رسالة..." disabled
                                    class="w-full py-3 pr-2 pl-4 bg-transparent text-[var(--text-primary)] text-sm focus:outline-none placeholder:text-gray-500 disabled:opacity-50"
                                    onkeypress="if(event.key==='Enter') sendChatMessage()">
                            </div>
                            <button onclick="sendChatMessage()" id="chatSendBtn" disabled
                                class="w-12 h-12 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center shrink-0">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>`,
quizGame: `
<!-- Quiz Game Page -->
<section class="pt-24 md:pt-32 pb-12 px-4 md:px-6 min-h-screen relative overflow-hidden home-animate">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
        <div id="quizContainer">
            <!-- Lobby View -->
            <div id="quizLobby">
                <div class="text-center mb-10">
                    <div class="flex justify-center gap-2 mb-4">
                        <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
                        <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.15s"></i>
                        <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating" style="animation-delay:0.3s"></i>
                    </div>
                    <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl mb-6 shadow-lg">
                        <i class="fas fa-gamepad text-white text-3xl"></i>
                    </div>
                    <h1 class="text-3xl md:text-4xl font-bold mb-3">
                        <span class="gradient-text">لعبة</span> الأسئلة
                    </h1>
                    <p class="text-gray-400 text-lg">أنشئ غرفة وتحدّى أصدقاءك!</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Create Room -->
                    <div class="elegant-card p-6 text-center">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-plus text-white text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">إنشاء غرفة</h3>
                        <p class="text-gray-400 text-sm mb-6">أنشئ غرفة جديدة وادعُ أصدقاءك</p>
                        <div class="space-y-3 mb-6">
                            <div class="flex items-center gap-3">
                                <label class="text-gray-400 text-sm whitespace-nowrap">وقت السؤال:</label>
                                <select id="quizTimerSelect" class="flex-1 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:border-sky-400 focus:outline-none">
                                    <option value="10" class="bg-[var(--bg-primary)]">10 ثواني</option>
                                    <option value="15" selected class="bg-[var(--bg-primary)]">15 ثانية</option>
                                    <option value="20" class="bg-[var(--bg-primary)]">20 ثانية</option>
                                    <option value="30" class="bg-[var(--bg-primary)]">30 ثانية</option>
                                </select>
                            </div>
                        </div>
                        <button onclick="createQuizRoom()" class="w-full btn-gradient py-3 text-base">
                            <i class="fas fa-rocket ml-2"></i>إنشاء غرفة
                        </button>
                    </div>

                    <!-- Join Room -->
                    <div class="elegant-card p-6 text-center">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-sky-500 rounded-2xl flex items-center justify-center">
                            <i class="fas fa-sign-in-alt text-white text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">انضم لغرفة</h3>
                        <p class="text-gray-400 text-sm mb-6">أدخل كود الغرفة للانضمام</p>
                        <div class="mb-6">
                            <input type="text" id="joinRoomCode" placeholder="أدخل كود الغرفة" maxlength="6"
                                class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg px-4 py-3 text-[var(--text-primary)] text-center text-xl tracking-widest uppercase focus:border-sky-400 focus:outline-none transition"
                                style="font-family: monospace; letter-spacing: 6px;">
                        </div>
                        <button onclick="joinQuizRoom()" class="w-full btn-gradient py-3 text-base">
                            <i class="fas fa-door-open ml-2"></i>انضمام
                        </button>
                    </div>
                </div>
            </div>

            <!-- Waiting Room -->
            <div id="quizWaitingRoom" class="hidden">
                <div class="text-center mb-8">
                    <p class="text-gray-400 mb-2">كود الغرفة</p>
                    <div class="text-3xl font-bold gradient-text font-mono tracking-[8px]" id="waitingRoomCode">------</div>
                    <button onclick="copyRoomCode()" class="mt-3 text-sky-400 hover:text-teal-400 transition-colors text-sm">
                        <i class="fas fa-copy ml-1"></i>نسخ الكود
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Players List -->
                    <div class="elegant-card p-5">
                        <h3 class="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <i class="fas fa-users text-sky-400"></i>
                            اللاعبون
                        </h3>
                        <div id="waitingPlayersList" class="space-y-3"></div>
                    </div>

                    <!-- Questions & Settings -->
                    <div class="space-y-4">
                        <!-- Add Preset Questions -->
                        <div class="elegant-card p-5">
                            <h3 class="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <i class="fas fa-list text-teal-400"></i>
                                أسئلة جاهزة
                            </h3>
                            <div id="presetCategories" class="grid grid-cols-2 gap-2"></div>
                        </div>

                        <!-- Add Custom Question -->
                        <div class="elegant-card p-5" id="customQuestionSection">
                            <h3 class="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <i class="fas fa-pen text-sky-400"></i>
                                سؤال مخصص
                            </h3>
                            <div class="space-y-2">
                                <input type="text" id="customQ" placeholder="السؤال" 
                                    class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:border-sky-400 focus:outline-none">
                                <input type="text" id="customOpt0" placeholder="الخيار 1 (الصحيح)" 
                                    class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:border-teal-400 focus:outline-none">
                                <input type="text" id="customOpt1" placeholder="الخيار 2" 
                                    class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:border-[var(--border-light)] focus:outline-none">
                                <input type="text" id="customOpt2" placeholder="الخيار 3" 
                                    class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:border-[var(--border-light)] focus:outline-none">
                                <input type="text" id="customOpt3" placeholder="الخيار 4" 
                                    class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:border-[var(--border-light)] focus:outline-none">
                            </div>
                            <button onclick="addCustomQuestion()" class="w-full btn-gradient py-2 text-sm mt-3">
                                <i class="fas fa-plus ml-1"></i>إضافة السؤال
                            </button>
                        </div>

                        <!-- Invite Users -->
                        <div class="elegant-card p-5">
                            <h3 class="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <i class="fas fa-user-plus text-teal-400"></i>
                                دعوة لاعبين
                            </h3>
                            <div class="relative group mb-3">
                                <input type="text" id="inviteSearchInput" placeholder="ابحث عن مستخدم..." oninput="searchUsersForInvite(this.value)"
                                    class="w-full bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:border-sky-400 focus:outline-none pr-10">
                                <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors text-sm"></i>
                            </div>
                            <div id="inviteSearchResults" class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar"></div>
                        </div>

                        <!-- Question Count & Start -->
                        <div class="elegant-card p-5 text-center">
                            <p class="text-gray-400 mb-3">عدد الأسئلة: <span id="totalQuestionsCount" class="text-sky-400 font-bold">0</span></p>
                            <button onclick="startQuizGame()" id="startGameBtn" class="w-full btn-gradient py-3 text-base" style="display:none;">
                                <i class="fas fa-play ml-2"></i>ابدأ اللعبة
                            </button>
                            <button onclick="loadPage('quizGame')" class="w-full btn-outline border-red-400/30 text-red-400 hover:bg-red-500/10 py-2 text-sm mt-2">
                                <i class="fas fa-sign-out-alt ml-1"></i>مغادرة الغرفة
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Game Play -->
            <div id="quizGamePlay" class="hidden">
                <div class="flex justify-between items-center mb-6">
                    <div class="text-gray-400 text-sm bg-[var(--bg-card)] px-4 py-2 rounded-full border border-[var(--border-light)]">
                        <i class="fas fa-question-circle text-sky-400 ml-1"></i>
                        السؤال <span id="gpCurrentQ">1</span> / <span id="gpTotalQ">10</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <div id="gpScoreBadge" class="bg-[var(--bg-card)] border border-[var(--border-light)] px-4 py-2 rounded-full text-sm">
                            <span class="gradient-text font-bold">0</span> نقطة
                        </div>
                        <div class="relative w-14 h-14">
                            <svg class="w-full h-full -rotate-90" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="17" fill="none" stroke="var(--border-light)" stroke-width="3"/>
                                <circle id="timerCircle" cx="20" cy="20" r="17" fill="none" 
                                    stroke="url(#timerGradient)" stroke-width="3" stroke-dasharray="106.8" stroke-dashoffset="0"
                                    stroke-linecap="round"/>
                            </svg>
                            <defs>
                                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#38bdf8"/>
                                    <stop offset="100%" stop-color="#14b8a6"/>
                                </linearGradient>
                            </defs>
                            <span id="gpTimerText" class="absolute inset-0 flex items-center justify-center text-lg font-bold text-sky-400">15</span>
                        </div>
                    </div>
                </div>

                <!-- Question Card -->
                <div class="elegant-card p-8 mb-6 quiz-animate-in text-center" id="gpQuestionCard">
                    <span id="gpCategory" class="inline-block text-xs text-sky-400 bg-sky-400/10 border border-sky-400/30 px-3 py-1 rounded-full mb-4">
                        برمجة
                    </span>
                    <h2 id="gpQuestionText" class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-relaxed">السؤال هنا</h2>
                </div>

                <!-- Options -->
                <div id="gpOptions" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6"></div>

                </div>

                <!-- Live Scores -->

                <!-- Live Scores -->
                <div id="liveScoreCon" class="elegant-card p-5 mt-4 hidden">
                    <h4 class="text-sm text-gray-400 mb-3 flex items-center gap-2">
                        <i class="fas fa-trophy text-yellow-400"></i>
                        النقاط الحالية
                    </h4>
                    <div id="gpLiveScores" class="flex flex-wrap gap-2"></div>
                </div>
            </div>

            <!-- Results -->
            <div id="quizResults" class="hidden">
                <div class="text-center mb-10">
                    <div class="flex justify-center gap-2 mb-4">
                        <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
                        <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.15s"></i>
                        <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating" style="animation-delay:0.3s"></i>
                    </div>
                    <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl mb-6 shadow-lg">
                        <i class="fas fa-trophy text-white text-3xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold mb-2">
                        <span class="gradient-text">النتائج</span> النهائية
                    </h2>
                    <p class="text-gray-400">غرفة <span id="resultRoomCode" class="text-sky-400 font-mono"></span></p>
                </div>

                <div id="resultsLeaderboard" class="space-y-3 max-w-lg mx-auto mb-8"></div>

                <div class="text-center">
                    <button onclick="loadPage('quizGame')" class="btn-gradient px-8 py-3 text-base">
                        <i class="fas fa-redo ml-2"></i>لعبة جديدة
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>
`,
archive:`
           <section id="archive" class="py-24 px-6 min-h-screen relative overflow-hidden home-animate" dir="rtl">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <!-- خلفية زخرفية خفيفة -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-sky-400/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>

    <div class="max-w-7xl mx-auto relative z-10">
        <!-- شاشة التحميل -->
        <div id="archive-loading" class="flex flex-col items-center justify-center py-28">
            <div class="relative">
                <div class="w-24 h-24 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <i class="fas fa-archive text-3xl text-sky-400"></i>
                </div>
            </div>

            <h3 class="text-3xl font-bold text-[var(--text-primary)] mt-10 mb-3">جاري تحميل الأرشيف</h3>
            <p class="text-gray-400 text-center max-w-md">
                نسترجع أجمل لحظاتنا وإنجازاتنا السابقة...
            </p>
        </div>

        <!-- المحتوى -->
        <div id="archive-content" class="hidden">
            <!-- العنوان -->
            <div class="text-center mb-20">
                <div class="flex justify-center gap-2 mb-4">
                    <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
                    <i class="fas fa-circle text-[0.4rem] text-teal-400/40 floating" style="animation-delay:0.15s"></i>
                    <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating" style="animation-delay:0.3s"></i>
                </div>

                <div class="inline-flex items-center gap-2 px-5 py-2 bg-sky-400/10 border border-sky-400/30 text-sky-400 text-sm rounded-full mb-6">
                    <i class="fas fa-archive"></i>
                    أرشيف الملتقى
                </div>

                <h2 class="text-5xl font-extrabold text-[var(--text-primary)] mb-6 leading-tight hero-title-animation">
                    رحلة <span class="gradient-text">التميّز والإنجاز</span>
                </h2>

                <p class="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
                    استعرض الفعاليات والإنجازات التي صنعت هويتنا، واكتشف محطات النجاح منذ الانطلاقة.
                </p>
            </div>

            <!-- الإحصائيات -->
            <div id="stats-container" class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24"></div>

            <!-- خط زمني -->
            <div class="relative">
                <!-- خط عمودي -->
                <div class="absolute right-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-sky-400/50 to-transparent hidden md:block"></div>

                <div id="archive-timeline" class="space-y-20"></div>
            </div>
        </div>
    </div>
</section>

<!-- قالب بطاقة الإحصائية -->
<template id="stat-card-template">
    <div class="group relative">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-teal-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
        <div class="relative elegant-card p-8 text-center">
            <h3 class="stat-value text-4xl font-extrabold gradient-text mb-3"></h3>
            <p class="stat-label text-gray-400 tracking-wide text-sm uppercase"></p>
        </div>
    </div>
</template>

<!-- قالب بطاقة الحدث -->
<template id="event-card-template">
    <div class="group relative">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
        <div class="relative elegant-card overflow-hidden">
            <!-- صورة الحدث -->
            <div class="relative h-48 overflow-hidden">
                <img class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <!-- شارة التصنيف -->
                <div class="absolute top-4 right-4">
                    <span class="px-3 py-1.5 bg-[var(--bg-card)] backdrop-blur-md text-sky-400 text-xs rounded-full border border-sky-400/30 flex items-center gap-1">
                        <i class="fas fa-tag category-icon text-[0.6rem]"></i>
                        <span class="category-name"></span>
                    </span>
                </div>
                
                <!-- التاريخ -->
                <div class="absolute bottom-4 left-4">
                    <span class="text-white/80 text-xs flex items-center gap-1">
                        <i class="fas fa-calendar text-teal-400"></i>
                        <span class="event-date"></span>
                    </span>
                </div>
            </div>

            <!-- محتوى البطاقة -->
            <div class="p-5">
                <h4 class="event-title text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:gradient-text transition-all"></h4>
                <p class="event-description text-gray-400 text-sm mb-4 line-clamp-2"></p>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                            <i class="fas fa-users text-white text-xs"></i>
                        </div>
                        <span class="text-gray-300 text-sm">
                            <span class="participants-count"></span> مشارك
                        </span>
                    </div>
                    
                    <button class="view-details text-sky-400 hover:text-teal-400 transition flex items-center gap-1 text-sm group/btn">
                        <span>عرض التفاصيل</span>
                        <i class="fas fa-arrow-left text-xs group-hover/btn:-translate-x-1 transition-transform"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<!-- قالب لشهر (للمجموعات) -->
<template id="month-group-template">
    <div class="month-group">
        <div class="flex items-center gap-4 mb-8">
            <div class="w-16 h-16 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span class="text-white font-bold text-xl month-number"></span>
            </div>
            <h3 class="text-3xl font-bold text-[var(--text-primary)] month-name"></h3>
            <div class="flex-1 h-0.5 bg-gradient-to-r from-sky-400 to-transparent"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 events-grid">
            <!-- هنا رح تدخل البطاقات -->
        </div>
    </div>
</template>

<!-- قالب لبطاقة الأرشيف -->
<template id="archive-card-template">
    <div class="group relative">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
        <div class="relative elegant-card overflow-hidden">
            <!-- صورة العنصر -->
            <div class="relative h-48 overflow-hidden">
                <img class="item-image w-full h-full object-cover group-hover:scale-110 transition duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <!-- شارة التصنيف -->
                <div class="absolute top-4 right-4">
                    <span class="px-3 py-1.5 bg-[var(--bg-card)] backdrop-blur-md text-sky-400 text-xs rounded-full border border-sky-400/30 flex items-center gap-1">
                        <i class="fas fa-tag ml-1"></i>
                        <span class="category-name"></span>
                    </span>
                </div>
                
                <!-- التاريخ -->
                <div class="absolute bottom-4 left-4">
                    <span class="text-white/80 text-xs flex items-center gap-1">
                        <i class="fas fa-calendar text-teal-400"></i>
                        <span class="item-date"></span>
                    </span>
                </div>
            </div>

            <!-- محتوى البطاقة -->
            <div class="p-5">
                <h4 class="item-title text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:gradient-text transition-all"></h4>
                <p class="item-description text-gray-400 text-sm mb-4 line-clamp-2"></p>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                            <i class="fas fa-users text-white text-xs"></i>
                        </div>
                        <span class="text-gray-300 text-sm">
                            <span class="participants-count"></span> مشارك
                        </span>
                    </div>
                    
                    <button class="view-details text-sky-400 hover:text-teal-400 transition flex items-center gap-1 text-sm group/btn">
                        <span>عرض التفاصيل</span>
                        <i class="fas fa-arrow-left text-xs group-hover/btn:-translate-x-1 transition-transform"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
`,
adminPanel: `
<!-- صفحة لوحة تحكم الأدمن -->
<section class="pt-24 md:pt-32 pb-12 px-4 md:px-6 min-h-screen relative overflow-hidden home-animate">
    <!-- عناصر زخرفية هادئة -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
        <!-- العنوان والترحيب -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
                <div class="flex items-center gap-2 mb-3">
                    <i class="fas fa-circle text-[0.4rem] text-sky-400/40 floating"></i>
                    <span class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse font-bold">Version 2.1</span>
                </div>
                <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
                    لوحة تحكم <span class="gradient-text">الأدمن</span>
                </h2>
                <p class="text-gray-400">مرحباً بعودتك! لديك ٣ إشعارات جديدة</p>
            </div>
            <div class="flex items-center gap-4">
                <button class="relative group" id="adminNotificationBtn" onclick="toggleAdminNotifications()">
                    <div class="w-12 h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-light)] flex items-center justify-center group-hover:border-sky-400 transition-all duration-300">
                        <i class="fas fa-bell text-sky-400 text-xl"></i>
                    </div>
                    <span class="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-gradient-to-r from-red-500 to-red-400 rounded-full text-white text-xs flex items-center justify-center px-1.5 border-2 border-[var(--bg-card)]">٣</span>
                </button>
                <div class="flex items-center gap-3 elegant-card p-2">
                    <div class="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-sky-500 to-teal-500">
                        <div class="w-full h-full rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
                            <i class="fas fa-crown text-sky-400"></i>
                        </div>
                    </div>
                    <div>
                        <div class="text-[var(--text-primary)] font-medium">المشرف العام</div>
                        <div class="text-gray-400 text-xs">admin@eyf.com</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- الإحصائيات السريعة -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- بطاقة 1 -->
            <div class="group relative">
                <div class="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div class="relative elegant-card p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                            <i class="fas fa-users text-sky-400 text-xl"></i>
                        </div>
                        <span class="text-green-400 text-sm bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">+١٢</span>
                    </div>
                    <div class="text-3xl font-bold gradient-text mb-1" id="admin-total-users">...</div>
                    <div class="text-gray-400 text-sm mb-3">إجمالي المستخدمين</div>
                    <div class="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div class="w-3/4 h-full bg-gradient-to-r from-sky-400 to-teal-400 rounded-full"></div>
                    </div>
                </div>
            </div>

            <!-- بطاقة 2 -->
            <div class="group relative">
                <div class="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div class="relative elegant-card p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                            <i class="fas fa-graduation-cap text-teal-400 text-xl"></i>
                        </div>
                        <span class="text-green-400 text-sm bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">+٥</span>
                    </div>
                    <div class="text-3xl font-bold gradient-text mb-1" id="admin-total-courses">...</div>
                    <div class="text-gray-400 text-sm mb-3">الكورسات</div>
                    <div class="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div class="w-3/4 h-full bg-gradient-to-r from-teal-400 to-sky-400 rounded-full"></div>
                    </div>
                </div>
            </div>

            <!-- بطاقة 3 -->
            <div class="group relative">
                <div class="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div class="relative elegant-card p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                            <i class="fas fa-calendar-alt text-sky-400 text-xl"></i>
                        </div>
                        <span class="text-green-400 text-sm bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">+٣</span>
                    </div>
                    <div class="text-3xl font-bold gradient-text mb-1" id="admin-total-events">...</div>
                    <div class="text-gray-400 text-sm mb-3">الفعاليات</div>
                    <div class="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div class="w-2/3 h-full bg-gradient-to-r from-sky-400 to-teal-400 rounded-full"></div>
                    </div>
                </div>
            </div>

            <!-- بطاقة 4 -->
            <div class="group relative">
                <div class="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div class="relative elegant-card p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                            <i class="fas fa-newspaper text-teal-400 text-xl"></i>
                        </div>
                        <span class="text-green-400 text-sm bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">+٢</span>
                    </div>
                    <div class="text-3xl font-bold gradient-text mb-1" id="admin-total-news">...</div>
                    <div class="text-gray-400 text-sm mb-3">الأخبار</div>
                    <div class="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div class="w-3/4 h-full bg-gradient-to-r from-teal-400 to-sky-400 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- الأقسام الرئيسية -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- العمود الأيمن - قائمة التحكم -->
            <div class="lg:col-span-1">
                <div class="elegant-card p-6 sticky top-24">
                    <h3 class="text-lg font-bold text-[var(--text-primary)] mb-6 pb-3 border-b border-[var(--border-light)] flex items-center gap-2">
                        <i class="fas fa-bars text-sky-400"></i>
                        قائمة التحكم
                    </h3>
                    
                    <div class="space-y-2">
                        <!-- طلبات الحسابات v2.1 -->
                        <button onclick="showAdminSection('pending-users', this)" class="admin-nav-btn w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/30">
                            <div class="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                                <i class="fas fa-user-clock text-white text-sm"></i>
                            </div>
                            <span class="font-bold text-yellow-500 flex-1 text-right">طلبات الحسابات</span>
                            <i class="fas fa-chevron-left text-yellow-500 group-hover:-translate-x-1 transition-transform"></i>
                        </button>

                        <!-- المحظرين v2.1 -->
                        <button onclick="showAdminSection('banned-users', this)" class="admin-nav-btn w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group hover:bg-red-500/10 border border-transparent hover:border-red-500/30">
                            <div class="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                                <i class="fas fa-user-slash text-white text-sm"></i>
                            </div>
                            <span class="font-bold text-red-500 flex-1 text-right">المحظرين (شهري)</span>
                            <i class="fas fa-chevron-left text-red-500 group-hover:-translate-x-1 transition-transform"></i>
                        </button>

                        <div class="my-2 border-t border-white/5"></div>

                        <!-- زر إدارة الفعاليات (نشط افتراضياً) -->
                        <button onclick="showAdminSection('events', this)" class="admin-nav-btn w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group bg-gradient-to-r from-sky-500/20 to-teal-500/20 border border-sky-400/30">
                            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                                <i class="fas fa-calendar-plus text-white text-sm"></i>
                            </div>
                            <span class="font-medium text-[var(--text-primary)] flex-1 text-right">إدارة الفعاليات</span>
                            <i class="fas fa-arrow-left text-sky-400 group-hover:-translate-x-1 transition-transform"></i>
                        </button>

                        <!-- زر آخر الأخبار -->
                        <button onclick="showAdminSection('news', this)" class="admin-nav-btn w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:bg-[var(--bg-card)]">
                            <div class="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center">
                                <i class="fas fa-newspaper text-gray-400"></i>
                            </div>
                            <span class="font-medium text-gray-400 flex-1 text-right">آخر الأخبار</span>
                            <i class="fas fa-arrow-left text-gray-500"></i>
                        </button>

                        <!-- زر إدارة المستخدمين -->
                        <button onclick="showAdminSection('users', this)" class="admin-nav-btn w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:bg-[var(--bg-card)]">
                            <div class="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center">
                                <i class="fas fa-users-cog text-gray-400"></i>
                            </div>
                            <span class="font-medium text-gray-400 flex-1 text-right">إدارة المستخدمين</span>
                            <i class="fas fa-arrow-left text-gray-500"></i>
                        </button>

                        <!-- زر الصلاحيات -->
                        <button onclick="showAdminSection('roles', this)" class="admin-nav-btn w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:bg-[var(--bg-card)]">
                            <div class="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center">
                                <i class="fas fa-user-shield text-gray-400"></i>
                            </div>
                            <span class="font-medium text-gray-400 flex-1 text-right">الصلاحيات</span>
                            <i class="fas fa-arrow-left text-gray-500"></i>
                        </button>

                        <!-- زر سجل النشاطات -->
                        <button onclick="showAdminSection('logs', this)" class="admin-nav-btn w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:bg-[var(--bg-card)]">
                            <div class="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center">
                                <i class="fas fa-list-alt text-gray-400"></i>
                            </div>
                            <span class="font-medium text-gray-400 flex-1 text-right">سجل النشاطات</span>
                            <i class="fas fa-arrow-left text-gray-500"></i>
                        </button>

                        <!-- زر الشهادات v2.1 -->
                        <button onclick="showAdminSection('certs', this)" class="admin-nav-btn w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group hover:bg-teal-500/10 border border-transparent hover:border-teal-500/30">
                            <div class="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                                <i class="fas fa-certificate text-white text-sm"></i>
                            </div>
                            <span class="font-bold text-teal-500 flex-1 text-right">إدارة الشهادات</span>
                            <i class="fas fa-chevron-left text-teal-500 group-hover:-translate-x-1 transition-transform"></i>
                        </button>
                    </div>

                    <!-- نشاط سريع -->
                    <div class="mt-8 p-5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-light)]">
                        <h4 class="text-[var(--text-primary)] font-medium mb-4 flex items-center gap-2">
                            <i class="fas fa-clock text-sky-400"></i>
                            آخر النشاطات
                        </h4>
                        <div id="sidebar-notifications" class="space-y-4">
                            <div class="flex items-start gap-3">
                                <div class="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                                <div>
                                    <p class="text-[var(--text-primary)] text-sm">تمت إضافة فعالية جديدة</p>
                                    <p class="text-gray-500 text-xs">منذ ٥ دقائق</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3">
                                <div class="w-2 h-2 mt-2 bg-sky-400 rounded-full"></div>
                                <div>
                                    <p class="text-[var(--text-primary)] text-sm">تسجيل ١٠ مستخدمين جدد</p>
                                    <p class="text-gray-500 text-xs">منذ ٢ ساعة</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3">
                                <div class="w-2 h-2 mt-2 bg-yellow-500 rounded-full"></div>
                                <div>
                                    <p class="text-[var(--text-primary)] text-sm">تم تحديث صلاحيات مشرف</p>
                                    <p class="text-gray-500 text-xs">منذ ٥ ساعات</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- العمود الأيسر - المحتوى -->
            <div class="lg:col-span-2">
                <!-- ========== لوحة المعلومات الرئيسية ========== -->
                <div id="dashboard-section" class="admin-section">
                    <div class="elegant-card p-8 text-center min-h-[957px]">
                        <!-- أيقونة ترحيب -->
                        <div class="flex justify-center mb-3 ">
                            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                                <i class="fas fa-crown text-4xl text-sky-400"></i>
                            </div>
                        </div>

                        <!-- نص الترحيب -->
                        <h2 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
                            مرحباً بك في <span class="gradient-text">لوحة التحكم</span>
                        </h2>

                        <p class="text-gray-400 text-lg">
                            يمكنك إدارة المحتوى من القائمة الجانبية
                        </p>

                        <!-- أيقونات بسيطة (زخرفية فقط) -->
                        <div class="flex justify-center gap-4 mt-6">
                            <i class="fas fa-circle text-[0.3rem] text-sky-400/40"></i>
                            <i class="fas fa-circle text-[0.3rem] text-teal-400/40"></i>
                            <i class="fas fa-circle text-[0.3rem] text-sky-400/40"></i>
                        </div>
                    </div>
                </div>
                <!-- ========== طلبات تفعيل الحسابات v2.1 ========== -->
                <div id="pending-users-section" class="admin-section hidden">
                    <div class="elegant-card p-8">
                        <div class="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                            <h3 class="text-xl font-bold text-white flex items-center gap-3">
                                <i class="fas fa-user-check text-yellow-500"></i>
                                طلبات تفعيل <span class="text-yellow-500">الحسابات الجديدة</span>
                            </h3>
                            <button onclick="fetchPendingUsers()" class="text-gray-400 hover:text-white transition"><i class="fas fa-sync-alt"></i></button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-right">
                                <thead class="text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th class="px-6 py-4">المستخدم</th>
                                        <th class="px-6 py-4">التاريخ</th>
                                        <th class="px-6 py-4 text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="pending-users-table-body" class="divide-y divide-white/5">
                                    <tr><td colspan="4" class="px-6 py-12 text-center text-gray-500">جاري التحميل...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- ========== المستخدمين المحظورين v2.1 ========== -->
                <div id="banned-users-section" class="admin-section hidden">
                    <div class="elegant-card p-8">
                        <div class="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                            <h3 class="text-xl font-bold text-white flex items-center gap-3">
                                <i class="fas fa-user-slash text-red-500"></i>
                                قائمة <span class="text-red-500">المحظورين لشهر</span>
                            </h3>
                            <button onclick="fetchBannedUsers()" class="text-gray-400 hover:text-white transition"><i class="fas fa-sync-alt"></i></button>
                        </div>
                        <div id="banned-users-list" class="space-y-4">
                            <div class="text-center text-gray-400 py-8">جاري التحميل...</div>
                        </div>
                    </div>
                </div>

                <!-- ========== إدارة الفعاليات ========== -->
                <div id="events-section-admin" class="admin-section hidden">

                    <div class="elegant-card p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <i class="fas fa-calendar-plus text-sky-400"></i>
                                إدارة الفعاليات
                            </h3>
                            <button onclick="toggleEventForm()" class="btn-gradient px-4 py-2 text-sm flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                <span id="eventFormToggleText">إضافة فعالية جديدة</span>
                            </button>
                        </div>

                        <!-- نموذج إضافة/تعديل فعالية -->
                        <div id="eventFormContainer" class="bg-[var(--bg-primary)] rounded-xl p-6 mb-8 border border-[var(--border-light)] hidden">
                            <h4 class="text-[var(--text-primary)] font-medium mb-4" id="eventFormTitle">إضافة فعالية جديدة</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" id="eventTitle" placeholder="عنوان الفعالية *" 
                                    class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition">
                                
                                <select id="eventType" class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:border-sky-400 focus:outline-none">
                                    <option value="courses">كورس</option>
                                    <option value="events">فعالية</option>
                                    <option value="workshops">ورشة عمل</option>
                                    <option value="upcoming">قريباً</option>
                                </select>
                                
                                <input type="date" id="eventDate" 
                                    class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:border-sky-400 focus:outline-none">
                                
                                <input type="number" id="eventSeats" placeholder="عدد المقاعد *" min="1"
                                    class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none">
                                
                                <input type="text" id="eventInstructor" placeholder="المدرب/المتحدث *" 
                                    class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none">
                                
                                <input type="text" id="eventDuration" placeholder="المدة (مثال: ٣ ساعات) *" 
                                    class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none">
                                
                                <input type="text" id="eventIcon" placeholder="أيقونة (مثال: fa-code)" value="fa-code"
                                    class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none">
                                
                                <input type="text" id="eventBgColor" placeholder="لون الخلفية (مثال: from-sky-500 to-teal-500)" 
                                    value="from-sky-500 to-teal-500"
                                    class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none">
                                
                                <div class="md:col-span-2">
                                    <textarea id="eventDescription" rows="3" placeholder="وصف الفعالية" 
                                        class="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none"></textarea>
                                </div>
                                
                                <!-- حالة النشر -->
                                <div class="md:col-span-2 flex items-center gap-4">
                                    <label class="flex items-center gap-2 cursor-pointer group">
                                        <div class="relative">
                                            <input type="checkbox" id="eventStatus" class="sr-only peer" checked>
                                            <div class="w-5 h-5 border-2 border-[var(--border-light)] rounded-md peer-checked:bg-gradient-to-br peer-checked:from-sky-500 peer-checked:to-teal-500 peer-checked:border-transparent transition-all duration-300"></div>
                                            <i class="fas fa-check absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                                        </div>
                                        <span class="text-gray-400 text-sm">نشر فوراً</span>
                                    </label>
                                </div>
                                
                                <div class="md:col-span-2 flex gap-3">
                                    <button onclick="saveEvent()" class="btn-gradient px-6 py-2">
                                        <i class="fas fa-save ml-2"></i>
                                        حفظ الفعالية
                                    </button>
                                    <button onclick="toggleEventForm()" class="btn-outline px-6 py-2">
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- حاوية الفعاليات -->
                        <h4 class="text-[var(--text-primary)] font-medium mb-4">الفعاليات الحالية <span id="eventsCount" class="text-gray-400">(0)</span></h4>
                        <div id="events-list-container" class="space-y-4">
                            <!-- جاري التحميل... -->
                            <div class="text-center text-gray-400 py-8">
                                <div class="inline-block">
                                    <div class="w-12 h-12 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin"></div>
                                </div>
                                <p class="mt-3">جاري تحميل الفعاليات...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ========== آخر الأخبار ========== -->
                <div id="news-section-admin" class="admin-section hidden">
                    <div class="elegant-card p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <i class="fas fa-newspaper text-teal-400"></i>
                                آخر الأخبار
                            </h3>
                            <button onclick="toggleNewsForm()" class="btn-gradient px-4 py-2 text-sm flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                <span id="formToggleText">خبر جديد</span>
                            </button>
                        </div>

                        <!-- نموذج إضافة خبر -->
                        <div id="newsFormContainer" class="bg-[var(--bg-primary)] rounded-xl p-6 mb-8 border border-[var(--border-light)] hidden">
                            <h4 class="text-[var(--text-primary)] font-medium mb-4" id="formTitle">إضافة خبر جديد</h4>
                            <div class="grid grid-cols-1 gap-4">
                                <input type="text" id="newsTitle" placeholder="عنوان الخبر *" class="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition">
                                
                                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <input type="text" id="newsCategory" placeholder="التصنيف *" class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition md:col-span-1">
                                    <input type="date" id="newsDate" class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:border-sky-400 focus:outline-none md:col-span-1">
                                    <input type="time" id="newsTime" value="12:00" class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:border-sky-400 focus:outline-none md:col-span-1">
                                    <input type="url" id="newsImage" placeholder="رابط الصورة" class="px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition md:col-span-1">
                                </div>

                                <textarea rows="4" id="newsDescription" placeholder="محتوى الخبر *" class="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition"></textarea>
                                
                                <!-- تفاصيل إضافية -->
                                <div class="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-light)]">
                                    <h5 class="text-[var(--text-primary)] font-medium mb-3 flex items-center gap-2">
                                        <i class="fas fa-info-circle text-teal-400"></i>
                                        تفاصيل إضافية
                                    </h5>
                                    <textarea rows="3" id="newsDetails" placeholder="اكتب تفاصيل إضافية عن الخبر هنا..." class="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-teal-400 focus:outline-none transition"></textarea>
                                    <p class="text-gray-500 text-xs mt-2">هذا الحقل اختياري - يمكنك إضافة معلومات مفصلة عن الخبر</p>
                                </div>
                                
                                <!-- خيارات الخبر المميز -->
                                <div class="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-light)]">
                                    <h5 class="text-[var(--text-primary)] font-medium mb-3">خيارات متقدمة</h5>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div class="flex items-center gap-3">
                                            <label class="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" id="newsIsFeatured" class="sr-only peer">
                                                <div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-teal-500"></div>
                                                <span class="mr-3 text-sm font-medium text-gray-400">خبر مميز</span>
                                            </label>
                                        </div>
                                        <div>
                                            <input type="number" id="newsFeaturedOrder" placeholder="ترتيب الظهور" min="0" value="0" class="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition">
                                        </div>
                                    </div>
                                </div>

                                <div class="flex gap-3">
                                    <button onclick="handleCreateNews()" class="btn-gradient px-6 py-2">نشر الخبر</button>
                                    <button onclick="toggleNewsForm()" class="btn-outline px-6 py-2">إلغاء</button>
                                </div>
                            </div>
                        </div>

                        <!-- قائمة الأخبار -->
                        <h4 class="text-[var(--text-primary)] font-medium mb-4">آخر الأخبار <span id="newsCount" class="text-gray-400">(0)</span></h4>
                        <div id="newsList" class="space-y-4">
                            <div class="text-center text-gray-500 py-8" id="loadingNews">
                                جاري تحميل الأخبار...
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ========== إدارة المستخدمين ========== -->
                <div id="users-section-admin" class="admin-section hidden">
                    <div class="elegant-card p-8">
                        <h3 class="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                            <i class="fas fa-users-cog text-sky-400"></i>
                            إدارة المستخدمين
                        </h3>
                        <div class="flex flex-col md:flex-row gap-4 mb-6">
                            <div class="flex-1 relative group">
                                <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors"></i>
                                 <input type="text" placeholder="بحث عن مستخدم..." oninput="filterAdminUsers(this.value)" class="w-full pr-10 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none transition">
                            </div>
                            <button onclick="fetchUsers()" class="btn-gradient px-4 py-2 flex items-center gap-2">
                                <i class="fas fa-sync-alt"></i>
                                تحديث
                            </button>
                        </div>
                        <div class="space-y-4" id="users-table-body">
                            <div class="text-center text-gray-400 py-8">جاري تحميل المستخدمين...</div>
                        </div>
                    </div>
                </div>

                <!-- ========== الصلاحيات ========== -->
                <div id="roles-section-admin" class="admin-section hidden">
                    <div class="elegant-card p-8">
                        <h3 class="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                            <i class="fas fa-user-shield text-teal-400"></i>
                            إدارة الصلاحيات
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- إضافة مشرف جديد -->
                            <div class="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-light)]">
                                <h4 class="text-[var(--text-primary)] font-medium mb-4 flex items-center gap-2">
                                    <i class="fas fa-user-plus text-sky-400"></i>
                                    إضافة مشرف جديد
                                </h4>
                                <div class="space-y-4">
                                    <input type="email" placeholder="البريد الإلكتروني للمستخدم" class="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-gray-500 focus:border-sky-400 focus:outline-none">
                                    <select class="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:border-sky-400 focus:outline-none">
                                        <option>صلاحية المشرف</option>
                                        <option>مشرف كامل</option>
                                        <option>مشرف محتوى</option>
                                        <option>مشرف مستخدمين</option>
                                    </select>
                                    <button class="w-full btn-gradient py-3">ترقية إلى مشرف</button>
                                </div>
                            </div>
                            <!-- قائمة الصلاحيات -->
                            <div class="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-light)]">
                                <h4 class="text-[var(--text-primary)] font-medium mb-4 flex items-center gap-2">
                                    <i class="fas fa-shield-alt text-teal-400"></i>
                                    أنواع الصلاحيات
                                </h4>
                                <div class="space-y-3">
                                    <div class="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)]">
                                        <div class="flex items-center gap-2">
                                            <i class="fas fa-crown text-yellow-500"></i>
                                            <span class="text-[var(--text-primary)]">مشرف كامل</span>
                                        </div>
                                        <span class="text-gray-400 text-sm">٨ مستخدمين</span>
                                    </div>
                                    <div class="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)]">
                                        <div class="flex items-center gap-2">
                                            <i class="fas fa-newspaper text-sky-400"></i>
                                            <span class="text-[var(--text-primary)]">مشرف محتوى</span>
                                        </div>
                                        <span class="text-gray-400 text-sm">١٢ مستخدم</span>
                                    </div>
                                    <div class="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)]">
                                        <div class="flex items-center gap-2">
                                            <i class="fas fa-users text-green-500"></i>
                                            <span class="text-[var(--text-primary)]">مشرف مستخدمين</span>
                                        </div>
                                        <span class="text-gray-400 text-sm">٦ مستخدمين</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ========== سجل النشاطات ========== -->
                <div id="logs-section-admin" class="admin-section hidden">
                    <div class="elegant-card p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <i class="fas fa-list-alt text-sky-400"></i>
                                سجل نشاطات النظام
                            </h3>
                            <button onclick="fetchLogs()" class="text-sky-400 hover:text-teal-400 transition flex items-center gap-1">
                                <i class="fas fa-sync-alt"></i>
                                تحديث
                            </button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-right text-gray-400">
                                <thead class="text-xs uppercase bg-[var(--bg-primary)] text-gray-500">
                                    <tr>
                                        <th class="px-6 py-4 rounded-r-lg">المستخدم</th>
                                        <th class="px-6 py-4">النشاط</th>
                                        <th class="px-6 py-4">التفاصيل</th>
                                        <th class="px-6 py-4">IP</th>
                                        <th class="px-6 py-4 rounded-l-lg">الوقت</th>
                                    </tr>
                                </thead>
                                <tbody id="logs-table-body" class="divide-y divide-[var(--border-light)]">
                                    <tr>
                                        <td colspan="4" class="px-6 py-8 text-center">جاري تحميل السجلات...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- ========== إدارة الشهادات v2.1 ========== -->
                <div id="certs-section-admin" class="admin-section hidden">
                    <div class="elegant-card p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                <i class="fas fa-certificate text-teal-400"></i>
                                إدارة الشهادات <span class="bg-teal-500/10 text-teal-500 text-[10px] px-2 py-0.5 rounded-full">v2.1</span>
                            </h3>
                            <button onclick="showIssueCertificateModal()" class="btn-gradient px-4 py-2 text-sm flex items-center gap-2">
                                <i class="fas fa-plus"></i>
                                إصدار شهادة جديدة
                            </button>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-right text-gray-400">
                                <thead class="text-xs uppercase bg-[var(--bg-primary)] text-gray-500">
                                    <tr>
                                        <th class="px-6 py-4 rounded-r-lg">المستخدم</th>
                                        <th class="px-6 py-4">عنوان الشهادة</th>
                                        <th class="px-6 py-4">تاريخ الإصدار</th>
                                        <th class="px-6 py-4 rounded-l-lg text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="admin-certs-table-body" class="divide-y divide-[var(--border-light)]">
                                    <tr>
                                        <td colspan="4" class="px-6 py-8 text-center"><i class="fas fa-spinner fa-spin ml-2"></i> جاري تحميل الشهادات...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
`,
error404: `
<section class="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden home-animate">
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-30"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>
    
    <div class="max-w-2xl w-full text-center relative z-10">
        <div class="relative inline-block mb-12">
            <div class="absolute -inset-8 bg-gradient-to-r from-sky-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div class="w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-secondary to-primary rounded-3xl flex items-center justify-center border border-sky-500/30 shadow-2xl floating relative">
                <i class="fas fa-shield-slash text-7xl md:text-9xl text-sky-400/80 icon-sky-glow"></i>
                <div class="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-primary">404</div>
            </div>
        </div>
        
        <h2 class="text-4xl md:text-6xl font-bold mb-6">
            <span class="gradient-text">المحتوى غير متاح</span>
            <br>أو صفحة غير موجودة
        </h2>
        
        <p class="text-gray-400 text-lg md:text-xl mb-12 leading-relaxed max-w-xl mx-auto">
            عذراً، يبدو أنك حاولت الوصول لملف محمي أو صفحة غير موجودة في النظام. تم تقييد الوصول المباشر للملفات لضمان أمن الموقع.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-6 justify-center">
            <button onclick="loadPage('home')" class="btn-gradient px-12 py-4 text-lg group rounded-2xl">
                <i class="fas fa-home ml-2 group-hover:-translate-y-1 transition-transform"></i>
                العودة للرئيسية
            </button>
            <button onclick="window.history.back()" class="btn-outline px-12 py-4 text-lg rounded-2xl">
                <i class="fas fa-arrow-right ml-2"></i>
                رجوع للخلف
            </button>
        </div>
    </div>
</section>
`,
privacy: `
<section class="min-h-screen py-20 px-6 relative overflow-hidden home-animate">
    <div class="absolute inset-0 pointer-events-none">
        <div class="stars opacity-20"></div>
        <div class="mosque-silhouette opacity-10"></div>
    </div>
    
    <div class="max-w-4xl mx-auto relative z-10">
        <div class="text-center mb-16">
            <div class="flex justify-center items-center gap-4 mb-6">
                <i class="fas fa-user-shield text-5xl text-sky-400 icon-sky-glow floating"></i>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold mb-4 hero-title-animation">
                سياسة <span class="gradient-text">الخصوصية</span> واستخدام الحسابات
            </h2>
            <div class="w-24 h-1 bg-gradient-to-r from-sky-400 to-teal-400 mx-auto rounded-full"></div>
        </div>

        <div class="space-y-8">
            <!-- الموافقة على الحساب -->
            <div class="elegant-card p-8 rounded-2xl border-r-4 border-r-sky-500">
                <h3 class="text-2xl font-bold mb-4 flex items-center gap-3">
                    <i class="fas fa-user-check text-sky-400"></i>
                    الموافقة على الحساب
                </h3>
                <ul class="space-y-3 text-gray-300 leading-relaxed">
                    <li class="flex items-start gap-2"><i class="fas fa-circle text-[0.5rem] mt-2 text-sky-400/50"></i> عند تسجيل حساب جديد، لا يتم تفعيل الحساب تلقائيًا.</li>
                    <li class="flex items-start gap-2"><i class="fas fa-circle text-[0.5rem] mt-2 text-sky-400/50"></i> يجب على المدير مراجعة الحساب الجديد والموافقة عليه أو رفضه لضمان جودة المجتمع.</li>
                    <li class="flex items-start gap-2"><i class="fas fa-circle text-[0.5rem] mt-2 text-sky-400/50"></i> سيتم إشعار المستخدم بحالة الموافقة أو الرفض فور اتخاذ القرار.</li>
                </ul>
            </div>

            <!-- سجل النشاط -->
            <div class="elegant-card p-8 rounded-2xl border-r-4 border-r-teal-500">
                <h3 class="text-2xl font-bold mb-4 flex items-center gap-3">
                    <i class="fas fa-history text-teal-400"></i>
                    سجل النشاط لدى المدير
                </h3>
                <p class="text-gray-300 leading-relaxed mb-4">
                    جميع حركات المستخدم داخل الموقع تُسجل في سجل خاص بالمدير لضمان أمان وسلامة الموقع، ويشمل ذلك:
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                        <i class="fas fa-sign-in-alt text-teal-400"></i> <span>تسجيل الدخول والخروج</span>
                    </div>
                    <div class="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                        <i class="fas fa-eye text-teal-400"></i> <span>تصفح الصفحات</span>
                    </div>
                    <div class="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                        <i class="fas fa-edit text-teal-400"></i> <span>التعديلات والإجراءات</span>
                    </div>
                    <div class="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                        <i class="fas fa-shield-alt text-teal-400"></i> <span>الإجراءات الأمنية</span>
                    </div>
                </div>
            </div>

            <!-- تشفير وحماية البيانات -->
            <div class="elegant-card p-8 rounded-2xl border-r-4 border-r-sky-500">
                <h3 class="text-2xl font-bold mb-4 flex items-center gap-3">
                    <i class="fas fa-lock text-sky-400"></i>
                    تشفير وحماية البيانات
                </h3>
                <p class="text-gray-300 leading-relaxed">
                    جميع البيانات الشخصية وسجلات النشاط للمستخدمين يتم تخزينها بشكل مشفر لضمان حماية المعلومات من الوصول غير المصرح به، ونستخدم معايير تشفير متقدمة (مثل AES-256) لتأمين البيانات أثناء التخزين والنقل. البيانات لا تُشارك مع أي طرف ثالث دون موافقة صريحة.
                </p>
            </div>

            <!-- الخصوصية وأمان الحساب -->
            <div class="elegant-card p-8 rounded-2xl border-r-4 border-r-teal-500">
                <h3 class="text-2xl font-bold mb-4 flex items-center gap-3">
                    <i class="fas fa-shield-virus text-teal-400"></i>
                    الخصوصية وأمان الحساب
                </h3>
                <p class="text-gray-300 leading-relaxed">
                    حماية خصوصية المستخدم هي أولويتنا القصوى، وجميع الإجراءات المتخذة تتوافق مع أفضل الممارسات الأمنية العالمية. يمكن للمدير الوصول إلى سجل النشاط فقط لأغراض المراقبة، الإدارة، وحماية سلامة النظام.
                </p>
            </div>

            <div class="text-center pt-8">
                <button onclick="loadPage('home')" class="btn-gradient px-10 py-4 text-lg">
                    العودة للرئيسية
                </button>
            </div>
        </div>
    </div>
</section>
`
}


window.checkUserSuspension = function (user) {
    if (user && user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
        let banner = document.getElementById('ban-countdown-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'ban-countdown-banner';
            banner.className = 'fixed top-0 left-0 w-full z-[9999] bg-red-600 text-white py-2 px-4 text-center font-bold flex items-center justify-center gap-4 shadow-xl';
            document.body.prepend(banner);
            if (document.querySelector('nav')) document.querySelector('nav').style.marginTop = '40px';
        }

        const updateTimer = () => {
            const now = new Date();
            const end = new Date(user.suspendedUntil);
            const diff = end - now;

            if (diff <= 0) {
                banner.remove();
                if (document.querySelector('nav')) document.querySelector('nav').style.marginTop = '0';
                clearInterval(window.banTimerInterval);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            banner.innerHTML = `
                <i class="fas fa-user-slash"></i>
                <span>حسابك معلق مؤقتاً. السبب: ${user.banReason || 'غير محدد'}. ينتهي بعد: ${days}ي ${hours}س ${mins}د ${secs}ث</span>
            `;
            
            const profileCountdown = document.getElementById('profile-ban-countdown');
            if (profileCountdown) {
                profileCountdown.textContent = `${days}:${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
                const profileStatus = document.getElementById('profile-ban-status');
                if (profileStatus) profileStatus.classList.remove('hidden');
                const profileReason = document.getElementById('profile-ban-reason');
                if (profileReason) profileReason.textContent = `السبب: ${user.banReason || 'غير محدد'}`;
            }
        };

        updateTimer();
        window.banTimerInterval = setInterval(updateTimer, 1000);
    }
};

window.togglePassword = function (id, btn) {

    const input = document.getElementById(id);
    if (!input) return;
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};

