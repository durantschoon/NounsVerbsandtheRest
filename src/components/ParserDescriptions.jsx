import {PoS, EnP} from '../dataClasses/Parser'
import Tooltipped from './ToolTipped.jsx'

import "./ParserDescriptions.css";

function ParserDescriptions() {
    return (
        <div id="parser-descriptions">
          <Tooltipped {...PoS.info} />
          <Tooltipped {...EnP.info} />
        </div>
    )
}

export default ParserDescriptions
