import { useEffect, useState } from "react";
import type { AchievementType } from "../../components/achievements/AchievementManager";
import { LineChart } from '@mui/x-charts/LineChart';
import "./Visitor.scss";

// const HOST = "http://localhost:2222/portfolio";
const HOST = "/php";

export default function VisitorsPage() {

    const [data, setData] = useState<VisitorData[] | null>(null);

    useEffect(() => {
        (async () => {
            if (!data) {
                const res = await ((await fetch(HOST + "/getVisitors.php", {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })).json() as Promise<VisitorData[]>);
                setData(res);
            }
        })();
    }, []);

    if (!data) return <></>;

    console.log(data);

    const mostUsedBrowser = data.reduce((acc, visitor) => {
        const browser = visitor.userAgent.client.name ?? 'Unknown';
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedBrowsers = Object.entries(mostUsedBrowser).sort((a, b) => b[1] - a[1]);

    const mostUsedOS = data.reduce((acc, visitor) => {
        const os = visitor.userAgent.os.name ?? 'Unknown';
        acc[os] = (acc[os] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedOS = Object.entries(mostUsedOS).sort((a, b) => b[1] - a[1]);

    const mostUsedDevice = data.reduce((acc, visitor) => {
        const device = visitor.userAgent.device.type || 'Desktop';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedDevices = Object.entries(mostUsedDevice).sort((a, b) => b[1] - a[1]);

    const mostVisitedPaths = data.reduce((acc, visitor) => {
        for (const path in visitor.path_visits) {
            acc[path] = (acc[path] || 0) + visitor.path_visits[path];
        }
        return acc;
    }, {} as Record<string, number>);

    const sortedPaths = Object.entries(mostVisitedPaths).sort((a, b) => b[1] - a[1]);

    const visitCountOverTime: {
        [date: string]: number;
    } = {};

    for (const visitor of data) {
        for (const visit of visitor.visits) {
            const date = new Date(visit);
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            visitCountOverTime[dateKey] = (visitCountOverTime[dateKey] || 0) + 1;
        }
    }

    const averageTimeOnSite = data.reduce((acc, visitor) => acc + visitor.timeOnSiteMinutes, 0) / data.length;

    const firstTimeVisitorsOverTime: {
        [date: string]: number;
    } = {};
    for (const visitor of data) {
        const date = new Date(visitor.first_visit);
        const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        firstTimeVisitorsOverTime[dateKey] = (firstTimeVisitorsOverTime[dateKey] || 0) + 1;
    }

    console.log(sortedBrowsers);
    console.log(sortedOS);
    console.log(sortedDevices);
    console.log(sortedPaths);
    console.log(visitCountOverTime);
    console.log(averageTimeOnSite);
    console.log(firstTimeVisitorsOverTime);

    return (
        <div className="visitors">
            <h1>Visitors</h1>

            <div className="visitor-statistic overallTimeSpent">
                <h2>Overall time spent on site</h2>
                <p>{data.reduce((acc, visitor) => acc + visitor.timeOnSiteMinutes, 0)} minutes</p>
            </div>

            <div className="visitor-statistic overallVisits">
                <h2>Overall visits</h2>
                <p>{data.reduce((acc, visitor) => acc + visitor.visitCount, 0)}</p>
            </div>

            <div className="visitor-statistic overallUniqueVisits">
                <h2>Overall unique visits</h2>
                <p>{data.length}</p>
            </div>

            <div className="visitor-statistic averageTimeSpent">
                <h2>Average time spent on site</h2>
                <p>{averageTimeOnSite.toFixed(2)} minutes</p>
            </div>

            <div className="visitor-statistic vititorCountOverTime">
                <h2>Visitor Count Over Time</h2>
                <LineChart
                    height={400}
                    series={[{
                        data: Object.values(visitCountOverTime),
                        label: undefined,
                        area: true,
                        color: '#420061',
                    }]}
                    grid={{ vertical: true, horizontal: true }}
                    xAxis={[{ scaleType: "time", data: Object.keys(visitCountOverTime).map(e => new Date(e)), valueFormatter: (value) => `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}` }]}
                    yAxis={[{ scaleType: "linear", data: Object.values(visitCountOverTime) }]}
                />
            </div>

            <div className="visitor-statistic firstTimeVisitorsOverTime">
                <h2>First Time Visitors Over Time</h2>
                <LineChart
                    height={400}
                    series={[{
                        data: Object.values(firstTimeVisitorsOverTime),
                        label: undefined,
                        area: true,
                        color: '#420061',
                    }]}
                    grid={{ vertical: true, horizontal: true }}
                    xAxis={[{ scaleType: "time", data: Object.keys(firstTimeVisitorsOverTime).map(e => new Date(e)), valueFormatter: (value) => `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}` }]}
                    yAxis={[{ scaleType: "linear", data: Object.values(firstTimeVisitorsOverTime) }]}
                />
            </div>

        </div>
    );
}

type VisitorData = {
    userAgent: {
        client: {
            type: string;
            name: string;
            version: string;
            engine: string;
            engineVersion: string;
        };
        os: {
            name: string;
            version: string;
            platform: string;
        };
        device: {
            type: string;
            brand: string;
            model: string;
        };
        bot: null;
    };
    uuid: string;
    visitCount: number;
    first_visit: string;
    last_visit: string;
    visits: string[];
    paths: string[];
    lastPath: string;
    timeOnSiteMinutes: number;
    path_visits: {
        [key: string]: number;
    };
    achievementsFinished: AchievementType[];
}