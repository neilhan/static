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
    const FREQUENCY_2 = 600;

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
    const TOPWORD_LIST = 
    ["i","and","the","you","that","a","to","know","of","it","yes","in","they","do","so",
    "but","is","like","have","was","we","its","just","on","or","not","think","for","well",
    "what","about","all","thats","oh","really","one","are","right","them","at","here",
    "there","my","mean","dont","no","with","if","when","can","u","be","as","out","kind",
    "because","people","go","got","this","some","im","would","things","now","lot","had",
    "how","good","get","see","from","he","me","their","more","too","ok","very","up","been",
    "guess","time","going","into","those","did","work","other","ive","even","our","any",
    "qrl","qrm","qrn","qrq","qrs","qrz","qth","qsb","qsy","r","tu","rtu","tnx","name",
    "rst","cq","agn","ant","dx","es","fb","gm","ga","ge","hi","hr","hw","nr","om","pse",
    "pwr","wx","73","5nn","599","btu","tst","de","his","by","say","her","she","an","will",
    "who","which","make","him","take","year","your","could","than","then","look","only",
    "come","over","also","back","after","use","two","first","way","new","want","these",
    "give","day","most","us","person","last","long","thing","great","man","little",
    "world","own","life","hand","old","part","child","big","eye","high","woman","different",
    "place","small","large","week","find","next","case","tell","early","point","ask",
    "young","government","important","company","seem","few","number","feel","public",
    "group","try","bad","problem","leave","same","fact","call","able","hot","were",
    "word","said","each","many","write","has","sound","water","may","down","side","made",
    "live","where","round","came","show","every","under","through","form","much","help",
    "low","line","before","turn","cause","differ","move","boy","does","sentence","set",
    "three","air","play","end","put","home","read","port","spell","add","land","must",
    "such","follow","act","why","men","change","went","light","off","need","house",
    "picture","again","animal","mother","near","build","self","earth","father","head",
    "stand","page","should","country","found","answer","school","grow","study","still",
    "learn","plant","cover","food","sun","four","thought","let","keep","never","door",
    "between","city","tree","cross","since","hard","start","might","story","saw","far",
    "sea","draw","left","late","run","while","press","close","night","real","stop",
    "open","together","white","children","begin","walk","example","ease","paper",
    "often","always","music","both","mark","book","letter","until","mile","river","car",
    "feet","care","second","carry","took","rain","eat","room","friend","began","idea",
    "fish","mountain","north","once","base","hear","horse","cut","sure","watch","color",
    "face","wood","main","enough","plain","girl","usual","ready","above","ever","red",
    "list","though","talk","bird","soon","body","dog","family","direct","pose","song",
    "measure","state","product","black","short","numeral","class","wind","question",
    "happen","complete","ship","area","half","rock","order","fire","south","piece","told",
    "knew","pass","farm","top","whole","king","size","heard","best","hour","better",
    "true","during","hundred","am","remember","step","hold","west","ground","interest",
    "reach","fast","five","sing","listen","six","table","travel","less","morning","ten",
    "simple","several","vowel","toward","war","lay","against","pattern","slow","center",
    "love","money","serve","appear","road","map","science","rule","govern","pull","cold",
    "notice","voice","fall","power","town","fine","certain","fly","unit","lead","cry",
    "dark","machine","note","wait","plan","figure","star","box","noun","field","rest",
    "correct","pound","done","beauty","drive","stood","contain","front","teach","final",
    "gave","green","quick","develop","sleep","warm","free","minute","strong","special",
    "mind","behind","clear","tail","produce","street","inch","nothing","course","stay",
    "wheel","full","force","blue","object","decide","surface","deep","moon","island",
    "foot","yet","busy","test","record","boat","common","gold","possible","plane","age",
    "dry","wonder","laugh","thousand","ago","ran","check","game","shape","miss","brought",
    "heat","snow","bed","bring","sit","perhaps","fill","east","weight","language","among"];

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
        genRandomWords(numWords) {
            let words = [];

            for (let i = 0; words.length < numWords; i++) {
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
                words.push(words[words.length - 1])
                words.push(words[words.length - 1])
            }

            return words.join(" ").toLowerCase();
        }

        // Generate random groups of characters
        genRandomCharGroups(numGroups, groupSize) {
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
        sendTextToSound(messages, updateDisplayCallback) {
            // Add a small 1/2 second delay after the send button
            // is clicked. 
            gainNode.gain.setValueAtTime(OFF, audioContext.currentTime);
            time = audioContext.currentTime;  // + 0.5;
            gainNode.gain.setValueAtTime(OFF, time);

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
                gainNode.gain.setValueAtTime(OFF, time);
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
