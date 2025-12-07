document.addEventListener('DOMContentLoaded', function() {
    // Common functionality for all pages
    
    // Toggle mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && navMenu.classList.contains('active') && !e.target.closest('.nav-menu') && !e.target.closest('.menu-toggle')) {
            navMenu.classList.remove('active');
        }
    });
    
    // Handle dropdown menus
    const dropdownToggles = document.querySelectorAll('.nav-menu .dropdown-toggle');
    
    if (dropdownToggles.length > 0) {
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const dropdown = this.nextElementSibling;
                
                if (dropdown && dropdown.classList.contains('dropdown')) {
                    dropdown.classList.toggle('show');
                }
            });
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown') && !e.target.classList.contains('dropdown-toggle')) {
            const openDropdowns = document.querySelectorAll('.dropdown.show');
            
            openDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
    
    // Handle alert banners
    const alertBanners = document.querySelectorAll('.alert-banner');
    
    if (alertBanners.length > 0) {
        alertBanners.forEach(alert => {
            const closeBtn = alert.querySelector('.close-btn');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    alert.style.display = 'none';
                });
            }
            
            // Auto hide alerts after 5 seconds
            setTimeout(() => {
                alert.style.display = 'none';
            }, 5000);
        });
    }
    
    // Form validation
    const forms = document.querySelectorAll('form');
    
    if (forms.length > 0) {
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                let hasError = false;
                const requiredFields = form.querySelectorAll('[required]');
                
                requiredFields.forEach(field => {
                    // Clear previous error
                    const errorElement = field.parentElement.querySelector('.error-message');
                    if (errorElement) {
                        errorElement.remove();
                    }
                    
                    field.classList.remove('error');
                    
                    // Check if empty
                    if (!field.value.trim()) {
                        hasError = true;
                        field.classList.add('error');
                        
                        const error = document.createElement('div');
                        error.className = 'error-message';
                        error.textContent = 'This field is required';
                        field.parentElement.appendChild(error);
                    }
                    
                    // Email validation
                    if (field.type === 'email' && field.value.trim() !== '') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(field.value)) {
                            hasError = true;
                            field.classList.add('error');
                            
                            const error = document.createElement('div');
                            error.className = 'error-message';
                            error.textContent = 'Please enter a valid email address';
                            field.parentElement.appendChild(error);
                        }
                    }
                    
                    // Password validation
                    if (field.type === 'password' && field.id === 'password' && field.value.trim() !== '') {
                        if (field.value.length < 8) {
                            hasError = true;
                            field.classList.add('error');
                            
                            const error = document.createElement('div');
                            error.className = 'error-message';
                            error.textContent = 'Password must be at least 8 characters long';
                            field.parentElement.appendChild(error);
                        }
                    }
                    
                    // Confirm password validation
                    if (field.id === 'confirm-password' && field.value.trim() !== '') {
                        const password = document.getElementById('password');
                        if (password && field.value !== password.value) {
                            hasError = true;
                            field.classList.add('error');
                            
                            const error = document.createElement('div');
                            error.className = 'error-message';
                            error.textContent = 'Passwords do not match';
                            field.parentElement.appendChild(error);
                        }
                    }
                });
                
                // Prevent form submission if there are errors
                if (hasError) {
                    e.preventDefault();
                }
            });
        });
    }
    
    // Input field validation on blur
    const inputFields = document.querySelectorAll('input, select, textarea');
    
    if (inputFields.length > 0) {
        inputFields.forEach(field => {
            field.addEventListener('blur', function() {
                // Skip if not required
                if (!this.hasAttribute('required')) {
                    return;
                }
                
                // Clear previous error
                const errorElement = this.parentElement.querySelector('.error-message');
                if (errorElement) {
                    errorElement.remove();
                }
                
                this.classList.remove('error');
                
                // Check if empty
                if (!this.value.trim()) {
                    this.classList.add('error');
                    
                    const error = document.createElement('div');
                    error.className = 'error-message';
                    error.textContent = 'This field is required';
                    this.parentElement.appendChild(error);
                }
                
                // Email validation
                if (this.type === 'email' && this.value.trim() !== '') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(this.value)) {
                        this.classList.add('error');
                        
                        const error = document.createElement('div');
                        error.className = 'error-message';
                        error.textContent = 'Please enter a valid email address';
                        this.parentElement.appendChild(error);
                    }
                }
            });
        });
    }
});