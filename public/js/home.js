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
    const offset = -currentIndex * 34.115; // Calculate the offset for translateX
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
    currentIndex = (currentIndex - 1 + items.length - 3) % (items.length - 3);
    updateCarousel();
  });

  nextButton.addEventListener('click', function (event) {
    event.preventDefault();
    currentIndex = (currentIndex + 1) % (items.length - 2);
    updateCarousel();
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', function () {
      currentIndex = index;
      updateCarousel();
    });

    updateCarousel();

    // Show  alert if the URL contains a specific path
    const pathname = window.location.pathname;
    if (pathname.includes('/ResetPassword')) {
      showSuccessAlert('Reset token is invalid or expired');
    }

    // Check for query parameters and show alerts accordingly
    const urlParams = new URLSearchParams(window.location.search);
    const sessionEnded = urlParams.get('sessionEnded');
    const unauthorizedAccess = urlParams.get('unauthorizedAccess');
    const loggedOut = urlParams.get('loggedOut');
    const loggedIn = urlParams.get('loggedIn');
    switch (true) {
      case !!sessionEnded:
        showSuccessAlert('Session ended');
        break;
      case !!unauthorizedAccess:
        showSuccessAlert('Unauthorized access');
        break;
      case !!loggedOut:
        showSuccessAlert('Successfully logged out');
        break;
      case !!loggedIn:
        showSuccessAlert('Successfully logged in');
        break;
    }

    if (loggedOut || loggedIn || sessionEnded || unauthorizedAccess) {
      history.replaceState(null, '', window.location.pathname);
    }
  });
});