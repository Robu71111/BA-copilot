"""
Audio Transcription Service
============================
Uses browser Web Speech API for FREE audio transcription.
NO API calls needed - completely client-side!

Note: Audio transcription is now handled by the frontend using
the browser's built-in Web Speech API. This service file is kept
for compatibility but actual transcription happens in the browser.
"""

import base64
import json


class AudioTranscriber:
    """Handle audio recording and transcription using browser API"""
    
    def __init__(self):
        """Initialize transcriber"""
        self.api_configured = True  # Always configured (uses browser API)
        print(f"✅ Audio transcription configured")
    
    
    def transcribe_audio(self, audio_data, audio_format="wav"):
        """
        This method is deprecated but kept for compatibility.
        
        Audio transcription now happens in the browser using Web Speech API.
        The frontend sends the already-transcribed text to the backend.
        
        If you still need backend transcription, consider using:
        1. Whisper.cpp (local, free)
        2. AssemblyAI free tier
        3. Google Cloud Speech-to-Text free tier
        
        Args:
            audio_data: Audio data (base64 encoded or bytes)
            audio_format: Audio format (wav, mp3, webm, etc.)
            
        Returns:
            Error message directing to use frontend transcription
        """
        raise Exception(
            "Backend audio transcription is disabled to save costs.\n\n"
            "Audio transcription is handled by the browser's Web Speech API (FREE).\n"
            "The frontend should send the transcribed text directly, not audio data.\n\n"
            "If you need backend transcription, consider:\n"
            "1. Whisper.cpp (local, offline, free)\n"
            "2. AssemblyAI free tier (5 hours/month)\n"
            "3. Google Cloud Speech-to-Text free tier (60 minutes/month)"
        )
    
    
    def is_configured(self):
        """Check if API is properly configured"""
        return True  # Always true since we use browser API


# Initialize transcriber instance
audio_transcriber = AudioTranscriber()