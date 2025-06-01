// Custom feedback handler that doesn't require analytics
document.addEventListener("DOMContentLoaded", function() {
  // Find the feedback widget container
  const feedbackContainer = document.querySelector('.md-feedback');
  
  if (feedbackContainer) {
    // Find the feedback options
    const options = feedbackContainer.querySelectorAll('.md-feedback__option');
    
    options.forEach(option => {
      option.addEventListener('click', function(event) {
        event.preventDefault();
        
        // Get the rating value (1 = positive, 0 = negative)
        const rating = this.getAttribute('data-md-value');
        
        // Find all options and remove 'selected' class
        options.forEach(opt => opt.classList.remove('md-feedback__option--selected'));
        
        // Add 'selected' class to the clicked option
        this.classList.add('md-feedback__option--selected');
        
        // Show the note
        const note = this.querySelector('.md-feedback__note');
        if (note) {
          note.style.display = 'block';
        }
        
        // You can add additional logic here to save the feedback locally
        // or send it to a custom endpoint if needed
        console.log(`Feedback submitted: ${rating === '1' ? 'Positive' : 'Negative'}`);
        
        // Optional: You could store feedback in localStorage if you want to persist it
        const currentPath = window.location.pathname;
        const feedbackData = JSON.parse(localStorage.getItem('page_feedback') || '{}');
        feedbackData[currentPath] = rating;
        localStorage.setItem('page_feedback', JSON.stringify(feedbackData));
      });
    });
  }
});