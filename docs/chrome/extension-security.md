---
title: Extension Security
description: Managing and securing browser extensions in Google Chrome
---

# Extension Security



# 1. Using Strict Content Security Policies.
   
  Writing stricter Content Security Policies (CSPs) for Google Chrome Extensions helps enhance security by preventing Cross-Site Scripting (XSS) and other code injection attacks. Stricter CSP's limits the sources from which the content can be loaded.

* Chrome Extensions run in privileged contexts. A compromised extension can:

  1. Access sensitive browser APIs.

  2. Steal user data.

  3. Execute arbitrary code.

 For MV3, the default CSP is:
    
      "content_security_policy": {
      "extension_pages": "script-src 'self'; object-src 'self'"
      }
 This is stricter than MV2 (which often allowed unsafe-eval) but can still be tightened further.

* Ways to tigthen CSPs:
  
    1. Disallow Inline Scripts
  
    2. Restrict img-src, media-src, and others
 
      "content_security_policy": {
      "extension_pages": "default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; object-src 'none';"
      }
  Explanation:

      default-src 'none': blocks all by default

      cript-src 'self': only allow internal JS

      connect-src 'self': allow fetch/XHR to self

      img-src 'self': only internal images

      style-src 'self': disallow inline styles and external stylesheets

      object-src 'none': completely block plugins


  
#  2. Minimizing Permissions

  Minimizing permissions in a Google Chrome extension is crucial for security because of the privileged access that extensions can have to a user's browser and data.

  1. Reducing Attack Surface:
     * Every permission that is granted is a potential entry point for an attacker.
     * Fewer permissions means less ways for bad actors to exploit the extension.

  2.Preventing Privelege Escalation:
    In a compromised extension, excessive permissions can let the attacker: 
     * Access sensitive data (emails, cookies, bookmarks)
     * Control browser actions
     * Manipulate web requests
     * Restricting permissions helps contain damage.

  3. Easier Maintenance and Auditing
     With fewer permissions:
      * Code reviews are simpler
      * Security audits are faster
      * It's easier to reason about what the extension is allowed to do
             
    
             Best Practices:                                 |   Why it helps:
             Use host_permissions selectively	         |   Don’t request <all_urls> unless necessary. Use specific domains.
             Use optional permissions (optional_permissions) |   Only request permissions when needed, and ask at runtime.
             Avoid persistent background scripts if possible |   Use service workers (Manifest V3) to reduce runtime exposure.
             Use declarative APIs (declarativeNetRequest)	 |   Safer than webRequest, which can expose full request/response data.
             Audit permissions regularly	                 |   Refactor or remove unnecessary permissions as features change.


     
# 3. Regular Updates and Monitoring
   For depveloperes it is very important to patch any newly found vulnerabilities promptly.
   
   1. Monitor security advisories (e.g., Chromium Blog, CVE databases) for:
      
         * JavaScript vulnerabilities
         * Extension API changes
         * Third-party library issues
           
         Fix identified issues immediately!

      2.Updating Manifest and Dependencies:
      
         * Ensure you're using the latest stable Manifest version (Manifest V3 is currently required).
         * Reghularly udpate and audit third-party libraries
           
           You can use tools like "npm audit" or "Snyk"
           
      3.Use Semantic Versioning:
      
         * What is Semantic Versioning?
      
         Semantic Versioning (SemVer) is a structured way to version software using a three-part number:

            MAJOR.MINOR.PATCH 
         For Example:
         
            1.4.2
      
         Each segment conveys meaning about the update's impact:

         | Segment   | When to Increment         | Description                                                              |
         | --------- | ------------------------- | ------------------------------------------------------------------------ |
         | **MAJOR** | Breaking changes          | Incompatible API or behavior changes                                     |
         | **MINOR** | New features              | Backward-compatible feature additions                                    |
         | **PATCH** | Bug fixes / small changes | Backward-compatible fixes, performance improvements, or security patches |

         * The use of SemVer in Extensions:

            * Helps users know what kind of changes to expect.
            * Makes it easier for Google reviewers to track meaningful updates.

         * Helps Security Patch management:

            * Clear PATCH version increases make it easier to distinguish security updates from new features.

         * Aids in Automation:

            * Automated deployment tools and CI/CD pipelines can detect when to trigger updates based on version increments.
          
      How to Apply Semantic Versioning in Your Extension?:

         1. Update manifest.json version

                  "version": "2.3.1"
            
            This is required by Chrome and is the official version used for auto-updates.


         2. Match It with CHANGELOG.md
      
                  ## [2.3.1] - 2025-05-30
                  ### Fixed
                  - Patched a bug that caused login tokens to persist incorrectly.
                  - Fixed performance issue in background script.
                  
                  ## [2.3.0] - 2025-05-25
                  ### Added
                  - New feature: Ability to export settings as JSON.
                  
                  ## [2.0.0] - 2025-05-01
                  ### Changed
                  - Switched from Manifest V2 to V3. This is a breaking change.
                  - Dropped support for Chrome < 90.        


         Make sure the logs are structure consistently.

         3. Version Bumping Strategy

               | Situation                               | New Version      | Why                             |
               | --------------------------------------- | ---------------- | ------------------------------- |
               | You fix a bug in a stable release       | `1.2.3 → 1.2.4`  | PATCH update                    |
               | You add a feature (e.g., dark mode)     | `1.2.3 → 1.3.0`  | MINOR update                    |
               | You migrate to Manifest V3              | `1.2.3 → 2.0.0`  | MAJOR update                    |
               | You fix a security vulnerability        | `1.3.2 → 1.3.3`  | PATCH update (critical)         |
               | You refactor internal code (no changes) | *No bump needed* | Optional, if behavior unchanged |
                  
         4. Security Best Practices Using SemVer:

               | Action                           | Benefit                               |
               | -------------------------------- | ------------------------------------- |
               | Use PATCH for all security fixes | Easier to isolate and track in audits |
               | Avoid skipping MAJOR bumps       | Prevent breaking user experience      |
               | Communicate changes clearly      | Reduces user confusion/trust issues   |
               | Document deprecated features     | Helps manage risky transitions        |
            
         5. Automation Tools for SemVer5:

               | Tool                  | Use Case                      |
               | --------------------- | ----------------------------- |
               | **standard-version**  | Auto-bump version + changelog |
               | **semantic-release**  | Full CI-based release mgmt    |
               | **npm version patch** | Quick version bump            |

# 4. Monitoring – Code & Setup
   
   1. Capture and Report Errors:

      background.js
      
               self.onerror = function (message, source, lineno, colno, error) {
                 fetch("https://your-logging-endpoint.com/log", {
                   method: "POST",
                   headers: {
                     "Content-Type": "application/json"
                   },
                   body: JSON.stringify({
                     message,
                     source,
                     lineno,
                     colno,
                     stack: error ? error.stack : null
                   })
                 });
               };
      This logs any uncaught errors in your background service worker.
      
      2. Log User Behavior (non-sensitive):
     
         Example: Track Feature Usage:

                   function logFeatureUsage(featureName) {
                    fetch("https://your-logging-endpoint.com/feature-usage", {
                      method: "POST",
                      body: JSON.stringify({ feature: featureName, time: Date.now() })
                    });
                  }
                  
                  // Usage
                  logFeatureUsage("clicked_sync_button");
         
         Ensure you're not collecting PII (Personally Identifiable Information) without explicit user consent.

       3. Monitor for Malicious Behavior (e.g., Extension Hijack):
     
          Detect unexpected API usage or content injection:

                  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                    if (changeInfo.status === 'complete') {
                      chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: () => {
                          if (document.querySelector('iframe[src*="malicious-site.com"]')) {
                            alert('Suspicious iframe detected.');
                          }
                        }
                      });
                    }
                  });

         4. Security Checklist (Code-Focused):
     
               | Task                  | Code Reference              |
               | --------------------- | --------------------------- |
               | Use Manifest V3       | `manifest.json`             |
               | Remove inline scripts | Move to external `.js`      |
               | Enforce CSP           | `"content_security_policy"` |
               | Log errors securely   | `fetch` error handler       |
               | Sanitize inputs       | `sanitizeInput()`           |
               | Test core logic       | Jest/Mocha unit tests       |
               | CI/CD pipeline        | GitHub Actions YAML         |
               | Patch dependencies    | `npm audit fix`             |

            
# 5. Validate and Sanitize Input

   1. Why Input Sanitization & Validation Matter?
   
   Chrome extensions often:

   * Accept user input (e.g., popup forms, options pages)
   * Inject content scripts into webpages
   * Make API calls and handle responses
     
   Without sanitization/validation:

   * A user could inject <script> tags into local DOM pages (XSS)
   * Malicious pages could trigger unsafe extension behavior
   * Data could be malformed, crash the extension, or open security holes

   2. Input Sanitization (Removing Dangerous Content):

      Sanitization ensures input is safe to use, especially in the DOM.

      When to Sanitize:

      * In content scripts, before inserting user-generated HTML
      * In options pages, before saving to storage
      * In background scripts, when handling messages

      Safe Techniques:

      1. Removing HTMP tags:
     
               function sanitizeInput(input) {
                 const div = document.createElement('div');
                 div.textContent = input;
                 return div.innerHTML; // Escaped version of input
               }
               
               const userInput = '<script>alert("xss")</script>';
               const safeInput = sanitizeInput(userInput);  // → &lt;script&gt;alert("xss")&lt;/script&gt;

      2. Use textContent or text() instead of innerHTML:

               // Unsafe (XSS risk):
               element.innerHTML = userInput;
               
               // Safe:
               element.textContent = userInput;
      
      
      3. Whitelist allowed tags/attributes (advanced):

         If you need rich input (e.g., <b>, <i>), use a sanitizer:

               import DOMPurify from 'dompurify';
      
               const safeHTML = DOMPurify.sanitize(userInput);
               element.innerHTML = safeHTML;
               
         Sidenote: "DOMPurify" is a robust open-source sanitizer that neutralizes XSS payloads.

   3.  Input Validation (Ensuring Correct Format):
      
          Validation checks data correctness — before using it in logic or sending to a server.
       
          When to Validate?
       
          * Before saving input to chrome.storage
          * Before sending input via chrome.runtime.sendMessage
          * Before calling any API
         
       1. Example: Validate an Email Address:

                function isValidEmail(email) {
                 const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                 return regex.test(email);
               }
               
               const email = "user@example.com";
               if (!isValidEmail(email)) {
                 alert("Invalid email");
               }
       2. Example: Validate Numeric Input (range):

                function isValidAge(age) {
                 return Number.isInteger(age) && age >= 18 && age <= 120;
               }

       3. Use JSON Schema for Complex Validation:

          For structured data (e.g., user settings), use a schema validator:

          Schema (userSettingsSchema.json):

                {
                 "type": "object",
                 "properties": {
                   "theme": { "type": "string", "enum": ["dark", "light"] },
                   "emailNotifications": { "type": "boolean" }
                 },
                 "required": ["theme"]
               }
                                    
          Validator (using ajv):

          bash:

                npm install ajv

          js:

                import Ajv from 'ajv';
               import schema from './userSettingsSchema.json';
               
               const ajv = new Ajv();
               const validate = ajv.compile(schema);
               
               const userSettings = {
                 theme: "dark",
                 emailNotifications: true
               };
               
               if (!validate(userSettings)) {
                 console.error(validate.errors);
               }
          
         4. Security Tips & Pitfalls:

               | Pitfall                               | Fix / Best Practice                         |
               | ------------------------------------- | ------------------------------------------- |
               | Using `innerHTML` with user input     | Always use `textContent` or a sanitizer     |
               | Accepting unvalidated JSON            | Use schema-based validation (e.g., AJV)     |
               | Saving raw input to storage           | Sanitize + validate before saving           |
               | Trusting input from `content scripts` | Validate all messages at the receiver       |
               | Not encoding URLs                     | Use `encodeURIComponent()` for query params |
               

         5.  Messaging Validation Example:
     

             Chrome extensions often use messaging between components (popup, background, etc.). Validate all data:

                   // background.js
                   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                     if (message.type === 'SAVE_DATA' && typeof message.payload === 'string') {
                       const clean = sanitizeInput(message.payload);
                       chrome.storage.local.set({ data: clean });
                     } else {
                       sendResponse({ error: 'Invalid input' });
                     }
                   });

         6. Recommended Libraries:
     
            | Purpose              | Library       | Notes                            |
            | -------------------- | ------------- | -------------------------------- |
            | Sanitization         | `DOMPurify`   | DOM XSS protection               |
            | Schema Validation    | `Ajv`         | JSON Schema 7+                   |
            | Type-safe validation | `Zod` / `Yup` | JS-first, great for TS           |
            | Regex checking       | Built-in      | Use for basic email, phone, etc. |

         7.  Example: Securely Handling a Form:
     

             html:

                   <form id="feedback-form">
                    <textarea id="feedback"></textarea>
                    <button type="submit">Send</button>
                  </form>
                         

             js:

                  document.getElementById('feedback-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const raw = document.getElementById('feedback').value;
                    const sanitized = DOMPurify.sanitize(raw);
                  
                    if (sanitized.length < 10) {
                      alert("Feedback too short");
                      return;
                    }
                  
                    chrome.storage.local.set({ feedback: sanitized });
                  });

             
 # 6. Secure Data Storage:

   1. Storage APIs in Chrome Extensions:

      Main Options:

      | API                    | Description                                               | Secure for sensitive data? |
      | ---------------------- | --------------------------------------------------------- | -------------------------- |
      | `chrome.storage.local` | Local storage (persistent, per user)                      | ✅ Yes (with caution)       |
      | `chrome.storage.sync`  | Synced across devices via Google account                  | ⚠️ Yes (not for secrets)   |
      | `localStorage`         | From web pages or content scripts (DOM-based)             | ❌ No (not secure)          |
      | IndexedDB              | Complex structured storage                                | ✅ Yes (less common)        |
      | Cookies                | Not recommended in extensions                             | ❌ No                       |
      | Native messaging       | Send/receive from a local app — highly secure but complex | ✅ Secure for advanced use  |
      
   2. Storing Data Securely:

      1. chrome.storage.local – Default and Most Secure API:
     
               // Save data
               chrome.storage.local.set({ theme: 'dark', token: 'abc123' });
               
               // Get data
               chrome.storage.local.get(['theme', 'token'], (result) => {
                 console.log(result.theme);
               });
      
         Notes:

         * Stored data is sandboxed to the extension
         * Not accessible from web pages or content scripts directly
         * Still visible in devtools (chrome-extension://...)
         * Should not store secrets in plain text

   3. Encrypting Sensitive Data:

      Chrome storage doesn’t encrypt values natively. To store tokens, user data, or secrets, encrypt before storing.

       Example: AES Encryption with crypto.subtle

      js:

            async function encryptData(key, data) {
              const enc = new TextEncoder().encode(data);
              const iv = crypto.getRandomValues(new Uint8Array(12));
            
              const encrypted = await crypto.subtle.encrypt(
                {
                  name: 'AES-GCM',
                  iv: iv
                },
                key,
                enc
              );
            
              return {
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encrypted))
              };
            }
            
            async function generateKey() {
              return await crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
              );
            }
      

      Use crypto.subtle.importKey if you want to persist a key between sessions (you'll need to save it securely as well).

      Save Encrypted Value:

      js:

            const key = await generateKey(); // or load a saved key
            const encrypted = await encryptData(key, 'my_secret_token');
            
            // Save encrypted token
            chrome.storage.local.set({ token: JSON.stringify(encrypted) });
      
      You must handle key management carefully — consider deriving it from a password or hardcoding an initialization key with constraints (less ideal).

   4. Validate Before Storage

      Before saving any user data:

      * Validate and sanitize it
      * Avoid storing unnecessary information

        Example:

        js:

              function isValidTheme(theme) {
                 return ['light', 'dark'].includes(theme);
               }
               
               const theme = 'dark';
               if (isValidTheme(theme)) {
                 chrome.storage.local.set({ theme });
               }

    
    
   5. Things To Avoid:

         | Mistake                                | Why It’s Bad                               |
         | -------------------------------------- | ------------------------------------------ |
         | Storing raw access tokens              | Leaked via devtools                        |
         | Using `localStorage`                   | Accessible from content scripts            |
         | Not sanitizing before saving           | Risk of DOM injection                      |
         | Using `chrome.storage.sync` for tokens | Could sync to other machines, insecure     |
         | Hardcoding secrets into JS files       | Exposed to anyone with the CRX or devtools |

 6. Best Practices Summary:

       | Practice                          | Description                                      |
       | --------------------------------- | ------------------------------------------------ |
       | Use `chrome.storage.local`        | Best for secure, local-only data                 |
       | Encrypt sensitive fields          | Use AES-GCM and `crypto.subtle` API              |
       | Validate input before saving      | Prevent storing garbage, XSS risk                |
       | Avoid `localStorage` entirely     | Not safe in extensions                           |
       | Use key derivation for encryption | Optional: derive keys from passphrases if needed |
       | Don’t expose secrets in popup UI  | Never populate secrets in DOM unnecessarily      |
   



