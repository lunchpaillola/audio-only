/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useCallState } from "../shared/callProvider";
import {View, Text, TouchableOpacity} from 'react-native';
import { LISTENER, MOD, SPEAKER } from "../shared/callProvider";
import Menu from "../shared/Menu";
import MoreIcon from "../icons/MoreIcon";
import MicIcon from "../icons/MicIcon";
import MutedIcon from "../icons/MutedIcon";
import { participantStyles } from "../shared/participantStyles";

const initials = (name) =>
  name
    ? name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
    : "";

const Participant = ({ participant, local, modCount }) => {
  const {
    getAccountType,
    activeSpeakerId,
    changeAccountType,
    displayName,
    handleMute,
    handleUnmute,
    removeFromCall,
    lowerHand,
    raiseHand,
    leaveCall,
    endCall,
  } = useCallState();
  const audioRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  let name
  const accountType = getAccountType(participant?.user_name);

  if (accountType === MOD || accountType === SPEAKER || accountType === LISTENER){
    name = displayName(participant?.user_name);
  } else {
    name = participant?.user_name;
  }
  //Translating the role for the user to the
  const role =
    getAccountType(participant?.user_name) === MOD
      ? "Host"
      : getAccountType(participant?.user_name) === SPEAKER
        ? "Speaker"
        : getAccountType(participant?.user_name) === LISTENER
          ? "Listener"
          : "Listener";
  

    const menuOptions = useMemo(() => {
    const mutedText = participant?.audio ? "Mute" : "Unmute";

    const audioAction = participant?.audio
      ? (id) => handleMute(id)
      : (id) => handleUnmute(id);

    /**
     * Determine what the menu options are based on the account type.
     * Listeners can't unmute but can raise their hand to speaker.
     * Moderators can change the status of others but can't have their
     * own status change to speaker or listener.
     * Moderators cannot unmute but can mute.
     */
    let options = [];

    /**
     * If it's the local particpant's menu:
     *  - Mods can unmute themselves and speakers.
     *  - Speakers can unmute themselves.
     *  - Listeners listen. :)
     */
    if (
      participant?.local &&
      [MOD, SPEAKER].includes(getAccountType(participant?.user_name))
    ) {
      options.push({
        text: mutedText,
        action: () => audioAction(participant),
      });
    }

    /**
     * If it's a remote participant:
     * Mods can only MUTE someone. We don't want
     * people getting unmuted without knowing because
     * it can be a bit invasive 😬
     */
    if (
      !participant?.local &&
      participant?.audio &&
      getAccountType(local?.user_name) === MOD &&
      [MOD, SPEAKER].includes(getAccountType(participant?.user_name))
    ) {
      options.push({
        text: "Mute",
        action: () => handleMute(participant),
      });
    }

    switch (getAccountType(participant?.user_name)) {
      case SPEAKER:
        if (!participant?.local) {
          const o = [
            {
              text: "Make moderator",
              action: () => changeAccountType(participant, MOD),
            },
            {
              text: "Make listener",
              action: () => changeAccountType(participant, LISTENER),
            },
            {
              text: "Remove from call",
              action: () => removeFromCall(participant),
              warning: true,
            },
          ];
          options = [...options, ...o];
        }
        break;
      case LISTENER:
        if (participant?.local) {
          options.push({
            text: participant?.user_name.includes("✋")
              ? "Lower hand"
              : "Raise hand ✋",
            action: participant?.user_name.includes("✋")
              ? () => lowerHand(participant)
              : () => raiseHand(participant),
          });
        } else {
          const o = [
            {
              text: "Make moderator",
              action: () => changeAccountType(participant, MOD),
            },
            {
              text: "Make speaker",
              action: () => changeAccountType(participant, SPEAKER),
            },
            {
              text: "Remove from call",
              action: () => removeFromCall(participant),
              warning: true,
            },
          ];
          options = [...options, ...o];
        }
        break;
      default:
        break;
    }

    /**
     * Let the local participant leave. (There's also
     * a button in the tray.) "Leave" or "Remove" should
     * be the last items
     */
    if (participant?.local) {
      const lastMod =
        modCount < 2 && getAccountType(participant?.user_name) === MOD;
      options.push({
        text: lastMod ? "End call" : "Leave call",
        action: () => (lastMod ? endCall() : leaveCall(participant)),
        warning: true,
      })
    }

    return options;
  }, [
    participant,
    local,
    getAccountType,
    changeAccountType,
    handleMute,
    handleUnmute,
    removeFromCall,
    endCall,
    lowerHand,
    leaveCall,
    modCount,
    raiseHand,
  ]);

  useEffect(() => {
    if (!participant?.audioTrack || !audioRef.current) return;
    // sanity check to make sure this is an audio track
    if (
      participant?.audioTrack?.track &&
      !participant?.audioTrack?.track?.kind === "audio"
    )
      return;
    // don't play the local audio track (echo!)
    if (participant?.local) return;
    // set the audio source for everyone else

    /**
      Note: Safari will block the autoplay of audio by default.

      Improvement: implement a timeout to check if audio stream is playing
      and prompt the user if not, e.g:
      
      let playTimeout;
      const handleCanPlay = () => {
        playTimeout = setTimeout(() => {
          showPlayAudioPrompt(true);
        }, 1500);
      };
      const handlePlay = () => {
        clearTimeout(playTimeout);
      };
      audioEl.current.addEventListener('canplay', handleCanPlay);
      audioEl.current.addEventListener('play', handlePlay);
     */
    audioRef.current.srcObject = new MediaStream([participant?.audioTrack]);
  }, [participant?.audioTrack, participant?.local]);

  useEffect(() => {
    // On iOS safari, when headphones are disconnected, all audio elements are paused.
    // This means that when a user disconnects their headphones, that user will not
    // be able to hear any other users until they mute/unmute their mics.
    // To fix that, we call `play` on each audio track on all devicechange events.

    const startPlayingTrack = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.error("Error trying to play audio:", error);
        });
    }
    };
  
    navigator.mediaDevices.addEventListener("devicechange", startPlayingTrack);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        startPlayingTrack
      );
    };
  }, [audioRef]);

  const showMoreMenu = useMemo(
    () => getAccountType(local?.user_name) === MOD || participant?.local,
    [getAccountType, local, participant]
  );

  return (
    <View
      style={[
       participantStyles.container
      ]}>
      <View
        style={[
         participantStyles.avatar,
          activeSpeakerId === participant?.user_id &&
            participant?.audio &&
            participantStyles.isActive,
        ]}>
        <Text style={participantStyles.initials} numberOfLines={1}>
          {initials(participant?.user_name)}
        </Text>
      </View>
      {getAccountType(participant?.user_name) !== LISTENER && (
        <View style={participantStyles.audioIcon}>
          {participant?.audio ? <MicIcon /> : <MutedIcon />}
        </View>
      )}
      <Text style={participantStyles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={participantStyles.role} numberOfLines={1}>
        {role}
      </Text>
      {showMoreMenu && menuOptions.length > 0 && (
        <TouchableOpacity
          style={participantStyles.menuButton}
          onPress={() => setIsVisible(!isVisible)}>
          <MoreIcon />
        </TouchableOpacity>
      )}
      {isVisible && (
        <View style={participantStyles.menuContainer}>
          <Menu options={menuOptions} setIsVisible={setIsVisible} />
        </View>
      )}
      {participant?.audioTrack && (
        <audio autoPlay id={`audio-${participant.user_id}`} ref={audioRef} />
      )}
    </View>
  );
};
export default Participant;