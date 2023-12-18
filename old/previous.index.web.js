import React, {
	useCallback,
	useEffect,
	useState,
	useRef
} from 'react'
import {
	Text,
	View,
	TouchableOpacity,
	StyleSheet
} from "react-native";
import PropTypes from "prop-types";
import Daily from "@daily-co/daily-js";

const AudioOnlybyLunchPail = (props) => {
	const {editor, _height, url, apikey,moderator, username} = props
	const [updateParticipants, setUpdateParticipants] = useState(null);
	const [participants, setParticipants] = useState([]);
	const [activeSpeakerId, setActiveSpeakerId] = useState(null);
 const MOD = "MOD";
	const SPEAKER = "SPK";
 const LISTENER = "LST";
	const MSG_MAKE_MODERATOR = "make-moderator";
	const MSG_MAKE_SPEAKER = "make-speaker";
	const MSG_MAKE_LISTENER = "make-listener";
	const FORCE_EJECT = "force-eject";
	

	const [callFrame, setCallFrame] = useState(null);



	const endpointurl = "https://api.daily.co/v1/";
	const urlObject = new URL(url);
const room_name = urlObject.pathname.split('/').filter(part => part !== '').pop();

  //action for creating a meeting token
  const createToken = () => {
    fetch(endpointurl + "meeting-tokens", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + apikey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          room_name: room_name,
          is_owner: moderator,
          user_name: username,
        },
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        const token = result.token;

       return token
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

	const joinRoom = useCallback(
		async () => {
				if (callFrame) {
						callFrame.leave();
				}

				/**
					* When a moderator makes someone else a moderator,
					* they first leave and then rejoin with a token.
					* In that case, we create a token for the new mod here. In this case....it'll have to be....we'll need to grab some existing info)
					
				let newToken;
				if (moderator) {
						// create a token for new moderators
						newToken = await createToken();
				}*/

				const call = Daily.createCallObject({
						audioSource: true, 
						videoSource: false,
						dailyConfig: {
								experimentalChromeVideoMuteLightOff: true,
						},
				});

				function handleJoinedMeeting(evt) {
					console.log('joined meeting', );
						setUpdateParticipants(
								`joined-${evt?.participant?.user_id}-${Date.now()}`
						);
				}

				call.on("joined-meeting", handleJoinedMeeting);

				await call
						.join({url:'https://lunchpaillabs.daily.co/BNYzg6zJ6Ln9gDOKtl7A',})
						.then(() => {
								setCallFrame(call);
								/**
									* Now mute, so everyone joining is muted by default.
									*
									* IMPROVEMENT: track a speaker's muted state so if they
									* are rejoining as a moderator, they don't have to turn
									* their mic back on.
									*/
								call.setLocalAudio(false);
						})
						.catch((err) => {
								if (err) {
										console.log('error');
								}
						});
				/**
					* Make sure every room has a moderator....rooms don't start wihtout it so need to add some UI bits...
					*/

				return () => {
						call.off("joined-meeting", handleJoinedMeeting);
				};
		},
		[callFrame]
	)

	useEffect(() => {
		if(!editor){
		joinRoom()
		}
}, []);

  /**
   * Update participants for any event that happens
   * to keep the local participants list up to date.
   * We grab the whole participant list to make sure everyone's
   * status is the most up-to-date.
   */
  useEffect(() => {
			if (updateParticipants) {
					console.log("[UPDATING PARTICIPANT LIST]");
					const list = Object.values(callFrame?.participants() || {});
					setParticipants(list);
			}
	}, [updateParticipants, callFrame]);



			return (
					<View
							style={{ backgroundColor: "#131A24", height: _height, color: "white" }}
					>
							<View
									style={{
											padding: 16,
											overflowY: "auto",
											height: _height - 60,
									}}
							>
									<View
											style={{
													display: "grid",
													gridAutoFlow: "row",
													gridAutoRows: "max-content",
													gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
													gap: 4,
											}}
									>
											{Array.from({ length: 21 }, (_, index) => (
													<View
															key={index}
															style={{
																	borderRadius: 8,
																	padding: 8,
																	display: "flex",
																	flexDirection: "column",
																	alignItems: "center",
																	overflowY: "auto",
															}}
													>
															<View style={{ position: "relative" }}>
																	<View
																			style={{
																					backgroundColor: "#2B3E56",
																					borderRadius: 50,
																					width: 64,
																					height: 64,
																					display: "flex",
																					alignItems: "center",
																					justifyContent: "center",
																					marginBottom: 8,
																			}}
																	>
																			<Text
																					style={{
																							fontSize: 24,
																							color: "#FFF",
																							// Additional styling for the text to be properly aligned and styled
																					}}
																			>
																					{index % 3 === 0 ? "J" : index % 3 === 1 ? "S" : "B"}{" "}
																			</Text>
																	</View>
																	<View
																			style={{
																					position: "absolute",
																					bottom: 0,
																					left: 0,
																					marginBottom: 8,
																					marginLeft: 8,
																			}}
																	>
																			{/* <View style={[tw`icon-circle`]}>
																																<i className="fas fa-microphone-slash text-xs text-white"></i> 
																															</View>*/}
																	</View>
																	<View
																			style={{
																					position: "absolute",
																					bottom: 0,
																					right: 0,
																					marginBottom: 8,
																					marginRight: 8,
																			}}
																	>
																			{/* <View style={[tw`icon-circle`]}>
																																		{/*  <i className="fas fa-ellipsis-h text-xs text-white"></i>
																															</View> */}
																	</View>
															</View>
															<View style={{ alignItems: "center" }}>
																	<Text style={{ fontSize: 12, color: "#fff" }}>
																			{index % 3 === 0 ? "JT" : index % 3 === 1 ? "Sara" : "Billie"}
																	</Text>
																	<Text style={{ fontSize: 12, color: "#fff" }}>
																			{index % 3 === 0 ? "Host" : "Speaker"}
																	</Text>
															</View>
													</View>
											))}
									</View>
							</View>
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
											{/*<View style={[tw`icon-circle flex flex-col items-center justify-center`]}>
																		<StyledIcon name="microphone-slash" size={24} color="#FFF" className="bg-[#424242] rounded-full p-2" />
																					<Text style={[tw`text-xs text-white mt-1`]}>Mute</Text>
																			</View>*/}
											{/*<Button
													color="#FF0000"
													onPress={() => {
															// Handle button press
													}}
											>
													Leave
											</Button> */}
									</View>
							</View>
					</View>
			);
	};
	
	AudioOnlybyLunchPail.propTypes = {
			editor: PropTypes.bool,
			username: PropTypes.string,
			apikey: PropTypes.string,
			moderator: PropTypes.bool,
			url: PropTypes.string,
			_height: AudioOnlybyLunchPail.number,
			
	};

const styles = StyleSheet.create({
	wrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	}
})

export default AudioOnlybyLunchPail
