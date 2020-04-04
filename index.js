// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const Util = require('./util.js');
const skillName = 'お手軽ミュージック';

const playlist = [
    {
        "token": "1",
        "url": 'https://xxxxx.s3-ap-northeast-1.amazonaws.com/sample1.mp3', 
        "metadata" : {
            "title": "サンプル1タイトル",
            "subtitle": "サンプル1サブタイトル",
            "art": {
                "sources": [
                    {
                        "contentDescription": "サンプル1ジャケット画像",
                        "url": "https://xxxxx.s3-ap-northeast-1.amazonaws.com/sample1_512x512.jpg",
                        "widthPixels": 512,
                        "heightPixels": 512
                    }
                ]
            },
            "backgroundImage": {
                "sources": [
                    {
                        "contentDescription": "サンプル1背景画像",
                        "url": "https://xxxxx.s3-ap-northeast-1.amazonaws.com/sample1_1200x800.jpg",
                        "widthPixels": 1200,
                        "heightPixels": 800
                    }
                ]
            }
        }
    },
    {
        "token": "2",
        "url": 'https://xxxxx.s3-ap-northeast-1.amazonaws.com/sample2.mp3', 
        "metadata" : {
            "title": "サンプル2タイトル",
            "subtitle": "サンプル2サブタイトル",
            "art": {
                "sources": [
                    {
                        "contentDescription": "サンプル2ジャケット画像",
                        "url": "https://xxxxx.s3-ap-northeast-1.amazonaws.com/sample2_512x512.jpg",
                        "widthPixels": 512,
                        "heightPixels": 512
                    }
                ]
            },
            "backgroundImage": {
                "sources": [
                    {
                        "contentDescription": "サンプル2背景画像",
                        "url": "https://xxxxx.s3-ap-northeast-1.amazonaws.com/sample2_1200x800.jpg",
                        "widthPixels": 1200,
                        "heightPixels": 800
                    }
                ]
            }
        }
    },
    {
        "token": "3",
        "url": 'https://xxxxx.s3-ap-northeast-1.amazonaws.com/sample3.mp3', 
        "metadata" : {
            "title": "サンプル3タイトル",
            "subtitle": "サンプル3サブタイトル",
            "art": {
                "sources": [
                    {
                        "contentDescription": "サンプル3ジャケット画像",
                        "url": "https://xxxxx.s3-ap-northeast-1.amazonaws.com/sample3_512x512.jpg",
                        "widthPixels": 512,
                        "heightPixels": 512
                    }
                ]
            },
            "backgroundImage": {
                "sources": [
                    {
                        "contentDescription": "サンプル3背景画像",
                        "url": "https://xxxxx.s3-ap-northeast-1.amazonaws.com/sample3_1200x800.jpg",
                        "widthPixels": 1200,
                        "heightPixels": 800
                    }
                ]
            }
        }
    }
];

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const speech   = `${skillName} にようこそ。音楽を聞くには「音楽を再生」と言ってください。`;
        const reprompt = '音楽を聞くには「音楽を再生」と言ってください。'; 
        return handlerInput.responseBuilder
            .speak(speech)
            .reprompt(reprompt)
            .getResponse();
    }
};

const PlayAudioIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && ( Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayAudioIntent'
              || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent');
    },
    async handle(handlerInput) {
        const intent = Alexa.getIntentName(handlerInput.requestEnvelope);
        let speech;
        if (intent === 'PlayAudioIntent') {
            speech = 'わかりました。楽曲を再生します。';
        } else if (intent === 'StartOverIntent') {
            speech = 'わかりました。楽曲を最初から再生します。';
        }
        const song = playlist[0];
        return handlerInput.responseBuilder
            .speak(speech)
            .addAudioPlayerPlayDirective('REPLACE_ALL', song.url, song.token, 0, null, song.metadata)
            .getResponse();
    }
};

const PauseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent';
    },
    async handle(handlerInput) {
        const speech = 'わかりました。楽曲を停止します。';
        return handlerInput.responseBuilder
            .speak(speech)
            .addAudioPlayerStopDirective()
            .getResponse();
    }
};

const ResumeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent';
    },
    async handle(handlerInput) {
        const speech = 'わかりました。楽曲再生を再開します。';
        const AudioPlayer = handlerInput.requestEnvelope.context.AudioPlayer;
        const token  = AudioPlayer.token;
        const offset  = AudioPlayer.offsetInMilliseconds;
        const song    = playlist.find(track => track.token === token);
        console.log(JSON.stringify(song));
        return handlerInput.responseBuilder
            .speak(speech)
            .addAudioPlayerPlayDirective('REPLACE_ALL', song.url, song.token, offset, null, song.metadata)
            .getResponse();
    }
};

const NextIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent';
    },
    async handle(handlerInput) {
        const speech = '次の曲です。';
        const AudioPlayer = handlerInput.requestEnvelope.context.AudioPlayer;
        const token  = AudioPlayer.token;
        const current_index = playlist.findIndex(track => track.token === token);
        const song = current_index === playlist.length - 1 ? playlist[0] : playlist[current_index + 1];
        return handlerInput.responseBuilder
            .speak(speech)
            .addAudioPlayerPlayDirective('REPLACE_ALL', song.url, song.token, 0, null, song.metadata)
            .getResponse();
    }
};

const PreviousIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent';
    },
    async handle(handlerInput) {
        const speech = '前の曲です。';
        const AudioPlayer = handlerInput.requestEnvelope.context.AudioPlayer;
        const token  = AudioPlayer.token;
        const current_index = playlist.findIndex(track => track.token === token);
        const song = current_index === 0 ? playlist[playlist.length -1] : playlist[current_index - 1];
        return handlerInput.responseBuilder
            .speak(speech)
            .addAudioPlayerPlayDirective('REPLACE_ALL', song.url, song.token, 0, null, song.metadata)
            .getResponse();
    }
};

const PlaybackNearlyFinishedHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AudioPlayer.PlaybackNearlyFinished';
    },
    async handle(handlerInput) {
        const AudioPlayer = handlerInput.requestEnvelope.context.AudioPlayer;
        const token  = AudioPlayer.token;
        const current_index = playlist.findIndex(track => track.token === token);
        const song = current_index === playlist.length - 1 ? playlist[0] : playlist[current_index + 1];
        return handlerInput.responseBuilder
            .addAudioPlayerPlayDirective('ENQUEUE', song.url, song.token, 0, token, song.metadata)
            .getResponse();
    }
};

const AudioFallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && ( Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOffIntent'
                 || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ShuffleOnIntent'
                 || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOnIntent'
                 || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.LoopOffIntent' );
    },
    async handle(handlerInput) {
        const speech = 'その機能には対応していません。楽曲を最初から再生します。';
        const song = playlist[0];
        return handlerInput.responseBuilder
            .speak(speech)
            .addAudioPlayerPlayDirective('REPLACE_ALL', song.url, song.token, 0, null, song.metadata)
            .getResponse();
    }
};

const PlaybackHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope).startsWith === 'AudioPlayer.'
    },
    async handle(handlerInput) {
      return handlerInput.responseBuilder
      .getResponse();
  }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = `{${skillName} では音楽を聞くことができます。音楽を聞くには「音楽を再生」と言ってください。`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'さようなら';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `${intentName} が呼び出されました。`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayAudioIntentHandler,
        PauseIntentHandler,
        ResumeIntentHandler,
        NextIntentHandler,
        PreviousIntentHandler,
        PlaybackNearlyFinishedHandler,
        PlaybackHandler,
        AudioFallbackIntentHandle ,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        //IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .withPersistenceAdapter(
         new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
     )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
