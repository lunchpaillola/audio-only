import React from 'react'
import PropTypes from "prop-types";
import {CallProvider} from "./shared/callProvider";
import AudioView from "./audioView/audioView";


const AudioOnlybyLunchPail = (props) => {
	const {editor, _height, url, apiKey, owner, userName} = props
	console.log('code got here' ,props);

			return (
				<CallProvider participantName={userName} url={url} owner={owner} apikey={apiKey}>
					<AudioView _height={_height} editor={editor}></AudioView>
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
			
	};

export default AudioOnlybyLunchPail
