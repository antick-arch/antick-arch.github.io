document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector("nav button");
    const menu = document.querySelector("nav .menu");
    menuButton.addEventListener("click", () => {
        menu.classList.toggle("show");
    });

    const text = "Neutron Knights - Quantum Warriors, Navigators of the Unknown";
    const textContainer = document.querySelector(".page2 .animated-text");
    text.split("").forEach((char, index) => {
        const span = document.createElement("span");
        span.textContent = char;
        textContainer.appendChild(span);
    });
});
