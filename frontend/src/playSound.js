// --------------------------------------------------------------------------------------------------------------------
//        SOUND EFFECTS
// --------------------------------------------------------------------------------------------------------------------
function playSound(isCorrect) {
  const audio = new Audio(isCorrect ? "/sounds/correct.mp3" : "/sounds/wrong.mp3");
  // play() rejects when the browser blocks audio or the file fails to load. A missing sound must not break the game.
  audio.play().catch(err => console.warn("Could not play sound:", err.message));
}

export default playSound;
