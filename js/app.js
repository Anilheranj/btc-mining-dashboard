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

    if (status) {

        status.textContent = "LIVE";
    }
}


// ==========================
// OFFLINE STATE
// ==========================

function showOfflineState() {

    const status =
        document.querySelector(".live-status strong");

    if (status) {

        status.textContent = "OFFLINE";
    }
}


// ==========================
// NAVIGATION
// ==========================

const navItems =
    document.querySelectorAll(".nav-item");

navItems.forEach(item => {

    item.addEventListener("click", () => {

        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");
    });

});


// ==========================
// INITIAL LOAD
// ==========================

loadBitcoinData();


// ==========================
// AUTO REFRESH
// ==========================

// Refresh every 60 seconds

setInterval(
    loadBitcoinData,
    60 * 1000
);
