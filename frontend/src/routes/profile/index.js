import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Tabs, Tab, Typography, Box, Avatar, TextField,
	Button
} from '@mui/material';
import { baseURL } from '../../utils';
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
	const teamReducer = useSelector(state => state.teamReducer)
	const userReducer = useSelector(state => state.userReducer)
	const [currentTab, setCurrentTab] = useState(0);
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')

	useEffect(() => {
		setFirstName(userReducer.user.firstName)
		setLastName(userReducer.user.lastName)
	}, [])

	const handleChange = (event, newValue) => {
		setCurrentTab(newValue);
	};

	return (
		<div className='profile-layout'>
			<Tabs
				orientation="vertical"
				value={currentTab}
				onChange={handleChange}
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
									alt="Remy Sharp"
									src={`${baseURL}/api/user/avatar/${userReducer.user.id}`}
									sx={{ width: 200, height: 200, margin: 'auto', border: '5px solid #f7f7f7' }} />
								<label className='new-avatar-btn' htmlFor='newAvatar'><i className="fas fa-camera"></i></label>
								<input id="newAvatar" type="file" accept='image/*' style={{ display: 'none' }}></input>
							</div>
						</div>
						<TextField fullWidth label="Email" id="email" margin="dense"
							variant="standard" value={userReducer.user.email} disabled />
						<TextField fullWidth label="First Name" id="firstName" margin="dense"
							variant="standard" value={firstName} onChange={e => setFirstName(e.target.value)} />
						<TextField fullWidth label="Last Name" id="lastName" margin="dense"
							variant="standard" value={lastName} onChange={e => setLastName(e.target.value)} />
						<div style={{ marginTop: '15px', textAlign: 'right' }}>
							<Button variant="text">Save</Button>
							<Button variant="text">Cancel</Button>
						</div>
					</div>
				</TabPanel>
				<TabPanel value={currentTab} index={1}>
					Item Two
				</TabPanel>
				<TabPanel value={currentTab} index={2}>
					Item Three
				</TabPanel>
				<TabPanel value={currentTab} index={3}>
					Item Four
				</TabPanel>
			</div>
		</div>
	)
}
