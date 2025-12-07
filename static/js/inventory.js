import { inventoryAPI } from './services/api';

document.addEventListener('DOMContentLoaded', function () {
    // Form elements
    const addInventoryForm = document.getElementById('addInventoryForm');
    const itemNameField = document.getElementById('itemName');
    const categoryField = document.getElementById('category');
    const quantityField = document.getElementById('quantity');
    const reorderLevelField = document.getElementById('reorderLevel');
    const supplierNameField = document.getElementById('supplierName');
    const purchaseDateField = document.getElementById('purchaseDate');
    const notesField = document.getElementById('notes');

    // Error message elements
    const itemNameError = document.getElementById('itemNameError');
    const categoryError = document.getElementById('categoryError');
    const quantityError = document.getElementById('quantityError');
    const reorderLevelError = document.getElementById('reorderLevelError');
    const supplierNameError = document.getElementById('supplierNameError');
    const purchaseDateError = document.getElementById('purchaseDateError');

    // Form submission handler
    addInventoryForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Reset error messages
        resetErrorMessages();

        // Validate form
        if (validateForm()) {
            try {
                // Show loading state
                const submitButton = addInventoryForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Item...';
                submitButton.disabled = true;

                // Create new inventory item object
                const newItem = {
                    name: itemNameField.value,
                    quantity: parseInt(quantityField.value),
                    threshold: parseInt(reorderLevelField.value),
                    category: categoryField.value,
                    supplier: supplierNameField.value,
                    purchaseDate: purchaseDateField.value,
                    notes: notesField.value
                };

                // Add to inventory using API
                await inventoryAPI.addItem(newItem);

                // Show success message
                showSuccessMessage('Inventory item added successfully!');

                // Redirect to inventory.html after a brief delay
                setTimeout(function () {
                    window.location.href = 'inventory.html';
                }, 1500);
            } catch (error) {
                showErrorMessage(error.message || 'Failed to add inventory item');
            } finally {
                // Reset button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        }
    });

    // Form validation function
    function validateForm() {
        let isValid = true;

        // Validate Item Name
        if (!itemNameField.value) {
            showError(itemNameField, itemNameError, 'Please select an item');
            isValid = false;
        }

        // Validate Category
        if (!categoryField.value) {
            showError(categoryField, categoryError, 'Please select a category');
            isValid = false;
        }

        // Validate Quantity
        if (!quantityField.value || parseInt(quantityField.value) <= 0) {
            showError(quantityField, quantityError, 'Quantity must be a positive number');
            isValid = false;
        }

        // Validate Reorder Level
        if (!reorderLevelField.value || parseInt(reorderLevelField.value) <= 0) {
            showError(reorderLevelField, reorderLevelError, 'Reorder level must be a positive number');
            isValid = false;
        }

        // Validate Supplier Name
        if (!supplierNameField.value.trim()) {
            showError(supplierNameField, supplierNameError, 'Please enter a supplier name');
            isValid = false;
        }

        // Validate Purchase Date
        if (!purchaseDateField.value) {
            showError(purchaseDateField, purchaseDateError, 'Please select a purchase date');
            isValid = false;
        } else {
            // Check if date is in the future
            const selectedDate = new Date(purchaseDateField.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to 00:00:00

            if (selectedDate > today) {
                showError(purchaseDateField, purchaseDateError, 'Date cannot be in the future');
                isValid = false;
            }
        }

        return isValid;
    }

    // Helper function to show error message
    function showError(inputElement, errorElement, message) {
        inputElement.classList.add('error-input');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    // Helper function to show error message
    function showErrorMessage(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'instruction-card';
        errorMessage.style.backgroundColor = 'rgba(234, 67, 53, 0.1)';
        errorMessage.style.borderLeftColor = '#ea4335';
        errorMessage.innerHTML = `<p><i class="fas fa-exclamation-circle"></i> ${message}</p>`;

        const formContainer = document.querySelector('.form-container');
        formContainer.parentNode.insertBefore(errorMessage, formContainer);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Helper function to reset all error messages
    function resetErrorMessages() {
        const allInputs = addInventoryForm.querySelectorAll('.form-control');
        const allErrors = addInventoryForm.querySelectorAll('.error-message');

        allInputs.forEach(input => {
            input.classList.remove('error-input');
        });

        allErrors.forEach(error => {
            error.style.display = 'none';
        });
    }

    // Helper function to show success message
    function showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'instruction-card';
        successMessage.style.backgroundColor = 'rgba(52, 168, 83, 0.1)';
        successMessage.style.borderLeftColor = '#34a853';
        successMessage.innerHTML = `<p><i class="fas fa-check-circle"></i> ${message}</p>`;

        const formContainer = document.querySelector('.form-container');
        formContainer.parentNode.insertBefore(successMessage, formContainer);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Sync category with item name if they match
    itemNameField.addEventListener('change', function () {
        const itemName = itemNameField.value;
        const categoryOptions = Array.from(categoryField.options);

        const matchingOption = categoryOptions.find(option => option.value === itemName);
        if (matchingOption) {
            categoryField.value = itemName;
        }
    });

    // Event listeners for input fields to clear errors on input
    const formInputs = addInventoryForm.querySelectorAll('.form-control');
    formInputs.forEach(input => {
        input.addEventListener('input', function () {
            this.classList.remove('error-input');
            const errorId = this.id + 'Error';
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    });
}); 