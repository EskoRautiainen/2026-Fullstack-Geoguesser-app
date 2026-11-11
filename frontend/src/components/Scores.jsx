import { useEffect, useState } from "react";
import { Paper, Typography } from "@mui/material";


// --------------------------------------------------------------------------------------------------------------------}
//        ONE LEADERBOARD (games of one mode, best first)
//  -------------------------------------------------------------------------------------------------------------------}

function Board({ title, games }) {
    return (
        <Paper variant="outlined" className="board">
            <Typography variant="subtitle1" component="h2" fontWeight={700} sx={{ px: 2, py: 1.5 }}>
                {title}
            </Typography>
            {games.length === 0 ? (
                <Typography color="text.secondary" sx={{ px: 2, pb: 2 }}>No games yet.</Typography>
            ) : (
                <ol className="board-list">
                    {games.map((g, i) => (
                        <li key={g.gameId}> {/* React needs an unique key for each item */}
                            <span className={`rank ${i < 3 ? "top" : ""}`}>{i + 1}</span>
                            <span className="player">
                                {g.username}
                                <small>{g.region} · {g.difficulty}</small>
                            </span>
                            <b>{g.points}</b>
                        </li>
                    ))}
                </ol>
            )}
        </Paper>
    );
}

// --------------------------------------------------------------------------------------------------------------------}
//        FETCH SCORES
//  -------------------------------------------------------------------------------------------------------------------}

function Scores() {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        async function fetchScores() {
            try {
                const res = await fetch("/api/gamedata");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setScores(data);
            } catch (err) {
                console.error("Failed to load scores:", err);
            }
        }
        fetchScores();
    }, []);

// --------------------------------------------------------------------------------------------------------------------}
//        FILTER SCORES
//  -------------------------------------------------------------------------------------------------------------------}

    const byMode = (mode) => scores
        .filter(g => g.mode === mode)
        .sort((a, b) => b.points - a.points);

    return (
        <div className="scores">
            <Typography variant="h5" component="h1" fontWeight={700} sx={{ mb: 2 }}>
                Scores
            </Typography>
            <div className="boards">
                <Board title="Name + flag" games={byMode("nameflag")} />
                <Board title="Flag only" games={byMode("flag")} />
            </div>
        </div>
    );
}

export default Scores;
