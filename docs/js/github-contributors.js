// Script to ensure contributor links go to GitHub profiles
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
  
  // Also run when the DOM might change (for single-page apps)
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        fixContributorLinks();
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
});