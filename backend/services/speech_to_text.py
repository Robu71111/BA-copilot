"""
Speech-to-Text Module
=====================
FREE VERSION - No Google Cloud required!

Audio transcription now happens in the browser using Web Speech API.
This module only provides mock data for testing.
"""


class SpeechToText:
    """Handle mock transcription for testing (real transcription in browser)"""
    
    def __init__(self):
        """Initialize mock transcriber"""
        self.credentials_configured = False
        print("✅ Mock transcriber initialized (Audio handled by browser)")
    
    
    @staticmethod
    def mock_transcribe(duration_seconds=30):
        """
        Mock transcription for testing without any API
        
        Args:
            duration_seconds: Simulated recording duration
            
        Returns:
            Mock transcript text
        """
        mock_transcript = """
        Good morning everyone. Thank you for joining today's requirements gathering session 
        for our new mobile banking application. Let me start by outlining the key features 
        we need to implement.
        
        First, users should be able to log in securely using their email and password. 
        We also need to support biometric authentication like fingerprint and face recognition 
        for enhanced security.
        
        Second, the dashboard should display account balance, recent transactions for the last 
        30 days, and quick access to frequently used features like transfers and bill payments.
        
        Third, users must be able to transfer money between their own accounts instantly, 
        and to other users within 24 hours. All transfers should require two-factor authentication 
        for amounts above $1000.
        
        Fourth, we need a bill payment feature that allows users to save payees, schedule 
        recurring payments, and receive notifications before payment due dates.
        
        The app must support both iOS and Android platforms, work offline for viewing 
        transaction history, and sync when connection is restored. Response time for any 
        action should not exceed 2 seconds under normal load.
        
        For security, all data must be encrypted both in transit and at rest. The app should 
        automatically log out users after 5 minutes of inactivity. We also need to implement 
        fraud detection that flags suspicious transactions.
        
        Are there any questions or additional requirements we should consider?
        """
        
        return mock_transcript.strip()
    
    
    def is_configured(self):
        """Check if API is properly configured"""
        return False  # Always false since we don't use backend transcription


# Initialize speech-to-text instance
stt = SpeechToText()