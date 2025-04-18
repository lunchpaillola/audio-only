/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useCallback } from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import {
  INCALL,
  PREJOIN,
  useCallState,
  LEAVESCREEN,
  ERRORSCREEN,
} from "../shared/callProvider";
import Participant from "../participant/participant";
import { LISTENER, MOD, SPEAKER } from "../shared/callProvider";
import MicIcon from "../icons/MicIcon";
import MutedIcon from "../icons/MutedIcon";
import Audio from "./Audio";
import { ActivityIndicator } from "react-native";

const AudioView = ({
  _height,
  editor,
  textColor,
  backgroundColor,
  avatarColor,
  buttonIconColors,
}) => {
  const {
    getAccountType,
    handleMute,
    handleUnmute,
    joinRoom,
    leaveCall,
    endCall,
    raiseHand,
    lowerHand,
    participants,
    view,
  } = useCallState();

  //Join room when theview is PreJOin
  useEffect(() => {
    if (!editor && view === PREJOIN) {
      joinRoom();
    }
  }, []);

  const getParticipantKey = (participant) => {
    const accountType = getAccountType(participant?.user_name);
    if (accountType === MOD) {
      return `speaking-${participant.user_id}`;
    } else if (accountType === SPEAKER) {
      return `speaking-${participant.user_id}`;
    } else {
      return `listening-${participant.user_id}`; // For any participant that is not a mod, speaker, or listener
    }
  };

  const local = useMemo(
    () => participants?.filter((p) => p?.local)[0],
    [participants]
  );

  const mods = useMemo(
    () =>
      participants?.filter(
        (p) => p?.owner && getAccountType(p?.user_name) === MOD
      ),
    [participants, getAccountType]
  );
  const speakers = useMemo(
    () => participants?.filter((p) => getAccountType(p?.user_name) === SPEAKER),
    [participants, getAccountType]
  );

  const listeners2 = useMemo(
    () =>
      participants
        ?.filter((p) => getAccountType(p?.user_name) === LISTENER)
        .sort((a, b) => {
          // Move raised hands to the front of the list
          return a?.user_name.includes("✋")
            ? -1
            : b?.user_name.includes("✋")
            ? 1
            : 0;
        }),
    [participants, getAccountType]
  );

  const allParticipants = useMemo(() => {
    const s = [...mods, ...speakers, ...listeners2];
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        {s?.map((p) => (
          <Participant
            participant={p}
            key={getParticipantKey(p)}
            local={local}
            modCount={mods?.length}
            textColor={textColor}
            avatarColor={avatarColor}
            buttonIconColors={buttonIconColors}
          />
        ))}
      </View>
    );
  }, [mods, speakers, listeners2, local, getAccountType]);

  const handleAudioChange = useCallback(
    () => (local?.audio ? handleMute(local) : handleUnmute(local)),
    [handleMute, handleUnmute, local]
  );
  const handleHandRaising = useCallback(
    () =>
      local?.user_name.includes("✋") ? lowerHand(local) : raiseHand(local),
    [lowerHand, raiseHand, local]
  );

  return (
    <>
      {view == PREJOIN ? (
        <View
          style={{
            height: _height,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: backgroundColor,
          }}
        >
          <ActivityIndicator size="large" color={textColor} />
        </View>
      ) : (view == LEAVESCREEN || view == ERRORSCREEN) ? (
        <View
          style={{
            height: _height,
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
            backgroundColor: backgroundColor,
          }}
        >
          <Text
            style={{
              color: textColor,
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {view == LEAVESCREEN
              ? "👋\n\nYou've left the call"
              : "🚫\n\nThis meeting has ended."}
          </Text>
          <Text
            style={{
              color: textColor,
              fontSize: 16,
              padding: 8,
              marginBottom: 8,
            }}
          >
            {view == LEAVESCREEN
              ? "Have a nice day!"
              : ""}
          </Text>
        </View>
      ) : (
        <>
          <Container hidden={view !== INCALL} backgroundColor={backgroundColor}>
            <View
              style={{
                backgroundColor: backgroundColor,
                height: _height,
                color: textColor,
              }}
            >
              <ScrollView
                style={{
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    color: textColor,
                    fontSize: 16,
                    padding: 8,
                    marginBottom: 8,
                  }}
                >
                  {participants.length}{" "}
                  {participants.length === 1
                    ? "person in call"
                    : "people in call"}
                </Text>
                <View
                  style={{
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  {allParticipants}
                </View>
              </ScrollView>
              {/*Tray content*/}
              <View
                style={{
                  height: 60,
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  borderTopWidth: 1,
                  marginBottom: 32,
                  paddingTop: 32,
                  borderTopColor: "#333",
                  backgroundColor: backgroundColor,
                }}
              >
                <View
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    backgroundColor: backgroundColor,
                  }}
                >
                  <TrayContent>
                    {[MOD, SPEAKER].includes(
                      getAccountType(local?.user_name)
                    ) ? (
                      <>
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AudioButton onPress={handleAudioChange}>
                            {local?.audio ? <MicIcon /> : <MutedIcon />}
                          </AudioButton>
                          <ButtonCaptionText textColor={textColor}>
                            {local?.audio ? "Mute" : "Unmute"}
                          </ButtonCaptionText>
                        </View>
                      </>
                    ) : (
                      <HandButton onPress={handleHandRaising}>
                        <ButtonText textColor={textColor}>
                          {local?.user_name.includes("✋")
                            ? "Lower hand"
                            : "Raise hand ✋"}
                        </ButtonText>
                      </HandButton>
                    )}
                    {mods?.length < 2 &&
                    getAccountType(local?.user_name) === MOD ? (
                      <LeaveButton
                        onPress={endCall}
                        title="End Call"
                        textColor={textColor}
                      >
                        End call
                      </LeaveButton>
                    ) : (
                      <LeaveButton
                        onPress={leaveCall}
                        textColor={textColor}
                        title="Leave"
                      >
                        Leave
                      </LeaveButton>
                    )}
                  </TrayContent>
                </View>
              </View>
            </View>
          </Container>
          <Audio participants={participants} />
        </>
      )}
    </>
  );
};

AudioView.propTypes = {
  editor: PropTypes.bool,
  _height: PropTypes.number,
};

const Container = ({ hidden, children, backgroundColor }) => (
  <View
    style={{
      display: hidden ? "none" : "flex",
      height: hidden ? 0 : "100%",
      backgroundColor: backgroundColor,
    }}
  >
    {children}
  </View>
);

const TrayContent = ({ children }) => (
  <View
    style={{
      padding: 4,
      width: "100%",
      bottom: 0,
      height: 60,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    {children}
  </View>
);

const LeaveButton = ({ onPress, title, textColor }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: "#FF0000",
      paddingHorizontal: 24,
      width: 150,
      height: 40,
      marginTop: 10,
      marginBottom: 10,
      paddingVertical: 8,
      borderRadius: 9999,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "auto",
    }}
  >
    <Text
      style={{
        fontWeight: "bold",
        color: textColor,
        fontSize: 16,
      }}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const HandButton = ({ onPress, children }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      height: 40,
      marginTop: 10,
      marginBottom: 10,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </TouchableOpacity>
);

const AudioButton = ({ onPress, children }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: "#333",
      paddingHorizontal: 8,
      paddingVertical: 8,
      width: 40,
      height: 40,
      marginTop: 10,
      paddingBottom: 4,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </TouchableOpacity>
);

const ButtonText = ({ children, style, textColor }) => (
  <Text style={{ marginLeft: 4, fontSize: 16, color: textColor, ...style }}>
    {children}
  </Text>
);

const ButtonCaptionText = ({ children, style, textColor }) => (
  <Text
    style={{
      color: textColor,
      fontSize: 16,
      marginTop: 4,
      width: 60,
      textAlign: "center",
      ...style,
    }}
  >
    {children}
  </Text>
);
export default AudioView;
