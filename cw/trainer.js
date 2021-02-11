// A Visual Farnsworth CW Trainer.
//
// Copyright (c) 2019, 2020, Seth Morabito <web@loomcom.com>
//
// This software is licensed under the terms of the GNU Affero GPL
// version 3.0. Please see the file LICENSE.txt for details.
// Making some changes for my need:
// - added top 500 words
// - added repeat: 1, 5, 10, 20
// - I prefer lower case strings. 

let CwTrainer = (function () {
    // The maximum output level our GainNode should produce.
    const ON = 1.0;

    // The minimum output level our GainNode should produce.
    // Note that, due to a bug in some browsers, this must be
    // a positive value, not 0! Therefore, we default to a very
    // small (and therefore inaudible) level.
    const OFF = 0.0001;

    const FREQUENCY = 500;

    const SYMBOLS = ['.', ',', '/', '=', '?'];
    const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const LETTERS = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
        'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
        'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    // Our Morse Alphabet.
    const CHARS = {
        'A': '.-',
        'B': '-...',
        'C': '-.-.',
        'D': '-..',
        'E': '.',
        'F': '..-.',
        'G': '--.',
        'H': '....',
        'I': '..',
        'J': '.---',
        'K': '-.-',
        'L': '.-..',
        'M': '--',
        'N': '-.',
        'O': '---',
        'P': '.--.',
        'Q': '--.-',
        'R': '.-.',
        'S': '...',
        'T': '-',
        'U': '..-',
        'V': '...-',
        'W': '.--',
        'X': '-..-',
        'Y': '-.--',
        'Z': '--..',
        '1': '.----',
        '2': '..---',
        '3': '...--',
        '4': '....-',
        '5': '.....',
        '6': '-....',
        '7': '--...',
        '8': '---..',
        '9': '----.',
        '0': '-----',
        '/': '-..-.',
        '=': '-...-',
        '?': '..--..',
        '.': '.-.-.-',
        ',': '--..--'
    };

    const PROSIGNS = {
        'AR': '.-.-.',
        'BT': '-...-',
        'SK': '...-.-',
        'KN': '-.--.',
        'BK': '-...-.-'
    };

    // Provide a ramp of 5 ms on either side of a character element to
    // gracefully turn the oscillator on or off. This prevents
    // horrible clicking from the speakers.  (NOTE: Only partially
    // works on Firefox browser at the present time, due to a known
    // bug.)
    const RAMP = 0.005;

    // This is NOT an exhaustive list of US callsign prefixes,
    // but a good sampling.
    const CALLPREFIXES = [
        'K', 'N', 'W', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF',
        'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'KA', 'KB', 'KC',
        'KD', 'KE', 'KF', 'KG', 'KH', 'KI', 'KL', 'KM', 'KN',
        'NA', 'NB', 'NC', 'ND', 'NE', 'NF', 'NG', 'NH', 'NI',
        'NJ', 'NK', 'NL', 'NM', 'NN', 'WA', 'WB', 'WC', 'WD',
        'WE', 'WF', 'WG', 'WH', 'WI', 'WJ', 'WK', 'WL', 'WM',
        'WN'
    ];

    // These are the top most used words in CW, based on
    // this site:
    //
    // http://www.4sqrp.com/resource/w0xi/w0xi-100/most_common.html
    const TOPWORD_LIST = [
        'I', 'AND', 'THE', 'YOU', 'THAT', 'A', 'TO', 'KNOW',
        'OF', 'IT', 'YES', 'IN', 'THEY', 'DO', 'SO', 'BUT',
        'IS', 'LIKE', 'HAVE', 'WAS', 'WE', 'ITS', 'JUST',
        'ON', 'OR', 'NOT', 'THINK', 'FOR', 'WELL', 'WHAT',
        'ABOUT', 'ALL', 'THATS', 'OH', 'REALLY', 'ONE',
        'ARE', 'RIGHT', 'THEM', 'AT', 'HERE', 'THERE', 'MY',
        'MEAN', 'DONT', 'NO', 'WITH', 'IF', 'WHEN', 'CAN', 'U',
        'BE', 'AS', 'OUT', 'KIND', 'BECAUSE', 'PEOPLE',
        'GO', 'GOT', 'THIS', 'SOME', 'IM', 'WOULD', 'THINGS',
        'NOW', 'LOT', 'HAD', 'HOW', 'GOOD', 'GET', 'SEE',
        'FROM', 'HE', 'ME', 'DONT', 'THEIR', 'MORE',
        'TOO', 'OK', 'VERY', 'UP', 'BEEN', 'GUESS', 'TIME',
        'GOING', 'INTO', 'THOSE', 'HERE', 'DID', 'WORK',
        'OTHER', 'AND', 'IVE', 'THINGS', 'EVEN', 'OUR',
        'ANY', 'IM', 'QRL', 'QRM', 'QRN', 'QRQ', 'QRS',
        'QRZ', 'QTH', 'QSB', 'QSY', 'R', 'TU', 'RTU', 'TNX',
        'NAME', 'RST', 'CQ', 'AGN', 'ANT', 'DX', 'ES', 'FB',
        'GM', 'GA', 'GE', 'HI', 'HR', 'HW', 'NR', 'OM', 'PSE',
        'PWR', 'WX', '73', '5NN', '599', 'U', 'BTU', 'TST',
        'DE',
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that',
        'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he',
        'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by',
        'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an',
        'will', 'my', 'one', 'all', 'would', 'there', 'their',
        'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
        'which', 'go', 'me', 'when', 'make', 'can', 'like',
        'time', 'no', 'just', 'him', 'know', 'take', 'people',
        'into', 'year', 'your', 'good', 'some', 'could', 'them',
        'see', 'other', 'than', 'then', 'now', 'look', 'only',
        'come', 'its', 'over', 'think', 'also', 'back', 'after',
        'use', 'two', 'how', 'our', 'work', 'first', 'well',
        'way', 'even', 'new', 'want', 'because', 'any', 'these',
        'give', 'day', 'most', 'us', 'time', 'be', 'good', 'to',
        'the', 'person', 'have', 'new', 'of', 'and', 'year', 'do',
        'first', 'in', 'a', 'way', 'say', 'last', 'for', 'that',
        'day', 'get', 'long', 'on', 'I', 'thing', 'make', 'great',
        'with', 'it', 'man', 'go', 'little', 'at', 'not', 'world',
        'know', 'own', 'by', 'he', 'life', 'take', 'other', 'from',
        'as', 'hand', 'see', 'old', 'up', 'you', 'part', 'come',
        'right', 'about', 'this', 'child', 'think', 'big', 'into',
        'but', 'eye', 'look', 'high', 'over', 'his', 'woman',
        'want', 'different', 'after', 'they', 'place', 'give',
        'small', 'her', 'work', 'use', 'large', 'she', 'week',
        'find', 'next', 'or', 'case', 'tell', 'early', 'an',
        'point', 'ask', 'young', 'will', 'government', 'work',
        'important', 'my', 'company', 'seem', 'few', 'one',
        'number', 'feel', 'public', 'all', 'group', 'try', 'bad',
        'would', 'problem', 'leave', 'same', 'there', 'fact',
        'call', 'able', 'their'
    ];

    const PROSIGN_LIST = [
        '@AR', '@BT', '@SK', '@KN', '@BK'
    ];

    let audioContext;
    let oscNode;
    let gainNode;
    let time;
    let dotWidth;
    let dashWidth;
    let charSpace;
    let wordSpace;

    let beforeCharCallback;
    let afterCharCallback;
    let afterSendCallback;
    let afterCancelCallback;

    let pendingTimeouts = [];

    class CwTrainer {

        constructor(wpm,
            fw,
            repeatNumber,
            beforeCharCb,
            afterCharCb,
            afterSendCb,
            afterCancelCb) {

            this.enableLetters = true;
            this.enableNumbers = true;
            this.enableSymbols = true;
            this.enableCallsigns = true;
            this.enableProsigns = true;
            this.setRepeatNumber(repeatNumber);

            this.setWpm(wpm, fw);

            beforeCharCallback = beforeCharCb;
            afterCharCallback = afterCharCb;
            afterSendCallback = afterSendCb;
            afterCancelCallback = afterCancelCb;

            let AudioContext = (window.AudioContext ||
                window.webkitAudioContext ||
                false);

            if (AudioContext) {
                audioContext = new AudioContext();

                console.log("Audio Context: " + audioContext);

                oscNode = audioContext.createOscillator();
                oscNode.type = "sine";
                oscNode.frequency.value = FREQUENCY;
                time = audioContext.currentTime + 0.5;

                gainNode = audioContext.createGain();
                gainNode.gain.setValueAtTime(OFF, audioContext.currentTime);

                oscNode.connect(gainNode);

                gainNode.connect(audioContext.destination);

                oscNode.start();
            } else {
                console.log("Warning: Unable to create audio context");
            }
        }

        // Public API
        // Unsuspend sending
        unsuspend() {
            audioContext.resume();
        }

        // Set the Words per Minute to be used by this trainer.
        //
        // wpm: The words per minute to use for each character
        // fw: The Farnsworth equivalent words per minute
        setWpm(wpm, fw) {
            // "1.2" is a magic constant here, derived from the fact that
            // if you were to send the word "PARIS" one time per minute, each
            // dot would be 1.2 seconds long. See also:
            //
            // http://sv8gxc.blogspot.com/2010/09/morse-code-101-in-wpm-bw-snr.html
            //
            let fwDotWidth = 1.2 / fw;

            dotWidth = 1.2 / wpm;

            // A dash is three dots wide
            dashWidth = dotWidth * 3.0;

            // There are 3 dots of silence between characters
            charSpace = fwDotWidth * 3.0;

            // There are 7 dots of silence between words
            wordSpace = fwDotWidth * 7.0;
        }

        setRepeatNumber(repeatNumber) {
            this.repeatNumber = repeatNumber;
            this.repeatCounter = this.repeatNumber;
        }

        // Generate random text based on the most common words
        randomText(numWords) {
            let words = [];

            for (let i = 0; i < numWords; i++) {
                if (Math.random() < 0.05 && this.enableCallsigns) {
                    words.push(this._makeCallSign());
                } else if (Math.random() < 0.05 && this.enableProsigns) {
                    words.push(
                        PROSIGN_LIST[Math.floor(Math.random() * PROSIGN_LIST.length)]
                    );
                } else {
                    words.push(
                        TOPWORD_LIST[Math.floor(Math.random() * TOPWORD_LIST.length)]
                    );
                }
            }

            return words.join(" ").toLowerCase();
        }

        // Generate random groups of characters
        randomGroups(numGroups, groupSize) {
            let groups = [];
            let alphabet = [];

            if (this.enableLetters) {
                alphabet = alphabet.concat(LETTERS);
            }

            if (this.enableNumbers) {
                alphabet = alphabet.concat(NUMBERS);
            }

            if (this.enableSymbols) {
                alphabet = alphabet.concat(SYMBOLS);
            }

            if (alphabet.length === 0) {
                return "";
            }

            for (let i = 0; i < numGroups; i++) {
                let group = "";

                for (let j = 0; j < groupSize; j++) {
                    let c = alphabet[Math.floor(Math.random() * alphabet.length)];
                    group = group + c;
                }

                groups.push(group);
            }

            return groups.join(" ").toLowerCase();
        }

        // Send a full text
        sendText(messages, updateDisplayCallback) {
            // Add a small 1/2 second delay after the send button
            // is clicked. 
            gainNode.gain.setValueAtTime(OFF, audioContext.currentTime);
            time = audioContext.currentTime + 0.5;
            for (let idx in [...Array(messages.length).keys()]) {
                setTimeout(() => updateDisplayCallback(idx),
                    (time - audioContext.currentTime) * 1000.0);
                gainNode.gain.setValueAtTime(OFF, time);
                time = time + 0.5;

                let words = messages[idx].split(' ');

                for (let i = 0; i < words.length; i++) {
                    this._sendWord(words[i]);
                    if (i < words.length - 1) {
                        time = time + wordSpace;
                    }
                }
                // Add a small 1 second delay after each batch
                gainNode.gain.setValueAtTime(OFF, audioContext.currentTime);
                time = time + 1.0;
            }

            if (afterSendCallback) {
                pendingTimeouts.push(setTimeout(afterSendCallback,
                    (time - audioContext.currentTime) * 1000.0));
            }
        }

        // Suspend sending immediately
        cancel() {
            gainNode.gain.cancelScheduledValues(audioContext.currentTime);
            gainNode.gain.setValueAtTime(OFF, audioContext.currentTime);
            time = 0.0;

            for (let i = pendingTimeouts.length - 1; i >= 0; i--) {
                window.clearTimeout(pendingTimeouts[i]);
                pendingTimeouts.pop();
            }

            if (afterCancelCallback) {
                afterCancelCallback();
            }
        }

        // Private functions ------------------------------
        _makeCallSign() {
            let callsign = CALLPREFIXES[Math.floor(Math.random() * CALLPREFIXES.length)];

            callsign += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];

            callsign += LETTERS[Math.floor(Math.random() * LETTERS.length)];

            if (Math.random() > 0.5) {
                callsign += LETTERS[Math.floor(Math.random() * NUMBERS.length)];
            }

            if (Math.random() > 0.5) {
                callsign += LETTERS[Math.floor(Math.random() * NUMBERS.length)];
            }

            return callsign;
        }

        // Send an individual element, either a dot or a dash.
        _sendDotOrDash(width) {
            gainNode.gain.setValueAtTime(OFF, time);
            gainNode.gain.exponentialRampToValueAtTime(ON, time + RAMP);
            gainNode.gain.setValueAtTime(ON, time + width);
            gainNode.gain.exponentialRampToValueAtTime(OFF, time + width + RAMP);
            time = time + width + RAMP;
        }

        // Send a list of dots and dashes
        _sendMorseString(str) {
            for (let i = 0; i < str.length; i++) {
                let e = str[i];
                if (e === '.') {
                    this._sendDotOrDash(dotWidth);
                } else if (e === '-') {
                    this._sendDotOrDash(dashWidth)
                }
                if (i < str.length - 1) {
                    time = time + dotWidth + RAMP;
                }
            }
        }

        // Send an individual ASCII character or Prosign
        _doSend(morseValue, val) {
            if (beforeCharCallback) {
                pendingTimeouts.push(setTimeout(function () {
                    beforeCharCallback(val);
                }, (time - audioContext.currentTime) * 1000.0));
            }

            if (morseValue) {
                this._sendMorseString(morseValue);
            }

            if (afterCharCallback) {
                pendingTimeouts.push(setTimeout(function () {
                    afterCharCallback(val);
                }, (time - audioContext.currentTime) * 1000.0));
            }
        }

        _sendWord(wordOrProsign) {
            if (wordOrProsign.startsWith('@')) {
                // Any word starting with @ is a prosign.
                if (wordOrProsign.startsWith('@')) {
                    wordOrProsign = wordOrProsign.substring(1, wordOrProsign.length);
                }

                this._doSend(PROSIGNS[wordOrProsign.toUpperCase()], wordOrProsign);
                return;
            }

            for (let i = 0; i < wordOrProsign.length; i++) {
                this._doSend(CHARS[wordOrProsign[i].toUpperCase()], wordOrProsign[i].toUpperCase());
                if (i < wordOrProsign.length - 1) {
                    time = time + charSpace;
                }
            }
        }
    }

    return CwTrainer;
})();
