import './style.css';
import testCache from './testCache.json';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ChartZoom from 'chartjs-plugin-zoom';
import * as d3 from 'd3-scale-chromatic';
Chart.register(ChartZoom);

const support = "Adam Nunez at adam.nunez@ctri.wisc.edu"
let redcap = [];
let rangeDates = {
    dropDownChange: false,
    start: "",
    end: "",
}

// MDY toLocalDate config
const mdy_date = { year: 'numeric', month: '2-digit', day: '2-digit' };

// Study Status Options
const study_status = {
    screened: {
        name: "Screen Fail",
        color: "#FF8B00",
    },
    elligible: {
        name: "Elligible",
        color: "#1668BD",
    },
    elligiblena: {
        name: "Elligible (NA)",
        color: "#666666",
    },
    enrolled: {
        name: "Enrolled",
        color: "#349C55",
    },
    declined: {
        name: "Declined",
        color: "#74226C",
    },
    excluded: {
        name: "Excluded",
        color: "#BA3B46",
    },
};

// Mapping for site info between various codes
const sites = {
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
                if (data.error) {
                    const textArea = document.getElementById('loadingScreen').getElementsByTagName('div')[0];
                    textArea.classList.remove('animate-bounce');
                    textArea.innerHTML = `Unable to fetch data from Redcap, the server may be down or there may be a permissions 
                    issue with the project. Reach out to ${support} for assistance if the issue persists.<br> Error: ${data.error}`;
                    return;
                }
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

    // Finish color config
    site_colors = interpolateColors(Object.keys(sites).length, colorScale, colorRangeInfo);

    // Get Data and build summary
    let data = getEnrollemntData();
    buildSummary(document.getElementById('enrollmentSummary'), data);
    buildFailureSummary(document.getElementById('failureSummary'), data);

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
    insert2colRow(table, "Screen Fail", data.screened);
    insert2colRow(table, "Elligible", data.elligible);
    insert2colRow(table, "Elligible <sm>(Not approached)</sm>", data.elligiblena);
    insert2colRow(table, "Enrolled", data.enrolled);
    insert2colRow(table, "Enrolled <sm>(30days)<sm>", data.last_30_enrolled);
    insert2colRow(table, "Declined", data.declined);
    insert2colRow(table, "Excluded", data.excluded);
    insert2colRow(table, "Study Age", Math.round(data.months_study_active, 1) + "<sm>months<sm>");

    // Generate the chart
    const labels = Object.keys(data.site).map(x => sites[x].display);
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

function buildFailureSummary(element, data) {

    // Generate the chart
    const config = {
        type: 'doughnut',
        data: {
            labels: Object.keys(data.site).map(x => sites[x].display),
            datasets: [{
                label: "Not Approached",
                data: Object.entries(data.site).map(x => x[1].elligiblena),
                backgroundColor: site_colors,
                hoverOffset: 4
            }, {
                label: "Declined",
                data: Object.entries(data.site).map(x => x[1].declined),
                backgroundColor: site_colors,
                hoverOffset: 4
            }, {
                label: "Excluded",
                data: Object.entries(data.site).map(x => x[1].excluded),
                backgroundColor: site_colors,
                hoverOffset: 4
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        let p = (value * 100 / sum).toFixed(0);
                        return p < 1 ? "" : p + "%";
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
    let cssTable = document.getElementById('siteTable');
    const offset = window.location.hostname == 'localhost' ? 2 : 1;
    cssTable.style.gridTemplateColumns = `repeat(${Object.keys(sites).length + offset}, minmax(0, 1fr))`;
    let start = document.getElementById('startDate').value || '2000-01-01';
    let end = document.getElementById('endDate').value || '3000-01-01';

    // Remove anything that was previously added (i.e. date range change)
    var target = cssTable.getElementsByTagName("div"), index;
    for (index = target.length - 1; index >= 0; index--) {
        target[index].parentNode.removeChild(target[index]);
    }

    // Headers
    cell = document.createElement('div');
    cell.innerHTML = `<b></b>`;
    cssTable.appendChild(cell);
    const labels = Object.keys(data.site).map(x => sites[x].display);
    Object.values(sites).forEach(siteInfo => {
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

    // Populate Study Status Rows, gather t0 and t1 stats as we go
    let surveyComplete = {
        t0: {},
        t1: {},
    };
    Object.entries(study_status).forEach(entry => {

        let [statusCode, statusInfo] = entry;
        cell = document.createElement('div');
        cell.classList.add('overflow-hidden');
        cell.innerHTML = `<b>${statusInfo.name}</b>`;
        cssTable.appendChild(cell);
        let rowTotal = 0;

        Object.entries(sites).forEach(entry => {
            let [siteCode, siteInfo] = entry;
            if (siteCode == 999 && window.location.hostname != "localhost") {
                return;
            }
            cell = document.createElement('div');
            cell.innerHTML = statusCode == "screened" ? `<b class="text-red-600">0</b>` : `<b>0</b>`;
            if (data.site[siteCode]) {
                let tmp = 0;
                Object.entries(data.time_series).forEach(timeEntry => {
                    let [date, siteData] = timeEntry;
                    if (date >= start && date <= end && siteData[siteCode]) {
                        tmp += siteData[siteCode][statusCode];
                        surveyComplete.t0[siteCode] = surveyComplete.t0[siteCode] || 0;
                        surveyComplete.t0[siteCode] += siteData[siteCode]['t0complete'] || 0;
                        surveyComplete.t1[siteCode] = surveyComplete.t1[siteCode] || 0;
                        surveyComplete.t1[siteCode] += siteData[siteCode]['t1complete'] || 0;
                    }
                });
                if (statusCode == "screened" && tmp <= 15) {
                    cell.innerHTML = `<b class="text-red-600">${tmp}</b>`;
                } else {
                    cell.innerHTML = `<b>${tmp}</b>`;
                }
                rowTotal += tmp;
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
    const rowSize = Object.keys(sites).length + (window.location.hostname == 'localhost' ? 2 : 1);
    const grid = document.getElementById("siteTable").getElementsByTagName('div');
    Object.entries(sites).forEach((entry, index) => {
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

    // T0 and T1 Complete Rows
    ["T0 Complete", "T1 Complete"].forEach(title => {

        cell = document.createElement('div');
        cell.classList.add('overflow-hidden');
        cell.innerHTML = `<b>${title}</b>`;
        cssTable.appendChild(cell);

        let total = 0;
        Object.entries(sites).forEach(entry => {
            let [siteCode, siteInfo] = entry;
            cell = document.createElement('div');
            cell.innerHTML = `<b></b>`;
            if (siteCode != 999 && data.site[siteCode]) {
                let tmp = surveyComplete[title.split(' ')[0].toLowerCase()][siteCode] || 0 / Object.keys(study_status).length;
                cell.innerHTML = `<b>${tmp}</b>`;
                total += tmp;
            }
            if (siteInfo.short != "UNK" || window.location.hostname == "localhost") {
                cssTable.appendChild(cell);
            }
        });

        cell = document.createElement('div');
        cell.innerHTML = `<b>${total}</b>`;
        cssTable.appendChild(cell);
    })


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
            varName: "months_active"
        }
    ];
    staticConfig.forEach(rowConfig => {
        cell = document.createElement('div');
        cell.classList.add(...borderClass);
        cell.classList.add('overflow-hidden');
        cell.innerHTML = `<b>${rowConfig.title}</b>`;
        cssTable.appendChild(cell);
        Object.entries(sites).forEach(entry => {
            let [siteCode, siteInfo] = entry;
            cell = document.createElement('div');
            cell.classList.add(...borderClass);
            cell.innerHTML = `<b></b>`;
            if (siteCode != 999 && data.site[siteCode] && data.site[siteCode][rowConfig.varName]) {
                if (['most_recent_enrollment', 'most_recent_decline'].includes(rowConfig.varName)) {
                    cell.innerHTML = `<b>${(new Date(data.site[siteCode][rowConfig.varName])).toLocaleDateString("en-US", mdy_date)}</b>`;
                }
                else {
                    cell.innerHTML = `<b>${Math.round(data.site[siteCode][rowConfig.varName])}<sm>months</sm></b>`;
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
    const labels = Object.keys(data.site).map(x => sites[x].display);
    let dataSet = [];

    // For the 3 status types
    Object.entries(study_status).forEach(entry => {

        let [statusCode, statusInfo] = entry;
        let innerData = [];

        // For each site
        Object.entries(sites).forEach(entry => {

            let [code, siteInfo] = entry;
            let count = 0;

            // For each date
            Object.entries(data.time_series).forEach(timeEntry => {
                let [date, siteData] = timeEntry;
                if (siteData[code] && (date >= start) && (date <= end)) {
                    count += siteData[code][statusCode];
                }
            });
            innerData.push(count);
        });

        dataSet.push({
            data: innerData,
            backgroundColor: statusInfo.color,
            label: statusInfo.name
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

    // Set start to X days past the first screen
    const windowSize = 14;
    let dt = new Date(data.date_of_first_screen);
    dt.setDate(dt.getDate() + windowSize);

    // Generate the datasets by week, build out labels as we go
    let timeData = {};
    let labels = [];
    let start = new Date(dt);
    let stop = new Date();
    stop = stop.getTime();

    while (dt.getTime() < stop) {

        let daysPast = Math.round((dt.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        labels.push(dt.toLocaleDateString("en-US", mdy_date));

        Object.entries(sites).forEach(entry => {

            let [code, siteInfo] = entry;
            if (window.location.hostname != "localhost" && code == 999) {
                return;
            }
            timeData[code] = timeData[code] || {};

            let avg = 0;
            for (let i = 0; i < windowSize; i++) {

                let date = new Date(dt);
                date.setDate(date.getDate() - i);
                let ymd = date.toISOString().split('T')[0];
                if (data.time_series[ymd] && data.time_series[ymd][code] && data.time_series[ymd][code].screened) {
                    avg += data.time_series[ymd][code].screened;
                }

            }
            timeData[code][daysPast] = avg / windowSize;

        });

        dt.setDate(dt.getDate() + 1);
    }

    // Reorganize all the datasets for sites
    let dataSets = [];
    Object.entries(sites).forEach((entry, index) => {
        let [code, siteInfo] = entry;

        if (window.location.hostname != "localhost" && code == 999) {
            return;
        }

        dataSets.push({
            label: siteInfo.display,
            data: Object.values(timeData[code]),
            fill: (index == 0) ? true : '-1',
            borderColor: site_colors[index],
            backgroundColor: site_colors[index].replace(')', ', 0.65)'),
            tension: 0.4
        });
    });

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: dataSets
        },
        plugins: [ChartZoom],
        options: {
            elements: {
                point: {
                    radius: 1.5
                }
            },
            scales: {
                y: {
                    stacked: true,
                    ticks: {
                        stepSize: 5
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 20
                    }
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                    },
                    zoom: {
                        drag: {
                            enabled: false,
                        },
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true,
                        },
                        mode: 'x',
                    }
                }
            }
        },
    };

    // Paint to screen
    const canvas = element.getElementsByTagName('canvas')[0];
    let chart = new Chart(canvas, config);

    // Setup reset button
    element.getElementsByTagName('button')[0].onclick = () => {
        chart.zoomScale('x', { min: labels.length - 91, max: labels.length - 1 });
    };

    // Setup default zoom
    element.getElementsByTagName('button')[0].onclick();
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
        elligiblena: 0,
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
            // - elligiblena
            // - excluded
            // - declined
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
        !(o.time_series[date][screenSite].elligiblena > -1) && (o.time_series[date][screenSite].elligiblena = 0);
        !(o.time_series[date][screenSite].declined > -1) && (o.time_series[date][screenSite].declined = 0);
        !(o.time_series[date][screenSite].excluded > -1) && (o.time_series[date][screenSite].excluded = 0);
        !(o.time_series[date][screenSite].t0complete > -1) && (o.time_series[date][screenSite].t0complete = 0);
        !(o.time_series[date][screenSite].t1complete > -1) && (o.time_series[date][screenSite].t1complete = 0);
        o.time_series[date][screenSite]['screened'] += 1

        // Site indexed data
        !(o.site[screenSite]) && (o.site[screenSite] = {});
        !(o.site[screenSite].screened) && (o.site[screenSite].screened = 0);
        !(o.site[screenSite].enrolled) && (o.site[screenSite].enrolled = 0);

        !(o.site[screenSite].elligiblena) && (o.site[screenSite].elligiblena = 0);
        !(o.site[screenSite].excluded) && (o.site[screenSite].excluded = 0);
        !(o.site[screenSite].declined) && (o.site[screenSite].declined = 0);

        !(o.site[screenSite].months_enrolled) && (o.site[screenSite].months_enrolled = {});
        !(o.site[screenSite].date_of_first_screen) && (o.site[screenSite].date_of_first_screen = "3000-01-01");
        o.site[screenSite].screened += 1;

        if (data.screen_datetime < o.site[screenSite].date_of_first_screen) {
            o.site[screenSite].date_of_first_screen = data.screen_datetime;
        }

        if (data.rescreen_me == "1") {
            o.enrolled += 1;
            o.time_series[date][screenSite]['enrolled'] += 1;

            const last30Days = ((new Date()).getTime() - (new Date(data.first_appt_date)).getTime()) < DAYS_30;
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

            if (data.facit_t0_complete == "1") {
                o.time_series[date][screenSite]['t0complete'] += 1;
            }

            if (data.pt_t1_qoc_complete == "1") {
                o.time_series[date][screenSite]['t1complete'] += 1;
            }

        }

        // Last minute stuff
        if (["1", "2", "3"].includes(data.decision_final) || (data.screen_approach_method && data.screen_approach_method == "3")) {
            o.elligible += 1;
            o.time_series[date][screenSite]['elligible'] += 1;
            if (data.decision_final && data.decision_final == "2") {
                o.declined += 1;
                o.time_series[date][screenSite]['declined'] += 1;
                o.site[screenSite].declined += 1;
            }
            if (data.screen_approach_method && data.screen_approach_method == "3") {
                o.elligiblena += 1;
                o.time_series[date][screenSite]['elligiblena'] += 1;
                o.site[screenSite].elligiblena += 1;
            }
            if (data.first_appt_date > (o.site[screenSite].most_recent_decline || "")) {
                o.site[screenSite].most_recent_decline = data.first_appt_date;
            }
        }

        if (data.screen_datetime < o.date_of_first_screen) {
            o.date_of_first_screen = data.screen_datetime;
        }

        if (data.screen_neph_exclude == "1" || data.screen_rc_exclude == "1") {
            o.excluded += 1;
            o.time_series[date][screenSite]['excluded'] += 1;
            o.site[screenSite].excluded += 1;
        }
    }

    // Time ellapsed from start of study
    const now = (new Date()).getTime();
    o.months_study_active = (now - (new Date(o.date_of_first_screen)).getTime()) / MONTH_1;
    for (const studySite in o.site) {
        o.site[studySite].weeks_active = (now - (new Date(o.site[studySite].date_of_first_screen)).getTime()) / WEEK_1;
        o.site[studySite].months_active = (now - (new Date(o.site[studySite].date_of_first_screen)).getTime()) / MONTH_1;
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
