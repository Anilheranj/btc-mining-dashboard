/*
    BTC / MINING
    V2 — LIVE BITCOIN DATA
*/

const API_URL =
    "https://api.coingecko.com/api/v3/simple/price" +
    "?ids=bitcoin" +
    "&vs_currencies=usd" +
    "&include_market_cap=true" +
    "&include_24hr_vol=true" +
    "&include_24hr_change=true" +
    "&include_24hr_high=true" +
    "&include_24hr_low=true";


// ==========================
// ELEMENTS
// ==========================

const clock = document.getElementById("clock");


// ==========================
// CLOCK
// ==========================

function updateClock() {

    if (!clock) return;

    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    clock.textContent =
        `${hours}:${minutes}:${seconds}`;
}

updateClock();

setInterval(updateClock, 1000);


// ==========================
// FORMATTERS
// ==========================

function formatUSD(value) {

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(value);
}


function formatCompact(value) {

    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2
    }).format(value);
}


function formatPercent(value) {

    const sign = value >= 0 ? "+" : "";

    return `${sign}${value.toFixed(2)}%`;
}


// ==========================
// LOAD BITCOIN DATA
// ==========================

async function loadBitcoinData() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                `API error: ${response.status}`
            );
        }

        const data = await response.json();

        const btc = data.bitcoin;

        updateDashboard(btc);

        console.log("Bitcoin data updated:", btc);

    } catch (error) {

        console.error(
            "Unable to load Bitcoin data:",
            error
        );

        showOfflineState();
    }
/*
    BTC / MINING
    V2.1 — LIVE MARKET + INTERACTIVE CHART
*/


// ==========================================
// CONFIG
// ==========================================

const API_BASE =
    "https://api.coingecko.com/api/v3";

const COIN_ID = "bitcoin";


// ==========================================
// DOM
// ==========================================

const elements = {

    clock: document.getElementById("clock"),

    liveText: document.getElementById("liveText"),

    systemText: document.getElementById("systemText"),

    btcPrice: document.getElementById("btcPrice"),

    priceChange: document.getElementById("priceChange"),

    btcHigh: document.getElementById("btcHigh"),

    btcLow: document.getElementById("btcLow"),

    marketCap: document.getElementById("marketCap"),

    volume: document.getElementById("volume"),

    lastUpdate: document.getElementById("lastUpdate"),

    chart: document.getElementById("priceChart"),

    chartLine: document.getElementById("chartLine"),

    chartArea: document.getElementById("chartArea"),

    chartLoading: document.getElementById("chartLoading"),

    labels: [

        document.getElementById("label1"),

        document.getElementById("label2"),

        document.getElementById("label3"),

        document.getElementById("label4"),

        document.getElementById("label5")

    ]

};


// ==========================================
// STATE
// ==========================================

let currentDays = 1;

let currentChartData = [];

let refreshTimer = null;


// ==========================================
// CLOCK
// ==========================================

function updateClock() {

    const now = new Date();

    const hours =
        String(now.getHours()).padStart(2, "0");

    const minutes =
        String(now.getMinutes()).padStart(2, "0");

    const seconds =
        String(now.getSeconds()).padStart(2, "0");

    elements.clock.textContent =
        `${hours}:${minutes}:${seconds}`;
}

updateClock();

setInterval(updateClock, 1000);


// ==========================================
// FORMATTERS
// ==========================================

function formatUSD(value) {

    return new Intl.NumberFormat("en-US", {

        style: "currency",

        currency: "USD",

        maximumFractionDigits:
            value >= 1000 ? 0 : 2

    }).format(value);
}


function formatCompactUSD(value) {

    return new Intl.NumberFormat("en-US", {

        notation: "compact",

        maximumFractionDigits: 2

    }).format(value);
}


function formatPercent(value) {

    const sign =
        value >= 0 ? "+" : "";

    return `${sign}${value.toFixed(2)}%`;
}


function formatTime(timestamp) {

    return new Date(timestamp)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
}


function formatDate(timestamp) {

    return new Date(timestamp)
        .toLocaleDateString([], {
            month: "short",
            day: "numeric"
        });
}


// ==========================================
// API — CURRENT MARKET
// ==========================================

async function fetchMarketData() {

    const url =
        `${API_BASE}/simple/price` +
        `?ids=${COIN_ID}` +
        `&vs_currencies=usd` +
        `&include_market_cap=true` +
        `&include_24hr_vol=true` +
        `&include_24hr_change=true` +
        `&include_24hr_high=true` +
        `&include_24hr_low=true`;


    const response =
        await fetch(url, {
            cache: "no-store"
        });


    if (!response.ok) {

        throw new Error(
            `Market API error: ${response.status}`
        );
    }


    return response.json();
}


// ==========================================
// API — HISTORICAL DATA
// ==========================================

async function fetchChartData(days) {

    const params =
        new URLSearchParams({

            vs_currency: "usd",

            days: String(days),

            ...(days <= 1
                ? {}
                : { interval: "daily" })

        });


    const url =
        `${API_BASE}/coins/${COIN_ID}/market_chart?${params}`;


    const response =
        await fetch(url, {
            cache: "no-store"
        });


    if (!response.ok) {

        throw new Error(
            `Chart API error: ${response.status}`
        );
    }


    return response.json();
}


// ==========================================
// UPDATE MARKET UI
// ==========================================

function updateMarketUI(data) {

    const btc =
        data.bitcoin;


    elements.btcPrice.textContent =
        formatUSD(btc.usd);


    elements.btcPrice.classList.remove(
        "loading-text"
    );


    elements.priceChange.textContent =
        formatPercent(
            btc.usd_24h_change
        );


    elements.priceChange.classList.toggle(
        "negative",
        btc.usd_24h_change < 0
    );


    elements.priceChange.classList.toggle(
        "positive",
        btc.usd_24h_change >= 0
    );


    elements.btcHigh.textContent =
        formatUSD(
            btc.usd_24h_high
        );


    elements.btcLow.textContent =
        formatUSD(
            btc.usd_24h_low
        );


    elements.marketCap.textContent =
        formatCompactUSD(
            btc.usd_market_cap
        );


    elements.volume.textContent =
        formatCompactUSD(
            btc.usd_24h_vol
        );


    elements.lastUpdate.textContent =
        new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
}


// ==========================================
// DRAW CHART
// ==========================================

function drawChart(prices) {

    if (!prices || prices.length < 2) {

        throw new Error(
            "Not enough chart data."
        );
    }


    currentChartData = prices;


    const width = 1000;

    const height = 300;

    const padding = 8;


    const values =
        prices.map(point => point[1]);


    const min =
        Math.min(...values);


    const max =
        Math.max(...values);


    const range =
        max - min || 1;


    const points =
        prices.map((point, index) => {

            const x =
                padding +
                (index / (prices.length - 1)) *
                (width - padding * 2);


            const y =
                height -
                padding -
                ((point[1] - min) / range) *
                (height - padding * 2);


            return {
                x,
                y
            };

        });


    const linePath =
        points
            .map((point, index) => {

                return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;

            })
            .join(" ");


    const first =
        points[0];


    const last =
        points[points.length - 1];


    const areaPath =
        `${linePath}
        L ${last.x.toFixed(2)} ${height}
        L ${first.x.toFixed(2)} ${height}
        Z`;


    elements.chartLine.setAttribute(
        "d",
        linePath
    );


    elements.chartArea.setAttribute(
        "d",
        areaPath
    );


    updateChartLabels(prices);


    elements.chartLoading.classList.add(
        "hidden"
    );
}


// ==========================================
// CHART LABELS
// ==========================================

function updateChartLabels(prices) {

    const length =
        prices.length;


    const positions = [
        0,
        0.25,
        0.5,
        0.75,
        0.999
    ];


    positions.forEach(
        (position, index) => {

            const dataIndex =
                Math.min(
                    length - 1,
                    Math.floor(
                        position * length
                    )
                );


            const timestamp =
                prices[dataIndex][0];


            if (currentDays <= 1) {

                elements.labels[index]
                    .textContent =
                    index === 4
                        ? "NOW"
                        : formatTime(timestamp);

            } else {

                elements.labels[index]
                    .textContent =
                    index === 4
                        ? "NOW"
                        : formatDate(timestamp);
            }

        }
    );
}


// ==========================================
// LOAD CHART
// ==========================================

async function loadChart(days) {

    elements.chartLoading.classList.remove(
        "hidden"
    );


    try {

        const data =
            await fetchChartData(days);


        drawChart(
            data.prices
        );


    } catch (error) {

        console.error(
            "Chart loading failed:",
            error
        );


        elements.chartLoading.textContent =
            "CHART DATA UNAVAILABLE";
    }
}


// ==========================================
// LOAD ALL MARKET DATA
// ==========================================

async function loadDashboard() {

    try {

        setConnectionState(
            "CONNECTING"
        );


        const marketData =
            await fetchMarketData();


        updateMarketUI(
            marketData
        );


        await loadChart(
            currentDays
        );


        setConnectionState(
            "LIVE"
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        setConnectionState(
            "OFFLINE"
        );
    }
}


// ==========================================
// CONNECTION STATE
// ==========================================

function setConnectionState(state) {

    elements.liveText.textContent =
        state;


    elements.systemText.textContent =
        state;


    const liveStatus =
        document.querySelector(
            ".live-status"
        );


    if (state === "OFFLINE") {

        liveStatus.classList.add(
            "offline"
        );

    } else {

        liveStatus.classList.remove(
            "offline"
        );
    }
}


// ==========================================
// RANGE BUTTONS
// ==========================================

const rangeButtons =
    document.querySelectorAll(
        ".range-btn"
    );


rangeButtons.forEach(button => {

    button.addEventListener(
        "click",
        async () => {

            rangeButtons.forEach(
                item => {
                    item.classList.remove(
                        "active"
                    );
                }
            );


            button.classList.add(
                "active"
            );


            currentDays =
                Number(
                    button.dataset.days
                );


            await loadChart(
                currentDays
            );
        }
    );

});


// ==========================================
// NAVIGATION
// ==========================================

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            navItems.forEach(nav => {

                nav.classList.remove(
                    "active"
                );

            });


            item.classList.add(
                "active"
            );

        }
    );

});


// ==========================================
// AUTO REFRESH
// ==========================================

// Market data refresh

function startRefresh() {

    if (refreshTimer) {

        clearInterval(
            refreshTimer
        );
    }


    refreshTimer =
        setInterval(
            async () => {

                try {

                    const marketData =
                        await fetchMarketData();


                    updateMarketUI(
                        marketData
                    );


                    setConnectionState(
                        "LIVE"
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                    setConnectionState(
                        "OFFLINE"
                    );
                }

            },
            60 * 1000
        );
}


// ==========================================
// START
// ==========================================

loadDashboard();

startRefresh();
}


// ==========================
// UPDATE DASHBOARD
// ==========================

function updateDashboard(btc) {

    const price = document.querySelector(".price");
    const positive = document.querySelector(".positive");

    const metaValues =
        document.querySelectorAll(".price-meta strong");

    const metricValues =
        document.querySelectorAll(".metric-card strong");


    // BTC PRICE

    if (price) {

        price.textContent =
            formatUSD(btc.usd);
    }


    // 24H CHANGE

    if (positive) {

        positive.textContent =
            formatPercent(btc.usd_24h_change);

        positive.classList.toggle(
            "negative",
            btc.usd_24h_change < 0
        );
    }


    // HIGH / LOW

    if (metaValues.length >= 2) {

        metaValues[0].textContent =
            formatUSD(btc.usd_24h_high);

        metaValues[1].textContent =
            formatUSD(btc.usd_24h_low);
    }


    // MARKET CAP

    if (metricValues[0]) {

        metricValues[0].textContent =
            formatCompact(btc.usd_market_cap);
    }


    // VOLUME

    if (metricValues[1]) {

        metricValues[1].textContent =
            formatCompact(btc.usd_24h_vol);
    }


    // LAST UPDATED

    const status =
        document.querySelector(".live-status strong");
======================
// AUTO REFRESH
// ==========================

// Refresh every 60 seconds

setInterval(
    loadBitcoinData,
    60 * 1000
);
