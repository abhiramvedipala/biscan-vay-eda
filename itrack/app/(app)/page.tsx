import { startOfWeek, subWeeks, format, isWithinInterval, parseISO } from "date-fns";
import { getApplications, getRecentActivity } from "@/lib/data";
import { StatCard } from "@/components/StatCard";
import { FollowUpsPanel } from "@/components/FollowUpsPanel";
import { ActivityFeed } from "@/components/ActivityFeed";
import { WeeklyChart } from "@/components/WeeklyChart";
import { ACTIVE_STATUSES, RESPONDED_STATUSES } from "@/lib/constants";
import { isOverdue, isDueToday } from "@/lib/utils";

export default async function DashboardPage() {
  const [applications, recentActivity] = await Promise.all([
    getApplications(),
    getRecentActivity(),
  ]);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const total = applications.length;
  const appliedThisWeek = applications.filter(
    (a) =>
      a.date_applied &&
      isWithinInterval(parseISO(a.date_applied), { start: weekStart, end: now })
  ).length;
  const activePipeline = applications.filter((a) =>
    ACTIVE_STATUSES.includes(a.status)
  ).length;
  const interviews = applications.filter((a) => a.status === "interviewing").length;
  const offers = applications.filter((a) => a.status === "offer").length;

  const sentApplications = applications.filter((a) => a.status !== "saved");
  const responseRate =
    sentApplications.length > 0
      ? Math.round(
          (sentApplications.filter((a) => RESPONDED_STATUSES.includes(a.status))
            .length /
            sentApplications.length) *
            100
        )
      : 0;

  const followUpsDue = applications
    .filter((a) => isOverdue(a.next_action_date) || isDueToday(a.next_action_date))
    .sort((a, b) =>
      (a.next_action_date ?? "").localeCompare(b.next_action_date ?? "")
    );

  const weeklyData = Array.from({ length: 8 }).map((_, i) => {
    const start = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
    const end = subWeeks(start, -1);
    const count = applications.filter(
      (a) =>
        a.date_applied &&
        isWithinInterval(parseISO(a.date_applied), { start, end }) &&
        parseISO(a.date_applied) < end
    ).length;
    return { week: format(start, "MMM d"), applications: count };
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-medium tracking-tight text-[#1a1a1a]">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your job search at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total applications" value={total} />
        <StatCard label="Applied this week" value={appliedThisWeek} />
        <StatCard label="Active pipeline" value={activePipeline} />
        <StatCard label="Interviews" value={interviews} />
        <StatCard label="Offers" value={offers} />
        <StatCard label="Response rate" value={`${responseRate}%`} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-[#1a1a1a]">Follow-ups due</h2>
        <FollowUpsPanel initialItems={followUpsDue} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-[#1a1a1a]">
            Applications per week
          </h2>
          <WeeklyChart data={weeklyData} />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-[#1a1a1a]">Recent activity</h2>
          <ActivityFeed items={recentActivity} />
        </div>
      </div>
    </div>
  );
}
