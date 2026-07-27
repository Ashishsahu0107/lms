import { ChevronLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function CourseAnalytics({ onBack, data }) {
  const defaultCategories = [
    { category: "Programming", count: 45, revenue: 12500 },
    { category: "Design", value: 28, revenue: 8200 },
    { category: "Business", count: 22, revenue: 6800 },
    { category: "Data Science", count: 18, revenue: 9400 },
    { category: "Marketing", count: 15, revenue: 4500 },
  ];

  const courseData = data?.courseCategoriesDistribution || defaultCategories;

  const topPerformingCourses = [
    {
      title: "Advanced JavaScript Masters",
      students: 1245,
      revenue: 45680,
      rating: 4.8,
      completion: 72,
    },
    {
      title: "Python for Data Science",
      students: 890,
      revenue: 32450,
      rating: 4.9,
      completion: 65,
    },
    {
      title: "UI/UX Design Fundamentals",
      students: 567,
      revenue: 18230,
      rating: 4.7,
      completion: 58,
    },
    {
      title: "Machine Learning Foundations",
      students: 432,
      revenue: 15670,
      rating: 4.6,
      completion: 45,
    },
    {
      title: "React Native Development Hub",
      students: 789,
      revenue: 28900,
      rating: 4.8,
      completion: 68,
    },
  ];

  return (
    <div className="space-y-6" id="course-analytics-root">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">
          Course Catalog & Category Audits
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Curriculum Catalog Count by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  name="Total Syllabus Count"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#10b981"
                  name="Gross Revenue ($)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Top Performing Courses Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Course Title
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Students enrolled
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Accumulated Revenue
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Rating index
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Completions Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topPerformingCourses.map((c, idx) => (
                  <tr key={idx} className="hover:bg-muted/10">
                    <td className="px-4 py-3 text-sm font-semibold">
                      {c.title}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="secondary">
                        {c.students.toLocaleString()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-600 font-bold">
                      ${c.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground font-semibold">
                      ★ {c.rating}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-28 flex items-center gap-2">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${c.completion}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {c.completion}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
