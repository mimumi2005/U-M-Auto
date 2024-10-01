document.addEventListener('DOMContentLoaded', function () {
window.onscroll = function () {
    toggleScrollToTopButton();
  };
    // Correctly adding event listeners without calling the functions immediately
    document.getElementById('Log-out-button').addEventListener('click', LogOut);
    document.getElementById('scroll-to-top-btn').addEventListener('click', scrollToTop);

    const LogOutButton = document.getElementById("Log-out-button");

    LogOutButton.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            LogOut();
        }
    });
});
