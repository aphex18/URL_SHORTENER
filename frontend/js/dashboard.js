// Dashboard JavaScript (for shorten.html) - IMPROVED VERSION
class DashboardManager {
    constructor() {
        this.baseURL = 'https://url-shortener-10.up.railway.app/'; // Change this to your backend URL
        this.token = sessionStorage.getItem('jwt_token');
        this.userUrls = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check authentication
        if (!this.token) {
            window.location.href = 'login.html';
            return;
        }

        this.bindEvents();
        this.loadUserInfo(); // NEW: Load user info
        this.loadUserURLs();
        this.setupAnimations();
    }

    // NEW: Load user information
    async loadUserInfo() {
        try {
            const response = await fetch(`${this.baseURL}/user/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.updateUserDisplay();
            } else if (response.status === 401) {
                this.handleTokenExpired();
            } else {
                // If no profile endpoint, extract from token
                this.extractUserFromToken();
            }
        } catch (error) {
            console.log('Profile endpoint not available, extracting from token');
            this.extractUserFromToken();
        }
    }

    // NEW: Extract user info from JWT token if no profile endpoint
    extractUserFromToken() {
        try {
            const tokenParts = this.token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                this.currentUser = {
                    firstname: payload.firstname || 'User',
                    lastname: payload.lastname || '',
                    email: payload.email || 'user@example.com',
                    id: payload.id || payload.userId
                };
                this.updateUserDisplay();
            }
        } catch (error) {
            console.log('Could not extract user info from token');
            this.currentUser = {
                firstname: 'User',
                lastname: '',
                email: 'user@example.com'
            };
            this.updateUserDisplay();
        }
    }

    // NEW: Update user display in header
    updateUserDisplay() {
        if (this.currentUser) {
            const welcomeText = document.querySelector('.welcome-text');
            const userInfo = document.querySelector('.user-info');
            
            const fullName = `${this.currentUser.firstname} ${this.currentUser.lastname || ''}`.trim();
            
            if (welcomeText) {
                welcomeText.innerHTML = `
                    <div class="user-welcome">
                        <span class="welcome-greeting">Welcome back!</span>
                        <span class="user-name">${fullName}</span>
                        <span class="user-email">${this.currentUser.email}</span>
                    </div>
                `;
            }
        }
    }

    bindEvents() {
        // Shorten form
        document.getElementById('shorten-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleShortenURL();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Search functionality
        document.getElementById('search-urls').addEventListener('input', (e) => {
            this.filterURLs(e.target.value);
        });

        // Modal close buttons
        document.getElementById('modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('modal-close-btn').addEventListener('click', () => {
            this.hideModal();
        });

        document.querySelector('.modal-overlay').addEventListener('click', () => {
            this.hideModal();
        });

        // Modal copy buttons
        document.getElementById('modal-copy-btn').addEventListener('click', () => {
            const shortUrl = document.getElementById('modal-short-url').textContent;
            this.copyToClipboard(shortUrl);
        });

        document.getElementById('modal-copy-main').addEventListener('click', () => {
            const shortUrl = document.getElementById('modal-short-url').textContent;
            this.copyToClipboard(shortUrl);
            this.hideModal();
        });
    }

    setupAnimations() {
        // Animate cards on load
        const cards = document.querySelectorAll('.section-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    async handleShortenURL() {
        const targetUrl = document.getElementById('target-url').value.trim();
        const customCode = document.getElementById('custom-code').value.trim();

        if (!this.validateShortenForm(targetUrl, customCode)) {
            return;
        }

        const submitBtn = document.getElementById('shorten-btn');
        this.setButtonLoading(submitBtn, true);

        try {
            const requestBody = { url: targetUrl };
            if (customCode) {
                requestBody.code = customCode;
            }

            const response = await fetch(`${this.baseURL}/shorten`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('URL shortened successfully!', 'success');
                this.clearShortenForm();
                
                // Show success modal
                this.showSuccessModal(targetUrl, data.url.shortCode);
                
                // Reload URLs
                this.loadUserURLs();
                
            } else {
                if (response.status === 401) {
                    this.handleTokenExpired();
                } else {
                    this.showToast(data.message || 'Failed to shorten URL', 'error');
                }
            }
        } catch (error) {
            console.error('Shorten URL error:', error);
            this.showToast('Network error. Please check your connection.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async loadUserURLs() {
        const urlsList = document.getElementById('urls-list');
        const emptyState = document.getElementById('empty-state');
        const urlsLoading = document.getElementById('urls-loading');

        // Show loading state
        urlsLoading.classList.remove('hidden');
        urlsList.classList.add('hidden');
        emptyState.classList.add('hidden');

        try {
            const response = await fetch(`${this.baseURL}/codes`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.userUrls = data.result || [];
                this.renderURLs(this.userUrls);
                this.updateStats();
            } else if (response.status === 401) {
                this.handleTokenExpired();
            } else {
                this.showToast('Failed to load URLs', 'error');
            }
        } catch (error) {
            console.error('Load URLs error:', error);
            this.showToast('Failed to load URLs', 'error');
        } finally {
            urlsLoading.classList.add('hidden');
        }
    }

    renderURLs(urls) {
        const urlsList = document.getElementById('urls-list');
        const emptyState = document.getElementById('empty-state');

        if (urls.length === 0) {
            urlsList.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        urlsList.classList.remove('hidden');
        emptyState.classList.add('hidden');

        urlsList.innerHTML = urls.map(url => this.createURLCard(url)).join('');

        // Bind events for the new cards
        this.bindURLCardEvents();

        // Animate new cards
        const newCards = urlsList.querySelectorAll('.url-card');
        newCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    createURLCard(url) {
        const shortUrl = `${this.baseURL}/${url.shortCode}`;
        const createdDate = new Date(url.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="url-card" data-url-id="${url.id}">
                <div class="url-card-header">
                    <div class="url-info">
                        <h3>${this.truncateUrl(url.targetUrl, 60)}</h3>
                        <div class="url-meta">
                            <i class="fas fa-calendar-alt"></i> Created ${createdDate}
                        </div>
                    </div>
                    <div class="url-actions">
                        <button class="btn btn-primary copy-url-btn" data-url="${shortUrl}" title="Copy short URL">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="btn btn-secondary delete-url-btn" data-url-id="${url.id}" title="Delete URL">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="url-display">${url.targetUrl}</div>
                <div class="url-display short-url-display">
                    <span>${shortUrl}</span>
                    <button class="copy-btn" data-url="${shortUrl}" title="Copy to clipboard">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        `;
    }

    bindURLCardEvents() {
        // Copy buttons
        document.querySelectorAll('.copy-url-btn, .copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                this.copyToClipboard(url);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-url-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const urlId = e.currentTarget.dataset.urlId;
                this.handleDeleteURL(urlId);
            });
        });
    }

    async handleDeleteURL(urlId) {
        if (!confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/${urlId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                this.showToast('URL deleted successfully!', 'success');
                this.loadUserURLs();
            } else if (response.status === 401) {
                this.handleTokenExpired();
            } else {
                const data = await response.json();
                this.showToast(data.message || 'Failed to delete URL', 'error');
            }
        } catch (error) {
            console.error('Delete URL error:', error);
            this.showToast('Failed to delete URL', 'error');
        }
    }

    filterURLs(searchTerm) {
        if (!searchTerm) {
            this.renderURLs(this.userUrls);
            return;
        }

        const filteredUrls = this.userUrls.filter(url => 
            url.targetUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
            url.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.renderURLs(filteredUrls);
    }

    updateStats() {
        const totalLinks = document.getElementById('total-links');
        if (totalLinks) {
            totalLinks.textContent = this.userUrls.length;
        }
    }

    handleLogout() {
        sessionStorage.removeItem('jwt_token');
        this.showToast('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    handleTokenExpired() {
        sessionStorage.removeItem('jwt_token');
        this.showToast('Session expired. Please login again.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }

    showSuccessModal(originalUrl, shortCode) {
        const modal = document.getElementById('success-modal');
        const originalUrlEl = document.getElementById('modal-original-url');
        const shortUrlEl = document.getElementById('modal-short-url');

        originalUrlEl.textContent = originalUrl;
        shortUrlEl.textContent = `${this.baseURL}/${shortCode}`;

        modal.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('success-modal').classList.add('hidden');
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Copied to clipboard!', 'success');
        }
    }

    validateShortenForm(targetUrl, customCode) {
        let isValid = true;

        // Clear previous errors
        this.clearFieldError('target-url');
        this.clearFieldError('custom-code');

        if (!targetUrl) {
            this.showFieldError('target-url', 'Target URL is required');
            isValid = false;
        } else if (!this.isValidUrl(targetUrl)) {
            this.showFieldError('target-url', 'Please enter a valid URL (include http:// or https://)');
            isValid = false;
        }

        if (customCode && !this.isValidCustomCode(customCode)) {
            this.showFieldError('custom-code', 'Custom code can only contain letters, numbers, hyphens, and underscores');
            isValid = false;
        }

        return isValid;
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    isValidCustomCode(code) {
        const codeRegex = /^[a-zA-Z0-9-_]+$/;
        return codeRegex.test(code);
    }

    truncateUrl(url, maxLength) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }

    showFieldError(fieldId, message) {
        const errorEl = document.getElementById(`${fieldId}-error`);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.opacity = '1';
        }
    }

    clearFieldError(fieldId) {
        const errorEl = document.getElementById(`${fieldId}-error`);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.opacity = '0';
        }
    }

    clearShortenForm() {
        document.getElementById('shorten-form').reset();
        this.clearFieldError('target-url');
        this.clearFieldError('custom-code');
    }

    setButtonLoading(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const btnSpinner = button.querySelector('.btn-spinner');

        if (isLoading) {
            btnText.style.opacity = '0';
            btnSpinner.classList.remove('hidden');
            button.disabled = true;
        } else {
            btnText.style.opacity = '1';
            btnSpinner.classList.add('hidden');
            button.disabled = false;
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';

        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'toastFade 0.3s ease forwards';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
    console.log('Dashboard loaded successfully! ⚡');
});