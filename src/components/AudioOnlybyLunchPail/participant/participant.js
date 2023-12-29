/* eslint-disable react-native/no-inline-styles */
import React, {useMemo, useState} from 'react';
import {DailyMediaView} from '@daily-co/react-native-daily-js';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import theme from '../shared/theme';
import {
  useCallState,
  LISTENER,
  MOD,
  SPEAKER,
} from '../shared/callProvider';
import Menu from '../shared/Menu';
import MicIcon from '../icons/MicIcon';
import MutedIcon from '../icons/MutedIcon';
import MoreIcon from '../icons/MoreIcon';

const AVATAR_DIMENSION = 72;
const ADMIN_BADGE = '';

const initials = name =>
  name
    ? name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
    : '';

const Participant = ({participant, local, modCount, zIndex}) => {
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

  const name = displayName(participant?.user_name);
  //Translating the role for the user to the
  const role =
    getAccountType(participant?.user_name) === MOD
      ? 'Host'
      : getAccountType(participant?.user_name) === SPEAKER
      ? 'Speaker'
      : getAccountType(participant?.user_name) === LISTENER
      ? 'Listener'
      : 'Listener';

  const menuOptions = useMemo(() => {
    const mutedText = participant?.audio ? 'Mute' : 'Unmute';

    const audioAction = participant?.audio
      ? id => handleMute(id)
      : id => handleUnmute(id);

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
        text: 'Mute',
        action: () => handleMute(participant),
      });
    }

    switch (getAccountType(participant?.user_name)) {
      case SPEAKER:
        if (!participant?.local) {
          const o = [
            {
              text: 'Make moderator',
              action: () => changeAccountType(participant, MOD),
            },
            {
              text: 'Make listener',
              action: () => changeAccountType(participant, LISTENER),
            },
            {
              text: 'Remove from call',
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
            text: participant?.user_name.includes('✋')
              ? 'Lower hand'
              : 'Raise hand ✋',
            action: participant?.user_name.includes('✋')
              ? () => lowerHand(participant)
              : () => raiseHand(participant),
          });
        } else {
          const o = [
            {
              text: 'Make moderator',
              action: () => changeAccountType(participant, MOD),
            },
            {
              text: 'Make speaker',
              action: () => changeAccountType(participant, SPEAKER),
            },
            {
              text: 'Remove from call',
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
        text: lastMod ? 'End call' : 'Leave call',
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
      participant?.tracks?.audio?.state === 'playable'
        ? participant?.tracks?.audio?.track
        : null,
    [participant?.tracks?.audio?.state, participant?.tracks?.audio?.track],
  );

  console.log(
    'LOLALOG: Rendering DailyMediaView for participant:',
    participant.user_id,
    'Audio track:',
    audioTrack,
  );

  return (
    <View
      style={[
        styles.container,
        {zIndex, elevation: Platform.OS === 'android' ? zIndex : 0},
      ]}>
      <View
        style={[
          styles.avatar,
          activeSpeakerId === participant?.user_id &&
            participant?.audio &&
            styles.isActive,
        ]}>
        <Text style={styles.initials} numberOfLines={1}>
          {initials(participant?.user_name)}
        </Text>
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
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsVisible(!isVisible)}>
          <MoreIcon />
        </TouchableOpacity>
      )}
      {isVisible && (
        <View style={styles.menuContainer}>
          <Menu options={menuOptions} setIsVisible={setIsVisible} />
        </View>
      )}
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

const Container = ({children}) => (
  <View
    style={{
      margin: 8,
      flex: 1,
      alignItems: 'flex-start',
      position: 'relative',
      maxWidth: 104,
      flexDirection: 'column',
    }}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    margin: 8,
    flex: 1,
    alignItems: 'flex-start',
    position: 'relative',
    maxWidth: 104,
    flexDirection: 'column',
  },

  avatarText: {
    fontSize: 16,
    color: '#fff',
  },
  audioIcon: {
    position: 'absolute',
    backgroundColor: '#1f2d3d',
    width: 32,
    height: 32,
    top: AVATAR_DIMENSION - 28,
    paddingTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  menuButton: {
    backgroundColor: '#1f2d3d',
    width: 32,
    height: 32,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    top: AVATAR_DIMENSION - 28,
    padding: 0,
    right: 32,
  },
  menuContainer: {
    position: 'absolute',
    bottom: -64,
    right: -96,
    zIndex: 10,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 9999,
    backgroundColor: '#2b3e56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#fff',
    marginVertical: 4,
    fontWeight: '400',
    paddingTop: 8,
    fontSize: 12,
    width: 72,
    textAlign: 'center',
    lineHeight: 12,
  },
  role: {
    color: '#c8d1dc',
    marginVertical: 4,
    fontWeight: '400',
    fontSize: 12,
    width: 72,
    textAlign: 'center',
    lineHeight: 12,
  },
  initials: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 32,
  },
  isActive: {
    borderColor: 'green',
    borderWidth: 2,
  },
  isMuted: {
    backgroundColor: '#2b3e56',
  },
  showMore: {
    backgroundColor: theme.colors.white,
    padding: 4,
    borderRadius: 24,
    position: 'absolute',
    top: -50,
    right: -6,
  },
  menu: {
    position: 'absolute',
    top: AVATAR_DIMENSION - 28,
    right: -4,
    zIndex: 15,
    backgroundColor: theme.colors.white,
    padding: 4,
    borderRadius: 16,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
  },
});

export default Participant;
