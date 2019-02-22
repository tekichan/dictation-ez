import axios from 'axios';

/**
 * Call TTS Service Endpoint
 * @param {*} _voiceRssApiKey   Voice RSS API Key
 * @param {*} _lang             Language of the text
 * @param {*} _content          Text Content
 * @param {*} _speed            Speed of the Speech
 * @param {*} _cbProcessResp    Call back function when processing Response object
 * @param {*} _cbProcessError   Call back function when an error happens during the process
 */
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

/**
 * Get Voice RSS Language Code 
 * @param {*} _locale   Locale Code used in this app
 */
export const getVoiceRssLang = (_locale) => {
    if (_locale) {
        return _locale;
    } else {
        return 'en-US';
    }
}