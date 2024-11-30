document.addEventListener('DOMContentLoaded', function () {

  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling.nextElementSibling; // Answer element
        const divider = question.nextElementSibling; // Divider element
        const arrow = question.querySelector('.arrow'); // Arrow element

        const isActive = answer.classList.contains('active');

        // Close all answers and reset arrows
        document.querySelectorAll('.faq-answer').forEach(ans => ans.classList.remove('active'));
        document.querySelectorAll('.divider').forEach(div => div.classList.remove('active'));
        document.querySelectorAll('.arrow').forEach(arw => arw.classList.remove('rotate'));

        // Toggle current question's answer, divider, and arrow
        if (!isActive) {
            answer.classList.add('active');
            divider.classList.add('active');
            arrow.classList.add('rotate');
        }
    });
});



  const carouselElement = document.getElementById('servicesCarousel');
  const carouselInner = carouselElement.querySelector('.carousel-inner');
  const view = carouselInner.querySelector('.carousel-item');
  const items = view.querySelectorAll('.service-item');
  const prevButton = document.querySelector('.carousel-control-prev');
  const nextButton = document.querySelector('.carousel-control-next');
  const indicators = document.querySelectorAll('.carousel-indicators button');
  let currentIndex = 0;

  function updateCarousel() {
    const offset = -currentIndex * 34.115 ; // Calculate the offset for translateX
    view.style.transform = `translateX(${offset}%)`;
    indicators.forEach((indicator, index) => {
      if (index === Math.floor(currentIndex)) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }

  prevButton.addEventListener('click', function (event) {
    event.preventDefault();
    currentIndex = (currentIndex - 1 + items.length-2) % (items.length-2);
    updateCarousel();
  });

  nextButton.addEventListener('click', function (event) {
    event.preventDefault();
    currentIndex = (currentIndex + 1) % (items.length-2);
    updateCarousel();
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', function () {
      currentIndex = index ;
      updateCarousel();
    });
  });

  updateCarousel();

  // JavaScript to handle smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      if (this.getAttribute('href') === '#' || this.getAttribute('href') === '#servicesCarousel') {
        return; // Skip smooth scrolling if the href is exactly '#'
      }
      e.preventDefault();
      var targetElement = document.querySelector(this.getAttribute('href'));
      var targetOffset = targetElement.getBoundingClientRect().top + window.pageYOffset - 100;
      var duration = 1500; // Adjust duration as needed (in milliseconds)
      slowScrollTo(targetOffset, duration);
    });
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




