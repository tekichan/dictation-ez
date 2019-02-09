import React, { Component}  from 'react';
import { Page, Toolbar, BottomToolbar, Segment, ToolbarButton, Modal, ProgressCircular } from 'react-onsenui';
import { LANG_NONE, LANG_ZH_HK, LANG_ZH_TW, LANG_EN } from './DictEzApp.js';
import { getBase64 } from './ImageUtils.js';
import { callOcrSpace } from './OcrService.js';
import { OCR_SPACE_API_KEY } from './config.js';

// Webpack CSS import
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

import './OcrPage.css';

const TOOLBAR_SELECT_LANG = '默書易 Dict-Ez：先選擇語言';
const TOOLBAR_START_OCR = '默書易 Dict-Ez：按下圖象辨析';

class OcrPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toolbar_msg: TOOLBAR_SELECT_LANG
            , lang: LANG_NONE
            , isPostingOcr: false
            , scannedFileBase64: ''
        }

        this.handleReset = this.handleReset.bind(this);
        this.handleCapturing = this.handleCapturing.bind(this);

        this.processBase64Image = this.processBase64Image.bind(this);
        this.processBase64ImageError = this.processBase64ImageError.bind(this);
        this.processOcrContent = this.processOcrContent.bind(this);
        this.processOcrError = this.processOcrError.bind(this);
    }
   
    resetAll() {
        this.setState({
            toolbar_msg: TOOLBAR_SELECT_LANG
            , lang: LANG_NONE
            , isPostingOcr: false
            , scannedFileBase64: ''
        });
    }

    processBase64Image(_base64Url) {
        this.setState({
            scannedFileBase64: _base64Url
        });
        this.setState({
            toolbar_msg: TOOLBAR_START_OCR
        });        
    }

    processBase64ImageError(_error) {
        console.log(_error);
    }

    processOcrContent(_response) {
        var completeText = '';
        _response.data.ParsedResults.forEach(function(parsedResult) {
            completeText += parsedResult.ParsedText + "\n";
        });
        this.setState({
            isPostingOcr: false
        });
        this.props.onOcrCompleted(this.state.lang, completeText); 
        console.log(completeText);
    }

    processOcrError(_error) {
        this.setState({
            isPostingOcr: false
        });
        console.log(_error);
    }

    handleReset(_event) {
        this.resetAll();
    }

    /**
     * Capture Camera Input Event
     * @param {} _event 
     */
    handleCapturing(_event) {
        getBase64(_event.target.files[0], this.processBase64Image, this.processBase64ImageError);
    }

    hangleLangBtnClick(_lang, _event) {
        document.getElementById("imgScanned").click()
        this.setState({
            lang: _lang
        })
    }

    render() {
        return(
<Page renderToolbar={() => 
    <Toolbar>
        <div className="center">
{ this.state.toolbar_msg }
        </div>
        <div className="right">
            <ToolbarButton onClick={this.handleReset}><i className="zmdi zmdi-refresh"></i></ToolbarButton>
        </div>
    </Toolbar>
}>
    <Modal isOpen={this.state.isPostingOcr}>
      <p>Loading ...</p>
      <ProgressCircular indeterminate />
    </Modal>    
    <div className='div-bgimg'>
        <input type="file" id="imgScanned" name="imgScanned" accept="image/*" capture="camera" 
            style={{display:'none'}}
            onChange={this.handleCapturing}
            onClick={
                (event) => {
                    event.target.value = null;
                }
            } 
        />        
{ this.state.scannedFileBase64 && 
    <img src={ this.state.scannedFileBase64 } alt="Optical Character Recognition" height="100%" 
            onClick={(_event) => {
                this.setState({
                    isPostingOcr: true
                })
                callOcrSpace(
                    OCR_SPACE_API_KEY
                    , this.state.lang
                    , this.state.scannedFileBase64
                    , this.processOcrContent
                    , this.processOcrError
                );    
            }}
    />
}
    </div>
    <BottomToolbar modifier="material">
        <Segment style={{width: '100%'}} modifier="material">
            <ToolbarButton 
                onClick={
                    (_event) => {this.hangleLangBtnClick(LANG_ZH_HK, _event)}
                }
            >廣東話</ToolbarButton>
            <ToolbarButton
                onClick={
                    (_event) => {this.hangleLangBtnClick(LANG_ZH_TW, _event)}
                }
            >普通語（繁）</ToolbarButton>
            <ToolbarButton
                onClick={
                    (_event) => {this.hangleLangBtnClick(LANG_EN, _event)}
                }
            >English</ToolbarButton>
        </Segment>     
    </BottomToolbar>    
</Page>
        );
    }
}

export default OcrPage;