    export default function Calendar() {
  const events = [
    { date: "2026-04-30", event: "Assignment Deadline" },
    { date: "2026-05-02", event: "Quiz" },
  ];

  return (
    <div>
      <h3>Events 📅</h3>

      {events.map((e, i) => (
        <div key={i}>
          {e.date} - {e.event}
        </div>
      ))}
    </div>
  );
}