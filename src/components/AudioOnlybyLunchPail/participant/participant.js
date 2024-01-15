/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useMemo } from "react";
import { useCallState } from "../shared/callProvider";
import { DailyMediaView } from "@daily-co/react-native-daily-js";
import { View, Text, Modal, Pressable, Platform, Image } from "react-native";
import { LISTENER, MOD, SPEAKER } from "../shared/callProvider";
import MoreIcon from "../icons/MoreIcon";
import MicIcon from "../icons/MicIcon";
import MutedIcon from "../icons/MutedIcon";
import { getParticipantStyles } from "../shared/participantStyles";

const initials = (name) =>
  name
    ? name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
    : "";

const Participant = ({
  participant,
  local,
  modCount,
  zIndex,
  textColor,
  avatarColor,
  buttonIconColors,
}) => {
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
  const [isVisible, setIsVisible] = useState(false);
  const styles = getParticipantStyles(textColor, avatarColor, buttonIconColors);
  const profileImage = participant?.userData?.profileImage;

  const name = displayName(participant?.user_name);
  const cleanName= name.replace("✋", "");
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
              text: `Make ${cleanName}  moderator`,
              action: () => changeAccountType(participant, MOD),
            },
            {
              text: `Make ${cleanName} listener`,
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
              text: `Make ${cleanName} moderator`,
              action: () => changeAccountType(participant, MOD),
            },
            {
              text: `Make ${cleanName} speaker`,
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
      });
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

  const showMoreMenu = useMemo(() => {
    return getAccountType(local?.user_name) === MOD || participant?.local;
  }, [getAccountType, local, participant]);

  const audioTrack = useMemo(
    () =>
      participant?.tracks?.audio?.state === "playable"
        ? participant?.tracks?.audio?.track
        : null,
    [participant?.tracks?.audio?.state, participant?.tracks?.audio?.track]
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatar,
          activeSpeakerId === participant?.user_id &&
            participant?.audio &&
            styles.isActive,
        ]}
      >
        {profileImage ? (
          <Image
            source={{ uri: participant?.userData?.profileImage }}
            style={{ width: 72, height: 72, borderRadius: 999 }}
          />
        ) : (
          <Text style={styles.initials} numberOfLines={1}>
            {initials(participant?.user_name)}
          </Text>
        )}
      </View>
      {getAccountType(participant?.user_name) !== LISTENER && (
        <View style={styles.audioIcon}>
          {participant?.audio ? <MicIcon /> : <MutedIcon />}
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.role} numberOfLines={1}>
        {role}
      </Text>
      {showMoreMenu && menuOptions.length > 0 && (
        <Pressable style={styles.menuButton} onPress={() => setIsVisible(true)}>
          <MoreIcon />
        </Pressable>
      )}

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsVisible(false)}
        >
          <View style={[styles.menuModal]}>
            {menuOptions.map((option, index) => (
              <Pressable
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  option.action();
                  setIsVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    option.warning ? { color:"#FF0000" } : {},
                  ]}
                >
                  {option.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
      {audioTrack && (
        <DailyMediaView
          id={`audio-${participant.user_id}`}
          videoTrack={null}
          audioTrack={audioTrack}
        />
      )}
    </View>
  );
};
export default Participant;
