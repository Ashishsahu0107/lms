import {
  LineChart, Line, XAxis, YAxis, Tooltip
} from "recharts";

const data = [
  { day: "Mon", lessons: 2 },
  { day: "Tue", lessons: 3 },
  { day: "Wed", lessons: 1 },
  { day: "Thu", lessons: 4 },
  { day: "Fri", lessons: 2 },
];

export default function ActivityChart() {
  return (
    <LineChart width={400} height={200} data={data}>
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="lessons" />
    </LineChart>
  );
}