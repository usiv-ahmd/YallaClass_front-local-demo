import { Trophy } from 'lucide-react';

export default function Leaderboard({ students = [] }) {
  return (
    <div className="card leaderboard-container">
      <div className="leaderboard-header">
        <div className="title-section">
          <div className="panel-icon leaderboard-icon"><Trophy size={19} /></div>
          <h2 className="leaderboard-title">لوحة المتصدرين</h2>
        </div>
      </div>

      <div className="leaderboard-table">
        <div className="leaderboard-row leaderboard-row--head">
          <span className="col-rank">#</span>
          <span className="col-name">الاسم</span>
          <span className="col-score">Score</span>
          <span className="col-streak">Streak</span>
        </div>

        {students.map((player, index) => (
          <div key={player.id} className="leaderboard-row">
            <span className="col-rank">{index + 1}</span>
            <span className="col-name">{player.name}</span>
            <span className="col-score">{player.score}</span>
            <span className="col-streak">🔥 {player.highestStreak}</span>
          </div>
        ))}
      </div>
    </div>
  );
}