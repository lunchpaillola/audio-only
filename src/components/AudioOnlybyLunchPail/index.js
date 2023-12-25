import React, {
	useEffect,
} from 'react'
import {
	Text,
	View,
	TouchableOpacity,
} from "react-native";
import PropTypes from "prop-types";
import { CallProvider, useCallState } from "../contexts/ReactNativeCallProvider";


const AudioOnlybyLunchPail = (props) => {
	const {editor, _height, url, apikey,moderator, userName} = props
	//const { joinRoom } = useCallState();

	useEffect(() => {
		console.log('running the useEffect');
		if(!editor){
		//joinRoom()
		}
}, []);



			return (
				<CallProvider participantName={userName} url={url} moderator={moderator} apikey={apikey}>
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
					</CallProvider>
			);
	};
	
	AudioOnlybyLunchPail.propTypes = {
			editor: PropTypes.bool,
			_height: AudioOnlybyLunchPail.number,
			
	};

export default AudioOnlybyLunchPail
