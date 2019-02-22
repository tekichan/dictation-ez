/**
 * Process and display Base 64 code from the given Image file
 * @param {*} file              Binary of Image file
 * @param {*} _cbProcessImage   Call back function after processing the Image file
 * @param {*} _cbProcessError   Call back function after an error happens during the process
 */
export function getBase64(file, _cbProcessImage, _cbProcessError) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);     // Read the file into binary buffer

    // Define the function routine when loading the file
    reader.onload = function () {
        var srcOrientation = getOrientation(reader.result);
        var base64 = 'data:image/jpg;base64,' + base64ArrayBuffer(reader.result);
        var img = new Image();
        img.setAttribute("src", base64);

        // Define the function routine when loading the image
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

            // Draw the canvas context
            ctx.drawImage(img, 0, 0, width, height);
            // Go to the call back function with the resulted Base64 code of the image
            _cbProcessImage(canvas.toDataURL("image/jpeg",0.7));
        }
    };
    // Define the error function routine with the call back function routine of the error handler
    reader.onerror = _cbProcessError;
}

/**
 * Generate Base 64 code by reading the binary buffer
 * @param {*} arrayBuffer 
 */
export function base64ArrayBuffer(arrayBuffer) {
    var base64    = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes         = new Uint8Array(arrayBuffer)
    var byteLength    = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength    = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3)   << 4 // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
}

/**
 * Get the image orientation
 * @param {*} buffer    Binary buffer of the image
 */
export function getOrientation(buffer) {
    var view = new DataView(buffer);
    if (view.getUint16(0, false) != 0xFFD8) return -2;
    var length = view.byteLength, offset = 2;
    while (offset < length) {
    var marker = view.getUint16(offset, false);
    offset += 2;
    if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) return -1;
        var little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;
        for (var i = 0; i < tags; i++)
        if (view.getUint16(offset + (i * 12), little) == 0x0112)
            return view.getUint16(offset + (i * 12) + 8, little);
    }
    else if ((marker & 0xFF00) != 0xFF00) break;
    else offset += view.getUint16(offset, false);
    }
    return (-1);
}