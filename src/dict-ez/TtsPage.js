import React, { Component}  from 'react';
import { Page, Toolbar, ToolbarButton, List, ListItem, Range, Row, Col } from 'react-onsenui';

// Webpack CSS import
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

const TOOLBAR_MSG_INIT = '按此播放';

class TtsPage extends Component {
    constructor(props) {
        super(props);
        if (this.props.ttsContent) {
            // Split Content Text with newline
            this.state = {
                toolbar_msg: TOOLBAR_MSG_INIT
                , ttsContents: this.props.ttsContent.trim().split(/\r?\n/)
                , speechSpeed: 0
            };
        } else {
            this.state = {
                toolbar_msg: TOOLBAR_MSG_INIT
                , ttsContents: []
                , speechSpeed: 0
            };
        }

        this.handleReset = this.handleReset.bind(this);
    }

    resetAll() {
        if (this.props.ttsContent) {
            // Split Content Text with newline
            this.setState({
                ttsContents: this.props.ttsContent.trim().split(/\r?\n/)
                , speechSpeed: 0
            });
        } else {
            this.setState({
                ttsContents: []
                , speechSpeed: 0
            });
        }        
    }

    handleReset(_event) {
        this.resetAll();
    }

    render() {
        return(
<Page renderToolbar={() =>
    <Toolbar>
        <div className="center">
{ this.state.toolbar_msg }<i className="zmdi zmdi-play-circle"></i>
        </div>
        <div className="right">
            <ToolbarButton onClick={this.handleReset}><i className="zmdi zmdi-refresh"></i></ToolbarButton>
        </div>
    </Toolbar>
}>
    <Row>
        <Col width="20%" verticalAlign="center" style={{ 'text-align': "right" }}>
            <i class="zmdi zmdi-bike" />Slow
        </Col>
        <Col width="60^">
        <Range modifier="material"
                style={{width: "100%"}}
                value={this.state.speechSpeed}
                onChange={(event) => this.setState({speechSpeed: parseInt(event.target.value)})}
        />
        </Col>
        <Col width="20%" verticalAlign="center" style={{ 'text-align': "left" }}>
            <i class="zmdi zmdi-airplane" />Fast
        </Col>
    </Row>
    <Row><Col>
        <List
            dataSource={ this.state.ttsContents }
            renderRow={(row, idx) => (
                <ListItem modifier={idx === this.state.ttsContents.length - 1 ? 'longdivider' : null}>
                <div class="left"><i className="zmdi zmdi-play-circle"></i></div>
                <div class="center">{row}</div>
                <div class="right"><i className="zmdi zmdi-edit"></i></div>
                </ListItem>
            )}
        />
    </Col></Row>
</Page>
        );
    }
}

export default TtsPage;