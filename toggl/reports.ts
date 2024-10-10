import { type ObjectEnum, TaskType, Team } from "@/types";
import { addSeconds, formatDistance, getISOWeek } from "date-fns";
import { parseISO } from "date-fns/parseISO";
import { getTimeEntries } from "./client";

type GetReportOpts = {
    since?: string;
};

const TimeType = {
    CapEx: "CapEx",
    OpEx: "OpEx",
} as const;

type TimeType = ObjectEnum<typeof TimeType>;

type TeamWeekReport = { [key in Team]?: WeekReport };
type WeekReport = Record<TimeType, number>;

const timeTypeMap = {
    [TaskType.Feature]: TimeType.CapEx,
    [TaskType.Bug]: TimeType.OpEx,
    [TaskType.Hotfix]: TimeType.OpEx,
    [TaskType.Improvement]: TimeType.OpEx,
    [TaskType.Cleanup]: TimeType.OpEx,
    [TaskType.Other]: TimeType.OpEx,
};

const secondsInHour = 60 * 60;

export async function getReport(opts: GetReportOpts) {
    const report = new Map<number, TeamWeekReport>();

    let since: Date | undefined;
    if (opts.since) {
        since = parseISO(opts.since);
    }
    const timeEntries = await getTimeEntries(since);

    for (const entry of timeEntries) {
        const date = parseISO(entry.start);
        const weekNumber = getISOWeek(date);

        const project = entry.project_name ?? Team.Other;

        let weekReport = report.get(weekNumber);
        if (!weekReport) {
            weekReport = {};
            report.set(weekNumber, weekReport);
        }

        if (!weekReport[project]) {
            weekReport[project] = {
                CapEx: 0,
                OpEx: 0,
            };
        }

        for (const tag of entry.tags) {
            const timeType: TimeType | undefined = timeTypeMap[tag as TaskType];
            if (timeType) {
                weekReport[project][timeType] += entry.duration ?? 0;
            }
        }
    }
    console.log(report);

    const referenceDate = new Date();

    for (const [week, teamReport] of report.entries()) {
        console.log(`Week: ${week}`);
        for (const [team, weekReport] of Object.entries(teamReport)) {
            console.log(team);
            for (const [type, duration] of Object.entries(weekReport)) {
                const end = addSeconds(referenceDate, duration);
                const difference = formatDistance(end, referenceDate);
                // const hours = duration % secondsInHour;
                // const minutes = (duration - hours * secondsInHour) % 60;
                // console.log(`${type}: ${hours}h ${minutes}m`);
                console.log(`${type}: ${difference}`);
            }
        }
        console.log("______________________");
    }
}
