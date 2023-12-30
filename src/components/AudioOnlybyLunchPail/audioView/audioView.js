/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useMemo} from 'react';
import {View, TouchableOpacity, Text, ScrollView} from 'react-native';
import {
  LISTENER,
  MOD,
  INCALL,
  SPEAKER,
  PREJOIN,
  LEAVESCREEN,
  useCallState,
} from '../shared/callProvider';
import PropTypes from 'prop-types';
import {ActivityIndicator} from 'react-native';
import MicIcon from '../icons/MicIcon';
import MutedIcon from '../icons/MutedIcon';
import Participant from '../participant/participant';

const AudioView = ({_height}) => {
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
    callFrame,
  } = useCallState();

  useEffect(() => {
    const joinRoomAsync = async () => {
      try {
        // Await the joinRoom function to ensure it completes before proceeding
        if (view === PREJOIN && !callFrame) {
          await joinRoom();
        }
      } catch (error) {
        // Handle any errors that occur during joinRoom
        console.error('Error joining room:', error);
        // You can add specific error handling or set an error state here
      }
    };
    joinRoomAsync();
  }, []);

  const getParticipantKey = useCallback(
    participant => {
      const accountType = getAccountType(participant?.user_name);
      console.log('LOLALOG running getParticpantKEY');
      if (accountType === MOD) {
        return `speaking-${participant.user_id}`;
      } else if (accountType === SPEAKER) {
        return `speaking-${participant.user_id}`;
      } else {
        return `listening-${participant.user_id}`; // For any participant that is not a mod, speaker, or listener
      }
    },
    [getAccountType],
  );

  const local = useMemo(
    () => participants?.filter(p => p?.local)[0],
    [participants],
  );

  const mods = useMemo(
    () =>
      participants?.filter(
        p => p?.owner && getAccountType(p?.user_name) === MOD,
      ),
    [getAccountType, participants],
  );
  const speakers = useMemo(
    () => participants?.filter(p => getAccountType(p?.user_name) === SPEAKER),
    [getAccountType, participants],
  );

  const listeners2 = useMemo(
    () =>
      participants
        ?.filter(p => getAccountType(p?.user_name) === LISTENER)
        .sort((a, b) => {
          // Move raised hands to the front of the list
          return a?.user_name.includes('✋')
            ? -1
            : b?.user_name.includes('✋')
            ? 1
            : 0;
        }),
    [getAccountType, participants],
  );

  const allParticipants = useMemo(() => {
    const modsArray = mods || [];
    const speakersArray = speakers || [];
    const listeners2Array = listeners2 || [];
    const s = [...modsArray, ...speakersArray, ...listeners2Array];
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 32,
        }}>
        {s?.map(p => (
          <Participant
            participant={p}
            key={getParticipantKey(p)}
            local={local}
            modCount={mods?.length}
            zIndex={3}
          />
        ))}
      </View>
    );
  }, [mods, speakers, listeners2, getParticipantKey, local]);

  const handleAudioChange = useCallback(
    () => (local?.audio ? handleMute(local) : handleUnmute(local)),
    [handleMute, handleUnmute, local],
  );

  const handleHandRaising = useCallback(
    () =>
      local?.user_name.includes('✋') ? lowerHand(local) : raiseHand(local),
    [lowerHand, raiseHand, local],
  );

  return (
    <>
      {/* this is just some buffer that won't exist in the actiual component*/}
      <View
        style={{
          height: 75,
          backgroundColor: '#131A24',
        }}
      />
      {view == PREJOIN ? (
        <View
          style={{
            height: _height,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#131A24',
          }}>
          <ActivityIndicator size="large" color="#ffff" />
        </View>
      ) : view == LEAVESCREEN ? (
        <View
          style={{
            height: _height,
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            backgroundColor: '#131A24',
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            👋{'\n'}{'\n'}You've left the call
          </Text>
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              padding: 8,
              marginBottom: 8,
            }}>
            Have a nice day!
          </Text>
        </View>
      ) : (
        <Container hidden={view !== INCALL}>
          <View
            style={{
              backgroundColor: '#131A24',
              height: _height,
            }}>
            <ScrollView
              style={{
                padding: 16,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  padding: 8,
                  marginBottom: 8,
                }}>
                {participants.length}{' '}
                {participants.length === 1
                  ? 'person in call'
                  : 'people in call'}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  flexWrap: 'wrap',
                }}>
                {allParticipants}
              </View>
            </ScrollView>
            {/* Tray content */}
            <View
              style={{
                height: 60,
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTopWidth: 1,
                marginBottom: 32,
                paddingTop: 32,
                borderTopColor: '#333',
                backgroundColor: '#131A24',
              }}>
              <View
                style={{
                  justifyContent: 'space-between',
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  backgroundColor: '#131A24',
                }}>
                <TrayContent>
                  {[MOD, SPEAKER].includes(getAccountType(local?.user_name)) ? (
                    <>
                      <View
                        style={{
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <AudioButton onPress={handleAudioChange}>
                          {local?.audio ? <MicIcon /> : <MutedIcon />}
                        </AudioButton>
                        <ButtonCaptionText>
                          {local?.audio ? 'Mute' : 'Unmute'}
                        </ButtonCaptionText>
                      </View>
                    </>
                  ) : (
                    <HandButton onPress={handleHandRaising}>
                      <ButtonText>
                        {local?.user_name.includes('✋')
                          ? 'Lower hand'
                          : 'Raise hand ✋'}
                      </ButtonText>
                    </HandButton>
                  )}
                  {mods?.length < 2 &&
                  getAccountType(local?.user_name) === MOD ? (
                    <LeaveButton onPress={endCall} title="End Call" />
                  ) : (
                    <LeaveButton onPress={leaveCall} title="Leave" />
                  )}
                </TrayContent>
              </View>
            </View>
          </View>
        </Container>
      )}
    </>
  );
};

AudioView.propTypes = {
  editor: PropTypes.bool,
  _height: PropTypes.number,
};
const Container = ({hidden, children}) => (
  <View
    style={{
      display: hidden ? 'none' : 'flex',
      height: hidden ? 0 : '100%',
      backgroundColor: '#131A24',
    }}>
    {children}
  </View>
);

const TrayContent = ({children}) => (
  <View
    style={{
      padding: 4,
      width: '100%',
      bottom: 0,
      height: 60,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
    {children}
  </View>
);

const LeaveButton = ({onPress, title}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: '#FF0000',
      paddingHorizontal: 24,
      width: 150,
      height: 40,
      marginTop: 10,
      marginBottom: 10,
      paddingVertical: 8,
      borderRadius: 9999,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 'auto',
    }}>
    <Text
      style={{
        fontWeight: 'bold',
        color: 'white', // Text color
        fontSize: 16,
      }}>
      {title}
    </Text>
  </TouchableOpacity>
);

const HandButton = ({onPress, children}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      height: 40,
      marginTop: 10,
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    {children}
  </TouchableOpacity>
);

const AudioButton = ({onPress, children}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: '#333',
      paddingHorizontal: 8,
      paddingVertical: 8,
      width: 40,
      height: 40,
      marginTop: 10,
      paddingBottom: 4,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    {children}
  </TouchableOpacity>
);

const ButtonText = ({children, style}) => (
  <Text style={{marginLeft: 4, fontSize: 16, color: 'white', ...style}}>
    {children}
  </Text>
);

const ButtonCaptionText = ({children, style}) => (
  <Text
    style={{
      color: 'white',
      fontSize: 16,
      marginTop: 4,
      width: 60,
      textAlign: 'center',
      ...style,
    }}>
    {children}
  </Text>
);

export default AudioView;
