import { useEffect, useState } from "react";
import { Container} from "@mui/material";
import { Typography} from "@mui/material";
import { Paper} from "@mui/material";
import { List} from "@mui/material";
import { ListItem} from "@mui/material";
import { ListItemText} from "@mui/material";
import { Divider} from "@mui/material";
import { Box} from "@mui/material";


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

    const flagName = scores
        .filter(g => g.mode === "nameflag")
        .sort((a, b) => b.points - a.points);

    const flagOnly = scores
        .filter(g => g.mode === "flag")
        .sort((a, b) => b.points - a.points);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" >
                Scores
            </Typography>

            {/* Flag + Name */}
            <Box sx={{display: "flex", gap: 2}}> {/* Flex: Put childen side to side. gap: add spacing between columns */}               
                <Paper sx={{ flex: 1, p: 2 }}>
                    <Typography variant="h6">Flag + Name</Typography>
                    <List>
                        {flagName.map((g, i) => (
                            <div key={g.gameId}> {/* React needs an unique key for each item */}
                                <ListItem>
                                    <ListItemText
                                        primary={`${g.points} pts | ${g.username}`}
                                        secondary={`${g.region} | ${g.difficulty}`}
                                    />
                                </ListItem>
                                {/* Add separator line between items. Skip last item */}
                                {i < flagName.length - 1 && <Divider />}
                            </div>
                        ))}
                    </List>
                </Paper>

                {/* Flag Only */}
                <Paper sx={{ flex: 1, p: 2 }}>
                    <Typography variant="h6">Flag Only</Typography>

                    <List>
                        {flagOnly.map((g, i) => (
                            <div key={g.gameId}>
                                <ListItem>
                                    <ListItemText
                                        primary={`${g.points} pts | ${g.username}`}
                                        secondary={`${g.region} | ${g.difficulty}`}
                                    />
                                </ListItem>
                                {i < flagOnly.length - 1 && <Divider />}
                            </div>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Container>
    );
}

export default Scores;