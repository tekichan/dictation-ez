import React, { Component}  from 'react';
import { Page } from 'react-onsenui';

// Webpack CSS import
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

// Application Page components
import OcrPage from './OcrPage.js';
import TtsPage from './TtsPage.js';

// Constant values across the application
export const [ LANG_NONE, LANG_ZH_HK, LANG_ZH_TW, LANG_EN ] = [ "", "zh-hk", "zh-tw", "en-gb" ];

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
            lang: LANG_NONE
            , ttsContent: ''
        }
        this.resetAll = this.resetAll.bind(this);
        this.changeToTtsPage = this.changeToTtsPage.bind(this);
        this.backToOcrPage = this.backToOcrPage.bind(this);
    }

    changeToTtsPage(_lang, _textContent) {
        this.setState({
            lang: _lang
            , ttsContent: _textContent
        })
    }

    backToOcrPage() {
        this.resetAll();
    }

    resetAll() {
        this.setState({
            lang: LANG_NONE
            , ttsContent: ''
        })
    }

    /**
     * React JS Render function
     */
    render() {
        return(
<Page id="MainPage">
{ this.state.ttsContent === '' &&
    <OcrPage onOcrCompleted={this.changeToTtsPage}></OcrPage>
}
{ this.state.ttsContent &&
    <TtsPage lang={this.state.lang} ttsContent={this.state.ttsContent} onBackToHome={this.backToOcrPage}></TtsPage>
}
</Page>
        );
    }
}

export default DictEzApp;