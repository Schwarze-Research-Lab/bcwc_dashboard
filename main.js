import './style.css';
import testCache from './testCache.json';
import Chart from 'chart.js/auto'
import * as d3 from 'd3-scale-chromatic'

let redcap = [];
let rangeDates = {
    start: "",
    end: "",
}
const site_map = {
    94: 'C',
    95: 'J',
    96: 'M',
    97: 'SI',
    98: 'P',
    99: 'WA',
    100: 'V',
    101: 'WV',
    999: 'Unknown',
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
    const content = document.getElementById("content");
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

    let data = getEnrollemntData();
    console.log(data);
    enrollment(document.getElementById('enrollmentSummary'), data);

    setInterval(() => {
        let start = document.getElementById('startDate').value;
        let end = document.getElementById('endDate').value;
        if (start != rangeDates.start || end != rangeDates.end) {
            siteEnrollmentTable(document.getElementById('siteEnrollmentTable'), data);
            rangeDates.start = start;
            rangeDates.end = end;
        }
    }, 500);
    siteEnrollmentTable(document.getElementById('siteEnrollmentTable'), data);
    timeSeriesEnrollment(document.getElementById('timeSeriesEnrollment'), data);
    document.getElementById('content').parentElement.classList.remove('hidden');
};

function enrollment(element, data) {

    // Build Summary Table
    const table = element.getElementsByTagName('table')[0];
    insert2colRow(table, "Screened", data.screened);
    insert2colRow(table, "Elligible", data.elligible);
    insert2colRow(table, "Enrolled", data.enrolled);
    insert2colRow(table, "Enrolled <sm>(30days)<sm>", data.last_30_enrolled);
    insert2colRow(table, "Study Age", Math.round(data.months_study_active, 1) + "<sm>months<sm>");

    // Default Color Options
    const colorScale = d3.interpolateRainbow;
    const colorRangeInfo = {
        colorStart: 0,
        colorEnd: 0.25,
        useEndAsStart: false,
    };

    // Generate the chart
    const labels = Object.keys(data.site).map(x => site_map[x]);
    const colors = interpolateColors(labels.length, colorScale, colorRangeInfo);
    const config = {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: Object.entries(data.site).map(x => x[1].enrolled),
                backgroundColor: colors,
                hoverOffset: 4
            }]
        },
    };

    // Paint to screen
    const canvas = element.getElementsByTagName('canvas')[0];
    new Chart(canvas, config);
}

function siteEnrollmentTable(element, data) {

    // Set up
    let cell;
    let cssTable = element.getElementsByClassName('grid')[0];
    cssTable.style.gridTemplateColumns = `repeat(${Object.values(site_map).length + 2}, minmax(0, 1fr))`;
    let start = document.getElementById('startDate').value || '2000-01-01';
    let end = document.getElementById('startDate').value || '3000-01-01';

    // Remove anything that was previously added
    var target = cssTable.getElementsByTagName("div"), index;
    for (index = target.length - 1; index >= 0; index--) {
        target[index].parentNode.removeChild(target[index]);
    }

    // Headers
    cell = document.createElement('div');
    cell.innerHTML = `<b></b>`;
    cssTable.appendChild(cell);
    Object.values(site_map).forEach(siteText => {
        cell = document.createElement('div');
        cell.innerHTML = `<b>${siteText}</b>`;
        cssTable.appendChild(cell);
    });
    cell = document.createElement('div');
    cell.innerHTML = `<b>Total</b>`;
    cssTable.appendChild(cell);

    // Populate table
    ["Screened", "Elligible", "Enrolled"].forEach(title => {
        cell = document.createElement('div');
        cell.innerHTML = `<b>${title}</b>`;
        cssTable.appendChild(cell);
        let rowTotal = 0;
        Object.entries(site_map).forEach(entry => {
            let [siteCode, siteText] = entry;
            cell = document.createElement('div');
            cell.innerHTML = `<b>0</b>`;
            if (data.site[siteCode]) {
                let tmp = 0;
                Object.entries(data.time_series).forEach(timeEntry => {
                    let [date, siteData] = timeEntry;
                    if (date >= start && date <= end && siteData[siteCode]) {
                        tmp += siteData[siteCode][title.toLowerCase()];
                    }
                });
                cell.innerHTML = `<b>${tmp || 0}</b>`;
                rowTotal += tmp || 0;
            }
            cssTable.appendChild(cell);
        });
        cell = document.createElement('div');
        cell.innerHTML = `<b>${rowTotal}</b>`;
        cssTable.appendChild(cell);
    });

}

function timeSeriesEnrollment(element, data) {

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

        if (!data.screen_datetime) {
            console.log('Skipped, no date listed');
            continue;
        }

        const month = data.screen_datetime.split('-').slice(0, 2).join('-');
        const date = data.screen_datetime.split(' ')[0];
        const screenSite = data.screen_site || 999;

        // Time series data Init to 0
        !(date in o.time_series) && (o.time_series[date] = {});
        !(o.time_series[date][screenSite]) && (o.time_series[date][screenSite] = {});
        !(o.time_series[date][screenSite].screened) && (o.time_series[date][screenSite].screened = 0);
        !(o.time_series[date][screenSite].enrolled > -1) && (o.time_series[date][screenSite].enrolled = 0);
        !(o.time_series[date][screenSite].elligible > -1) && (o.time_series[date][screenSite].elligible = 0);
        o.time_series[date][screenSite]['screened'] += 1

        // Site indexed data
        !(o.site[screenSite]) && (o.site[screenSite] = {});
        !(o.site[screenSite].screened) && (o.site[screenSite].screened = 0);
        !(o.site[screenSite].enrolled) && (o.site[screenSite].enrolled = 0);
        !(o.site[screenSite].months_enrolled) && (o.site[screenSite].months_enrolled = {});
        !(o.site[screenSite].date_of_first_screen) && (o.site[screenSite].date_of_first_screen = "3000-01-01");
        o.site[screenSite].screened += 1;

        if (data.screen_datetime < o.site[screenSite].date_of_first_screen) {
            o.site[screenSite].date_of_first_screen = data.screen_datetime;
        }

        // Enrolled into sutdy
        if (data.rescreen_me == "1") {
            o.enrolled += 1;
            o.time_series[date][screenSite]['enrolled'] += 1;

            const last30Days = ((new Date()).getTime() - (new Date(data.screen_datetime)).getTime()) < DAYS_30;
            if (last30Days) {
                o.last_30_enrolled += 1;
            }

            o.site[screenSite].enrolled += 1;
            !(o.month_enrolled[month]) && (o.month_enrolled[month] = 0);
            o.month_enrolled[month] += 1;
            !(o.site[screenSite].months_enrolled[month]) && (o.site[screenSite].months_enrolled[month] = 0);
            o.site[screenSite].months_enrolled[month] += 1;

            if (data.screen_datetime > (o.site[screenSite].most_recent_enrollment || "")) {
                o.site[screenSite].most_recent_enrollment = data.screen_datetime;
            }
        }

        // Last minute stuff
        if (["1", "2", "3"].includes(data.decision_final)) {
            o.elligible += 1;
            o.time_series[date][screenSite]['elligible'] += 1;
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

// Util Func - create an RBG color array for graphs
function interpolateColors(dataLength, colorScale, colorRangeInfo) {
    var { colorStart, colorEnd } = colorRangeInfo;
    var colorRange = colorEnd - colorStart;
    var intervalSize = colorRange / dataLength;
    var i, colorPoint;
    var colorArray = [];

    function calculatePoint(i, intervalSize, colorRangeInfo) {
        var { colorStart, colorEnd, useEndAsStart } = colorRangeInfo;
        return (useEndAsStart
            ? (colorEnd - (i * intervalSize))
            : (colorStart + (i * intervalSize)));
    }

    for (i = 0; i < dataLength; i++) {
        colorPoint = calculatePoint(i, intervalSize, colorRangeInfo);
        colorArray.push(colorScale(colorPoint));
    }

    return colorArray;
}

// Util Func - build a row with left and right col in table
function insert2colRow(table, left, right) {
    let row = table.insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    cell1.innerHTML = left;
    cell2.innerHTML = right;
}