---
title: Code Block Features
description: Examples of advanced code block features in the documentation
---

!!! warning "Under Construction"
    This page is under construction. Please check back later for comprehensive guidance



# Code Block Features

This guide demonstrates the advanced code block features available in the documentation, including syntax highlighting, line numbers, line highlighting, annotations, and the new line selection feature.

## Basic Code Block

A simple code block with syntax highlighting:

```python
def hello_world():
    """A simple function that prints Hello World."""
    message = "Hello World"
    print(message)
    
    # This is a comment
    for i in range(5):
        print(f"Count: {i}")
    
    return True
```

## Code Block with Line Numbers

Adding line numbers makes it easier to reference specific parts of code:

```python linenums="1"
def hello_world():
    """A simple function that prints Hello World."""
    message = "Hello World"
    print(message)
    
    # This is a comment
    for i in range(5):
        print(f"Count: {i}")
    
    return True
```

## Code Block with Line Highlighting

You can highlight specific lines to draw attention to them:

```python linenums="1" hl_lines="3 6-8"
def hello_world():
    """A simple function that prints Hello World."""
    message = "Hello World"  # This line is highlighted
    print(message)
    
    # This comment and the next two lines are highlighted
    for i in range(5):
        print(f"Count: {i}")
    
    return True
```

## Code Block with Title

You can add a title to your code block:

```python linenums="1" title="hello_world.py"
def hello_world():
    """A simple function that prints Hello World."""
    message = "Hello World"
    print(message)
    
    # This is a comment
    for i in range(5):
        print(f"Count: {i}")
    
    return True
```

## Code Block with Annotations

You can add annotations to explain specific parts of your code:

```python linenums="1" title="hello_world.py"
def hello_world():
    """A simple function that prints Hello World."""
    message = "Hello World"
    print(message)  # (1)
    
    # This is a comment
    for i in range(5):
        print(f"Count: {i}")  # (2)
    
    return True  # (3)
```

1. This line prints the message to the console
2. This loop iterates 5 times (0-4)
3. The function returns a boolean value

## Code Line Selection Feature

The line selection feature allows you to select and share specific lines of code. Click on any line number to select that line. You'll see a "Select lines" button appear that allows you to copy a link to the selected line(s).

```python linenums="1" title="secure_configuration.py"
def apply_security_controls(workspace_domain, config):
    """Apply security controls to Google Workspace domain."""
    # Initialize the admin SDK
    admin_service = initialize_admin_sdk(config['credentials_file'])
    
    # Apply 2-Step Verification settings
    if config['enforce_2sv']:
        enforce_2sv_for_all_users(admin_service, workspace_domain)
    
    # Configure password policy
    set_password_policy(
        admin_service, 
        workspace_domain,
        min_length=config['password_min_length'],
        require_uppercase=config['password_require_uppercase'],
        require_lowercase=config['password_require_lowercase'],
        require_special_char=config['password_require_special_char']
    )
    
    # Configure login monitoring
    if config['enable_login_monitoring']:
        setup_login_monitoring(
            admin_service,
            workspace_domain,
            alert_email=config['security_alert_email']
        )
    
    # Apply data access controls
    configure_data_access_controls(
        admin_service,
        workspace_domain,
        dlp_rules=config['dlp_rules']
    )
    
    # Return success status
    return {
        "status": "success",
        "controls_applied": list(config.keys()),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
```

Try clicking on line numbers to select lines, then use the "Select lines" button to copy a link to the selected lines.

## JavaScript Example with Line Selection

Here's a JavaScript example where you can also select lines:

```javascript linenums="1" title="security-controls.js"
/**
 * Applies security controls to a Google Workspace domain
 * @param {string} domain - The Google Workspace domain
 * @param {Object} config - Configuration options
 * @returns {Promise<Object>} - Result of the operation
 */
async function applySecurityControls(domain, config) {
  try {
    // Initialize the Admin SDK
    const adminClient = await initializeAdminSDK(config.credentialsFile);
    
    // Apply 2-Step Verification if configured
    if (config.enforce2SV) {
      await enforce2SVForAllUsers(adminClient, domain);
      console.log('2SV enforcement applied successfully');
    }
    
    // Configure password policies
    const passwordPolicy = {
      minLength: config.passwordMinLength || 12,
      requireUppercase: config.passwordRequireUppercase || true,
      requireLowercase: config.passwordRequireLowercase || true,
      requireSpecialChar: config.passwordRequireSpecialChar || true,
      requireNumber: config.passwordRequireNumber || true
    };
    
    await setPasswordPolicy(adminClient, domain, passwordPolicy);
    console.log('Password policy configured successfully');
    
    // Set up security alerts
    if (config.enableAlerts) {
      await setupSecurityAlerts(adminClient, domain, {
        alertEmail: config.securityAlertEmail,
        alertLevel: config.alertLevel || 'HIGH'
      });
      console.log('Security alerts configured successfully');
    }
    
    // Return success status
    return {
      status: 'success',
      controlsApplied: Object.keys(config),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error applying security controls:', error);
    return {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

## Diff Syntax Highlighting with Line Selection

You can also select lines in diff syntax highlighting:

```diff linenums="1"
 # Original password policy settings
 password_policy = {
-    "min_length": 8,
+    "min_length": 12,
     "require_uppercase": True,
-    "require_special_char": False,
+    "require_special_char": True,
+    "enforce_password_expiration": True,
+    "password_expiration_days": 90,
     "prevent_password_reuse": True,
-    "reuse_history_size": 5
+    "reuse_history_size": 10
 }
 
 # Security alert settings
 alert_settings = {
     "enable_alerts": True,
-    "alert_email": "it@example.com",
+    "alert_email": "security@example.com",
+    "alert_mobile": "+1234567890",
     "alert_severity_threshold": "MEDIUM"
 }
```

## How to Use Line Selection in Your Documentation

To enable code line selection in your code blocks, use the `linenums="1"` attribute to enable line numbers. The line selection feature is automatically available for all code blocks with line numbers.

When users click on a line number, the "Select lines" button appears, allowing them to copy a link that directly highlights those specific lines when shared.

This feature is particularly useful for:

1. Referencing specific parts of code during discussions
2. Creating targeted documentation links
3. Sharing specific implementation details
4. Highlighting important security controls

After selecting lines, users can copy the URL which contains a fragment identifier that will highlight those lines when the page is loaded.