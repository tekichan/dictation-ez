import React, { Component}  from 'react';
import { Page } from 'react-onsenui';

// Webpack CSS import
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

// Application Page components
import OcrPage from './OcrPage.js';
import TtsPage from './TtsPage.js';

// Stage Constants
const [STAGE_OCR, STAGE_TTS] = [1, 2];

/**
 * Main Application Page for Dictation EZ
 * @author Teki Chan
 * @since 25 Jan 2019
 */
class DictEzApp extends Component {
    /**
     * Default Constructor
     * @param {*} props     Inbound Properties
     */
    constructor(props) {
        super(props);
        this.state = {
            stage: STAGE_OCR
        }
    }

    /**
     * React JS Render function
     */
    render() {
        return(
<Page id="MainPage">
{ (this.state.stage === STAGE_OCR) &&
    <OcrPage></OcrPage>
}
{ (this.state.stage === STAGE_TTS) &&
    <TtsPage></TtsPage>
}
</Page>
        );
    }
}

export default DictEzApp;