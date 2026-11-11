// --------------------------------------------------------------------------------------------------------------------}
//        GAME HUD: target country, progress and guesses in one compact bar
//  -------------------------------------------------------------------------------------------------------------------}

const MAX_GUESSES = 3;

// Flag and/or name, depending on the game mode.
// hideName: in flag-only mode the alt text must not reveal the answer.
function CountryLabel({ country, mode, hideName }) {
    return (
        <>
            {(mode === "nameflag" || mode === "flag") && (
                <img
                    className="flag"
                    src={country.flag}
                    alt={hideName && mode === "flag" ? "Flag of the country to find" : `${country.name} flag`}
                    width={54}
                    height={36}
                />
            )}
            {mode === "nameflag" && <span>{country.name}</span>}
        </>
    );
}

// Receive props from Map.jsx
export function GameHud({
    points,
    time,
    score,
    targetCountries,
    currentIndex,
    currentTarget,
    clickedCountry,
    lastGuess,
    attempt,
    mode,
}) {
    const total = targetCountries.length;

    return (
    <header className="hud">
        <div className="hud-target">
            <span className="hud-label">Find</span>
            {currentTarget && <CountryLabel country={currentTarget} mode={mode} hideName />}
        </div>

        <div className="hud-stats">
            <span><small>Round</small> <b>{currentIndex + 1}/{total}</b></span>
            <span><small>Correct</small> <b>{score}/{total}</b></span>
            <span><small>Points</small> <b>{points}</b></span>
            <span><small>Time</small> <b>{time}s</b></span>
        </div>

        <div className="hud-guess">
            {clickedCountry && lastGuess && (
                <span className={`last-guess ${lastGuess.isCorrect ? "good" : "bad"}`} title="You clicked">
                    {lastGuess.isCorrect ? "✓" : "✗"}
                    <CountryLabel country={clickedCountry} mode={mode} />
                </span>
            )}
            <span className="guesses" role="img" aria-label={`${attempt} of ${MAX_GUESSES} guesses left`}>
                {Array.from({ length: MAX_GUESSES }, (_, i) => (
                    <i key={i} className={i < attempt ? "left" : ""} />
                ))}
            </span>
        </div>
    </header>
    );
}
