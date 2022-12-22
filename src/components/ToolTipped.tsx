import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      // backgroundColor: '#f5f5f9',
      backgroundColor: '#ffffff',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));

export default function Tooltipped(props) {
    return (
        <HtmlTooltip
            title={
            <>
                <Typography color="inherit">{props.title}</Typography>
                {props.body}
            </>
            }>
            <a href={props.link} target="_blank">{props.title}</a>
        </HtmlTooltip>
    );
}