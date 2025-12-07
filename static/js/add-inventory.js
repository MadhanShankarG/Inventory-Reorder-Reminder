/**
 * Add Inventory Form Handler
 * Handles form submission, validation, and API communication for adding new inventory items
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addInventoryForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const toastContainer = document.getElementById('toastContainer');

    // Form field elements
    const fields = {
        itemName: document.getElementById('itemName'),
        category: document.getElementById('category'),
        quantity: document.getElementById('quantity'),
        reorderLevel: document.getElementById('reorderLevel'),
        supplierName: document.getElementById('supplierName'),
        purchaseDate: document.getElementById('purchaseDate'),
        notes: document.getElementById('notes')
    };

    // Error message elements
    const errorElements = {
        itemName: document.getElementById('itemNameError'),
        category: document.getElementById('categoryError'),
        quantity: document.getElementById('quantityError'),
        reorderLevel: document.getElementById('reorderLevelError'),
        supplierName: document.getElementById('supplierNameError'),
        purchaseDate: document.getElementById('purchaseDateError')
    };

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of toast (success/error)
     */
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} toast-icon"></i>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Reset all error messages
     */
    function resetErrorMessages() {
        Object.values(errorElements).forEach(element => {
            element.style.display = 'none';
        });
    }

    /**
     * Show error message for a specific field
     * @param {string} fieldName - Name of the field with error
     * @param {string} message - Error message to display
     */
    function showError(fieldName, message) {
        const errorElement = errorElements[fieldName];
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            fields[fieldName].classList.add('error-input');
        }
    }

    /**
     * Validate form data before submission
     * @returns {boolean} Whether the form is valid
     */
    function validateForm() {
        let isValid = true;
        resetErrorMessages();

        // Validate required fields
        Object.entries(fields).forEach(([name, field]) => {
            if (field.required && !field.value.trim()) {
                showError(name, `${name.charAt(0).toUpperCase() + name.slice(1)} is required`);
                isValid = false;
            }
        });

        // Validate numeric fields
        if (fields.quantity.value && parseInt(fields.quantity.value) <= 0) {
            showError('quantity', 'Quantity must be greater than 0');
            isValid = false;
        }

        if (fields.reorderLevel.value && parseInt(fields.reorderLevel.value) <= 0) {
            showError('reorderLevel', 'Reorder level must be greater than 0');
            isValid = false;
        }

        // Validate purchase date
        if (fields.purchaseDate.value) {
            const purchaseDate = new Date(fields.purchaseDate.value);
            const today = new Date();
            if (purchaseDate > today) {
                showError('purchaseDate', 'Purchase date cannot be in the future');
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Reset form fields to their initial state
     */
    function resetForm() {
        form.reset();
        Object.values(fields).forEach(field => {
            field.classList.remove('error-input');
        });
        resetErrorMessages();
    }

    /**
     * Handle form submission
     * @param {Event} event - Form submit event
     */
    async function handleSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Disable submit button and show loading state
        submitButton.disabled = true;
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Item...';

        try {
            const formData = {
                item_name: fields.itemName.value,
                category: fields.category.value,
                quantity: parseInt(fields.quantity.value),
                threshold: parseInt(fields.reorderLevel.value),
                supplier: fields.supplierName.value,
                purchase_date: fields.purchaseDate.value,
                notes: fields.notes.value
            };

            const response = await fetch('/api/inventory/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add inventory item');
            }

            // Show success toast
            showToast('Item added successfully!');

            // Reset form
            resetForm();

        } catch (error) {
            // Show error toast
            showToast(error.message || 'An error occurred while adding the item', 'error');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    // Attach form submit handler
    form.addEventListener('submit', handleSubmit);

    // Set max date for purchase date to today
    const today = new Date().toISOString().split('T')[0];
    fields.purchaseDate.setAttribute('max', today);

    // Handle back and cancel buttons
    const backToInventoryBtn = document.getElementById('backToInventory');
    const cancelBtn = document.getElementById('cancelBtn');

    function navigateToInventory() {
        window.location.href = "{{ url_for('inventory') }}";
    }

    backToInventoryBtn.addEventListener('click', navigateToInventory);
    cancelBtn.addEventListener('click', navigateToInventory);
}); 