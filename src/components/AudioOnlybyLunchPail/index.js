import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CallProvider } from "./shared/callProvider";
import AudioView from "./audioView/audioView";
import { View, ActivityIndicator } from "react-native";
import EditorView from "./editor";

const AudioOnlybyLunchPail = (props) => {
  const {
    editor,
    _height,
    url,
    apiKey,
    owner,
    userName,
    profileImage,
    textColor,
    backgroundColor,
    avatarColor,
    buttonIconColors,
    callEnded
  } = props;

  const [currentUrl, setCurrentUrl] = useState(null);

  useEffect(() => {
    if (url) {
      setCurrentUrl(url);
    }
  }, [url]);


  if (editor) {
    return <EditorView _height={_height} buttonIconColors={buttonIconColors}  textColor={textColor}
    backgroundColor={backgroundColor} avatarColor={avatarColor}
    ></EditorView>;
  }

  if (!currentUrl && !editor) {
    return (
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
    );
  }

  return (
    <CallProvider
      participantName={userName}
      url={currentUrl}
      owner={owner}
      apikey={apiKey}
      profileImage={profileImage}
      callEnded={callEnded}
    >
      <AudioView
        _height={_height}
        editor={editor}
        textColor={textColor}
        backgroundColor={backgroundColor}
        avatarColor={avatarColor}
        buttonIconColors={buttonIconColors}
      />
    </CallProvider>
  );
};

AudioOnlybyLunchPail.propTypes = {
  editor: PropTypes.bool,
  userName: PropTypes.string,
  apiKey: PropTypes.string,
  owner: PropTypes.bool,
  url: PropTypes.string,
  _height: PropTypes.number,
  profileImage: PropTypes.object, // Assuming profileImage is an object
  textColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  avatarColor: PropTypes.string,
};

export default AudioOnlybyLunchPail;
