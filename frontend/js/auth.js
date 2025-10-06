// Authentication JavaScript (for login.html and signup.html)
class AuthManager {
    constructor() {
        this.baseURL = 'https://urlshortener10.vercel.app'; // Change this to your backend URL
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAnimations();
    }

    bindEvents() {
        // Check if we're on login or signup page
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }

    setupAnimations() {
        // Add entrance animation
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.style.opacity = '0';
            authCard.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                authCard.style.transition = 'all 0.6s ease';
                authCard.style.opacity = '1';
                authCard.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    async handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!this.validateLoginForm(email, password)) {
            return;
        }

        const submitBtn = document.getElementById('login-btn');
        this.setButtonLoading(submitBtn, true);

        try {
            const response = await fetch(`${this.baseURL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store JWT token
                sessionStorage.setItem('jwt_token', data.data);
                
                this.showToast('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    window.location.href = 'shorten.html';
                }, 1500);
                
            } else {
                this.showToast(data.message || 'Login failed Incorrect Username or Password. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Network error. Please check your connection.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleSignup() {
        const firstname = document.getElementById('firstname').value.trim();
        const lastname = document.getElementById('lastname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!this.validateSignupForm(firstname, lastname, email, password)) {
            return;
        }

        const submitBtn = document.getElementById('signup-btn');
        this.setButtonLoading(submitBtn, true);

        try {
            const requestBody = {
                firstname,
                email,
                password
            };

            // Only add lastname if it's provided
            if (lastname) {
                requestBody.lastname = lastname;
            }

            const response = await fetch(`${this.baseURL}/user/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Account created successfully! Redirecting to login...', 'success');
                
                // Redirect to login after short delay
                setTimeout(() => {
                    window.location.href = `login.html?email=${encodeURIComponent(email)}`;
                }, 1500);
                
            } else {
                this.showToast(data.message || 'Signup failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showToast('Network error. Please check your connection.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    validateLoginForm(email, password) {
        let isValid = true;

        // Clear previous errors
        this.clearFieldError('email');
        this.clearFieldError('password');

        if (!email) {
            this.showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            this.showFieldError('password', 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    validateSignupForm(firstname, lastname, email, password) {
        let isValid = true;

        // Clear previous errors
        this.clearFieldError('firstname');
        this.clearFieldError('lastname');
        this.clearFieldError('email');
        this.clearFieldError('password');

        if (!firstname) {
            this.showFieldError('firstname', 'First name is required');
            isValid = false;
        }

        if (!email) {
            this.showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            this.showFieldError('password', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showFieldError('password', 'Password must be at least 6 characters long');
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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

    setButtonLoading(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const btnSpinner = button.querySelector('.btn-spinner');

        if (isLoading) {
            btnText.style.opacity = '0';
            btnSpinner.classList.remove('hidden');
            button.disabled = true;
            button.style.cursor = 'not-allowed';
        } else {
            btnText.style.opacity = '1';
            btnSpinner.classList.add('hidden');
            button.disabled = false;
            button.style.cursor = 'pointer';
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

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
    new AuthManager();
    
    // Check if email is passed in URL (from signup redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = email;
        }
    }
    
    // Add some interactive effects
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'translateY(0)';
        });
    });
    
    console.log('Authentication page loaded successfully! 🔐');
});