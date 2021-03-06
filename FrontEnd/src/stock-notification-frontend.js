/**
 * @fileoverview Stock Notifications Frontend - Form Modal Functions and Constants
 * @requires stock-notification-api.js
 * @requires stock-notification-helpers.js
 * @author Chris Leung
*/

/* Update with correct ID of the variant selector from your product page */
const INPUT_VARIANT_SELECTOR = "#product-selector";

/* Defaults */
const NOTIFICATION_FORM ="#stock-notification-form"
const NOTIFICATION_FORM_VARIANT = "#stock-notification-variant-id";
const NOTIFICATION_FORM_EMAIL = "#stock-notification-email";
const NOTIFICATION_FORM_EMAIL_INPUT = "#stock-notification-email-input";
const NOTIFICATION_FORM_VARIANT_TITLE = "#stock-notification-product-variant";
const NOTIFICATION_FORM_STATUS = "#stock-notification-status";
const NOTIFICATION_FORM_SUBMIT = "#stock-notification-submit";

/**
 * Displays a status message div + message in the modal (animated)
 * @param  {String} message
 * @return {undefined}
 */
function showStatus(message) {
  $(NOTIFICATION_FORM_STATUS).animate({opacity: 0},0);
  $(NOTIFICATION_FORM_STATUS).html(message);
  $(NOTIFICATION_FORM_STATUS).stop(true);
  $(NOTIFICATION_FORM_STATUS).show();
  $(NOTIFICATION_FORM_STATUS).animate({opacity: 1});
}

/**
 * Hides the status message div in the modal (animated)
 * @return {[type]} [description]
 */
function hideStatus() {
  $(NOTIFICATION_FORM_STATUS).empty();
  $(NOTIFICATION_FORM_STATUS).hide();
}

/**
 * Sets up and displays the modal
 */
function openStockNotificationForm() {
  // Reset if we previously submitted
  $(NOTIFICATION_FORM_EMAIL).show();
  $(NOTIFICATION_FORM_EMAIL_INPUT).val("");
  $(NOTIFICATION_FORM_SUBMIT).show();
  hideStatus()
  // Copy selected variant title into the form modal
  $(NOTIFICATION_FORM_VARIANT_TITLE).text($(INPUT_VARIANT_SELECTOR+" option:selected").text());
  $(NOTIFICATION_FORM).modal({ fadeDuration: 200 });
}

/**
 * Handles form submission in demo.html
 * @param  {Object} form  The form object
 * @return {Boolean}      Returns false to prevent the page from reloading
 */
function onSubmit(form){
  // Copy selected variant ID from product page into hidden form field
  $(NOTIFICATION_FORM_VARIANT).val($(INPUT_VARIANT_SELECTOR).val());
  var json = getFormDataAsObject(form);
  if(isValidEmail(json['email'])) {
    showStatus("Submitting...");
    submitNotification(json).then(function(response) {
      if(response['success']) {
        $(NOTIFICATION_FORM_EMAIL).hide();
        $(NOTIFICATION_FORM_SUBMIT).hide();
        showStatus("Your notification has been saved. <a href='#' rel='modal:close'>Close</a>");
      } else {
        showStatus("You have already registered for a notification.");
      }
    }).catch(function(error) {
      showStatus("Sorry, a problem occurred when submitting your request. Please contact our customer support.");
    });
  } else {
    showStatus("The email address you entered is invalid");
  }
  return false;
}
