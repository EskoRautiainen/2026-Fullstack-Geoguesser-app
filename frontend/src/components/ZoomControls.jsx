// --------------------------------------------------------------------------------------------------------------------
//        ZOOM CONTROLS (float over the map's corner)
// --------------------------------------------------------------------------------------------------------------------

function ZoomControls({ onZoomIn, onZoomOut }) {
    return (
    <div className="zoom-controls">
        <button onClick={onZoomIn} aria-label="Zoom in" title="Zoom in">+</button>
        <button onClick={onZoomOut} aria-label="Zoom out" title="Zoom out">−</button>
    </div>
    );
}

export default ZoomControls;
