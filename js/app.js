/*
    BTC / MINING
    CONCEPTUAL SKETCH
    V2.2
*/


// ==========================================
// CONFIG
// ==========================================

const API_BASE =
    "https://api.coingecko.com/api/v3";

const COIN_ID =
    "bitcoin";


// ==========================================
// DOM
// ==========================================

const el = {

    clock:
        document.getElementById("clock"),

    systemStatus:
        document.getElementById("systemStatus"),

    btcPrice:
        document.getElementById("btcPrice"),

    priceChange:
        document.getElementById("priceChange"),

    btcHigh:
        document.getElementById("btcHigh"),

    btcLow:
        document.getElementById("btcLow"),

    lastUpdate:
        document.getElementById("lastUpdate"),

    marketCap:
        document.getElementById("marketCap"),

    volume:
        document.getElementById("volume"),

    marketState:
        document.getElementById("marketState"),

    chartLine:
        document.getElementById("chartLine"),

    chartArea:
        document.getElementById("chartArea"),

    chartLoading:
        document.getElementById("chartLoading"),

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

let selectedDays = 1;


// ==========================================
// CLOCK
// ==========================================

function updateClock() {

    const now = new Date();

    const h =
        String(now.getHours()).padStart(2, "0");

    const m =
        String(now.getMinutes()).padStart(2, "0");

    const s =
        String(now.getSeconds()).padStart(2, "0");

    el.clock.textContent =
        `${h}:${m}:${s}`;
}


updateClock();

setInterval(
    updateClock,
    1000
);


// ==========================================
// FORMATTERS
// ==========================================

function usd(value) {

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            maximumFractionDigits:
                value >= 1000 ? 0 : 2
        }
    ).format(value);
}


function compact(value) {

    return new Intl.NumberFormat(
        "en-US",
        {
            notation: "compact",
            maximumFractionDigits: 2
        }
    ).format(value);
}


function percent(value) {

    const sign =
        value >= 0 ? "+" : "";

    return `${sign}${value.toFixed(2)}%`;
}


function time(timestamp) {

    return new Date(timestamp)
        .toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


function date(timestamp) {

    return new Date(timestamp)
        .toLocaleDateString(
            [],
            {
                month: "short",
                day: "numeric"
            }
        );
}


// ==========================================
// CONNECTION
// ==========================================

function setStatus(status) {

    el.systemStatus.textContent =
        status;

    el.marketState.textContent =
        status === "LIVE"
            ? "ACTIVE"
            : status;

}


// ==========================================
// CURRENT MARKET
// ==========================================

async function getMarket() {

    const params =
        new URLSearchParams({

            ids: COIN_ID,

            vs_currencies: "usd",

            include_market_cap: "true",

            include_24hr_vol: "true",

            include_24hr_change: "true",

            include_24hr_high: "true",

            include_24hr_low: "true"

        });


    const response =
        await fetch(
            `${API_BASE}/simple/price?${params}`,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `Market API ${response.status}`
        );
    }


    return response.json();
}


// ==========================================
// HISTORICAL MARKET
// ==========================================

async function getHistory(days) {

    const params =
        new URLSearchParams({

            vs_currency: "usd",

            days: String(days),

            ...(days <= 1
                ? {}
                : {
                    interval: "daily"
                })

        });


    const response =
        await fetch(
            `${API_BASE}/coins/${COIN_ID}/market_chart?${params}`,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `Chart API ${response.status}`
        );
    }


    return response.json();
}


// ==========================================
// UPDATE MARKET
// ==========================================

function updateMarket(data) {

    const btc =
        data.bitcoin;


    el.btcPrice.textContent =
        usd(btc.usd);


    el.priceChange.textContent =
        percent(
            btc.usd_24h_change
        );


    el.priceChange.classList.toggle(
        "negative",
        btc.usd_24h_change < 0
    );


    el.btcHigh.textContent =
        usd(
            btc.usd_24h_high
        );


    el.btcLow.textContent =
        usd(
            btc.usd_24h_low
        );


    el.marketCap.textContent =
        compact(
            btc.usd_market_cap
        );


    el.volume.textContent =
        compact(
            btc.usd_24h_vol
        );


    el.lastUpdate.textContent =
        new Date()
            .toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );
}


// ==========================================
// DRAW CHART
// ==========================================

function drawChart(prices) {

    if (!prices || prices.length < 2) {

        throw new Error(
            "Insufficient chart data"
        );
    }


    const width = 1000;

    const height = 350;

    const padding = 12;


    const values =
        prices.map(
            item => item[1]
        );


    const min =
        Math.min(...values);


    const max =
        Math.max(...values);


    const range =
        max - min || 1;


    const points =
        prices.map(
            (item, index) => {

                const x =
                    padding +
                    (
                        index /
                        (prices.length - 1)
                    ) *
                    (
                        width -
                        padding * 2
                    );


                const y =
                    height -
                    padding -
                    (
                        (
                            item[1] - min
                        ) /
                        range
                    ) *
                    (
                        height -
                        padding * 2
                    );


                return {
                    x,
                    y
                };

            }
        );


    const line =
        points
            .map(
                (point, index) => {

                    return `${
                        index === 0
                            ? "M"
                            : "L"
                    } ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;

                }
            )
            .join(" ");


    const first =
        points[0];


    const last =
        points[points.length - 1];


    const area =
        `${line}
         L ${last.x.toFixed(2)} ${height}
         L ${first.x.toFixed(2)} ${height}
         Z`;


    el.chartLine.setAttribute(
        "d",
        line
    );


    el.chartArea.setAttribute(
        "d",
        area
    );


    updateLabels(
        prices
    );


    el.chartLoading.classList.add(
        "hidden"
    );
}


// ==========================================
// CHART LABELS
// ==========================================

function updateLabels(prices) {

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
                    prices.length - 1,
                    Math.floor(
                        position *
                        prices.length
                    )
                );


            const timestamp =
                prices[dataIndex][0];


            if (selectedDays <= 1) {

                el.labels[index]
                    .textContent =
                    index === 4
                        ? "NOW"
                        : time(timestamp);

            } else {

                el.labels[index]
                    .textContent =
                    index === 4
                        ? "NOW"
                        : date(timestamp);
            }

        }
    );
}


// ==========================================
// LOAD CHART
// ==========================================

async function loadChart() {

    el.chartLoading.classList.remove(
        "hidden"
    );

    el.chartLoading.textContent =
        "FETCHING MARKET DATA...";


    try {

        const history =
            await getHistory(
                selectedDays
            );


        drawChart(
            history.prices
        );


    } catch (error) {

        console.error(
            error
        );


        el.chartLoading.textContent =
            "MARKET DATA UNAVAILABLE";
    }
}


// ==========================================
// DASHBOARD LOAD
// ==========================================

async function loadDashboard() {

    setStatus(
        "CONNECTING"
    );


    try {

        const market =
            await getMarket();


        updateMarket(
            market
        );


        await loadChart();


        setStatus(
            "LIVE"
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        setStatus(
            "OFFLINE"
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


rangeButtons.forEach(
    button => {

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


                selectedDays =
                    Number(
                        button.dataset.days
                    );


                await loadChart();

            }
        );

    }
);


// ==========================================
// NAVIGATION
// ==========================================

const navLinks =
    document.querySelectorAll(
        ".nav a"
    );


navLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                navLinks.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                link.classList.add(
                    "active"
                );

            }
        );

    }
);


// ==========================================
// AUTO REFRESH
// ==========================================

setInterval(
    async () => {

        try {

            const market =
                await getMarket();


            updateMarket(
                market
            );


            setStatus(
                "LIVE"
            );


        } catch (error) {

            console.error(
                error
            );


            setStatus(
                "OFFLINE"
            );
        }

    },
    60 * 1000
);


// ==========================================
// INITIALIZE
// ==========================================

loadDashboard();
