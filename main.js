import './style.css';
import testCache from './testCache.json';
import Chart from 'chart.js/auto'
import * as d3 from 'd3-scale-chromatic'

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
                buildDashboard();
            });
    } else {
        redcap = testCache;
        buildDashboard();
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

function buildDashboard() {

    // Page hashes and other static content are defined in HTML
    enrollment(document.getElementById('enrollmentSummary'));

};

function enrollment(element) {
    let enro = getEnrollemntData();
    console.log(enro);

    // Build Summary Table
    let table = element.getElementsByTagName('table')[0];
    insert2colRow(table, "Screened", enro.screened);
    insert2colRow(table, "Elligible", enro.elligible);
    insert2colRow(table, "Enrolled", enro.enrolled);
    insert2colRow(table, "Enrolled <sm>(30days)<sm>", enro.last_30_enrolled);
    insert2colRow(table, "Study Age", Math.round(enro.months_study_active, 1) + "<sm>months<sm>");

    // Default Color Options
    const colorScale = d3.interpolateRainbow;
    const colorRangeInfo = {
        colorStart: 0,
        colorEnd: 1,
        useEndAsStart: false,
    };

    // Generate the chart
    const labels = Object.keys(enro.site).map(x => site_map[x]);
    const colors = interpolateColors(labels.length, colorScale, colorRangeInfo);
    const config = {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: Object.entries(enro.site).map(x => x[1].enrolled),
                backgroundColor: colors,
                hoverOffset: 4
            }]
        },
    };

    // Paint to screen
    let canvas = element.getElementsByTagName('canvas')[0];
    let chart = new Chart(canvas, config);
}

function getEnrollemntData() {

    const DAYS_30 = (30 * 24 * 60 * 60 * 1000);
    const MONTH_1 = (30.4 * 24 * 60 * 60 * 1000);
    const WEEK_1 = (7 * 24 * 60 * 60 * 1000);

    let o = {
        time_series: {},
        screened: Object.keys(redcap).length,
        enrolled: 0,
        elligible: 0,
        last_30_enrolled: 0,
        month_enrolled: {},
        site: {
            // Site
            // - most_recent_enrollment
            // - screened
            // - enrolled
            // - weeks_active
            // - months_enrolled
            // - date_of_first_screen
        },
        date_of_first_screen: "3000-01-01"
    }

    for (const id in redcap) {

        const data = redcap[id];
        const month = data.screen_datetime.split('-').slice(0, 2).join('-');
        const date = data.screen_datetime.split(' ')[0];

        // Time series data Init to 0
        !(date in o.time_series) && (o.time_series[date] = {});
        !(o.time_series[date][data.screen_site]) && (o.time_series[date][data.screen_site] = {});
        !(o.time_series[date][data.screen_site].screened) && (o.time_series[date][data.screen_site].screened = 0);
        !(o.time_series[date][data.screen_site].enrolled > -1) && (o.time_series[date][data.screen_site].enrolled = 0);
        !(o.time_series[date][data.screen_site].elligible > -1) && (o.time_series[date][data.screen_site].elligible = 0);
        o.time_series[date][data.screen_site]['screened'] += 1

        // Site indexed data
        !(o.site[data.screen_site]) && (o.site[data.screen_site] = {});
        !(o.site[data.screen_site].screened) && (o.site[data.screen_site].screened = 0);
        !(o.site[data.screen_site].enrolled) && (o.site[data.screen_site].enrolled = 0);
        !(o.site[data.screen_site].months_enrolled) && (o.site[data.screen_site].months_enrolled = {});
        !(o.site[data.screen_site].date_of_first_screen) && (o.site[data.screen_site].date_of_first_screen = "3000-01-01");
        o.site[data.screen_site].screened += 1;

        if (data.screen_datetime < o.site[data.screen_site].date_of_first_screen) {
            o.site[data.screen_site].date_of_first_screen = data.screen_datetime;
        }

        // Enrolled into sutdy
        if (data.rescreen_me == "1") {
            o.enrolled += 1;
            o.time_series[date][data.screen_site]['enrolled'] += 1;

            const last30Days = ((new Date()).getTime() - (new Date(data.screen_datetime)).getTime()) < DAYS_30;
            if (last30Days) {
                o.last_30_enrolled += 1;
            }

            o.site[data.screen_site].enrolled += 1;
            !(o.month_enrolled[month]) && (o.month_enrolled[month] = 0);
            o.month_enrolled[month] += 1;
            !(o.site[data.screen_site].months_enrolled[month]) && (o.site[data.screen_site].months_enrolled[month] = 0);
            o.site[data.screen_site].months_enrolled[month] += 1;

            if (data.screen_datetime > (o.site[data.screen_site].most_recent_enrollment || "")) {
                o.site[data.screen_site].most_recent_enrollment = data.screen_datetime;
            }
        }

        // Last minute stuff
        if (["1", "2", "3"].includes(data.decision_final)) {
            o.elligible += 1;
            o.time_series[date][data.screen_site]['elligible'] += 1;
        }

        if (data.screen_datetime < o.date_of_first_screen) {
            o.date_of_first_screen = data.screen_datetime;
        }
    }

    // Time ellapsed from start of study
    const now = (new Date()).getTime();
    o.months_study_active = (now - (new Date(o.date_of_first_screen)).getTime()) / MONTH_1;
    for (const studySite in o.site) {
        o.site[studySite].weeks_active = (now - (new Date(o.date_of_first_screen)).getTime()) / WEEK_1;
    }
    return o;
}

function calculatePoint(i, intervalSize, colorRangeInfo) {
    var { colorStart, colorEnd, useEndAsStart } = colorRangeInfo;
    return (useEndAsStart
        ? (colorEnd - (i * intervalSize))
        : (colorStart + (i * intervalSize)));
}

function interpolateColors(dataLength, colorScale, colorRangeInfo) {
    var { colorStart, colorEnd } = colorRangeInfo;
    var colorRange = colorEnd - colorStart;
    var intervalSize = colorRange / dataLength;
    var i, colorPoint;
    var colorArray = [];

    for (i = 0; i < dataLength; i++) {
        colorPoint = calculatePoint(i, intervalSize, colorRangeInfo);
        colorArray.push(colorScale(colorPoint));
    }

    return colorArray;
}

function insert2colRow(table, left, right) {
    let row = table.insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    cell1.innerHTML = left;
    cell2.innerHTML = right;
}