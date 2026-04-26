export default function Leaderboard() {
  const users = [
    { name: "Rahul", score: 95 },
    { name: "Aman", score: 88 },
    { name: "Priya", score: 80 },
  ];

  return (
    <div>
      <h3>Leaderboard 🏆</h3>

      {users.map((u, i) => (
        <div key={i}>
          {u.name} - {u.score}
        </div>
      ))}
    </div>
  );
}