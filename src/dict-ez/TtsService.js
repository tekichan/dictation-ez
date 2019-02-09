import axios from 'axios';

export function callVoiceRss(_voiceRssApiKey, _lang, _content, _speed, _cbProcessResp, _cbProcessError) {
    const urlVoiceRss = "https://api.voicerss.org/";
    var formData = new FormData();
        formData.append('key', _voiceRssApiKey);
        formData.append('src', _content);
        formData.append('hl', getVoiceRssLang(_lang));
        formData.append('b64', 'true');
        formData.append('r', _speed);
    console.log('POST to [' + urlVoiceRss + '] started');    
    axios.post(urlVoiceRss, formData)
    .then(function (response) {
        _cbProcessResp(response);
    })
    .catch(function (error) {
        _cbProcessError(error);
    })
    .then(function () {
        // always executed
        console.log('POST to [' + urlVoiceRss + '] completed');
    })
}

export const getVoiceRssLang = (_locale) => {
    if (_locale) {
        return _locale;
    } else {
        return 'en-US';
    }
}