/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useMemo } from "react";
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import {
  LISTENER,
  MOD,
  INCALL,
  SPEAKER,
  PREJOIN,
  useCallState,
} from "../contexts/CallProvider";
import EditorView from "../editor";
import PropTypes from "prop-types";
import Participant from "./Participant";
import { ActivityIndicator } from "react-native";
import MicIcon from "../nativeIcons/MicIcon";
import MutedIcon from "../nativeIcons/MutedIcon";

const AudioView = ({ _height, editor }) => {
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

  if (editor) {
    return <EditorView _height={_height}></EditorView>;
  }

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

  const ghostParticipants2 = useMemo(
    () =>
      participants?.filter((p) => {
        const accountType = getAccountType(p?.user_name);
        return (
          accountType !== SPEAKER &&
          accountType !== LISTENER &&
          accountType !== MOD
        );
      }),
    [participants, getAccountType]
  );

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
    const s = [...mods, ...speakers, ...listeners2, ...ghostParticipants2];
    return (
      <CombinedContainer>
        {s?.map((p) => (
          <Participant
            participant={p}
            key={getParticipantKey(p)}
            local={local}
            modCount={mods?.length}
          />
        ))}
      </CombinedContainer>
    );
  }, [mods, speakers, listeners2, ghostParticipants2, local, getAccountType]);

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
      {editor ? (
        <EditorView _height={_height}></EditorView>
      ) : view !== INCALL ? (
        <View
          style={{
            height: _height,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#ffff" />
        </View>
      ) : (
        <>
          <Container hidden={view !== INCALL}>
            <View
              style={{
                backgroundColor: "#131A24",
                height: _height,
              }}
            >
              <ScrollView
                style={{
                  padding: 16,
                  height: _height - 60,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center", 
                    alignItems: "center", 
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
                  backgroundColor: "#131A24",
                }}
              >
                <View
                  style={{    
                    justifyContent: "space-between",
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    backgroundColor: "#131A24",
                  }}
                >
                  <TrayContent>
                    {[MOD, SPEAKER].includes(
                      getAccountType(local?.user_name)
                    ) ? (
                      <>
                        <View
                          style={{
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AudioButton onPress={handleAudioChange}>
                            {local?.audio ? <MicIcon /> : <MutedIcon />}
                          </AudioButton>
                          <ButtonCaptionText>
                            {local?.audio ? "Mute" : "Unmute"}
                          </ButtonCaptionText>
                        </View>
                      </>
                    ) : (
                      <HandButton onPress={handleHandRaising}>
                        <ButtonText>
                          {local?.user_name.includes("✋")
                            ? "Lower hand"
                            : "Raise hand ✋"}
                        </ButtonText>
                      </HandButton>
                    )}
                    {mods?.length < 2 &&
                    getAccountType(local?.user_name) === MOD ? (
                      <LeaveButton onPress={endCall} title="End Call">
                        End call
                      </LeaveButton>
                    ) : (
                      <LeaveButton onPress={leaveCall} title="Leave">
                        Leave
                      </LeaveButton>
                    )}
                  </TrayContent>
                </View>
              </View>
            </View>
          </Container>
        </>
      )}
    </>
  );
};

AudioView.propTypes = {
  editor: PropTypes.bool,
  _height: PropTypes.number,
};

const Container = ({ hidden }) => (
  <View
    style={{
      display: hidden ? "none" : "flex",
      height: hidden ? 0 : "100%",
      flex: 1,
    }}
  />
);


const CombinedContainer = () => (
  <View
    style={{
      flexDirection: "row",
      flexWrap: "wrap",
      paddingBottom: 32,
      gap: 40,
    }}
  />
);

const TrayContent = () => (
  <View
    style={{
      padding: 4,
      width: "100%",
      height: 60,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  />
);

const LeaveButton = ({ onPress, title }) => (
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
        color: "white", // Text color
        fontSize: 16,
      }}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const HandButton = ({ onPress, buttonText }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
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
      backgroundColor: "#FF0000", 
    }}
  >
    <Text style={{ fontWeight: "bold", color: "white", fontSize: 16 }}>
      {buttonText}
    </Text>
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

const ButtonText = ({ children, style }) => (
  <Text style={{ marginLeft: 4, fontSize: 16, color: "white", ...style }}>
    {children}
  </Text>
);

const ButtonCaptionText = ({ children, style }) => (
  <Text
    style={{
      color: "white",
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
