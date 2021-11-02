import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Tabs, Tab, Typography, Box, Avatar, TextField,
	Button, Dialog, DialogContent, DialogActions, DialogContentText,
	DialogTitle
} from '@mui/material';
import { baseURL } from '../../utils';
import { Link } from 'react-router-dom';
import { updateBasicUserInfo } from '../../store/reducers/user.reducer'
import {
	getJoinedTeams, getInvitedTeams, getRequestTeams,
	outTeam, deleteTeam, confirmInvitations,
	refuseInvitations, cancelJoinRequest
} from '../../store/reducers/team.reducer'
import './profile.css';

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

	const handleTabChange = (event, newValue) => {
		setCurrentTab(newValue);
	};

	const handleImageChange = (e) => {
		setImage(e.target.files[0])
		let reader = new FileReader()
		let url = reader.readAsDataURL(e.target.files[0])
		reader.onloadend = e => {
			setImageUrl(reader.result)
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
		dispatch(outTeam({
			teamId: selectedTeam,
			userId: userReducer.user.id
		}))
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
		dispatch(confirmInvitations({
			teams: [selectedTeam]
		}))
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
		dispatch(cancelJoinRequest({
			teamId: selectedTeam
		}))
		handleCloseCancelRequest()
	}
	//cancel request

	const isDisableSave = () => {
		return firstName === userReducer.user.firstName && lastName === userReducer.user.lastName
			&& !imageUrl;
	}

	return (
		<div className='profile-layout'>
			<Tabs
				orientation="vertical"
				value={currentTab}
				onChange={handleTabChange}
				aria-label="Vertical tabs example"
				sx={{ borderRight: 1, borderColor: 'divider', height: 195 }}
			>
				<Tab label="Profile" {...a11yProps(0)} />
				<Tab label="Joined Teams" {...a11yProps(1)} />
				<Tab label="Invited Teams" {...a11yProps(2)} />
				<Tab label="Requesting Teams" {...a11yProps(3)} />
			</Tabs>
			<div style={{ minWidth: '500px', justifyContent: 'center' }}>
				<TabPanel value={currentTab} index={0}>
					<div>
						<div>
							<div className='profile-avatar-container'>
								<Avatar
									key={userReducer.user.avatar}
									alt="Remy Sharp"
									src={imageUrl || `${baseURL}/api/user/avatar/${userReducer.user.id}`}
									sx={{ width: 200, height: 200, margin: 'auto', border: '5px solid #f7f7f7' }} />
								<label className='new-avatar-btn' htmlFor='newAvatar'><i className="fas fa-camera"></i></label>
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
							<Button variant="text" disabled={isDisableSave()} onClick={handleSave}>Save</Button>
							<Button variant="text" onClick={cancelChange}>Cancel</Button>
						</div>
					</div>
				</TabPanel>
				<TabPanel value={currentTab} index={1}>
					<div>
						{teamReducer.joinedTeams.length > 0 ?
							teamReducer.joinedTeams.map(team => {
								return <div style={{ display: 'flex', alignItems: 'center' }} key={team.id}>
									<Link style={{ margin: '10px', display: 'flex', alignItems: 'center' }}
										to={`/teams/${team.id}`}>
										<Avatar alt="team coverphoto"
											src={`${baseURL}/api/team/coverphoto/${team.id}")`}
											sx={{ width: 50, height: 50, }} />
										<p style={{ margin: 0, marginLeft: '10px' }}>{team.name}</p>
									</Link>
									{team.hostId !== userReducer.user.id ?
										<Button className="team-action-btn" variant="contained"
											onClick={handleOutTeam(team.id)}>Out</Button> :
										<Button className="team-action-btn" variant="contained"
											onClick={handleDeleteTeam(team.id)}>Delete team</Button>}
								</div>
							})
							: <h1>No team for show</h1>}
					</div>
				</TabPanel>
				<TabPanel value={currentTab} index={2}>
					<div>
						{teamReducer.invitedTeams.length > 0 ?
							teamReducer.invitedTeams.map(team => {
								return <div style={{ display: 'flex', alignItems: 'center' }} key={team.id}>
									<Link style={{ margin: '10px', display: 'flex', alignItems: 'center' }}
										to={`/teams/${team.id}`}>
										<Avatar alt="team coverphoto"
											src={`${baseURL}/api/team/coverphoto/${team.id}")`}
											sx={{ width: 50, height: 50, }} />
										<p style={{ margin: 0, marginLeft: '10px' }}>{team.name}</p>
									</Link>
									<Button className="team-action-btn" variant="contained"
										onClick={handleConfirmInvitation(team.id)}>Agree</Button>
									<Button className="team-action-btn" style={{ marginLeft: '20px' }} variant="contained"
										onClick={(handleRemoveInvitation(team.id))}>Disagree</Button>
								</div>
							})
							: <h1>No invited team for show</h1>}
					</div>
				</TabPanel>
				<TabPanel value={currentTab} index={3}>
					<div>
						{teamReducer.requestingTeams.length > 0 ?
							teamReducer.requestingTeams.map(team => {
								return <div style={{ display: 'flex', alignItems: 'center' }} key={team.id}>
									<span style={{ margin: '10px', display: 'flex', alignItems: 'center' }}
										to={`/teams/${team.id}`}>
										<Avatar alt="team coverphoto"
											src={`${baseURL}/api/team/coverphoto/${team.id}")`}
											sx={{ width: 50, height: 50, }} />
										<p style={{ margin: 0, marginLeft: '10px' }}>{team.name}</p>
									</span>
									<Button className="team-action-btn" style={{ marginLeft: '20px' }} variant="contained"
										onClick={handleCancelRequest(team.id)}
									>Cancel</Button>
								</div>
							})
							: <h1>No request team for show</h1>}
					</div>
				</TabPanel>
			</div>

			<Dialog
				open={isOutTeamModelShow}
				onClose={handleCloseOutModel}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{"Do you really want to out this team ?"}
				</DialogTitle>
				<DialogActions>
					<Button onClick={handleCloseOutModel}>Cancel</Button>
					<Button onClick={confirmOutTeam} autoFocus>
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
				<DialogTitle id="alert-dialog-title">
					{"Do you really want to delete this team ?"}
				</DialogTitle>
				<DialogActions>
					<Button onClick={handleCloseDeleteModel}>Cancel</Button>
					<Button onClick={confirmDeleteTeam} autoFocus>
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
				<DialogTitle id="alert-dialog-title">
					{"Confirm to join this team ?"}
				</DialogTitle>
				<DialogActions>
					<Button onClick={handleCloseConfirmInvitation}>Cancel</Button>
					<Button onClick={agreeInvitaton} autoFocus>
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
				<DialogTitle id="alert-dialog-title">
					{"Confirm to refuse invitation to join this team ?"}
				</DialogTitle>
				<DialogActions>
					<Button onClick={handleCloseRemoveInvitation}>Cancel</Button>
					<Button onClick={disagreeInvitation} autoFocus>
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
				<DialogTitle id="alert-dialog-title">
					{"Confirm to cancel request to join this team ?"}
				</DialogTitle>
				<DialogActions>
					<Button onClick={handleCloseCancelRequest}>Cancel</Button>
					<Button onClick={cancelJoin} autoFocus>
						Agree
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}
