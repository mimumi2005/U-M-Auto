// CORE PROJECT JS
document.addEventListener("DOMContentLoaded", function () {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    link.href = '/images/Icon.png';
  } else {
    link.href = '/images/Icon2.png';
  }

  document.head.appendChild(link);
  window.onscroll = function () {
    toggleScrollToTopButton();
  };
  const languageLinks = document.querySelectorAll('#languageDropdownSelect .dropdown-item');
  const currentLanguageFlag = document.getElementById('currentLanguageFlag');

  setFlag(window.currentLanguage, currentLanguageFlag);

  languageLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const lang = this.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  languageLinks.forEach(item => {
    const lang = item.getAttribute('data-lang');
    if (lang === currentLanguage.toLowerCase()) {
      item.style.display = 'none';
    }
  });

  const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', scrollToTop);
  }

  const LogOutButton = document.getElementById("Log-out-button");
  if (LogOutButton) {
    LogOutButton.addEventListener('click', LogOut);
    LogOutButton.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        LogOut();
      }
    });
  }

  // Fetch user session data
  fetch('/api/getUserSession', { credentials: 'include' })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch user session data');
      return response.json();
    })
    .then(userSessionData => {
      const isLoggedIn = userSessionData.isLoggedIn;
      const isAdmin = userSessionData.isAdmin;
      const isWorker = userSessionData.isWorker;
      updateButtonVisibility(isLoggedIn, isAdmin, isWorker);
    })
    .catch(error => {
      console.error('Error fetching user session data:', error);
      updateButtonVisibility(false, false, false);
    });
});

// Function to update button visibility depending of login status
function updateButtonVisibility(isLoggedIn, isAdmin, isWorker) {
  if (isLoggedIn) {
    if (isAdmin) {
      document.getElementById('AdminMenu').classList.remove('nodisplay');
      document.getElementById('Statistics').classList.remove('nodisplay');
    }
    else {
      document.getElementById('AdminMenu').classList.add('nodisplay');
      document.getElementById('Statistics').classList.add('nodisplay');
    }
    if (isWorker) {
      document.getElementById('defaultNav').classList.add('nodisplay');
      document.getElementById('workerButton').classList.remove('nodisplay');
      document.getElementById('WorkerButtonDropDown').classList.remove('nodisplay');
    }
    else { document.getElementById('timeTableButton').classList.remove('nodisplay'); }
    document.getElementById('estimatorButton').classList.remove('nodisplay');
    document.getElementById('LogOutButton').classList.remove('nodisplay');
    document.getElementById('LoginButton').classList.add('nodisplay');

    if (document.getElementById('LoginP')) {
      document.getElementById('LoginP').classList.add('nodisplay');
    }
    if (document.getElementById('BookingP')) {
      document.getElementById('BookingP').classList.remove('nodisplay');
    }
    if (document.getElementById('PriceEstimator')) {
      document.getElementById('PriceEstimator').classList.remove('nodisplay');
    }
    if (document.getElementById('PriceEstimatorGuest')) {
      document.getElementById('PriceEstimatorGuest').classList.add('nodisplay');
    }

  }
  else {
    document.getElementById('timeTableButton').classList.add('nodisplay');
    document.getElementById('estimatorButton').classList.add('nodisplay');
    document.getElementById('LogOutButton').classList.add('nodisplay');
    document.getElementById('LoginButton').classList.remove('nodisplay');
    if (document.getElementById('LoginP')) {
      document.getElementById('LoginP').classList.remove('nodisplay');
    }
    if (document.getElementById('BookingP')) {
      document.getElementById('BookingP').classList.add('nodisplay');
    }
    if (document.getElementById('PriceEstimator')) {
      document.getElementById('PriceEstimator').classList.add('nodisplay');
    }
    if (document.getElementById('PriceEstimatorGuest')) {
      document.getElementById('PriceEstimatorGuest').classList.remove('nodisplay');
    }
  }
}
// SESSION RELATED
// Login main function
function loginUser(response) {
  setCookie('userData', response.UUID, 1);
  updateButtonVisibility();
  window.location.href = '/?loggedIn=true';
}

// LogOut main function
function LogOut() {
  fetch(`/auth/log-out`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      isLoggedIn = false;
      updateButtonVisibility();
      showSuccessAlert('Successfully logged out');

      setTimeout(function () {
        window.location.href = '/?loggedOut=true';
        window.setLanguage(window.currentLanguage);
      }, 200);
    })
    .catch(error => {
      alert(`Cannot connect to server: ${error}`);
    });
}

// SCROLLING FUNCTIONS
// Function to show to scroll to top button
function toggleScrollToTopButton() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 700) {
    document.getElementById("scroll-to-top-btn").style.display = 'flex';
  } else {
    document.getElementById("scroll-to-top-btn").style.display = 'none'
  }
}
// Scroll to top function
function scrollToTop() {
  const scrollToTopElement = document.documentElement || document.body;

  scrollToTopElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest'
  });
}

// Service page scroll into view
function slowScrollTo(targetOffset, duration) {
  var startPosition = window.pageYOffset;
  var startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    var timeElapsed = currentTime - startTime;
    var scrollAmount = Math.round(easeInOutQuad(timeElapsed, startPosition, targetOffset - startPosition, duration));
    window.scrollTo(0, scrollAmount);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  // Easing function - use easeInOutQuad for smooth acceleration and deceleration
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  requestAnimationFrame(animation);
}

// ALERTS AND POPUPS

// Function to display a success alert for the user
function showSuccessAlert(messageKey, callbackAfter) {
  // Gets the elements in the page
  const alertBox = document.getElementById('successAlert');
  const alertText = document.getElementById('successAlertMessage');

  if (alertBox && alertText) {
    // Adds the desired message to the element and displays it
    alertText.textContent = translate(messageKey);
    alertBox.classList.remove('nodisplay');

    setTimeout(() => {
      // After element has been shown optional callback (a function called after the alert)
      alertBox.classList.add('nodisplay');
      if (typeof callbackAfter === 'function') callbackAfter();
    }, 2000);
  }
}

// Function to display an error alert
function showErrorAlert(messageKey) {
  // Gets the elements in the page
  const alertBox = document.getElementById('errorAlert');
  const alertText = document.getElementById('errorAlertMessage');

  if (alertBox && alertText) {
    // Adds the message to the element and displays it
    alertText.textContent = translate(messageKey);
    alertBox.classList.remove('nodisplay');

    setTimeout(() => {
      // Hides it after 2 seconds
      alertBox.classList.add('nodisplay');
    }, 2000);
  }
}

// Show confirmation popup function
function showConfirmationPopup(descriptionHTML, confirmCallback) {
  const popup = document.getElementById('confirmationPopup');
  const popupContent = popup.querySelector('.popup-content'); // Get the content area
  const description = document.getElementById('confirmationDescription');
  const confirmButton = document.getElementById('confirmButton');
  const cancelButton = document.getElementById('cancelButton');

  description.innerHTML = descriptionHTML;

  // Show the popup
  popup.classList.remove('nodisplay');

  // Remove any previous click listeners on the confirm button
  const newConfirmButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

  // Confirm button: execute the callback and hide
  newConfirmButton.addEventListener('click', () => {
    popup.classList.add('nodisplay');
    if (typeof confirmCallback === 'function') {
      confirmCallback();
    }
  });

  // Cancel button: just hide the popup
  cancelButton.addEventListener('click', () => {
    popup.classList.add('nodisplay');
  });

  // Clicking outside the content area: hide the popup
  popup.addEventListener('click', (event) => {
    if (!popupContent.contains(event.target)) {
      popup.classList.add('nodisplay');
    }
  });
}

// Function to set cookie with JSON data
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
}

// Function to get the cookie value
const getCookie = (name) => {
  const cookieValue = (document.cookie.match('(^|;\\s*)' + name + '=([^;]*)') || [])[2];
  return cookieValue ? decodeURIComponent(cookieValue) : null;
}

// TRANSLATION RELATED 

// Function to tranlsate the project info part 
async function extractAndTranslateCarInfo(text) {
  // Split lines and trim
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  const translatedLines = await Promise.all(lines.map(async (line, index) => {
    // Translate the additional info part dynamically, since it was written by user
    if (index === 5)
      return `    ${await translateDynamicFromEnglish(line)}`;
    // Default translate the first line
    else if (index === 0)
      return translate(line);
    // The rest translate with gap or newline
    else {
      const labelPart = line.includes('-') ? line.split('-')[0].trim() : line;
      const textAfterHyphen = line.split('-')[1] != null ? '- ' + line.split('-')[1].trim() : '';
      return (index === 1 || index === 2 || index === 3) ? `    ${translate(labelPart)}${textAfterHyphen}` : `\n${translate(labelPart)}${textAfterHyphen}`;
    }

  }));

  // Join back with newline separator
  const finalText = translatedLines.join('\n');
  return finalText;
}

// Function to translate text from english dynamically
async function translateDynamicFromEnglish(text, responseLang = window.currentLanguage) {
  if (responseLang === 'en') return text;
  if (text === '') return text;

  // Checks if it already exists in local dynamic translations
  const existingTranslation = await getTranslationFromDynamic(text, responseLang);
  if (existingTranslation) {
    return existingTranslation;
  }

  // if not found, call the translation API
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=EN|${responseLang}&de=umautodarbnica@inbox.lv`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const translatedText = data.responseData.translatedText;

    // Save the new translation in your dynamic locale file
    await saveTranslationToDynamic(text, translatedText, responseLang);

    return translatedText;
  } catch (err) {
    console.error('Error with MyMemory API:', err);
    return text;
  }
}

// Function to translate text to english dynamically
async function translateDynamicToEnglish(text, sourceLang = window.currentLanguage) {
  if (sourceLang === 'en') return text;
  if (text === '') return text;
  
  const existingTranslation = await getTranslationFromDynamic(text, 'en');
  if (existingTranslation) {
    return existingTranslation;
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|EN&de=umautodarbnica@inbox.lv`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const translatedText = data.responseData.translatedText;

    await saveTranslationToDynamic(text, translatedText, 'en');

    return translatedText;
  } catch (err) {
    console.error('Error with MyMemory API:', err);
    return text;
  }
}


// Setting language function
function setLanguage(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.location.href = url.toString();
  window.currentLanguage = lang;
}

// Function to set the flag based on the current language
function setFlag(lang, flag) {
  flag.className = 'flag-icon';
  switch (lang) {
    case 'en':
      flag.classList.add('flag-icon-gb');
      break;
    case 'lv':
      flag.classList.add('flag-icon-lv');
      break;
    case 'de':
      flag.classList.add('flag-icon-de');
      break;
    case 'ru':
      flag.classList.add('flag-icon-ru');
      break;
    default:
      flag.className = '';
  }
}

// FETCH
// Function that removes a project from delayed aka, finishes the project, since if it was marked as delayed the default project finish doesnt work (as in when end date projection is reached)
function finishDelayedProject(idProjects) {
  fetch('/worker/remove-delayed', {
    method: 'POST',
    headers: {
      'CSRF-Token': csrfToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      idProjects: idProjects
    }),
  })
    .then(response => response.json())
    .then(data => {
      if (data[0]) {
        displayProjectDataForWorker(data);
      }
    })
    .catch(error => {
      console.error('Error:', error);

    });
}

// Fetch dynamic translations
async function getTranslationFromDynamic(key, lang) {
  const translations = await fetch(`/translation/get-translation/${encodeURIComponent(key)}`);
  if (translations.ok) {
    const data = await translations.json();
    return data?.[lang] || null;
  }
  return null;
}

// Fetch for adding the dynamic translation to files
async function saveTranslationToDynamic(key, translation, lang) {
  await fetch('/translation/add-dynamic-translation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, translation, lang })
  });
}

// Default translate for static page text
function translate(key) {
  const lang = window.currentLanguage || "en";
  const value = window.translations?.[lang]?.[key];

  if (!value) {
    // Notify server to write missing key
    fetch("/api/add-missing-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    return key;
  }

  return value;
}
