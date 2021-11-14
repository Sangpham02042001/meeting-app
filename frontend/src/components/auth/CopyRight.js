import {
    Typography, Link
} from '@mui/material';


export default function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link href="/">
                Meeting App
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}
