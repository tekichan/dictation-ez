import React, { Component}  from 'react';
import { Page, Toolbar, ToolbarButton, List, ListItem, Range, Row, Col, Input, Modal, ProgressCircular, AlertDialog, Button } from 'react-onsenui';
// import { LANG_NONE, LANG_ZH_HK, LANG_ZH_TW, LANG_EN } from './DictEzApp.js';
import { VOICE_RSS_API_KEY } from './config.js';
import { callVoiceRss } from './TtsService.js';

// Webpack CSS import
import 'onsenui/css/onsenui.css';
import '../onsenui/css/onsen-css-components.min.css';
import '../onsenui/css/theme.css';

// Constant values for Instruction Messages
const TOOLBAR_MSG_INIT = '按此播放';

// Constant Numeric Values for configuration
const DEFAULT_SPEECH_SPEED = 50;
const VOICE_BYTE_LIMIT = 90000;

// Function to count the number of bytes of a given String
const countBytes = (str) => encodeURI(str).split(/%..|./).length - 1;

/**
 * TTS Page Component
 */
class TtsPage extends Component {
    /**
     * Default Constructor
     * @param {*} props     Inbound Properties
     */
    constructor(props) {
        super(props);
        if (this.props.ttsContent) {
            // Split Content Text with newline
            this.state = {
                toolbar_msg: TOOLBAR_MSG_INIT
                , ttsContents: this.props.ttsContent.trim().split(/\r?\n/)
                , speechSpeed: DEFAULT_SPEECH_SPEED
                , isPostingTts: false
                , errorTitle: ''
                , errorContent: ''
            };
        } else {
            this.state = {
                toolbar_msg: TOOLBAR_MSG_INIT
                , ttsContents: []
                , speechSpeed: DEFAULT_SPEECH_SPEED
                , isPostingTts: false
                , errorTitle: ''
                , errorContent: ''
            };
        }

        this.handleReset = this.handleReset.bind(this);
        this.handleBackHome = this.handleBackHome.bind(this);
        this.handlePlay = this.handlePlay.bind(this);
        this.handlePlayAll = this.handlePlayAll.bind(this);
        this.handleUpdateItem = this.handleUpdateItem.bind(this);
        this.handleMoveItem = this.handleMoveItem.bind(this);
        this.handleErrorDialogCancel = this.handleErrorDialogCancel.bind(this);

        this.processTtsContent = this.processTtsContent.bind(this);
        this.processTtsError = this.processTtsError.bind(this);

        this.playVoice = this.playVoice.bind(this);
    }

    /**
     * Reset all state values to the default ones
     */
    resetAll() {
        if (this.props.ttsContent) {
            // Split Content Text with newline
            this.setState({
                ttsContents: this.props.ttsContent.trim().split(/\r?\n/)
                , speechSpeed: DEFAULT_SPEECH_SPEED
                , isPostingTts: false
                , errorTitle: ''
                , errorContent: ''
            });
        } else {
            this.setState({
                ttsContents: []
                , speechSpeed: DEFAULT_SPEECH_SPEED
                , isPostingTts: false
                , errorTitle: ''
                , errorContent: ''
            });
        }        
    }

    /**
     * Event Handler of requesting Back Home
     * @param {*} _event 
     */
    handleBackHome(_event) {
        this.resetAll();
        this.props.onBackToHome();
    }

    /**
     * Event Handler of requesting Reset
     * @param {*} _event 
     */
    handleReset(_event) {
        this.resetAll();
    }

    /**
     * Event Handler of requesting TTS on the given text and playing the TTS voice
     * @param {*} _event        Event of this handler
     * @param {*} _sentence     Text to be converted to Speech
     */
    handlePlay(_event, _sentence) {
        if (this.state.isPostingTts) {
            // Posting to TTS in progress
            console.log('Posting to TTS in progress rejects a new coming request.');
            this.setState({
                errorTitle: '語音轉換異常'
                , errorContent: '語音轉換進行中，請稍候。'
            });
        } else {
            this.setState({
                isPostingTts: true
            });
            callVoiceRss(
                VOICE_RSS_API_KEY
                , this.props.lang
                , _sentence
                , Math.floor(this.state.speechSpeed / 5.0) - 10
                , this.processTtsContent
                , this.processTtsError
            );    
        }
    }

    /**
     * Event Handler of requesting TTS on all texts and playing the TTS voice
     * @param {*} _event    Event of this handler
     */
    handlePlayAll(_event) {
        this.playFromArray(this.state.ttsContents.slice());
    }

    /**
     * Request TTS of all the given texts until the buffer is over limit
     * @param {*} arrContents   Array of given texts
     */
    playFromArray(arrContents) {
        var voiceContent = "";
        if (typeof arrContents !== undefined && arrContents !== null && arrContents.length > 0) {
            while (arrContents.length > 0 &&
                    countBytes(voiceContent + "\n" + arrContents[0]) <= VOICE_BYTE_LIMIT) {
              voiceContent += "\n" + arrContents.shift();
            }
        }
        if (voiceContent.trim() !== "") {
            callVoiceRss(
                VOICE_RSS_API_KEY
                , this.props.lang
                , voiceContent
                , Math.floor(this.state.speechSpeed / 5.0) - 10
                , (_response) => {
                    if (typeof _response !== undefined && _response !== null) {
                        var respData = _response.data;
                        if (respData.startsWith("ERROR")) {
                          console.log("Speech can't be played. Please try next time.");
                          console.log(respData);
                          this.setState({
                            isPostingTts: false
                            , errorTitle: '語音轉換異常'
                            , errorContent: JSON.stringify(respData)
                          }); 
                        } else {
                          let playResult = this.playVoice(respData);
                          if (!playResult) {
                            console.log("Speech can't be played. Please try next time.");
                            this.setState({
                                isPostingTts: false
                                , errorTitle: '播放語音異常'
                                , errorContent: '播放語音異常，請重試。'
                            });                             
                          } else {
                              this.playFromArray(arrContents);
                          }
                        }
                    } else {
                        console.log("Speech can't be played. Please try next time.");
                        this.setState({
                            isPostingTts: false
                            , errorTitle: '語音轉換異常'
                            , errorContent: '語音播放異常，請重試。'
                        });                         
                    }
                }
                , (_error) => {
                    console.log(_error);
                    this.setState({
                        isPostingTts: false
                        , errorTitle: '語音轉換異常'
                        , errorContent: JSON.stringify(_error)
                    });                    
                }
            ); 
        }
    }

    /**
     * Event Handler of Updating text content of a List Item
     * @param {*} _event    Event of this handler
     * @param {*} _idx      Index value of the List Item in the List
     */
    handleUpdateItem(_event, _idx) {
        this.setState(prevState => {
            const arrContent = prevState.ttsContents.map((item, idx) => {
                if (idx === _idx) {
                    return _event.target.value;
                } else {
                    return item;
                }
            });
            return {
                ttsContents: arrContent
            };
        });
    }

    /**
     * Event Handler of moving text content of a List Item along the List
     * @param {*} _event    Event of this handler
     * @param {*} _idx      Current Index value of the List Item in the List
     * @param {*} _step     Step to move. Positive to down. Negative to up.
     */
    handleMoveItem(_event, _idx, _step) {
        if (_idx + _step < 0 || _idx + _step >= this.state.ttsContents.length) {
            console.log("Invalid Movement.");
            return; // Invalid movement
        } else {
            var thisValue = this.state.ttsContents[_idx];
            var nextValue = this.state.ttsContents[_idx + _step];
            this.setState(prevState => {
                const arrContent = prevState.ttsContents.map((item, idx) => {
                    if (idx === _idx) {
                        return nextValue;
                    } else if (idx === (_idx + _step)) {
                        return thisValue;
                    } else {
                        return item;
                    }
                });
                return {
                    ttsContents: arrContent
                };
            });            
        }
    }

    /**
     * Function routine when TTS Content Response is successfully received
     * @param {*} _response     Response Object
     */
    processTtsContent(_response) {
        if (typeof _response !== undefined && _response !== null) {
            var respData = _response.data;
            if (respData.startsWith("ERROR")) {
              console.log("Speech can't be played. Please try next time.");
              console.log(respData);
              this.setState({
                isPostingTts: false
                , errorTitle: '語音轉換異常'
                , errorContent: JSON.stringify(respData)
              }); 
            } else {
              let playResult = this.playVoice(respData);
              if (!playResult) {
                console.log("Speech can't be played. Please try next time.");
                this.setState({
                    isPostingTts: false
                    , errorTitle: '播放語音異常'
                    , errorContent: '播放語音異常，請重試。'
                }); 
              }                
            }
        } else {
            console.log("Speech can't be played. Please try next time.");
            this.setState({
                isPostingTts: false
                , errorTitle: '語音轉換異常'
                , errorContent: '語音播放異常，請重試。'
            }); 
        }
        this.setState({
            isPostingTts: false
        });        
    }

    /**
     * Function routine when an error happens in processing TTS Content
     * @param {*} _error    Error Object
     */
    processTtsError(_error) {
        console.log(_error);
        this.setState({
            isPostingTts: false
            , errorTitle: '語音轉換異常'
            , errorContent: JSON.stringify(_error)
        });
    }

    /**
     * Play the given voice content
     * @param {*} _voiceContent     Voice Content encoded in Base 64
     */
    playVoice(_voiceContent) {
        var audio = document.querySelector("#audioPlayback");
        if (!audio.src || audio.paused || audio.ended) {
            audio.src = _voiceContent;
            audio.load();
            var playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(function() {
                    console.log("Automatic playback started!");
                }).catch(function(error) {
                    console.log(error);
                    this.setState({
                        isPostingTts: false
                        , errorTitle: '播放語音異常'
                        , errorContent: JSON.stringify(error)
                    });                    
                });
            } else {
                console.log("audio returns undefined.");
                this.setState({
                    isPostingTts: false
                    , errorTitle: '播放語音異常'
                    , errorContent: '未能返回語音。'
                });                
            }
            return playPromise;            
        } else {
            console.log("audio element is not available.");
            this.setState({
                isPostingTts: false
                , errorTitle: '播放語音異常'
                , errorContent: '未能產生語音元件。'
            });             
        }
        return null; 
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
        <div className="left">
            <ToolbarButton onClick={this.handleBackHome}><i className="zmdi zmdi-home"></i></ToolbarButton>
        </div>        
        <div className="center" onClick={this.handlePlayAll}>
{ this.state.toolbar_msg }<i className="zmdi zmdi-play-circle"></i>
        </div>
        <div className="right">
            <ToolbarButton onClick={this.handleReset}><i className="zmdi zmdi-refresh"></i></ToolbarButton>
        </div>
    </Toolbar>
}>
    <Modal isOpen={this.state.isPostingTts}>
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
    <Row>
        <Col width="20%" verticalAlign="center" style={{ 'textAlign': "right" }}>
            <i className="zmdi zmdi-bike" />Slow
        </Col>
        <Col width="60^">
        <Range modifier="material"
                style={{width: "100%"}}
                value={this.state.speechSpeed}
                onChange={(event) => this.setState({speechSpeed: parseInt(event.target.value)})}
        />
        </Col>
        <Col width="20%" verticalAlign="center" style={{ 'textAlign': "left" }}>
            <i className="zmdi zmdi-airplane" />Fast
        </Col>
    </Row>
    <Row><Col>
        <audio id="audioPlayback" controls src=""></audio>
    </Col></Row>
    <Row><Col>
        <List
            dataSource={ this.state.ttsContents }
            renderRow={(row, idx) => (
                <ListItem key={"contentItem-" + idx} modifier={idx === this.state.ttsContents.length - 1 ? 'longdivider' : null}>
                <div className="left" onClick={(_event) => { this.handlePlay(_event, row); }}>
                    <i className="zmdi zmdi-play-circle" style={{"fontSize": "1.5em"}}></i>
                </div>
                <div className="center">
                    <Input type="text" modifier='transparent' style={{ 'width': "100%" }} value={row} onChange={(_event) => this.handleUpdateItem(_event, idx)} float></Input>
                </div>
                <div className="right">
                    <i className="zmdi zmdi-caret-up-circle" style={{"fontSize": "1.5em"}} onClick={(_event) => {this.handleMoveItem(_event, idx, -1)}}></i>
                    &nbsp;
                    <i className="zmdi zmdi-caret-down-circle" style={{"fontSize": "1.5em"}} onClick={(_event) => {this.handleMoveItem(_event, idx, 1)}}></i>
                </div>
                </ListItem>
            )}
        />
    </Col></Row>
</Page>
        );
    }
}

// Default exported component
export default TtsPage;