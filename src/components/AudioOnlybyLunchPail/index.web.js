import React from 'react'
import PropTypes from "prop-types";
import {CallProvider} from "../contexts/ReactCallProvider";
import AudioView from "./webComponents/audioView";


const AudioOnlybyLunchPail = (props) => {
	const {editor, _height, url, apiKey,moderator, userName} = props
	//const { joinRoom } = useCallState();

			return (
				<CallProvider participantName={userName} url={url} moderator={moderator} apikey={apiKey}>
					<AudioView _height={_height} editor={editor}></AudioView>
					</CallProvider>
			);
	};
	
	AudioOnlybyLunchPail.propTypes = {
			editor: PropTypes.bool,
			userName: PropTypes.string,
			apiKey: PropTypes.string,
			moderator: PropTypes.bool,
			url: PropTypes.string,
			_height: PropTypes.number,
			
	};

export default AudioOnlybyLunchPail
