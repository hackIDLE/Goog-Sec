// Script to ensure contributor links go to GitHub profiles
// OPTIMIZED: Reduced MutationObserver scope for better performance
document.addEventListener('DOMContentLoaded', function() {
  // Function to fix contributor links
  function fixContributorLinks() {
    // Find all contributor links that have mailto: protocol
    const contributorLinks = document.querySelectorAll('.md-source-file__fact a[href^="mailto:"]');

    contributorLinks.forEach(link => {
      // Extract username from email (assuming format username@domain.com)
      const email = link.getAttribute('href').replace('mailto:', '');
      const username = email.split('@')[0];

      // Replace with GitHub profile link
      link.setAttribute('href', `https://github.com/${username}`);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');

      // Keep the display name but remove email if shown
      if (link.textContent.includes('@')) {
        link.textContent = link.textContent.split('@')[0];
      }
    });
  }

  // Run once when page loads
  fixContributorLinks();

  // PERFORMANCE FIX: Only observe the content area, not entire body
  // Also use debouncing to reduce excessive calls
  const contentArea = document.querySelector('.md-content');
  if (contentArea) {
    let timeoutId;
    const observer = new MutationObserver(mutations => {
      // Debounce: only run after changes stop for 100ms
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Only check if contributor links were actually added
        const hasNewLinks = mutations.some(mutation =>
          Array.from(mutation.addedNodes).some(node =>
            node.nodeType === 1 &&
            (node.matches('.md-source-file__fact') || node.querySelector('.md-source-file__fact'))
          )
        );
        if (hasNewLinks) {
          fixContributorLinks();
        }
      }, 100);
    });

    // Only observe the content area with minimal options
    observer.observe(contentArea, {
      childList: true,
      subtree: true
    });
  }
});