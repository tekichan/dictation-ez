import React, { Component}  from 'react';
import { Page, Toolbar, BottomToolbar, Segment, ToolbarButton, Modal, ProgressCircular, AlertDialog, Button } from 'react-onsenui';
import { LANG_NONE, LANG_ZH_HK, LANG_ZH_TW, LANG_EN } from './DictEzApp.js';
import { getBase64 } from './ImageUtils.js';
import { callOcrSpace } from './OcrService.js';
import { OCR_SPACE_API_KEY } from './config.js';

// Webpack CSS import
import 'onsenui/css/onsenui.css';
import '../onsenui/css/onsen-css-components.min.css';
import '../onsenui/css/theme.css';

// Specific CSS for OCR Page
import './OcrPage.css';

// Constant values for Instruction Messages
const TOOLBAR_SELECT_LANG = '默書易 Dict-Ez：先選擇語言';
const TOOLBAR_START_OCR = '默書易 Dict-Ez：按下圖象辨析';

/**
 * OCR Page Component
 */
class OcrPage extends Component {
    /**
     * Default Constructor
     * @param {*} props     Inbound Properties
     */
    constructor(props) {
        super(props);
        this.state = {
            toolbar_msg: TOOLBAR_SELECT_LANG
            , lang: LANG_NONE
            , isPostingOcr: false
            , scannedFileBase64: ''
            , errorTitle: ''
            , errorContent: ''
        }

        this.handleReset = this.handleReset.bind(this);
        this.handleCapturing = this.handleCapturing.bind(this);
        this.handleErrorDialogCancel = this.handleErrorDialogCancel.bind(this);

        this.processBase64Image = this.processBase64Image.bind(this);
        this.processBase64ImageError = this.processBase64ImageError.bind(this);
        this.processOcrContent = this.processOcrContent.bind(this);
        this.processOcrError = this.processOcrError.bind(this);
    }
    
    /**
     * Reset all state values to the default ones
     */
    resetAll() {
        this.setState({
            toolbar_msg: TOOLBAR_SELECT_LANG
            , lang: LANG_NONE
            , isPostingOcr: false
            , scannedFileBase64: ''
            , errorTitle: ''
            , errorContent: ''
        });
    }

    /**
     * Call this method when Base64 code generation is successfully complete
     * @param {*} _base64Url    Base 64 code
     */
    processBase64Image(_base64Url) {
        this.setState({
            scannedFileBase64: _base64Url
        });
        this.setState({
            toolbar_msg: TOOLBAR_START_OCR
        });        
    }

    /**
     * Call this method when Base64 code generation has an error
     * @param {*} _error    Error message
     */
    processBase64ImageError(_error) {
        console.log(_error);
        this.setState({
            errorTitle: 'BASE64 編碼異常'
            , errorContent: JSON.stringify(_error)
        });
    }

    /**
     * Call this method when Response is returned from OCR Service Endpoint
     * @param {*} _response     Response Object
     */
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

    /**
     * Call this method when Error is returned from OCR Service Endpoint
     * @param {*} _error    Error Object
     */
    processOcrError(_error) {
        console.log(_error);
        this.setState({
            isPostingOcr: false
            , errorTitle: '文字辨識異常'
            , errorContent: JSON.stringify(_error)
        });
    }

    /**
     * Event Handler when Reset is requested
     * @param {*} _event    Event of this handler
     */
    handleReset(_event) {
        this.resetAll();
    }

    /**
     * Event Handler to capture Camera Input Event
     * @param {} _event    Event of this handler
     */
    handleCapturing(_event) {
        getBase64(_event.target.files[0], this.processBase64Image, this.processBase64ImageError);
    }

    /**
     * Event Handler when a language button is clicked
     * @param {*} _lang     Language is selected
     * @param {*} _event    Event of this handler 
     */
    hangleLangBtnClick(_lang, _event) {
        document.getElementById("imgScanned").click()
        this.setState({
            lang: _lang
        })
    }

    /**
     * Event Handler of cancelling an error dialog box
     * @param {*} _event    Event of this handler 
     */
    handleErrorDialogCancel(_event) {
        if (this.state.errorTitle.length > 0) {
            this.setState({
                errorTitle: ''
                , errorContent: ''
            });
        }
    }

    /**
     * React JS Render function
     */
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
    <AlertDialog
        isOpen={this.state.errorTitle.length > 0}
        onCancel={this.handleErrorDialogCancel}        
        cancelable
        >
        <div className="alert-dialog-title"
            onClick={this.handleErrorDialogCancel}
        ><b>{this.state.errorTitle}</b></div>
        <div className="alert-dialog-content">{this.state.errorContent}</div>
        <div className="alert-dialog-footer">
            <Button onClick={this.handleErrorDialogCancel} className="alert-dialog-button">Ok</Button>
        </div>
   </AlertDialog>
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

// Default exported component
export default OcrPage;