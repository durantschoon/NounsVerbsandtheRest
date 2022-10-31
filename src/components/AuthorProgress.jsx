import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

function AuthorProgress({author, percentage}) {
    console.log("AuthorProgress:", {author, percentage})
    return (
        <Box sx={{ width: '90%', margin: '1rem' }}>
          <LinearProgress variant="determinate" value={percentage} />
          <i>{author}</i>
        </Box>
    )
}

export default AuthorProgress
