import DeviceDetector from "device-detector-js";

// const HOST = "http://localhost:2222/portfolio";
const HOST = "/php";

export default function VisitorManager() {

    let ID = localStorage.getItem('visitorID');

    const userAgent = new DeviceDetector().parse(navigator.userAgent);

    if (userAgent.bot) return;

    if (!ID) {
        const newID = crypto.randomUUID();
        localStorage.setItem('visitorID', newID);
        ID = newID;
    }

    let lastPathName = location.pathname;

    const sendData = async () => {
        fetch(HOST + "/visitorManager.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                visitorID: ID,
                path: location.pathname,
                userAgent: userAgent,
                achievementsFinished: JSON.parse(localStorage.getItem('achievements') || '[]')
            })
        });
    };

    const checkForPathChange = () => {
        if (lastPathName !== location.pathname) {
            lastPathName = location.pathname;
            sendData();
        }
    };

    const startVisitTime = Date.now();

    if (localStorage.getItem('visitTimeLast') !== null) {
        const duration = parseFloat(localStorage.getItem('visitTimeLast') || '-1');
        if (duration > 0) {
            fetch(HOST + "/visitorManager.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    visitorID: ID,
                    visitDuration: duration
                })
            });
            localStorage.removeItem('visitTimeLast');
        }
    }

    window.addEventListener("beforeunload", () => {
        const visitDuration = Date.now() - startVisitTime;
        localStorage.setItem('visitTimeLast', (visitDuration / 1000 / 60.0).toFixed(1));
    })

    window.addEventListener('popstate', () => {
        checkForPathChange();
    });

    setInterval(checkForPathChange, 1000 * 5); // Every 5 minutes

    sendData();

}