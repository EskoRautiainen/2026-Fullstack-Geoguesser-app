// --------------------------------------------------------------------------------------------------------------------}
//        DISPLAY FLAGS AND COUNTRY NAMES IN GAME
//  -------------------------------------------------------------------------------------------------------------------}

// Receieve props from Map.jsx
export function StatsGrid1({
    points,
    time,
    score,
    targetCountries,
    currentIndex,

    
}) {
    return (
    //  stats-grid is defined in App.css
    <div className="stats-grid1">
      {/* <div> is one grid cell. <p> will not work with grid. */}
        <div>Total points: <b>{points}</b></div>
        <div>Time: <b>{time}</b></div>
        <div>Score: <b>{score} / {targetCountries.length}</b></div>
        <div>Round: <b>{currentIndex + 1} / {targetCountries.length}</b></div>
    </div>
    );
}

export function StatsGrid2({
    currentTarget,
    clickedCountry,
    mode
}) {
    return (
    <div className="stats-grid2">
        <div>
            Click on: {" "}
            {currentTarget && (
            <b>
            {(mode === "nameflag" || mode === "flag") && (
            <img
                src={currentTarget.flag}
                // In flag-only mode the alt text must not reveal the answer
                alt={mode === "nameflag" ? `${currentTarget.name} flag` : "Flag of the country to find"}
                width={40}
                height={25}
                style={{ margin: "0 5px" }}
            />
            )}
                {mode === "nameflag"
                    ? currentTarget.name
                    : "" // Show empty string if mode is not "nameflag"
                }
            </b>
        )}
    </div>
<div>
            You clicked: {" "}
            {clickedCountry ? (
            <b>
            {(mode === "nameflag" || mode === "flag") && (
            <img
                src={clickedCountry.flag}
                alt={`${clickedCountry.name} flag`}
                width={40}
                height={25}
                style={{ margin: "0 5px" }}
            />
            )}
                {mode === "nameflag"
                    ? clickedCountry.name
                    : ""
                }
            </b>
        ) :  (
            <b>-</b> // Display "-" if no country has been clicked
        )}
    </div>
    </div>
    );
}
