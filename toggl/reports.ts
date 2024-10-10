import { type ObjectEnum, TaskType, Team } from "@/types";
import {
    addSeconds,
    differenceInHours,
    formatDistance,
    getISOWeek,
} from "date-fns";
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

type WeekReport = {
    teams: { [key in Team]?: TeamWeekReport };
    totalDuration: number;
};

type TeamWeekReport = Record<TimeType, number>;

const timeTypeMap = {
    [TaskType.Feature]: TimeType.CapEx,
    [TaskType.Bug]: TimeType.OpEx,
    [TaskType.Hotfix]: TimeType.OpEx,
    [TaskType.Improvement]: TimeType.OpEx,
    [TaskType.Cleanup]: TimeType.OpEx,
    [TaskType.Other]: TimeType.OpEx,
};

export async function getReport(opts: GetReportOpts) {
    const report = new Map<number, WeekReport>();

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
            weekReport = {
                teams: {},
                totalDuration: 0,
            };
            report.set(weekNumber, weekReport);
        }

        if (!weekReport.teams[project]) {
            weekReport.teams[project] = {
                CapEx: 0,
                OpEx: 0,
            };
        }

        for (const tag of entry.tags) {
            const timeType: TimeType | undefined = timeTypeMap[tag as TaskType];
            if (timeType) {
                weekReport.teams[project][timeType] += entry.duration ?? 0;
                weekReport.totalDuration += entry.duration ?? 0;
            }
        }
    }
    // console.log(report);

    const referenceDate = new Date();

    for (const [week, weekReport] of report.entries()) {
        const weekTotal = addSeconds(referenceDate, weekReport.totalDuration);
        const weekDifference = differenceInHours(weekTotal, referenceDate);

        console.log("----------------------------------");
        console.log(`Week: ${week} (total duration: ${weekDifference}h)`);

        for (const team of Object.values(Team)) {
            const teamWeekReport = weekReport.teams[team];
            if (!teamWeekReport) {
                continue;
            }

            console.log(team);
            for (const [type, duration] of Object.entries(teamWeekReport)) {
                const end = addSeconds(referenceDate, duration);
                const difference = differenceInHours(end, referenceDate);

                console.log(`${type}: ${difference}h`);
            }
        }
    }
}
