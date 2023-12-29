import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from 'react';
import Daily from '@daily-co/react-native-daily-js';

export const CallContext = createContext(null);
export const MOD = 'MOD';
export const SPEAKER = 'SPK';
export const LISTENER = 'LST';
export const PREJOIN = 'pre-join';
export const INCALL = 'in-call';
const MSG_MAKE_MODERATOR = 'make-moderator';
const MSG_MAKE_SPEAKER = 'make-speaker';
const MSG_MAKE_LISTENER = 'make-listener';
const FORCE_EJECT = 'force-eject';

export const CallProvider = ({
  children,
  participantName,
  url,
  owner,
  apikey,
}) => {
  const [view, setView] = useState(PREJOIN); // pre-join | in-call
  const [callFrame, setCallFrame] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [roomExp, setRoomExp] = useState(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [updateParticipants, setUpdateParticipants] = useState(null);

  const getAccountType = useCallback(username => {
    if (!username) {
      return;
    }
    // check last three letters to compare to account type constants
    return username.slice(-3);
  });

  const displayName = useCallback(username => {
    if (!username) {
      return;
    }
    // return name without account type
    return username.slice(0, username.length - 4);
  });
  const endpointurl = 'https://api.daily.co/v1/';

  if (!url) {
    return null;
  }

  const room_name = url
    .split('/')
    .filter(part => part !== '')
    .pop();

  //action for creating a meeting token
  const createToken = async () => {
    try {
      const response = await fetch(endpointurl + 'meeting-tokens', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + apikey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            room_name: room_name,
            is_owner: true,
          },
        }),
      });

      const result = await response.json();
      const token = result.token;

      return token;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const joinRoom = async () => {
    console.log('LOLALOG joinRoomfunction: joiningroom');
    try {
      if (callFrame) {
        console.log('LOLALOG: there is already a callFrame so leaving');
        await callFrame.leave();
        await callFrame.destroy();
      }
      //formatting the username
      let userName;
      let newToken;
      let moderator;
      if (moderator || owner) {
        userName = `${participantName?.trim()}_${MOD}`;
        newToken = await createToken();
      } else {
        userName = `${participantName?.trim()}_${LISTENER}`;
      }

      let roomInfo = {room_name};

      const call = Daily.createCallObject({videoSource: false});

      console.log('LOLALOG: CALL', call);

      const options = {
        url: url,
        userName,
      };
      if (roomInfo.token) {
        options.token = roomInfo?.token;
      }
      if (newToken) {
        options.token = newToken;
      }

      await call.join(options);
      setError(false);
      setCallFrame(call);
      call.setLocalAudio(false);

      setView(INCALL);
    } catch (err) {
      if (err) {
        console.error(err);
        setError(err);
      }
    }
  };

  const handleJoinedMeeting = evt => {
    setUpdateParticipants(
      `joined-${evt?.participants?.local?.user_id}-${Date.now()}`,
    );
    setView(INCALL);
  };

  const handleParticipantJoinedOrUpdated = evt => {
    setUpdateParticipants(`updated-${evt?.participant?.user_id}-${Date.now()}`);
    console.log('[PARTICIPANT JOINED/UPDATED]', evt.participant);
  };
  const handleParticipantLeft = evt => {
    setUpdateParticipants(`left-${evt?.participant?.user_id}-${Date.now()}`);
    console.log('[PARTICIPANT LEFT]', evt);
  };
  const handleActiveSpeakerChange = evt => {
    console.log('[ACTIVE SPEAKER CHANGE]', evt);
    setActiveSpeakerId(evt?.activeSpeaker?.peerId);
  };

  const playTrack = evt => {
    console.log(
      '[TRACK STARTED]',
      evt.participant && evt.participant.session_id,
    );
    setUpdateParticipants(
      `track-started-${evt?.participant?.user_id}-${Date.now()}`,
    );
  };
  const destroyTrack = evt => {
    console.log('[DESTROY TRACK]', evt);
    setUpdateParticipants(
      `track-stopped-${evt?.participant?.user_id}-${Date.now()}`,
    );
  };
  const leaveCall = useCallback(() => {
    if (!callFrame) {
      return;
    }
    async function leave() {
      await callFrame.leave();
    }
    leave();
    setView(PREJOIN);
  }, [callFrame]);

  const removeFromCall = useCallback(
    participant => {
      if (!callFrame) {
        return;
      }
      console.log('[EJECTING PARTICIPANT]', participant?.user_id);
      callFrame.sendAppMessage({msg: FORCE_EJECT}, participant?.session_id);
      setUpdateParticipants(
        `eject-participant-${participant?.user_id}-${Date.now()}`,
      );
    },
    [callFrame],
  );

  const endCall = useCallback(() => {
    participants.forEach(p => removeFromCall(p));
    leaveCall();
  }, [participants, removeFromCall, leaveCall]);

  const updateUsername = useCallback(
    newAccountType => {
      if (![MOD, SPEAKER, LISTENER].includes(newAccountType)) {
        return;
      }
      /**
       * In case the user had their hand raised, let's make
       * sure to remove that emoji before updating the account type.
       */
      const split = callFrame?.participants()?.local?.user_name.split('✋ ');
      const handRemoved = split.length === 2 ? split[1] : split[0];

      const display = displayName(handRemoved);
      /**
       * The display name is what the participant provided on sign up.
       * We append the account type to their user name so to update
       * the account type we can update the last few letters.
       */
      callFrame.setUserName(`${display}_${newAccountType}`);
    },
    [callFrame],
  );

  const handleMute = useCallback(
    p => {
      if (!callFrame) {
        return;
      }
      console.log('[MUTING]');

      if (p?.user_id === 'local') {
        callFrame.setLocalAudio(false);
      } else {
        callFrame.updateParticipant(p?.session_id, {
          setAudio: false,
        });
      }
      setUpdateParticipants(`unmute-${p?.user_id}-${Date.now()}`);
    },
    [callFrame],
  );
  const handleUnmute = useCallback(
    p => {
      if (!callFrame) {
        console.log('LOLALOG CALLFRAME IS HERE RETURNING');
        return;
      }
      console.log('UNMUTING');

      if (p?.user_id === 'local') {
        callFrame.setLocalAudio(true);
      } else {
        callFrame.updateParticipant(p?.session_id, {
          setAudio: true,
        });
      }
      setUpdateParticipants(`unmute-${p?.user_id}-${Date.now()}`);
    },
    [callFrame],
  );
  const raiseHand = useCallback(
    p => {
      if (!callFrame) {
        return;
      }
      console.log('RAISING HAND');
      callFrame.setUserName(`✋ ${p?.user_name}`);
      setUpdateParticipants(`raising-hand-${p?.user_id}-${Date.now()}`);
    },
    [callFrame],
  );
  const lowerHand = useCallback(
    p => {
      if (!callFrame) {
        return;
      }
      console.log('UNRAISING HAND');
      const split = p?.user_name.split('✋ ');
      const username = split.length === 2 ? split[1] : split[0];
      callFrame.setUserName(username);
      setUpdateParticipants(`unraising-hand-${p?.user_id}-${Date.now()}`);
    },
    [callFrame],
  );

  const changeAccountType = useCallback(
    (participant, accountType) => {
      if (!participant || ![MOD, SPEAKER, LISTENER].includes(accountType)) {
        return;
      }
      /**
       * In case someone snuck in through a direct link, give their username
       * the correct formatting
       */
      let userName;
      if (
        ![MOD, SPEAKER, LISTENER].includes(
          getAccountType(participant?.user_name),
        )
      ) {
        userName = participant?.user_name + `_${accountType}`;
      }
      userName = displayName(participant?.user_name) + `_${accountType}`;
      /**
       * Direct message the participant their account type has changed.
       * The participant will then update their own username with setUserName().
       * setUserName will trigger a participant updated event for everyone
       * to then update the participant list in their local state.
       */
      const msg =
        accountType === MOD
          ? MSG_MAKE_MODERATOR
          : accountType === SPEAKER
          ? MSG_MAKE_SPEAKER
          : MSG_MAKE_LISTENER;

      console.log('[UPDATING ACCOUNT TYPE]');
      if (msg === MSG_MAKE_LISTENER) {
        handleMute(participant);
      }
      callFrame.sendAppMessage(
        {userName, id: participant?.user_id, msg},
        participant?.session_id,
      );
    },
    [getAccountType, displayName, handleMute, callFrame],
  );

  useEffect(() => {
    const handleAppMessage = async evt => {
      console.log('[APP MESSAGE]', evt);
      try {
        let userName;
        switch (evt.data.msg) {
          case MSG_MAKE_MODERATOR:
            console.log('[LEAVING]');
            await callFrame.leave();
            await callFrame.destroy();
            console.log('[REJOINING AS MOD]');
            userName = evt?.data?.userName;
            if (userName?.includes('✋')) {
              const split = userName.split('✋ ');
              userName = split.length === 2 ? split[1] : split[0];
            }
            joinRoom({
              moderator: true,
              userName,
              name: room?.name,
            });
            break;
          case MSG_MAKE_SPEAKER:
            updateUsername(SPEAKER);
            break;
          case MSG_MAKE_LISTENER:
            updateUsername(LISTENER);
            break;
          case FORCE_EJECT:
            //seeya
            leaveCall();
            break;
        }
      } catch (e) {
        console.error(e);
      }
    };

    const showError = e => {
      console.log('[ERROR]');
      console.warn(e);
    };

    if (!callFrame) {
      return;
    }
    callFrame.on('error', showError);
    callFrame.on('joined-meeting', handleJoinedMeeting);
    callFrame.on('participant-joined', handleParticipantJoinedOrUpdated);
    callFrame.on('participant-updated', handleParticipantJoinedOrUpdated);
    callFrame.on('participant-left', handleParticipantLeft);
    callFrame.on('app-message', handleAppMessage);
    callFrame.on('active-speaker-change', handleActiveSpeakerChange);
    callFrame.on('track-started', playTrack);
    callFrame.on('track-stopped', destroyTrack);

    return () => {
      // clean up
      callFrame.off('error', showError);
      callFrame.off('joined-meeting', handleJoinedMeeting);
      callFrame.off('participant-joined', handleParticipantJoinedOrUpdated);
      callFrame.off('participant-updated', handleParticipantJoinedOrUpdated);
      callFrame.off('participant-left', handleParticipantLeft);
      callFrame.off('app-message', handleAppMessage);
      callFrame.off('active-speaker-change', handleActiveSpeakerChange);
      callFrame.off('track-started', playTrack);
      callFrame.off('track-stopped', destroyTrack);
    };
  }, [callFrame, participants, destroyTrack, playTrack, updateUsername]);

  /**
   * Update participants for any event that happens
   * to keep the local participants list up to date.
   * We grab the whole participant list to make sure everyone's
   * status is the most up-to-date.
   */
  useEffect(() => {
    if (updateParticipants) {
      console.log('[UPDATING PARTICIPANT LIST]', callFrame, participants);
      const participantData = callFrame?.participants();
      const list = participantData ? Object.values(participantData) : [];
      setParticipants(list);
      console.log('LOLALOG: Listing list', list);
    }
  }, [updateParticipants, callFrame]);

  useEffect(() => {
    if (!callFrame) {
      return;
    }
    async function getRoom() {
      console.log('[GETTING ROOM DETAILS]');
      const room = await callFrame?.room();
      const exp = room?.config?.exp;
      setRoom(room);
      if (exp) {
        setRoomExp(exp * 1000 || Date.now() + 1 * 60 * 1000);
      }
    }
    getRoom();
  }, [callFrame]);

  return (
    <CallContext.Provider
      value={{
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
        callFrame,
        activeSpeakerId,
        error,
        participants,
        room,
        roomExp,
        view,
      }}>
      {children}
    </CallContext.Provider>
  );
};
export const useCallState = () => useContext(CallContext);
