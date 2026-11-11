// --------------------------------------------------------------------------------------------------------------------
//        SOUND EFFECTS
// --------------------------------------------------------------------------------------------------------------------
function playSound(isCorrect) {
  const audio = new Audio(
    isCorrect ? "/sounds/correct.mp3" : "/sounds/wrong.mp3"
  );
  audio.play();
}

export default playSound;