import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { socketClient } from "../../utils";
import MeetingChatBox from "./MeetingChatBox";
import MeetingUserList from "./MeetingUserList";
import MeetingVideo from "./MeetingVideo";
import MeetingInfo from "./MeetingInfo";
import { isAuthenticated } from '../../store/reducers/user.reducer';
import {
	getTeamInfo,
} from '../../store/reducers/team.reducer'
import { getMeetingMessages } from '../../store/reducers/meeting.reducer'
import Janus from '../../janus'
import { janusServer, baseURL, getAmTime } from '../../utils'
import { debounce } from 'lodash'
import { v4 } from 'uuid'

// ***React Material***
import './meeting.css';
import { Button, IconButton, Tooltip, Snackbar, Alert, Badge, Avatar } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InfoIcon from '@mui/icons-material/Info';
import ChatIcon from '@mui/icons-material/Chat';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';



function useQuery() {
	return new URLSearchParams(useLocation().search);
}

const Meeting = (props) => {
	let query = useQuery()
	const history = useHistory()
	const { teamId, meetingId } = useParams()
	const dispatch = useDispatch()
	const userReducer = useSelector(state => state.userReducer)
	const teamReducer = useSelector(state => state.teamReducer)
	const meetingReducer = useSelector(state => state.meetingReducer)
	const [members, setMembers] = useState([])
	const [isOpenInfo, setIsOpenInfo] = useState(false);
	const [isOpenUsers, setIsOpenUsers] = useState(false);
	const [isOpenChat, setIsOpenChat] = useState(false);
	const [isVideoActive, setIsVideoActive] = useState(true);
	const [isAudioActive, setIsAudioActive] = useState(query.get('audio') == 'true' || false);
	const [isEnableVideo, setIsEnableVideo] = useState(false);
	const [isEnableAudio, setIsEnableAudio] = useState(false);
	const [isMeetingEnd, setIsMeetingEnd] = useState(false);
	const [message, setMessage] = useState('')
	const [trigger, setTrigger] = useState(v4())

	//******************janus************
	let janus = null;
	let myId = null;
	let mypvtId = null;
	const opaqueId = "videoroomtest-" + Janus.randomString(12)
	const myVideo = useRef();
	const myStream = useRef();
	const sfuRef = useRef()
	const feedRefs = useRef([])
	const remoteStreams = useRef([])
	const remoteVideos = useRef([])
	const remoteAudios = useRef([])

	function getConnectedDevices(type, callback) {
		navigator.mediaDevices.enumerateDevices()
			.then(devices => {
				const filtered = devices.filter(device => device.kind === type);
				callback(filtered);
			});
	}

	const publishOwnFeed = (useAudio) => {
		console.log(`PUBLISH OWN FEED CALL`)
		sfuRef.current && sfuRef.current.createOffer(
			{
				media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },
				// simulcast: doSimulcast,
				// simulcast2: doSimulcast2,
				success: function (jsep) {
					Janus.debug("Got publisher SDP!", jsep);
					const publish = { request: "configure", audio: useAudio, video: true };
					sfuRef.current.send({ message: publish, jsep: jsep });
				},
				error: function (error) {
					Janus.error("WebRTC error:", error);
					if (useAudio) {
						publishOwnFeed(false);
						// setIsVideoActive(true)
						// setIsAudioActive(false)
					} else {
						alert('WebRTC Error')
					}
				}
			});
	}

	const newRemoteFeed = (id, display, audio, video) => {
		let remoteFeed = null;
		janus.attach({
			plugin: "janus.plugin.videoroom",
			opaqueId: opaqueId,
			success: function (pluginHandle) {
				console.log(`new remote feed, ${pluginHandle}`)
				remoteFeed = pluginHandle;
				remoteFeed.simulcastStarted = false;
				Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
				Janus.log("  -- This is a subscriber");
				let subscribe = {
					request: "join",
					room: Number(meetingId),
					ptype: "subscriber",
					feed: id,
					private_id: mypvtId
				};
				remoteFeed.videoCodec = video;
				remoteFeed.send({ message: subscribe });
			},
			error: function (error) {
				Janus.error("  -- Error attaching plugin...", error);
				alert("Error attaching plugin... " + error.message);
			},
			iceState: function (state) {
				console.log("ICE state of this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") changed to " + state);
			},
			webrtcState: function (on) {
				console.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
			},
			onmessage: function (msg, jsep) {
				let event = msg["videoroom"];
				if (msg["error"]) {
					alert(msg["error"]);
				} else if (event) {
					if (event === "attached") {
						console.log('new remote attach', msg)
						for (let i = 0; i < 6; i++) {
							if (!feedRefs.current[i]) {
								feedRefs.current[i] = remoteFeed;
								remoteFeed.rfindex = i;
								break;
							}
						}
						remoteFeed.rfid = msg["id"];
						remoteFeed.rfdisplay = msg["display"];
						console.log("Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
					} else if (event === "event") {
						//**************************************************************************************//

						//**************************************************************************************//
					}
				}
				if (jsep) {
					console.log('jsep answer ')
					Janus.debug("Handling SDP as well...", jsep);
					let stereo = (jsep.sdp.indexOf("stereo=1") !== -1);
					// Answer and attach
					remoteFeed.createAnswer(
						{
							jsep: jsep,
							// Add data:true here if you want to subscribe to datachannels as well
							// (obviously only works if the publisher offered them in the first place)
							media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
							customizeSdp: function (jsep) {
								if (stereo && jsep.sdp.indexOf("stereo=1") == -1) {
									// Make sure that our offer contains stereo too
									jsep.sdp = jsep.sdp.replace("useinbandfec=1", "useinbandfec=1;stereo=1");
								}
							},
							success: function (jsep) {
								Janus.debug("Got SDP!", jsep);
								let body = { request: "start", room: Number(meetingId) };
								remoteFeed.send({ message: body, jsep: jsep });
							},
							error: function (error) {
								Janus.error("WebRTC error:", error);
								alert("WebRTC error... " + error.message);
							}
						});
				}
			},

			onremotestream: stream => {
				remoteStreams.current[remoteFeed.rfindex] = {
					stream,
					name: JSON.parse(remoteFeed.rfdisplay).name,
					userId: JSON.parse(remoteFeed.rfdisplay).userId
				};
				let videoTracks = stream.getVideoTracks();
				// let debounceFunc = debounce((videoTracks) => {
				// 	console.log(`remotestream debounce call ${Date.now()}`)
				// 	if (!videoTracks || videoTracks.length === 0) {
				// 		remoteVideos.current[remoteFeed.rfindex] = false
				// 	} else {
				// 		remoteVideos.current[remoteFeed.rfindex] = true
				// 	}
				// 	setTrigger(v4())
				// }, 1000)

				debounceFunc(videoTracks, remoteFeed.rfindex)
			},
			oncleanup: function () {
				console.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
				remoteFeed.simulcastStarted = false;
				feedRefs.current.splice(remoteFeed.rfindex, 1)
				remoteStreams.current.splice(remoteFeed.rfindex, 1)
				for (let i = remoteFeed.rfindex; i < feedRefs.current.length; i++) {
					feedRefs.current[i].rfindex--;
				}
				setTrigger(v4())
			}
		})
	}

	let debounceFunc = useCallback(
		debounce((videoTracks, rfindex) => {
			if (!videoTracks || videoTracks.length === 0) {
				remoteVideos.current[rfindex] = false
			} else {
				remoteVideos.current[rfindex] = true
			}
			setTrigger(v4())
		}, 1000), [])

	useEffect(() => {
		if (meetingReducer.meeting.members.length && members.length) {
			let length = meetingReducer.meeting.members.length
			let users
			if (length > members.length) {
				users = meetingReducer.meeting.members.filter(user => members.findIndex(u => u.userId == user.userId) < 0)
				if (users && users.length) {
					setMessage(`${users[0].userName} join`)
				}
			} else if (length < members.length) {
				users = members.filter(user => meetingReducer.meeting.members.findIndex(u => u.userId == user.userId) < 0)
				if (users && users.length) {
					setMessage(`${users[0].userName} out`)
				}
			}
		}
		setMembers([...meetingReducer.meeting.members])
	}, [meetingReducer.meeting.members.length])

	useEffect(() => {
		if (!userReducer.loaded) {
			dispatch(isAuthenticated())
		}
		dispatch(getTeamInfo({ teamId }))

		getConnectedDevices('videoinput', (cameras) => {
			if (cameras.length) setIsEnableVideo(true);
		})

		getConnectedDevices('audioinput', (audios) => {
			if (audios.length) setIsEnableAudio(true);
		})

		window.addEventListener('beforeunload', function (e) {
			e.preventDefault()
		});

		socketClient.on('receive-end-meeting', ({ currentMeetingId }) => {
			if (currentMeetingId == meetingId) {
				setIsMeetingEnd(true)
			}
		})

	}, []);

	useEffect(() => {
		if (teamReducer.teamLoaded) {
			let members = teamReducer.team.members;
			let meetingId = teamReducer.team.meetingActive && teamReducer.team.meetingActive.id;
			if (localStorage.getItem('user')) {
				let userId = JSON.parse(localStorage.getItem('user')).id
				let member = members.find(member => member.id === userId)
				if (!member) {
					history.push('/notfound')
				}
			} else {
				history.push('/notfound')
			}

			let meeting = teamReducer.team.meetingActive
			// if (!meeting) {
			//     history.push(`/notfound`)
			// }
			if (!meeting || !meeting.active) {
				setIsMeetingEnd(true)
			} else {
				Janus.init({
					debug: 'all', callback: () => {
						janus = new Janus({
							server: janusServer,
							iceServers: [{
								url: 'turn:numb.viagenie.ca',
								credential: 'muazkh',
								username: 'webrtc@live.com'
							},],
							success: function () {
								janus.attach({
									plugin: "janus.plugin.videoroom",
									opaqueId,
									success: (pluginHandle) => {
										sfuRef.current = pluginHandle;
										const register = {
											request: "join",
											room: Number(meetingId),
											ptype: "publisher",
											display: JSON.stringify({
												name: userReducer.user.firstName + ' ' + userReducer.user.lastName,
												userId: userReducer.user.id
											}),
										};
										sfuRef.current.send({ message: register });
									},
									iceState: function (state) {
										Janus.log("ICE state changed to " + state);
									},
									mediaState: function (medium, on) {
										Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
									},
									webrtcState: function (on) {
										Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
										if (!on) {
											console.log('no on')
											return;
										}
									},
									onmessage: (msg, jsep) => {
										console.log(msg);
										const event = msg["videoroom"];
										if (event) {
											if (event === 'joined') {
												console.log(`JOINED MESSAGE CALL`)
												myId = msg["id"];
												mypvtId = msg["private_id"];
												publishOwnFeed(true);

												if (msg["publishers"]) {
													let list = msg["publishers"];
													Janus.debug("Got a list of available publishers/feeds:", list);
													for (let f in list) {
														let id = list[f]["id"];
														let display = list[f]["display"];
														let audio = list[f]["audio_codec"];
														let video = list[f]["video_codec"];
														Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
														newRemoteFeed(id, display, audio, video);
													}
												}
											} else if (event === 'event') {
												if (msg["publishers"]) {
													let list = msg["publishers"];
													Janus.debug("Got a list of available publishers/feeds:", list);
													for (let f in list) {
														let id = list[f]["id"];
														let display = list[f]["display"];
														let audio = list[f]["audio_codec"];
														let video = list[f]["video_codec"];
														Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
														newRemoteFeed(id, display, audio, video);
													}
												} else if (msg["leaving"]) {
													// One of the publishers has gone away?
													let leaving = msg["leaving"];
													console.log("Publisher left: " + leaving);
													let remoteFeed = null;
													for (let i = 0; i < 6; i++) {
														if (feedRefs.current[i] && feedRefs.current[i].rfid == leaving) {
															remoteFeed = feedRefs.current[i];
															break;
														}
													}
													if (remoteFeed != null) {
														Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
														console.log(`remote feed leaving ${remoteFeed.rfindex}`)
														remoteFeed.detach();
													}
												}
											}

											if (jsep) {
												Janus.debug("Handling SDP as well...", jsep);
												sfuRef.current.handleRemoteJsep({ jsep: jsep });
												// Check if any of the media we wanted to publish has
												// been rejected (e.g., wrong or unsupported codec)
												let audio = msg["audio_codec"];
												if (myStream.current && myStream.current.getAudioTracks() && myStream.current.getAudioTracks().length > 0 && !audio) {
													// Audio has been rejected
													console.warning("Our audio stream has been rejected, viewers won't hear us");
												}
												let video = msg["video_codec"];
												if (myStream.current && myStream.current.getVideoTracks() && myStream.current.getVideoTracks().length > 0 && !video) {
													// Video has been rejected
													console.warning("Our video stream has been rejected, viewers won't see us");
													// Hide the webcam video
													myVideo.current = null;
												}
											}
										}
									},
									onlocalstream: (stream) => {
										console.log(`ON LOCAL STREAM CALL`)
										Janus.attachMediaStream(myVideo.current, stream);
										myStream.current = stream;
										let videoTracks = stream.getVideoTracks();
										if (sfuRef.current.webrtcStuff.pc.iceConnectionState !== "completed" &&
											sfuRef.current.webrtcStuff.pc.iceConnectionState !== "connected") {
											// alert("publishing...")
										}
										if (!videoTracks || videoTracks.length === 0) {
											// myVideo.current = null;
										}
										// if (!isVideoActive) {
										// 	sfuRef.current.muteVideo();
										// 	sfuRef.current.createOffer({
										// 		media: { removeVideo: true },
										// 		success: (jsep) => {
										// 			sfuRef.current.send({ message: { request: "configure" }, jsep: jsep })
										// 		},
										// 		error: (error) => { console.log(error) }
										// 	})
										// } else {
										// 	sfuRef.current.unmuteVideo();
										// }
										if (!isAudioActive) {
											sfuRef.current.muteAudio()
										}
									},
									oncleanup: function () {
										Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
										myStream.current = null;
									},
									error: (error) => {
										console.log(error)
									},
									destroyed: function () {
										window.location.reload();
									}
								})
							}
						})
					}
				})
				dispatch(getMeetingMessages({
					meetingId
				}))
				socketClient.emit("join-meeting", { teamId, meetingId, userId: userReducer.user.id, isAudioActive })
			}
		}
	}, [teamReducer.teamLoaded])

	const toggleAudio = (event) => {
		event.preventDefault()
		let muted = sfuRef.current.isAudioMuted();
		Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
		if (muted) {
			sfuRef.current.unmuteAudio();
			socketClient.emit('meeting-audio-change', {
				isAudioActive: true,
				userId: userReducer.user.id,
				meetingId: Number(meetingReducer.meeting.id)
			})
			setIsAudioActive(true)
		}
		else {
			sfuRef.current.muteAudio();
			socketClient.emit('meeting-audio-change', {
				isAudioActive: false,
				userId: userReducer.user.id,
				meetingId: Number(meetingReducer.meeting.id)
			})
			setIsAudioActive(false)
		}
	}

	const toggleVideo = (event) => {
		event.preventDefault()
		let muted = sfuRef.current.isVideoMuted();
		console.log(`MUTED ${muted}`)
		Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
		if (muted) {
			sfuRef.current.unmuteVideo();
			sfuRef.current.createOffer({
				media: { replaceVideo: true },
				success: (jsep) => {
					sfuRef.current.send({ message: { request: "configure" }, jsep: jsep })
				},
				error: (error) => { console.log(error) }
			})
			setIsVideoActive(true)
		} else {
			sfuRef.current.muteVideo();
			sfuRef.current.createOffer({
				media: { removeVideo: true },
				success: (jsep) => {
					sfuRef.current.send({ message: { request: "configure" }, jsep: jsep })
				},
				error: (error) => { console.log(error) }
			})
			setIsVideoActive(false)
		}
	}

	const handleVisibleChat = () => {
		if (isOpenUsers) {
			setIsOpenUsers(false);
		}

		if (isOpenInfo) {
			setIsOpenInfo(false);
		}
		setIsOpenChat(!isOpenChat);
	}

	const handleVisibleUsers = () => {
		if (isOpenChat) {
			setIsOpenChat(false);
		}

		if (isOpenInfo) {
			setIsOpenInfo(false);
		}
		setIsOpenUsers(!isOpenUsers);
	}

	const handleVisibleInfo = () => {
		if (isOpenUsers) {
			setIsOpenUsers(false);
		}

		if (isOpenChat) {
			setIsOpenChat(false);
		}
		setIsOpenInfo(!isOpenInfo);
	}

	const handleEndMeeting = () => {
		// console.log(myVideo.current.srcObject)
		// myVideo.current.srcObject.getTracks().forEach((track) => {
		//     console.log(track)
		//     track.stop();
		// });
		// socketClient.emit('disconnect-meeting');
		window.open("", "_self").close();
	}

	const getTimeInfo = () => {

		return new Date().getHours() + ':' + new Date().getMinutes().toPrecision(2);
	}

	return (
		!isMeetingEnd ? <div className="room-meeting">
			<div className="room-content">
				<div className="my-video">
					<video ref={myVideo} muted autoPlay />
					{(!isEnableVideo || !isVideoActive) &&
						<div style={{
							position: 'absolute',
							left: '20px',
							bottom: '-1px',
							width: '251px',
							height: '181px',
							backgroundColor: '#3c4043',
							borderRadius: '15px'
						}}>
							<Avatar sx={{ width: "70px", height: '70px', zIndex: 10, position: 'absolute', bottom: '55px', left: '90px' }}
								src={`${baseURL}/api/user/avatar/${userReducer.user.id}`}
								alt={userReducer.user.firstName} />
						</div>}
					<h4>You {!isAudioActive && <MicOffIcon />}</h4>
				</div>
				<div className="meeting-remote-videos"
					style={{ width: isOpenChat || isOpenUsers || isOpenInfo ? '60%' : '80%' }}>
					<MeetingVideo remoteStreams={remoteStreams} remoteVideos={remoteVideos} remoteAudios={remoteAudios} />
				</div>
				<div className="meeting-box" style={{
					width: isOpenChat || isOpenInfo || isOpenUsers ? '350px' : '0%'
				}}>

					{isOpenInfo && <MeetingInfo infoVisible={handleVisibleInfo} />}

					{isOpenChat && <MeetingChatBox chatVisible={handleVisibleChat} />}

					{isOpenUsers && <MeetingUserList usersVisible={handleVisibleUsers} members={meetingReducer.meeting.members} />}
				</div>

			</div>
			<div className="meeting-btn-list" >
				<div style={{
					width: "30%",
					color: '#fff',
					fontSize: "18px",
					display: 'flex',
					alignItems: 'center'
				}}>
					<strong style={{ color: '#FFF' }}>
						Time: {getAmTime(Date.now())}
					</strong>
				</div>
				<div className="btn-mid" style={{
					display: 'flex',
					justifyContent: 'center',
					width: '40%'
				}} >
					{
						!isEnableVideo ?
							<Tooltip placement="top" title="No camera found">
								<div>
									<IconButton aria-label="No camera" disabled>
										<i className="fas fa-video-slash"></i>
									</IconButton>
								</div>
							</Tooltip >
							:
							<IconButton onClick={toggleVideo} >
								{!isVideoActive ?
									<Tooltip placement="top" title="Turn on camera">
										<i className="fas fa-video-slash"></i>
									</Tooltip>
									:
									<Tooltip placement="top" title="Turn off camera">
										<i className="fas fa-video"></i>
									</Tooltip>}
							</IconButton>
					}
					{
						!isEnableAudio ?
							<Tooltip placement="top" title="No micro found">
								<div>
									<IconButton disabled >
										<MicOffIcon />
									</IconButton>
								</div>
							</Tooltip>
							:
							<IconButton onClick={toggleAudio} >
								{!isAudioActive ?
									<Tooltip placement="top" title="Turn on mic">
										<MicOffIcon />
									</Tooltip>
									:
									<Tooltip placement="top" title="Turn off mic">
										<MicIcon />
									</Tooltip>}
							</IconButton>
					}
					<Tooltip placement="top" title="End the call">
						<IconButton style={{ backgroundColor: 'red', border: 'red' }} onClick={handleEndMeeting} >
							<CallEndIcon />
						</IconButton>
					</Tooltip>
				</div>
				<div className="btn-right" style={{
					flex: '1',
					textAlign: 'right'
				}}>
					<Tooltip placement="top" title="Meeting details">
						<IconButton onClick={handleVisibleInfo} >
							{isOpenInfo ?
								<InfoIcon /> : <InfoOutlinedIcon />}
						</IconButton>
					</Tooltip>

					<Tooltip placement="top" title="Show everyone">

						<IconButton onClick={handleVisibleUsers} >
							<Badge badgeContent={meetingReducer.meeting.members.length} color="info">
								{isOpenUsers ? <PeopleAltIcon style={{ color: '#fff' }} /> :
									<PeopleAltOutlinedIcon style={{ color: '#fff' }} />}
							</Badge>
						</IconButton>

					</Tooltip>

					<Tooltip placement="top" title="Go message">
						<IconButton onClick={handleVisibleChat}>
							{isOpenChat ? <ChatIcon /> :
								<ChatOutlinedIcon />}
						</IconButton>
					</Tooltip>
				</div>
			</div>
			<Snackbar open={message.length > 0} autoHideDuration={3000} onClose={e => setMessage('')}>
				<Alert variant="filled" severity="info">
					{message}
				</Alert>
			</Snackbar>
		</div >
			:
			<div className="room-meeting" style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column'
			}}>
				<h1 style={{ color: '#fff' }}>Meeting has already ended</h1>
				<Button color="primary" variant="contained" onClick={e => {
					e.preventDefault()
					window.open("", "_self").close();
				}}>
					Close
				</Button>
			</div>
	);
};

export default Meeting;