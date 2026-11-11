// --------------------------------------------------------------------------------------------------------------------
//        ZOOM CONTROLS (float over the map's corner)
// --------------------------------------------------------------------------------------------------------------------

// Use prop destructuring. Expect two functions as props.
function Controls({ onZoomIn, onZoomOut }) {
    return (
    <div className="zoom-controls">
        {/* Pass the function. Don't call it yet. NO {onZoomIn()}.*/}
        <button onClick={onZoomIn} aria-label="Zoom in" title="Zoom in">+</button>
        <button onClick={onZoomOut} aria-label="Zoom out" title="Zoom out">−</button>
    </div>
    );
}

export default Controls;
