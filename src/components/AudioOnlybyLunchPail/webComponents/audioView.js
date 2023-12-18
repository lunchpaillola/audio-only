/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useCallback } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import {
  INCALL,
  PREJOIN,
  useCallState,
} from "../../contexts/ReactCallProvider";
import Participant from "./Participant";
import styled from "styled-components";
import { LISTENER, MOD, SPEAKER } from "../../contexts/ReactCallProvider";
import MicIcon from "./MicIcon";
import MutedIcon from "./MutedIcon";
import theme from "../theme";
import Audio from "./Audio";
import EditorView from "../editor";
import { Spinner } from "flowbite-react";

const AudioView = ({ _height, editor }) => {
  const {
    getAccountType,
    changeAccountType,
    handleMute,
    handleUnmute,
    displayName,
    joinRoom,
    leaveCall,
    endCall,
    removeFromCall,
    raiseHand,
    lowerHand,
    activeSpeakerId,
    error,
    participants,
    room,
    roomExp,
    view,
  } = useCallState();

  if (editor) {
    return <EditorView _height={_height}></EditorView>;
  }

  //Join room when theview is PreJOin
  useEffect(() => {
    //joinRoom()
    if (!editor && view === PREJOIN) {
      joinRoom();
    }
  }, []);

  useEffect(() => {
    console.log("participantsand view", participants, view);
  }, [view, participants]);

  //InCallview
  const local = useMemo(
    (p) => participants?.filter((p) => p?.local)[0],
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
    (p) =>
      participants?.filter((p) => getAccountType(p?.user_name) === SPEAKER),
    [participants, getAccountType]
  );
  const listeners = useMemo(() => {
    const l = participants
      ?.filter((p) => getAccountType(p?.user_name) === LISTENER)
      .sort((a, _) => {
        // Move raised hands to front of list
        if (a?.user_name.includes("✋")) return -1;
        return 0;
      });
    return (
      <ListeningContainer>
        {l?.map((p, i) => (
          <Participant
            participant={p}
            key={`listening-${p.user_id}`}
            local={local}
            modCount={mods?.length}
          />
        ))}
      </ListeningContainer>
    );
  }, [participants, getAccountType, local, mods]);

  const canSpeak = useMemo(() => {
    const s = [...mods, ...speakers];
    return (
      <CanSpeakContainer>
        {s?.map((p, i) => (
          <Participant
            participant={p}
            key={`speaking-${p.user_id}`}
            local={local}
            modCount={mods?.length}
          />
        ))}
      </CanSpeakContainer>
    );
  }, [mods, speakers, local]);

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
        <Spinner />
      ) : (
        <>
          <Container hidden={view !== INCALL}>
            <View
              style={{
                backgroundColor: "#131A24",
                height: _height,
                color: "white",
              }}
            >
              <View
                style={{
                  padding: 16,
                  overflowY: "auto",
                  height: _height - 60,
                }}
              >
                {canSpeak}
                {listeners}
              </View>
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
                    display: "flex",
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
                      <AudioButton onClick={handleAudioChange}>
                        {local?.audio ? (
                          <MicIcon type="simple" />
                        ) : (
                          <MutedIcon type="simple" />
                        )}
                        <ButtonText>
                          {local?.audio ? "Mute" : "Unmute"}
                        </ButtonText>
                      </AudioButton>
                    ) : (
                      <HandButton onClick={handleHandRaising}>
                        <ButtonText>
                          {local?.user_name.includes("✋")
                            ? "Lower hand"
                            : "Raise hand ✋"}
                        </ButtonText>
                      </HandButton>
                    )}
                    {mods?.length < 2 &&
                    getAccountType(local?.user_name) === MOD ? (
                      <LeaveButton onClick={endCall}>End call</LeaveButton>
                    ) : (
                      <LeaveButton onClick={leaveCall}>Leave call</LeaveButton>
                    )}
                  </TrayContent>
                  <View
                    style={{
                      backgroundColor: "#333",
                      paddingHorizontal: 24,
                      paddingVertical: 24,
                      borderRadius: 9999,
                    }}
                  ></View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#FF0000", // Button background color
                      paddingHorizontal: 24, // Horizontal padding
                      paddingVertical: 8, // Vertical padding
                      borderRadius: 9999, // Fully rounded corners
                      alignItems: "center", // Center children horizontally
                      justifyContent: "center", // Center children vertically
                    }}
                    onPress={() => {
                      // Handle button press
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: "white", // Text color, not fontColor
                        fontSize: 16,
                      }}
                    >
                      Leave
                    </Text>
                  </TouchableOpacity>
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

const Container = styled.div`
  margin: 48px 0 0;
  visibility: ${(props) => (props.hidden ? "hidden" : "visible")};
  height: ${(props) => (props.hidden ? "0" : "100%")};
`;
const CanSpeakContainer = styled.div`
  border-bottom: ${theme.colors.grey} 1px solid;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
`;
const ListeningContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
`;
const Header = styled.h2`
  font-size: ${theme.fontSize.large};
  color: ${theme.colors.greyDark};
`;
const CallHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
`;
const Tray = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 52px;
  width: 100vw;
  box-sizing: border-box;
  background-color: ${theme.colors.greyLight};
  padding: 12px;
`;
const TrayContent = styled.div`
  max-width: 700px;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
const Button = styled.button`
  font-size: ${theme.fontSize.large};
  font-weight: 600;
  border: none;
  background-color: transparent;
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background-color: ${theme.colors.greyLightest};
  }
`;
const LeaveButton = styled(Button)`
  margin-left: auto;
`;
const HandButton = styled(Button)`
  margin-right: auto;
`;
const AudioButton = styled(Button)`
  margin-right: auto;
  display: flex;
  align-items: center;
`;
const ButtonText = styled.span`
  margin-left: 4px;
`;

export default AudioView;
