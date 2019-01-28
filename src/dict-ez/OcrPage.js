import React, { Component}  from 'react';
import { Page, Toolbar, BottomToolbar, Segment, ToolbarButton } from 'react-onsenui';
import { base64ArrayBuffer, getOrientation } from './ImageUtils.js';
const [ LANG_NONE, LANG_ZH_HK, LANG_ZH_CN, LANG_EN ] = [ "", "zh-hk", "zh-tw", "en-gb" ];

class OcrPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: LANG_NONE
            , scannedFileBase64: ''
        }
        this.handleReset = this.handleReset.bind(this);
        this.handleCapturing = this.handleCapturing.bind(this);
        this.clickLangBtn = this.clickLangBtn.bind(this);
    }

    getBase64(file) {
        var self = this;
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function () {
            var srcOrientation = getOrientation(reader.result);
            var base64 = 'data:image/jpg;base64,' + base64ArrayBuffer(reader.result);
            var img = new Image();
            img.setAttribute("src", base64);
            img.onload = function() {
                var width = 800;
                var height = Math.floor(img.height * (width / img.width));
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");
    
                // set proper canvas dimensions before transform & export
                if ([5,6,7,8].indexOf(srcOrientation) > -1) {
                    canvas.width = height;
                    canvas.height = width;
                } else {
                    canvas.width = width;
                    canvas.height = height;
                }
    
                // transform context before drawing image
                switch (srcOrientation) {
                    case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
                    case 3: ctx.transform(-1, 0, 0, -1, width, height ); break;
                    case 4: ctx.transform(1, 0, 0, -1, 0, height ); break;
                    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
                    case 6: ctx.transform(0, 1, -1, 0, height , 0); break;
                    case 7: ctx.transform(0, -1, -1, 0, height , width); break;
                    case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
                    default: ctx.transform(1, 0, 0, 1, 0, 0);
                }
    
                ctx.drawImage(img, 0, 0, width, height);
                self.setState({
                    scannedFileBase64: canvas.toDataURL("image/jpeg",0.7)
                });
            }
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }
    
    resetAll() {
        this.setState({
            lang: LANG_NONE
            , scannedFileBase64: ''
        });
    }

    handleReset(_event) {
        this.resetAll();
    }

    /**
     * Capture Camera Input Event
     * @param {} _event 
     */
    handleCapturing(_event) {
        this.getBase64(_event.target.files[0]);
    }

    clickLangBtn(_lang, _event) {
        this.setState({
            lang: _lang
        })
        document.getElementById("imgScanned").click()
    }

    render() {
        return(
<Page>
    <Toolbar>
        <div className="center">
默書易 Dict-Ez：先選擇語言
        </div>
        <div className="right">
            <ToolbarButton onClick={this.handleReset}><i className="zmdi zmdi-refresh"></i></ToolbarButton>
        </div>
    </Toolbar>
    <div>
        <input type="file" id="imgScanned" name="imgScanned" accept="image/*" capture="camera" 
            style={{display:'none'}}
            onChange={this.handleCapturing}
            onClick={
                (event) => {
                    console.log('onClick'); 
                    event.target.value = null;
                }
            } 
        />        
{ this.state.lang === LANG_NONE &&
    <img src="./images/education_bg.jpg" alt="Please select a language" height="100%" />
}
{ this.state.lang !== LANG_NONE && this.state.scannedFileBase64 && 
    <img src={ this.state.scannedFileBase64 } alt="Optical Character Recognition" height="100%" />
}
    </div>
    <BottomToolbar modifier="material">
        <Segment style={{width: '100%'}} modifier="material">
            <ToolbarButton 
                onClick={
                    (_event) => {this.clickLangBtn(LANG_ZH_HK, _event)}
                }
            >廣東話</ToolbarButton>
            <ToolbarButton>普通語（繁）</ToolbarButton>
            <ToolbarButton>English</ToolbarButton>
        </Segment>     
    </BottomToolbar>    
</Page>
        );
    }
}

export default OcrPage;