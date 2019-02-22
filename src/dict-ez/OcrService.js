import axios from 'axios';

/**
 * Call OCR Service Endpoint
 * <p>
 * Ref: https://ocr.space/
 * @param {*} _ocrApiKey        OCR Space API Key
 * @param {*} _lang             Language Selected
 * @param {*} _base64Image      Base 64 Code of Image
 * @param {*} _cbProcessResp    Call back function when processing Response object
 * @param {*} _cbProcessError   Call back function when an error happens during the process
 */
export function callOcrSpace(_ocrApiKey, _lang, _base64Image, _cbProcessResp, _cbProcessError) {
    const urlOcrApi = "https://api.ocr.space/parse/image";
    var formData = new FormData();
        formData.append('apikey', _ocrApiKey);
        formData.append('base64Image', _base64Image);
        formData.append('language', getOcrLang(_lang));
    console.log('POST to [' + urlOcrApi + '] started');    
    axios.post(urlOcrApi, formData)
    .then(function (response) {
        _cbProcessResp(response);
    })
    .catch(function (error) {
        _cbProcessError(error);
    })
    .then(function () {
        // always executed
        console.log('POST to [' + urlOcrApi + '] completed');
    })
}

/**
 * Get OCR Space Language Code 
 * @param {*} _locale   Locale Code used in this app
 */
export const getOcrLang = (_locale) => {
    if (_locale) {
        if (_locale.startsWith('zh')) {
            return 'cht';
        } else {
            return 'eng';
        }
    } else {
        return 'eng';
    }
}