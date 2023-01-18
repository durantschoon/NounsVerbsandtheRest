import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

import { AuthorName } from "src/type-definitions";

type Props = {
  authorName: AuthorName,
  percentage: number
}

function AuthorProgress({authorName, percentage}: Props) {
    return (
        <Box id="progress-box" sx={{ width: '90%', margin: '1rem' }}>
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            aria-describedby="progress-box"
            aria-busy={percentage < 100 ? true : false}
          />
          <i>{authorName}</i>
        </Box>
    )
}

export default AuthorProgress
