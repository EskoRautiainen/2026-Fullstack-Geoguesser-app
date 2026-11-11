// --------------------------------------------------------------------------------------------------------------------
//        GAME RULES (shared by the setup screen, the game screen and the HUD)
// --------------------------------------------------------------------------------------------------------------------

export const DEFAULT_SETTINGS = { region: "europe", difficulty: "easy", mode: "nameflag" };

export const ROUNDS = { easy: 10, hard: 25 }; // Countries per game
export const MAX_GUESSES = 3;                  // Guesses per country
export const REVEAL_MS = 2500;                 // How long the answer is shown after the last wrong guess
const POINTS_PER_GUESS_LEFT = 60;

// Points for a correct guess: 180 / 120 / 60 on the first / second / third guess.
// guessesLeft is the number of guesses left before this one (3 on the first guess).
export function roundPoints(guessesLeft) {
  return guessesLeft * POINTS_PER_GUESS_LEFT;
}

// Final score: the round points scaled by the total time in seconds, rounded to one decimal
export function finalScore(totalRoundPoints, seconds) {
  return Number((totalRoundPoints * 5 / (seconds / 50 + 1)).toFixed(1));
}

// Fisher-Yates shuffle. Sorting with Math.random() does not give every order an equal chance.
export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
