/**
 * ================================================================
 * STRATIFY SCHOOL PORTAL - MAIN JAVASCRIPT
 * ================================================================
 */

// ================================================================
// THEME TOGGLE
// ================================================================
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', next);

    const themeLabel = document.getElementById('themeLabel');
    themeLabel.textContent = next === 'dark' ? 'Light' : 'Dark';

    const icon = document.querySelector('.theme-toggle i');
    icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    // Re-render charts with new theme colors
    renderAllCharts();
}

// ================================================================
// TAB SWITCHING
// ================================================================
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });

    // Show selected tab
    const target = document.getElementById('tab-' + tabId);
    if (target) {
        target.classList.add('active');
    }

    // Update tab button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Re-render charts after tab switch (with slight delay for DOM)
    setTimeout(renderAllCharts, 150);

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================================
// CHART MANAGEMENT
// ================================================================
const chartInstances = {};

function renderAllCharts() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#F1F5F9' : '#0F172A';
    const gridColor = isDark ? '#334155' : '#E2E8F0';

    // --- Admin Chart 1: Performance by Class ---
    const ctx1 = document.getElementById('adminChart1');
    if (ctx1) {
        if (chartInstances.admin1) {
            chartInstances.admin1.destroy();
        }
        chartInstances.admin1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Form 1', 'Form 2', 'Form 3', 'Form 4'],
                datasets: [{
                    label: 'Average Score',
                    data: [72, 68, 74, 81],
                    backgroundColor: ['#4F46E5', '#0EA5E9', '#22C55E', '#EAB308'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    x: {
                        ticks: { color: textColor }
                    }
                }
            }
        });
    }

    // --- Admin Chart 2: Fee Collection Trend ---
    const ctx2 = document.getElementById('adminChart2');
    if (ctx2) {
        if (chartInstances.admin2) {
            chartInstances.admin2.destroy();
        }
        chartInstances.admin2 = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Fees (KES)',
                    data: [120000, 98000, 145000, 132000, 168000, 189000],
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79,70,229,0.1)',
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#4F46E5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    x: {
                        ticks: { color: textColor }
                    }
                }
            }
        });
    }

    // --- Parent Chart: Child Performance (Radar) ---
    const ctx3 = document.getElementById('parentChart');
    if (ctx3) {
        if (chartInstances.parent) {
            chartInstances.parent.destroy();
        }
        chartInstances.parent = new Chart(ctx3, {
            type: 'radar',
            data: {
                labels: ['Math', 'English', 'Kiswahili', 'Physics', 'History'],
                datasets: [{
                    label: 'Jane Mwangi',
                    data: [88, 76, 81, 63, 45],
                    backgroundColor: 'rgba(79,70,229,0.2)',
                    borderColor: '#4F46E5',
                    pointBackgroundColor: '#4F46E5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        grid: { color: gridColor },
                        ticks: { color: textColor },
                        pointLabels: { color: textColor }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                }
            }
        });
    }
}

// ================================================================
// KEYBOARD SHORTCUTS
// ================================================================
document.addEventListener('keydown', function(e) {
    // Ctrl+1 through Ctrl+8 for tab switching
    if (e.ctrlKey && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const tabs = ['home', 'student', 'teacher', 'admin', 'parent', 'admissions', 'gallery', 'contact'];
        const index = parseInt(e.key) - 1;
        if (tabs[index]) {
            switchTab(tabs[index]);
        }
    }

    // Ctrl+D for dark mode toggle
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
    }
});

// ================================================================
// INITIALIZATION
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Set initial theme label
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) {
        themeLabel.textContent = isDark ? 'Light' : 'Dark';
    }

    // Set initial theme icon
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon && isDark) {
        themeIcon.className = 'fas fa-sun';
    }

    // Render charts
    renderAllCharts();

    // Log welcome message
    console.log('%c 🎓 Stratify School Portal v2.0 ', 'background: #4F46E5; color: white; padding: 10px; font-size: 18px; border-radius: 6px;');
    console.log('%c 🔑 Keyboard Shortcuts:', 'font-weight: bold;');
    console.log('  Ctrl+1-8 : Switch tabs');
    console.log('  Ctrl+D   : Toggle dark/light mode');
    console.log('%c 🚀 Built with ❤️ for schools', 'color: #4F46E5; font-style: italic;');
});

// ================================================================
// WINDOW EVENTS
// ================================================================
let resizeTimer;

window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderAllCharts, 300);
});

// Re-render charts when theme changes (for any external theme changes)
window.addEventListener('themechange', renderAllCharts);

// ================================================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE (for inline HTML onclick)
// ================================================================
window.toggleTheme = toggleTheme;
window.switchTab = switchTab;
window.renderAllCharts = renderAllCharts;

// ================================================================
// LOADING SCREEN
// ================================================================
function showLoading() {
    const loading = document.getElementById('loadingScreen');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

function hideLoading() {
    const loading = document.getElementById('loadingScreen');
    if (loading) {
        setTimeout(() => {
            loading.classList.add('hidden');
        }, 500);
    }
}

// ================================================================
// LOADING WITH PROGRESS
// ================================================================
function simulateProgress() {
    const fill = document.querySelector('.loading-progress-fill');
    if (!fill) return;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(hideLoading, 300);
        }
        fill.style.width = progress + '%';
    }, 150);
}

// ================================================================
// LOADING WITH TIPS
// ================================================================
const loadingTips = [
    '📚 Did you know? We have over 500 students enrolled!',
    '🎓 Our graduates have a 95% university placement rate.',
    '🏆 Stratify School was ranked #1 in the region.',
    '🌍 We have exchange programs with 12 countries.',
    '💡 Our AI assistant is coming soon to help you!',
    '📱 You can access your portal from any device.',
    '💰 Pay fees easily using M-Pesa integration.',
    '⭐ We have a 4.8/5 rating from parents.',
    '📊 Track your child\'s progress in real-time.',
    '🎯 Personalized learning paths for every student.'
];

function showRandomTip() {
    const tipElement = document.querySelector('.loading-tip');
    if (!tipElement) return;

    const randomTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
    tipElement.style.opacity = '0';
    setTimeout(() => {
        tipElement.textContent = randomTip;
        tipElement.style.opacity = '1';
    }, 300);
}

// ================================================================
// INIT LOADING
// ================================================================
function initLoading() {
    // Show loading screen
    showLoading();

    // Start progress animation
    simulateProgress();

    // Show random tip every 2.5 seconds
    showRandomTip();
    const tipInterval = setInterval(showRandomTip, 2500);

    // Force hide after 5 seconds (safety net)
    setTimeout(() => {
        hideLoading();
        clearInterval(tipInterval);
    }, 5000);

    // Hide when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(hideLoading, 800);
    });

    // Hide when all resources are loaded
    window.addEventListener('load', () => {
        setTimeout(hideLoading, 400);
    });
}

// ================================================================
// EXPOSE LOADING FUNCTIONS
// ================================================================
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.initLoading = initLoading;
/**
 * ================================================================
 * STRATIFY SCHOOL - MAIN JAVASCRIPT
 * ================================================================
 */

// ================================================================
// THEME TOGGLE
// ================================================================
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', next);

    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) {
        themeLabel.textContent = next === 'dark' ? 'Light' : 'Dark';
    }

    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Save preference
    localStorage.setItem('theme', next);

    // Re-render charts if they exist
    if (typeof renderAllCharts === 'function') {
        setTimeout(renderAllCharts, 100);
    }
}

// ================================================================
// THEME ON LOAD
// ================================================================
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) {
        themeLabel.textContent = isDark ? 'Light' : 'Dark';
    }

    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ================================================================
// MOBILE MENU
// ================================================================
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

// Close mobile menu on link click
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-links a').forEach(function(link) {
        link.addEventListener('click', function() {
            const navLinks = document.getElementById('navLinks');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    });
});

// ================================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// ================================================================
// SLIDESHOW (4.5 second interval)
// ================================================================
(function() {
    let currentSlide = 0;
    let slideInterval = null;
    let totalSlides = 0;
    let slides = [];
    let dots = [];

    function initSlideshow() {
        const container = document.getElementById('slideshowContainer');
        if (!container) return;

        slides = document.querySelectorAll('.slide');
        dots = document.querySelectorAll('.dot');
        totalSlides = slides.length;

        if (totalSlides === 0) return;

        // Set initial state
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === 0);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === 0);
        });

        startSlideshow();

        // Dot click handlers
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                goToSlide(index);
                resetSlideshow();
            });
        });

        // Pause on hover
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (slideshowContainer) {
            slideshowContainer.addEventListener('mouseenter', pauseSlideshow);
            slideshowContainer.addEventListener('mouseleave', resumeSlideshow);
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                changeSlide(-1);
                resetSlideshow();
            } else if (e.key === 'ArrowRight') {
                changeSlide(1);
                resetSlideshow();
            }
        });

        console.log('🎠 Slideshow initialized with ' + totalSlides + ' slides');
    }

    function changeSlide(direction) {
        if (totalSlides === 0) return;

        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

        currentSlide = (currentSlide + direction + totalSlides) % totalSlides;

        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function goToSlide(index) {
        if (totalSlides === 0 || index === currentSlide) return;

        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

        currentSlide = index;

        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function startSlideshow() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            changeSlide(1);
        }, 4500); // 4.5 seconds
    }

    function pauseSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }

    function resumeSlideshow() {
        if (!slideInterval) {
            startSlideshow();
        }
    }

    function resetSlideshow() {
        pauseSlideshow();
        startSlideshow();
    }

    // Expose functions globally
    window.changeSlide = changeSlide;
    window.goToSlide = goToSlide;
    window.startSlideshow = startSlideshow;
    window.pauseSlideshow = pauseSlideshow;
    window.resumeSlideshow = resumeSlideshow;
    window.resetSlideshow = resetSlideshow;

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlideshow);
    } else {
        initSlideshow();
    }
})();

// ================================================================
// INIT ON LOAD
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    console.log('🎓 Stratify School Portal v2.0 loaded successfully!');
});