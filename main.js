import './style.css';
//import proxyURL from './proxy.php';

//let data = fetch("proxy.php");
let content = document.getElementById("content");

// Setup mobile button
document.getElementById("mobile-button").onclick = () => {
    document.getElementById("mobile-menu").classList.toggle("hidden");
};

// Setup Nav
let allButtons = document.querySelectorAll("#nav-bar a, #nav-bar-mobile a");
const activeClass = ["bg-gray-900", "text-white"];
const defaultClass = ["text-gray-300", "hover:bg-gray-700", "hover:text-white"];
allButtons.forEach(btn => {
    btn.onclick = el => {
        // Style all butons to normal
        allButtons.forEach(el => {
            el.classList.remove(...activeClass);
            el.classList.add(...defaultClass);
        });
        // Find the active buttons (mobile + normal) and style
        let activeBtns = document.querySelectorAll(`a[href='${el.target.hash}']`);
        activeBtns.forEach(el => {
            el.classList.add(...activeClass);
            el.classList.remove(...defaultClass);
        });
        // Show correct cells on page
        content.childNodes.forEach(el => { if (el.style) el.style.display = "none" });
        content.querySelectorAll(`[data-hash=${el.target.hash.substr(1)}]`).forEach(el => el.style.display = "");
    };
});

// Data Display
let config = [
    {
        title: "Example",
        text: "Hello world! This is an example cell.",
        page: "dash"
    },
    {
        title: "Example 2",
        text: "Hello world! This is an example cell.",
        page: "one"
    }, {}, {}, {}, {}
];

config.forEach(setting => {
    content.appendChild(content.children[0].cloneNode(true));
    content.children[content.children.length - 1]
    let newest = content.children[content.children.length - 1];
    if (setting.title)
        newest.querySelector('h2').textContent = setting.title;
    if (setting.text)
        newest.querySelector('p').textContent = setting.text;
    if (setting.page)
        newest.setAttribute("data-hash", setting.page);
});

// Delete template
content.children[0].remove();