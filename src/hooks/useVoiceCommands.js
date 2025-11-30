import { useEffect, useRef, useState, useCallback } from 'react';

export function useVoiceCommands({
  onCommand,            // your handler for recognized text
  autoRestart = true,   // keep listening automatically
  talkback = false      // if true, speak back recognized text
} = {}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        const transcript = last[0].transcript.trim();
        console.log('Voice command:', transcript);

        // send text to your app
        if (onCommand) onCommand(transcript);

        // optional talkback
        if (talkback) {
          const utterance = new SpeechSynthesisUtterance(
            `You said ${transcript}`
          );
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    recognition.onend = () => {
      setListening(false);
      if (autoRestart) {
        setTimeout(() => {
          recognition.start();
          setListening(true);
        }, 500);
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onCommand, autoRestart, talkback]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }, []);

  return {
    listening,
    startListening,
    stopListening,
  };
}
