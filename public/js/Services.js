document.addEventListener('DOMContentLoaded', function () {
  // Extract the 'scrollTo' parameter from the URL
  const params = new URLSearchParams(window.location.search);
  const scrollToId = params.get('scrollTo');

  // If the parameter exists, find the element and scroll to it
  if (scrollToId) {
    const targetElement = document.getElementById(scrollToId);
    if (targetElement) {
      var targetOffset = targetElement.getBoundingClientRect().top -25;
      var duration = 2000; // Adjust duration as needed (in milliseconds)
      slowScrollTo(targetOffset, duration);
    }
  }

  // JavaScript to handle smooth scrolling for links on the same page
  document.querySelectorAll('a[href^="?"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const targetId = href.split('?scrollTo=')[1];
      if (targetId) {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          var targetOffset = targetElement.getBoundingClientRect().top -25;
          var duration = 2000; // Adjust duration as needed (in milliseconds)
          slowScrollTo(targetOffset, duration);
        }
      }
    });
  });


  // Function to handle the scroll event
  function handleScroll() {
    var elements = document.querySelectorAll('.fade-in-hidden');
    elements.forEach(function (element) {
      if (isInViewport(element)) {
        element.classList.add('fade-in');
        element.classList.remove('fade-in-hidden');
      }
    });
  }

  // Check for the 'sessionEnded' query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const sessionEnded = urlParams.get('sessionEnded');
  const unauthorizedAccess = urlParams.get('unauthorizedAccess')
  if (sessionEnded) {
    document.getElementById('session-message').classList.remove('nodisplay');
  }
  if (unauthorizedAccess) {
    document.getElementById('unauthorizedAccess').classList.remove('nodisplay');
  }

  // Add scroll event listener
  document.addEventListener('scroll', handleScroll);

});


// Scroll event
// Function to check if an element is in the viewport
function isInViewport(element) {
  var rect = element.getBoundingClientRect();
  var threshold = 0.7; // Adjust this value to set the trigger threshold
  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) * threshold &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) * threshold
  );
}
