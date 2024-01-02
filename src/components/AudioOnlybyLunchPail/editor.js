import React, {

} from 'react'
import {
	Text,
	View,
	TouchableOpacity,
} from "react-native";
import PropTypes from "prop-types";


const EditorView = ({_height, buttonIconColors,   textColor,
	backgroundColor,
	avatarColor, }) => {

			return (
					<View
							style={{ backgroundColor: backgroundColor, height: "100%", color: textColor }}
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
											{Array.from({ length: 12 }, (_, index) => (
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
																					backgroundColor: avatarColor,
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
																							color: textColor,
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
																	</View>
															</View>
															<View style={{ alignItems: "center" }}>
																	<Text style={{ fontSize: 12, color: textColor }}>
																			{index % 3 === 0 ? "JT" : index % 3 === 1 ? "Sara" : "Billie"}
																	</Text>
																	<Text style={{ fontSize: 12, color: textColor }}>
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
											backgroundColor: backgroundColor,
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
													backgroundColor: backgroundColor,
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
															backgroundColor: "#FF0000", 
															paddingHorizontal: 24, 
															paddingVertical: 8, 
															borderRadius: 9999, 
															alignItems: "center", 
															justifyContent: "center", 
													}}
													onPress={() => {
															// Handle button press
													}}
											>
													<Text
															style={{
																	fontWeight: "bold",
																	color: textColor, 
																	fontSize: 16,
															}}
													>
															Leave
													</Text>
											</TouchableOpacity>
									</View>
							</View>
					</View>
			);
	};
	
	EditorView.propTypes = {
			editor: PropTypes.bool,
			username: PropTypes.string,
			apikey: PropTypes.string,
			moderator: PropTypes.bool,
			url: PropTypes.string,
			_height: PropTypes.number,
			
	};

export default EditorView
