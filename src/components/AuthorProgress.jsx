import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

function AuthorProgress({authorName, percentage}) {
    return (
        <Box sx={{ width: '90%', margin: '1rem' }}>
          <LinearProgress variant="determinate" value={percentage} />
          <i>{authorName}</i>
        </Box>
    )
}

export default AuthorProgress
