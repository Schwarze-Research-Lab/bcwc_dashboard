import './style.css';
import testCache from './testCache.json';
import Chart from 'chart.js/auto'

let redcap = [];
let content = document.getElementById("content");
const site_map = {
    999: 'Unknown',
    94: 'C',
    95: 'J',
    96: 'M',
    97: 'SI',
    98: 'P',
    99: 'WA',
    100: 'V',
    101: 'WV'
};
init();

function init() {

    // Load data from php proxy (or local test cache)
    if (window.location.hostname != "localhost") {
        fetch("proxy.php")
            .then(response => response.json())
            .then(data => {
                redcap = data;
                buildCards();
            });
    } else {
        redcap = testCache;
        buildCards();
    }

    // Setup mobile button
    document.getElementById("mobile-button").onclick = () => {
        document.getElementById("mobile-menu").classList.toggle("hidden");
    };

    // Setup Nav
    const allButtons = document.querySelectorAll("#nav-bar a, #nav-bar-mobile a");
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
            const activeBtns = document.querySelectorAll(`a[href='${el.target.hash}']`);
            activeBtns.forEach(el => {
                el.classList.add(...activeClass);
                el.classList.remove(...defaultClass);
            });
            // Show correct cells on page
            content.childNodes.forEach(el => { if (el.style) el.style.display = "none" });
            content.querySelectorAll(`[data-hash=${el.target.hash.substr(1)}]`).forEach(el => el.style.display = "");
        };
    });
};

function buildCards() {

    const config = [
        {
            title: "Example",
            text: " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur purus id augue vehicula, dapibus luctus nulla sodales. Proin suscipit elit id nibh vehicula elementum. Etiam faucibus tortor eget fringilla dignissim. Mauris id interdum tortor. Sed turpis ipsum, ullamcorper sit amet lorem nec, convallis tempor massa. Cras vestibulum euismod lacus quis porttitor. Proin non pharetra massa, euismod euismod ligula. Aenean elementum urna in nisi ullamcorper facilisis. Suspendisse molestie enim vitae purus auctor auctor sed a nibh. Phasellus efficitur, urna vitae varius dapibus, eros neque finibus nisl, vitae tincidunt massa odio nec tellus. Mauris et interdum lectus. Pellentesque placerat aliquam velit. Phasellus ornare turpis ac eros sollicitudin, nec efficitur odio sodales. ",
            page: "dash"
        },
        {
            title: "Example 2",
            text: " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur purus id augue vehicula, dapibus luctus nulla sodales. Proin suscipit elit id nibh vehicula elementum. Etiam faucibus tortor eget fringilla dignissim. Mauris id interdum tortor. Sed turpis ipsum, ullamcorper sit amet lorem nec, convallis tempor massa. Cras vestibulum euismod lacus quis porttitor. Proin non pharetra massa, euismod euismod ligula. Aenean elementum urna in nisi ullamcorper facilisis. Suspendisse molestie enim vitae purus auctor auctor sed a nibh. Phasellus efficitur, urna vitae varius dapibus, eros neque finibus nisl, vitae tincidunt massa odio nec tellus. Mauris et interdum lectus. Pellentesque placerat aliquam velit. Phasellus ornare turpis ac eros sollicitudin, nec efficitur odio sodales. ",
            page: "one"
        },
        {
            title: "Enrollment",
            text: "",
            page: "dash",
            fn: enrollment
        }
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
        if (setting.fn)
            setting.fn(newest);
    });

    // Delete template
    content.children[0].remove();
};

function enrollment(element) {
    let enro = getEnrollemntData();
    const data = {
        labels: [
            'Red',
            'Blue',
            'Yellow'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
        }]
    };
    const config = {
        type: 'doughnut',
        data: data,
    };
    let canvas = document.createElement('canvas');
    let container = element.getElementsByTagName('div')[1];
    container.appendChild(canvas);
    let chart = new Chart(canvas, config);
}

function getEnrollemntData() {

    const DAYS_30 = (30 * 24 * 60 * 60 * 1000);
    const MONTH_1 = (30.4 * 24 * 60 * 60 * 1000);

    let o = {
        total_enrolled: 0,
        total_elligible: 0,
        last_30_enrolled: 0,
        month_enrolled: {},
        site_month_enrolled: {},
        site_most_recent_enrollment: {},
        site_enrollment: {},
        date_of_first_screen: "3000-01-01"
    }

    for (const id in redcap) {

        const data = redcap[id];

        if (data.rescreen_me == "1") {
            o.total_enrolled += 1;

            const last30Days = ((new Date()).getTime() - (new Date(data.screen_datetime)).getTime()) < DAYS_30;
            if (last30Days) {
                o.last_30_enrolled += 1;
            }

            const month = data.screen_datetime.split('-').slice(0, 2).join('-');
            if (!o.month_enrolled[month]) {
                o.month_enrolled[month] = 0;
            }
            o.month_enrolled[month] += 1;

            if (!o.site_enrollment[data.screen_site]) {
                o.site_enrollment[data.screen_site] = 0;
                o.site_month_enrolled[data.screen_site] = {};
            }
            o.site_enrollment[data.screen_site] += 1;

            if (!o.site_month_enrolled[data.screen_site][month]) {
                o.site_month_enrolled[data.screen_site][month] = 0;
            }
            o.site_month_enrolled[data.screen_site][month] += 1;

            if (data.screen_datetime > (o.site_most_recent_enrollment[data.screen_site] || "")) {
                o.site_most_recent_enrollment[data.screen_site] = data.screen_datetime;
            }
        }

        if (["1", "2", "3"].includes(data.decision_final)) {
            o.total_elligible += 1;
        }

        if (data.screen_datetime < o.date_of_first_screen) {
            o.date_of_first_screen = data.screen_datetime;
        }
    }

    o.months_study_active = ((new Date()).getTime() - (new Date(o.date_of_first_screen)).getTime()) / MONTH_1;
    return o;
}
