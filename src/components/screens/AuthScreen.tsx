import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import trueCitizenLogo from "@/assets/remove all white bac.png";
import { supabase } from '@/supabase'; 
import { useTranslation } from 'react-i18next'; // [MODIFIED] New Import
import { LanguageToggle } from "../LanguageToggle"; // [MODIFIED] New Import

export const AuthScreen = () => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const { t } = useTranslation(); // [MODIFIED] New Hook

  // Sign in with Google (OAuth)
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      console.error('Error logging in with Google:', error.message);
      setLoading(false);
    }
    // Supabase handles the redirect and session
  };

  // Step 1: Send OTP to the user's phone
  const handlePhoneSubmit = async () => {
    setLoading(true);
    // Ensure phone number is in E.164 format for Supabase
    const formattedPhoneNumber = `+91${phoneNumber}`; 
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhoneNumber,
    });

    if (error) {
      console.error('Error sending OTP:', error.message);
    } else {
      setShowOtp(true);
    }
    setLoading(false);
  };

  // Step 2: Verify the OTP entered by the user
  const handleOtpVerify = async () => {
    setLoading(true);
    const formattedPhoneNumber = `+91${phoneNumber}`;
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhoneNumber,
      token: otp,
      type: 'sms',
    });

    if (error) {
      console.error('Error verifying OTP:', error.message);
    }
    // The onAuthStateChange listener in Index.tsx will handle the navigation
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-background flex flex-col items-center justify-center px-6">
      {/* [MODIFIED] Add Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      
      <div className="w-full max-w-sm text-center">
        <div className="w-24 h-24 mx-auto mb-4">
          <img 
            src={trueCitizenLogo} 
            alt="TrueCitizen Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('joinTitle')}</h2> {/* [MODIFIED] Translation */}
        
        <Card className="bg-white/80 p-6 space-y-4 shadow-lg rounded-xl text-left">
          <h3 className="text-xl font-semibold text-center">{t('signUp')}</h3> {/* [MODIFIED] Translation */}
          <Button 
            variant="outline" 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white"
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('continueWithGoogle')} {/* [MODIFIED] Translation */}
          </Button>
          
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">{t('or')}</span></div> {/* [MODIFIED] Translation */}
          </div>

          {!showOtp ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  type="tel" 
                  placeholder="9876543210" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button onClick={handlePhoneSubmit} className="w-full bg-secondary hover:bg-secondary/90" disabled={!phoneNumber || loading}>
                {loading ? t('verifying') : t('sendOtp')} {/* [MODIFIED] Translation */}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp">OTP</Label>
                <Input 
                  id="otp"
                  type="text" 
                  placeholder="123456" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button onClick={handleOtpVerify} className="w-full bg-secondary hover:bg-secondary/90" disabled={otp.length !== 6 || loading}>
                {loading ? t('verifying') : t('login')} {/* [MODIFIED] Translation */}
              </Button>
              <Button variant="link" onClick={() => setShowOtp(false)} disabled={loading}>{t('back')}</Button> {/* [MODIFIED] Translation */}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};