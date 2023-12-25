/* eslint-disable react/prop-types */
import React, { useRef, useEffect } from "react";

export const AudioItem = ({ participant }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!participant?.audioTrack || !audioRef.current || participant?.local)
      return;
    // sanity check to make sure this is an audio track

    if (
      participant?.audioTrack?.track &&
      !participant?.audioTrack?.track?.kind === "audio"
    )
      return;
    audioRef.current.srcObject = new MediaStream([
      participant?.tracks.audio.persistentTrack,
    ]);
  }, [participant]);

  return (
    <>
      <audio
        autoPlay
        id={`audio-${participant.user_id}`}
        ref={audioRef}
      />
    </>
  );
};

export const Audio = ({ participants }) => {
  return (
    <>
      {participants.map((p) => (
        <AudioItem participant={p} key={`p-${p.user_id}`} />
      ))}
    </>
  );
};

export default Audio;