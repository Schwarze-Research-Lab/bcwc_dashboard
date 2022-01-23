import './style.css';
import testCache from './testCache.json';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as d3 from 'd3-scale-chromatic';

let redcap = [];
let rangeDates = {
    dropDownChange: false,
    start: "",
    end: "",
}

// MDY toLocalDate config
const mdy_date = { year: 'numeric', month: '2-digit', day: '2-digit' };

// Study Status Options and Colors
const study_statuses = ["Screened", "Elligible", "Enrolled", "Declined", "Excluded"];
const status_colors = ['#FF8B00', '#1668BD', '#349C55', '#74226C', '#BA3B46'];

// Mapping for site info between various codes
const site_map = {
    94: {
        'short': 'C',
        'display': 'Col'
    },
    95: {
        'short': 'J',
        'display': 'JHU'
    },
    96: {
        'short': 'M',
        'display': 'MCW'
    },
    97: {
        'short': 'SI',
        'display': 'Si'
    },
    98: {
        'short': 'P',
        'display': 'Pitt'
    },
    99: {
        'short': 'WA',
        'display': 'WA'
    },
    100: {
        'short': 'V',
        'display': 'Vt'
    },
    101: {
        'short': 'WV',
        'display': 'WV'
    },
    999: {
        'short': 'UNK',
        'display': 'Unknown'
    },
};

// Default Color Options for Sites
let site_colors;
const colorScale = d3.interpolateRainbow;
const colorRangeInfo = {
    colorStart: 0,
    colorEnd: 1,
    useEndAsStart: false,
};


init();

// Main build for page elements (Nav and data load)
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

    // Setup button clicks on nav, not used currently
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

// Main Build function for dashboard
function buildDashboard() {

    // Page hashes and other static content are defined in HTML

    // Finish color config
    site_colors = interpolateColors(Object.keys(site_map).length, colorScale, colorRangeInfo);

    // Get Data and build summary
    let data = getEnrollemntData();
    buildSummary(document.getElementById('enrollmentSummary'), data);

    // Setup date dropdown
    buildDateDropdown();
    document.getElementById('datedropdown').dispatchEvent(new Event("change"));

    // Initial build out
    buildTable(document.getElementById('siteEnrollmentTable'), data);
    buildBarChart(document.getElementById('siteEnrollmentTable'), data);
    buildLineChart(document.getElementById('siteLineChart'), data);

    // Check on date changes 
    setInterval(() => {
        let start = document.getElementById('startDate').value;
        let end = document.getElementById('endDate').value;
        if (start != rangeDates.start || end != rangeDates.end) {
            if (rangeDates.dropDownChange) {
                rangeDates.dropDownChange = false;
            } else {
                document.getElementById('datedropdown').getElementsByTagName("select")[0].value = "";
            }
            buildTable(document.getElementById('siteEnrollmentTable'), data);
            buildBarChart(document.getElementById('siteEnrollmentTable'), data);
            rangeDates.start = start;
            rangeDates.end = end;
        }
    }, 500);

    // Make content Visible
    document.getElementById('content').parentElement.classList.remove('hidden');
    document.getElementById('loadingScreen').classList.add('hidden');
};

// Build out options for the date drop down and setup the onChange event
function buildDateDropdown() {

    const today = (new Date()).toLocaleDateString('fr-CA');
    const dropDown = document.getElementById('datedropdown').getElementsByTagName("select")[0];
    dropDown.value = "";

    document.getElementById('datedropdown').addEventListener("change", () => {

        dropDown.classList.remove("text-gray-400");
        rangeDates.dropDownChange = true;

        if (dropDown.value == "") {
            dropDown.classList.add("text-gray-400");
            document.getElementById('startDate').value = "";
            document.getElementById('endDate').value = "";
        } else if (dropDown.value.length == 2 && parseInt(dropDown.value) > 0) {
            let start = new Date();
            start.setDate(start.getDate() - parseInt(dropDown.value));
            start = start.toLocaleDateString('fr-CA');
            document.getElementById('startDate').value = start;
            document.getElementById('endDate').value = today;
        } else if (dropDown.value == "month") {
            let start = new Date();
            start.setDate(1);
            start = start.toLocaleDateString('fr-CA');
            document.getElementById('startDate').value = start;
            document.getElementById('endDate').value = today;
        } else {
            const [year, month] = dropDown.value.split('-');
            const start = (new Date(year, month - 1, 1)).toLocaleDateString('fr-CA');
            const end = (new Date(year, month, 0)).toLocaleDateString('fr-CA');
            document.getElementById('startDate').value = start;
            document.getElementById('endDate').value = end;
        }
    });

    for (let i = 1; i <= 6; i++) {
        let option = document.createElement("option");
        option.value = "-1";
        let tmpDate = new Date();
        tmpDate.setMonth(tmpDate.getMonth() - i);
        option.text = tmpDate.toLocaleDateString("en-US", { year: "numeric", month: "long" }).split(' ').reverse().join(' ');
        option.value = tmpDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit" }).split('/').reverse().join('-');
        dropDown.appendChild(option);
    }

}

// Build the top most summary with site-wide statistic and pie chart
function buildSummary(element, data) {

    // Build Summary Table
    const table = element.getElementsByTagName('table')[0];
    insert2colRow(table, "Screened", data.screened);
    insert2colRow(table, "Elligible", data.elligible);
    insert2colRow(table, "Enrolled", data.enrolled);
    insert2colRow(table, "Enrolled <sm>(30days)<sm>", data.last_30_enrolled);
    insert2colRow(table, "Declined", data.declined);
    insert2colRow(table, "Excluded", data.excluded);
    insert2colRow(table, "Study Age", Math.round(data.months_study_active, 1) + "<sm>months<sm>");

    // Generate the chart
    const labels = Object.keys(data.site).map(x => site_map[x].display);
    const config = {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: Object.entries(data.site).map(x => x[1].enrolled),
                backgroundColor: site_colors,
                hoverOffset: 4
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            plugins: {
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        let p = (value * 100 / sum).toFixed(0);
                        return p < 5 ? "" : p + "%";
                    },
                    color: '#ffffff',
                },
            }
        }
    };

    // Paint to screen
    const canvas = element.getElementsByTagName('canvas')[0];
    new Chart(canvas, config);
}

// Build the table that is time range dependent
function buildTable(element, data) {

    // Set up
    let cell;
    let cssTable = element.getElementsByClassName('grid')[0];
    const offset = window.location.hostname == 'localhost' ? 2 : 1;
    cssTable.style.gridTemplateColumns = `repeat(${Object.keys(site_map).length + offset}, minmax(0, 1fr))`;
    let start = document.getElementById('startDate').value || '2000-01-01';
    let end = document.getElementById('endDate').value || '3000-01-01';

    // Remove anything that was previously added
    var target = cssTable.getElementsByTagName("div"), index;
    for (index = target.length - 1; index >= 0; index--) {
        target[index].parentNode.removeChild(target[index]);
    }

    // Headers
    cell = document.createElement('div');
    cell.innerHTML = `<b></b>`;
    cssTable.appendChild(cell);
    const labels = Object.keys(data.site).map(x => site_map[x].display);
    Object.values(site_map).forEach(siteInfo => {
        if (siteInfo.short == "UNK" && window.location.hostname != "localhost") {
            return;
        }
        let siteText = siteInfo.display;
        cell = document.createElement('div');
        cell.innerHTML = `<b>${siteText}</b>`;
        cssTable.appendChild(cell);
    });
    cell = document.createElement('div');
    cell.innerHTML = `<b>Total</b>`;
    cssTable.appendChild(cell);

    // Populate table
    study_statuses.forEach(title => {
        cell = document.createElement('div');
        cell.classList.add('overflow-hidden');
        cell.innerHTML = `<b>${title}</b>`;
        cssTable.appendChild(cell);
        let rowTotal = 0;
        Object.entries(site_map).forEach(entry => {
            let [siteCode, siteInfo] = entry;
            if (siteCode == 999 && window.location.hostname != "localhost") {
                return;
            }
            cell = document.createElement('div');
            cell.innerHTML = title == "Screened" ? `<b class="text-red-600">0</b>` : `<b>0</b>`;
            if (data.site[siteCode]) {
                let tmp = 0;
                Object.entries(data.time_series).forEach(timeEntry => {
                    let [date, siteData] = timeEntry;
                    if (date >= start && date <= end && siteData[siteCode]) {
                        tmp += siteData[siteCode][title.toLowerCase()];
                    }
                });
                if (title == "Screened" && tmp <= 15) {
                    cell.innerHTML = `<b class="text-red-600">${tmp || 0}</b>`;
                } else {
                    cell.innerHTML = `<b>${tmp || 0}</b>`;
                }
                rowTotal += tmp || 0;
            }
            cssTable.appendChild(cell);
        });
        cell = document.createElement('div');
        cell.innerHTML = `<b>${rowTotal}</b>`;
        cssTable.appendChild(cell);
    });

    // Add on the % Elligible row
    cell = document.createElement('div');
    cell.classList.add('overflow-hidden');
    cell.innerHTML = `<b>% Elligible</b>`;
    cssTable.appendChild(cell);
    const rowSize = Object.keys(site_map).length + (window.location.hostname == 'localhost' ? 2 : 1);
    const grid = document.getElementById("siteEnrollmentTable").getElementsByClassName("grid")[0].getElementsByTagName('div');
    Object.entries(site_map).forEach((entry, index) => {
        let [siteCode, siteInfo] = entry;
        cell = document.createElement('div');
        cell.innerHTML = `<b></b>`;
        if (siteCode != 999 && data.site[siteCode]) {
            let numerator = grid[(rowSize * 2) + 1 + index].textContent;
            let denominator = grid[rowSize + 1 + index].textContent;
            if (denominator == 0) {
                numerator = 0;
                denominator = 1;
            }
            cell.innerHTML = `<b>${(100 * (numerator / denominator)).toFixed(2)}%</b>`;
        }
        if (siteInfo.short != "UNK" || window.location.hostname == "localhost") {
            cssTable.appendChild(cell);
        }
    });
    cell = document.createElement('div');
    cell.innerHTML = `<b>${(100 * ((grid[(rowSize * 3) - 1].textContent) / (grid[(rowSize * 2) - 1].textContent))).toFixed(2)}%</b>`;
    cssTable.appendChild(cell);

    // Populate unique rows of the table with time insensative info
    let borderClass = ['border-t', 'border-gray-400'];
    const staticConfig = [
        {
            title: "Recent Enroll",
            varName: "most_recent_enrollment"
        },
        {
            title: "Recent Decline",
            varName: "most_recent_decline"
        },
        {
            title: "Time Active",
            varName: "weeks_active"
        }
    ];
    staticConfig.forEach(rowConfig => {
        cell = document.createElement('div');
        cell.classList.add(...borderClass);
        cell.classList.add('overflow-hidden');
        cell.innerHTML = `<b>${rowConfig.title}</b>`;
        cssTable.appendChild(cell);
        Object.entries(site_map).forEach(entry => {
            let [siteCode, siteInfo] = entry;
            cell = document.createElement('div');
            cell.classList.add(...borderClass);
            cell.innerHTML = `<b></b>`;
            if (siteCode != 999 && data.site[siteCode] && data.site[siteCode][rowConfig.varName]) {
                if (['most_recent_enrollment', ''].includes(rowConfig.varName)) {
                    cell.innerHTML = `<b>${(new Date(data.site[siteCode]['most_recent_enrollment'])).toLocaleDateString("en-US", mdy_date)}</b>`;
                }
                else {
                    cell.innerHTML = `<b>${Math.round(data.site[siteCode][rowConfig.varName])}<sm>weeks</sm></b>`;
                }
            }
            if (siteInfo.short != "UNK" || window.location.hostname == "localhost") {
                cssTable.appendChild(cell);
            }
        });
        cell = document.createElement('div');
        cell.classList.add(...borderClass);
        cell.innerHTML = `<b></b>`;
        cssTable.appendChild(cell);
        borderClass = [];
    });
}

// Build the primary bar chart that is time range dependent
function buildBarChart(element, data) {

    const start = document.getElementById('startDate').value || '2000-01-01';
    const end = document.getElementById('endDate').value || '3000-01-01';

    // Generate the chart
    const labels = Object.keys(data.site).map(x => site_map[x].display);
    let dataSet = [];

    // For the 3 status types
    study_statuses.forEach((title, index) => {

        let innerData = [];

        // For each site
        Object.entries(site_map).forEach(entry => {

            let [code, siteInfo] = entry;
            let count = 0;

            // For each date
            Object.entries(data.time_series).forEach(timeEntry => {
                let [date, siteData] = timeEntry;
                if (siteData[code] && (date >= start) && (date <= end)) {
                    count += siteData[code][title.toLowerCase()];
                }
            });
            innerData.push(count);
        });

        dataSet.push({
            data: innerData,
            backgroundColor: status_colors[index],
            label: title
        });

    });

    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: dataSet
        },
        options: {
            responsive: true,
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            }
        }
    };

    // Paint to screen
    const container = element.getElementsByTagName('canvas')[0].parentElement;
    element.getElementsByTagName('canvas')[0].remove();
    const canvas = document.createElement('canvas');
    container.appendChild(canvas)
    new Chart(canvas, config);

}


function buildLineChart(element, data) {

    let dataSets = [];

    Object.entries(site_map).forEach((entry, index) => {
        let [code, siteInfo] = entry;

        dataSets.push({
            label: siteInfo.display,
            data: [],
            fille: false,
            borderColor: site_colors[index],
            tension: 0.1
        })
    });

    let dt = new Date(data.date_of_first_screen);
    dt.setDate(1);
    let stop = new Date();
    stop = stop.getTime();
    let labels = [];
    while (dt.getTime() < stop) {
        labels.push(dt.toLocaleDateString("en-US", mdy_date));
        dt.setDate(dt.getDate() + 7);
    }

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: dataSets
        },
    };

    // Paint to screen
    const canvas = element.getElementsByTagName('canvas')[0];
    new Chart(canvas, config);

}

// Fetch and organize all data
function getEnrollemntData() {

    const DAYS_30 = (30 * 24 * 60 * 60 * 1000);
    const MONTH_1 = (30.4 * 24 * 60 * 60 * 1000);
    const WEEK_1 = (7 * 24 * 60 * 60 * 1000);

    let o = {
        time_series: {},
        screened: Object.keys(redcap).length,
        enrolled: 0,
        elligible: 0,
        declined: 0,
        excluded: 0,
        last_30_enrolled: 0,
        month_enrolled: {},
        site: {
            // Site
            // - most_recent_enrollment
            // - most_recent_decline
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
        !(o.time_series[date][screenSite].declined > -1) && (o.time_series[date][screenSite].declined = 0);
        !(o.time_series[date][screenSite].excluded > -1) && (o.time_series[date][screenSite].excluded = 0);
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

            // if (data.screen_datetime > (o.site[screenSite].most_recent_decline || "")) {
            //     o.site[screenSite].most_recent_decline = data.screen_datetime;
            // }
        }

        // Last minute stuff
        if (["1", "2", "3"].includes(data.decision_final)) {
            o.elligible += 1;
            o.time_series[date][screenSite]['elligible'] += 1;
            if (data.decision_final == "2") {
                o.declined += 1;
                o.time_series[date][screenSite]['declined'] += 1;
            }
        }

        if (data.screen_datetime < o.date_of_first_screen) {
            o.date_of_first_screen = data.screen_datetime;
        }

        if (data.screen_neph_exclude == "1") {
            o.excluded += 1;
            o.time_series[date][screenSite]['excluded'] += 1;
        }
    }

    // Time ellapsed from start of study
    const now = (new Date()).getTime();
    o.months_study_active = (now - (new Date(o.date_of_first_screen)).getTime()) / MONTH_1;
    for (const studySite in o.site) {
        o.site[studySite].weeks_active = (now - (new Date(o.site[studySite].date_of_first_screen)).getTime()) / WEEK_1;
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