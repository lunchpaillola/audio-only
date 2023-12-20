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
import MicIcon from "../icons/MicIcon";
import MutedIcon from "../icons/MutedIcon";
import theme from "../theme";
import Audio from "./Audio";
import EditorView from "../editor";
import { ActivityIndicator } from "react-native";

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

  useEffect(() => {console.log('changing all Particpants', allParticipants)}, [allParticipants]);

  const getParticipantKey = (participant) => {
    const accountType = getAccountType(participant?.user_name);
    console.log('accountType billie', accountType);
    if (accountType === MOD) {
      return `speaking-${participant.user_id}`;
    } else if (accountType === SPEAKER) {
      return `speaking-${participant.user_id}`;
    } else {
      return `listening-${participant.user_id}`; // For any participant that is not a mod, speaker, or listener
    }
  };

  //InCallview
  const ghostParticipants = useMemo(() => {
    // Filter out participants who are not speakers, listeners, or moderators
    const ghostParticipantsList = participants?.filter((p) => {
      const accountType = getAccountType(p?.user_name);
      return (
        accountType !== SPEAKER &&
        accountType !== LISTENER &&
        accountType !== MOD
      );
    });

    // Render the filtered participants
    return (
      <ListeningContainer>
        {" "}
        {/* Use an appropriate container for ghost participants */}
        {ghostParticipantsList?.map((p) => (
          <Participant
            participant={p}
            key={`listener-${p.user_id}`}
            local={local}
            modCount={mods?.length}
          />
        ))}
      </ListeningContainer>
    );
  }, [participants, getAccountType, local, mods]);

  const ghostParticipants2 = useMemo(() => 
  participants?.filter(p => {
    const accountType = getAccountType(p?.user_name);
    return accountType !== SPEAKER && accountType !== LISTENER && accountType !== MOD;
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
    () =>
      participants?.filter((p) => getAccountType(p?.user_name) === SPEAKER),
    [participants, getAccountType]
  );

  const listeners2 = useMemo(() => participants
  ?.filter((p) => getAccountType(p?.user_name) === LISTENER)
  .sort((a, b) => {
    // Move raised hands to the front of the list
    return a?.user_name.includes("✋") ? -1 : b?.user_name.includes("✋") ? 1 : 0;
  }),
  [participants, getAccountType]
);



const listeners = useMemo(() => {
  const l = [...listeners2, ...ghostParticipants2];
  return (
    <ListeningContainer>
      {l?.map((p) => (
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



  /*const listeners = useMemo(() => {
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
  }, [participants, getAccountType, local, mods]);*/

  const canSpeak = useMemo(() => {
    const s = [...mods, ...speakers];
    return (
      <CanSpeakContainer>
        {s?.map((p) => (
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

  const allParticipants = useMemo(() => {
    const s = [...mods, ...speakers, ...listeners2, ...ghostParticipants2]
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
  }, [mods, speakers,listeners2, ghostParticipants2, local, getAccountType]);




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
                {allParticipants}
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
                          <ButtonCaptionText>
                            {local?.audio ? "Mute" : "Unmute"}
                          </ButtonCaptionText>
                        </View>
                      </>
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
                      <LeaveButton onPress={endCall} title="End Call">
                        End call
                      </LeaveButton>
                    ) : (
                      <LeaveButton onPress={leaveCall} title="Leave call">
                        Leave call
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

const Container = styled.div`
  visibility: ${(props) => (props.hidden ? "hidden" : "visible")};
  height: ${(props) => (props.hidden ? "0" : "100%")};
`;
const CanSpeakContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const ListeningContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const CombinedContainer = styled.div`
  display: flex;
  flex-direction: row; 
  flex-wrap: wrap;
  gap: 32px; 
`;

const TrayContent = styled.div`
  padding: 8px;
  width: 100vw;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
const LeaveButton = ({ onPress, title }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: "#FF0000",
      paddingHorizontal: 24,
      width: 150,
      height: 44,
      marginTop: 10,
      marginBottom:10,
      margin: 8,
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
const HandButton = styled(Button)`
  margin-right: auto;
  &:hover {
    background-color: transparent;
  }
`;
const AudioButton = ({ onPress, children }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: "#333",
      paddingHorizontal: 8,
      paddingVertical: 8,
      width: 44,
      height: 44,
      borderRadius: 9999,
      flexDirection: "vertical",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </TouchableOpacity>
);

const ButtonText = styled.span`
  margin-left: 4px;
  font-size: 16px;
  color: white;
`;

const ButtonCaptionText = styled.span`
  color: white;
  font-size: 16px;
  margin-top: 4px;
  width: 60px;
  text-align: center;
`;
export default AudioView;
