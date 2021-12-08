import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Tabs, Tab, Typography, Box, Avatar, TextField,
	Button, Dialog, DialogActions,
	DialogTitle, Snackbar, Alert, Switch, FormControlLabel
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { baseURL, socketClient } from '../../utils';
import { Link } from 'react-router-dom';
import { updateBasicUserInfo } from '../../store/reducers/user.reducer'
import {
	getJoinedTeams, getInvitedTeams, getRequestTeams,
	outTeam, deleteTeam, confirmInvitations,
	refuseInvitations
} from '../../store/reducers/team.reducer'
import Loading from '../../components/Loading'
import './profile.css';
// import { toggleDarkMode } from '../../store/reducers/setting.reducer'

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`vertical-tabpanel-${index}`}
			aria-labelledby={`vertical-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

function a11yProps(index) {
	return {
		id: `vertical-tab-${index}`,
		'aria-controls': `vertical-tabpanel-${index}`,
	};
}

export default function Profile() {
	const dispatch = useDispatch()
	const teamReducer = useSelector(state => state.teamReducer)
	const userReducer = useSelector(state => state.userReducer)
	const settingReducer = useSelector(state => state.settingReducer)
	const [currentTab, setCurrentTab] = useState(0);
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [image, setImage] = useState('')
	const [imageUrl, setImageUrl] = useState('')
	const [selectedTeam, setSelectedTeam] = useState(0)
	const [isOutTeamModelShow, setOutTeamModelShow] = useState(false)
	const [isDeleteTeamModelShow, setDeleteTeamModelShow] = useState(false)
	const [isConfirmInvitationShow, setConfirmInvitationShow] = useState(false)
	const [isRemoveInvitationShow, setRemoveInvitatonShow] = useState(false)
	const [isCancelRequestShow, setCancelRequestShow] = useState(false)
	const [message, setMessage] = useState({})
	const [editted, setEditted] = useState(false)



	useEffect(() => {
		setFirstName(userReducer.user.firstName)
		setLastName(userReducer.user.lastName)
		if (!teamReducer.joinedTeamLoaded) {
			dispatch(getJoinedTeams())
		}
		if (!teamReducer.requestTeamLoaded) {
			dispatch(getRequestTeams())
		}
		if (!teamReducer.invitedTeamLoaded) {
			dispatch(getInvitedTeams())
		}
	}, [])

	useEffect(() => {
		if (editted) {
			setMessage({
				type: 'success',
				content: 'Edit profile successfully'
			})
			setTimeout(() => {
				setEditted(false)
			}, 3000)
		}
	}, [userReducer.user.firstName, userReducer.user.lastName, userReducer.user.avatar])

	const handleTabChange = (event, newValue) => {
		setCurrentTab(newValue);
	};

	const handleImageChange = (e) => {
		if (e.target.files.length) {
			let file = e.target.files[0]
			if (Math.round(file.size / 1024) > 1024) {
				setMessage({
					type: 'error',
					content: "Cann't upload avatar > 1MB size"
				})
				return;
			}
			setImage(file)
			let reader = new FileReader()
			let url = reader.readAsDataURL(e.target.files[0])
			reader.onloadend = e => {
				setImageUrl(reader.result)
			}
		}
	}

	const cancelChange = () => {
		setFirstName(userReducer.user.firstName)
		setLastName(userReducer.user.lastName)
		setImageUrl('')
		setImage('')
	}

	const handleSave = () => {
		let formData = new FormData()
		formData.append('firstName', firstName)
		formData.append('lastName', lastName)
		formData.append('avatar', image)
		dispatch(updateBasicUserInfo({
			form: formData,
			userId: userReducer.user.id
		}))
		setEditted(true)
		setImageUrl('')
	}

	//out team
	const handleOutTeam = teamId => event => {
		setSelectedTeam(teamId)
		setOutTeamModelShow(true)
	}

	const handleCloseOutModel = () => {
		setOutTeamModelShow(false)
		setSelectedTeam(0)
	}

	const confirmOutTeam = () => {
		// dispatch(outTeam({
		// 	teamId: selectedTeam,
		// 	userId: userReducer.user.id
		// }))
		socketClient.emit('out-team', { teamId: selectedTeam })
		handleCloseOutModel()
	}
	//out team

	//delete team if is host
	const handleDeleteTeam = teamId => event => {
		setSelectedTeam(teamId)
		setDeleteTeamModelShow(true)
	}

	const handleCloseDeleteModel = () => {
		setDeleteTeamModelShow(false)
		setSelectedTeam(0)
	}

	const confirmDeleteTeam = () => {
		dispatch(deleteTeam({
			teamId: selectedTeam
		}))
		handleCloseDeleteModel()
	}
	//delete team if is host

	//confirm invitations
	const handleConfirmInvitation = teamId => e => {
		console.log(teamId)
		setSelectedTeam(teamId)
		setConfirmInvitationShow(true)
	}

	const handleCloseConfirmInvitation = () => {
		setSelectedTeam(0)
		setConfirmInvitationShow(false)
	}

	const agreeInvitaton = () => {
		console.log(selectedTeam)
		// dispatch(confirmInvitations({
		// 	teams: [selectedTeam]
		// }))
		socketClient.emit('confirm-invitation', {
			userName: userReducer.user.firstName + ' ' + userReducer.user.lastName,
			id: userReducer.user.id,
			teamId: selectedTeam
		})
		handleCloseConfirmInvitation()
	}
	//confirm invitations

	//remove invitations
	const handleRemoveInvitation = teamId => e => {
		console.log(teamId)
		setSelectedTeam(teamId)
		setRemoveInvitatonShow(true)
	}

	const handleCloseRemoveInvitation = () => {
		setSelectedTeam(0)
		setRemoveInvitatonShow(false)
	}

	const disagreeInvitation = () => {
		console.log(selectedTeam)
		dispatch(refuseInvitations({
			teams: [selectedTeam]
		}))
		handleCloseRemoveInvitation()
	}
	//remove invitations

	//cancel request
	const handleCancelRequest = teamId => e => {
		setSelectedTeam(teamId)
		setCancelRequestShow(true)
	}

	const handleCloseCancelRequest = () => {
		setSelectedTeam(0)
		setCancelRequestShow(false)
	}

	const cancelJoin = () => {
		console.log(selectedTeam)
		socketClient.emit('cancel-join-request', { teamId: selectedTeam })
		handleCloseCancelRequest()
	}
	//cancel request

	const isDisableSave = () => {
		return firstName === userReducer.user.firstName && lastName === userReducer.user.lastName
			&& !imageUrl;
	}

	return (<>
		{!userReducer.loaded ? <Loading /> :
			<div className='profile-layout'>
				<Tabs
					orientation="vertical"
					value={currentTab}
					onChange={handleTabChange}
					aria-label="Vertical tabs example"
					className='profile-tabs'
					sx={{ borderRight: 1, borderColor: 'divider', height: 190 }}
				>
					<Tab label="Profile" {...a11yProps(0)} />
					<Tab label="Joined Teams" {...a11yProps(1)} />
					<Tab label="Invited Teams" {...a11yProps(2)} />
					<Tab label="Requesting Teams" {...a11yProps(3)} />
				</Tabs>
				<div className='profile-right-tab'>
					<TabPanel value={currentTab} index={0}>
						<div className='profile-info'>
							<div>
								<div className='profile-avatar-container'>
									<Avatar
										key={userReducer.user.avatar}
										alt="Remy Sharp"
										src={imageUrl || `${baseURL}/api/user/avatar/${userReducer.user.id}?id=${userReducer.user.avatar}`}
										sx={{ width: 200, height: 200, margin: 'auto', border: '5px solid #f7f7f7' }} />
									<label className='new-avatar-btn' htmlFor='newAvatar'>
										<CameraAltIcon style={{ color: '#000' }} />
									</label>
									<input id="newAvatar" type="file" accept='image/*' style={{ display: 'none' }}
										onChange={handleImageChange}></input>
								</div>
							</div>
							<TextField fullWidth label="Email" id="email" margin="dense"
								variant="standard" value={userReducer.user.email} disabled />
							<TextField fullWidth label="First Name" id="firstName" margin="dense"
								variant="standard" value={firstName} onChange={e => setFirstName(e.target.value)} />
							<TextField fullWidth label="Last Name" id="lastName" margin="dense"
								variant="standard" value={lastName} onChange={e => setLastName(e.target.value)} />
							<div style={{ marginTop: '15px', textAlign: 'right' }}>
								<Button variant="text" disabled={isDisableSave()}
									style={{ color: 'var(--icon-color)' }}
									onClick={handleSave}>Save</Button>
								<Button variant="text" onClick={cancelChange}
									style={{ color: 'var(--icon-color)' }}>Cancel</Button>
							</div>
						</div>
					</TabPanel>
					<TabPanel value={currentTab} index={1}>
						<div className='profile-team-list'>
							{teamReducer.joinedTeams.length > 0 ?
								teamReducer.joinedTeams.map(team => {
									return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} key={team.id}>
										<Link style={{ margin: '10px', display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#000' }}
											to={`/teams/${team.id}`}>
											<Avatar alt="team coverphoto"
												src={`${baseURL}/api/team/coverphoto/${team.id}")`}
												sx={{ width: 50, height: 50, }} />
											<div style={{ marginLeft: '20px' }}>
												<p className='team-name'>{team.name}</p>
												{team.hostId === userReducer.user.id &&
													<span style={{ fontSize: '14px' }}>You are the admin of this team</span>
												}
											</div>
										</Link>
										{team.hostId !== userReducer.user.id ?
											<Button className="team-action-btn" variant="text"
												style={{ color: 'var(--icon-color)' }}
												onClick={handleOutTeam(team.id)}>Out Team</Button> :
											<Button className="team-action-btn" variant="text"
												style={{ color: 'var(--icon-color)' }}
												onClick={handleDeleteTeam(team.id)}>Delete team</Button>}
									</div>
								})
								: <h3>No team for show</h3>}
						</div>
					</TabPanel>
					<TabPanel value={currentTab} index={2}>
						<div className='profile-team-list'>
							{teamReducer.invitedTeams.length > 0 ?
								teamReducer.invitedTeams.map(team => {
									return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} key={team.id}>
										<Link style={{ margin: '10px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
											to={`/teams/${team.id}`}>
											<Avatar alt="team coverphoto"
												src={`${baseURL}/api/team/coverphoto/${team.id}")`}
												sx={{ width: 50, height: 50, }} />
											<div style={{ marginLeft: '20px' }}>
												<p className='team-name'>{team.name}</p>
											</div>
										</Link>
										<div>
											<Button className="team-action-btn" variant="text"
												style={{ color: 'var(--text-color)' }}
												onClick={handleConfirmInvitation(team.id)}>Agree</Button>
											<Button className="team-action-btn"
												style={{ marginLeft: '20px', color: 'var(--text-color)' }}
												variant="text"
												onClick={(handleRemoveInvitation(team.id))}>Disagree</Button>
										</div>
									</div>
								})
								: <h3>No invited team for show</h3>}
						</div>
					</TabPanel>
					<TabPanel value={currentTab} index={3}>
						<div className='profile-team-list'>
							{teamReducer.requestingTeams.length > 0 ?
								teamReducer.requestingTeams.map(team => {
									return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} key={team.id}>
										<span style={{ margin: '10px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
											to={`/teams/${team.id}`}>
											<Avatar alt="team coverphoto"
												src={`${baseURL}/api/team/coverphoto/${team.id}")`}
												sx={{ width: 50, height: 50, }} />
											<div style={{ marginLeft: '20px' }}>
												<p className='team-name'>{team.name}</p>
											</div>
										</span>
										<Button className="team-action-btn"
											style={{ marginLeft: '20px', color: 'var(--icon-color)' }}
											variant="text"
											onClick={handleCancelRequest(team.id)}
										>Cancel</Button>
									</div>
								})
								: <h3>No request team for show</h3>}
						</div>
					</TabPanel>
				</div>

				<Dialog
					open={isOutTeamModelShow}
					onClose={handleCloseOutModel}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title"
						style={{ backgroundColor: 'var(--primary-bg)' }}>
						{"Do you really want to out this team ?"}
					</DialogTitle>
					<DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
						<Button style={{ color: 'var(--icon-color)' }} onClick={handleCloseOutModel}>Cancel</Button>
						<Button style={{ color: 'var(--icon-color)' }} onClick={confirmOutTeam} autoFocus>
							Confirm
						</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={isDeleteTeamModelShow}
					onClose={handleCloseDeleteModel}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title"
						style={{ backgroundColor: 'var(--primary-bg)' }}>
						{"Do you really want to delete this team ?"}
					</DialogTitle>
					<DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
						<Button style={{ color: 'var(--icon-color)' }} onClick={handleCloseDeleteModel}>Cancel</Button>
						<Button style={{ color: 'var(--icon-color)' }} onClick={confirmDeleteTeam} autoFocus>
							Confirm
						</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={isConfirmInvitationShow}
					onClose={handleCloseConfirmInvitation}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title"
						style={{ backgroundColor: 'var(--primary-bg)' }}>
						{"Confirm to join this team ?"}
					</DialogTitle>
					<DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
						<Button style={{ color: 'var(--icon-color)' }} onClick={handleCloseConfirmInvitation}>Cancel</Button>
						<Button style={{ color: 'var(--icon-color)' }} onClick={agreeInvitaton} autoFocus>
							Agree
						</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={isRemoveInvitationShow}
					onClose={handleCloseRemoveInvitation}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title"
						style={{ backgroundColor: 'var(--primary-bg)' }}>
						{"Confirm to refuse invitation to join this team ?"}
					</DialogTitle>
					<DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
						<Button style={{ color: 'var(--icon-color)' }} onClick={handleCloseRemoveInvitation}>Cancel</Button>
						<Button style={{ color: 'var(--icon-color)' }} onClick={disagreeInvitation} autoFocus>
							Disagree
						</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={isCancelRequestShow}
					onClose={handleCloseCancelRequest}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title"
						style={{ backgroundColor: 'var(--primary-bg)' }}>
						{"Confirm to cancel request to join this team ?"}
					</DialogTitle>
					<DialogActions style={{ backgroundColor: 'var(--primary-bg)' }}>
						<Button style={{ color: 'var(--icon-color)' }} onClick={handleCloseCancelRequest}>Cancel</Button>
						<Button style={{ color: 'var(--icon-color)' }} onClick={cancelJoin} autoFocus>
							Agree
						</Button>
					</DialogActions>
				</Dialog>
				<Snackbar open={message.content && message.content.length > 0} autoHideDuration={3000} onClose={e => setMessage({})}>
					<Alert severity={message.type}>
						{message.content}
					</Alert>
				</Snackbar>
			</div>}</>
	)
}
