import React, { Component}  from 'react';
import { Page, Toolbar, ToolbarButton, List, ListItem, Range, Row, Col, Input } from 'react-onsenui';
// import { LANG_NONE, LANG_ZH_HK, LANG_ZH_TW, LANG_EN } from './DictEzApp.js';
import { VOICE_RSS_API_KEY } from './config.js';
import { callVoiceRss } from './TtsService.js';

// Webpack CSS import
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

const TOOLBAR_MSG_INIT = '按此播放';
const DEFAULT_SPEECH_SPEED = 50;
const VOICE_BYTE_LIMIT = 90000;

const countBytes = (str) => encodeURI(str).split(/%..|./).length - 1;

class TtsPage extends Component {
    constructor(props) {
        super(props);
        if (this.props.ttsContent) {
            // Split Content Text with newline
            this.state = {
                toolbar_msg: TOOLBAR_MSG_INIT
                , ttsContents: this.props.ttsContent.trim().split(/\r?\n/)
                , speechSpeed: DEFAULT_SPEECH_SPEED
                , isPostingTts: false
            };
        } else {
            this.state = {
                toolbar_msg: TOOLBAR_MSG_INIT
                , ttsContents: []
                , speechSpeed: DEFAULT_SPEECH_SPEED
                , isPostingTts: false
            };
        }

        this.handleReset = this.handleReset.bind(this);
        this.handleBackHome = this.handleBackHome.bind(this);
        this.handlePlay = this.handlePlay.bind(this);
        this.handlePlayAll = this.handlePlayAll.bind(this);
        this.handleUpdateItem = this.handleUpdateItem.bind(this);
        this.handleMoveItem = this.handleMoveItem.bind(this);

        this.processTtsContent = this.processTtsContent.bind(this);
        this.processTtsError = this.processTtsError.bind(this);

        this.playVoice = this.playVoice.bind(this);
    }

    resetAll() {
        if (this.props.ttsContent) {
            // Split Content Text with newline
            this.setState({
                ttsContents: this.props.ttsContent.trim().split(/\r?\n/)
                , speechSpeed: DEFAULT_SPEECH_SPEED
                , isPostingTts: false
            });
        } else {
            this.setState({
                ttsContents: []
                , speechSpeed: DEFAULT_SPEECH_SPEED
                , isPostingTts: false
            });
        }        
    }

    handleBackHome(_event) {
        this.resetAll();
        this.props.onBackToHome();
    }

    handleReset(_event) {
        this.resetAll();
    }

    handlePlay(_event, _sentence) {
        if (this.state.isPostingTts) {
            // Posting to TTS in progress
            console.log('Posting to TTS in progress rejects a new coming request.');
            // TODO: show a dialog to prompt a warning messagae
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

    handlePlayAll(_event) {
        this.playFromArray(this.state.ttsContents);
    }

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
                        } else {
                          let playResult = this.playVoice(respData);
                          if (!playResult) {
                            console.log("Speech can't be played. Please try next time.");
                          } else {
                              this.playFromArray(arrContents);
                          }
                        }
                    } else {
                        console.log("Speech can't be played. Please try next time.");
                    }
                }
                , (_error) => {
                    console.log(_error);
                }
            ); 
        }
    }

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

    handleMoveItem(_event, _idx, _step) {
        if (_idx + _step < 0 || _idx + _step >= this.state.ttsContents.length) {
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

    processTtsContent(_response) {
        if (typeof _response !== undefined && _response !== null) {
            var respData = _response.data;
            if (respData.startsWith("ERROR")) {
              console.log("Speech can't be played. Please try next time.");
              console.log(respData);
              // TODO: show a dialog to prompt a warning messagae
            } else {
              let playResult = this.playVoice(respData);
              if (!playResult) {
                console.log("Speech can't be played. Please try next time.");
                // TODO: show a dialog to prompt a warning messagae
              }                
            }
        } else {
            console.log("Speech can't be played. Please try next time.");
            // TODO: show a dialog to prompt a warning messagae
        }
        this.setState({
            isPostingTts: false
        });        
    }

    processTtsError(_error) {
        this.setState({
            isPostingTts: false
        });
        console.log(_error);
    }

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
                });
            } else {
                console.log("audio returns undefined.");
            }
            return playPromise;            
        } else {
            console.log("audio element is not available.");
        }
        return null; 
    }

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

export default TtsPage;