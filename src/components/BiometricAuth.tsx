import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Shield, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface BiometricAuthProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

const BiometricAuth = ({ onSuccess, onError }: BiometricAuthProps) => {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [biometricType, setBiometricType] = useState<string>('');

    useEffect(() => {
        checkBiometricAvailability();
        checkIfEnabled();
    }, []);

    const checkBiometricAvailability = async () => {
        // Check if Web Authentication API is available
        if (window.PublicKeyCredential) {
            try {
                const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                setIsAvailable(available);

                if (available) {
                    // Detect biometric type based on platform
                    const userAgent = navigator.userAgent.toLowerCase();
                    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                        setBiometricType('Face ID / Touch ID');
                    } else if (userAgent.includes('android')) {
                        setBiometricType('Fingerprint / Face Unlock');
                    } else if (userAgent.includes('windows')) {
                        setBiometricType('Windows Hello');
                    } else if (userAgent.includes('mac')) {
                        setBiometricType('Touch ID');
                    } else {
                        setBiometricType('Biometric');
                    }
                }
            } catch (error) {
                console.error('Error checking biometric availability:', error);
                setIsAvailable(false);
            }
        }
    };

    const checkIfEnabled = () => {
        const enabled = localStorage.getItem('biometric-auth-enabled') === 'true';
        setIsEnabled(enabled);
    };

    const enableBiometric = async () => {
        setLoading(true);
        try {
            // Create credential for biometric auth
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
                challenge,
                rp: {
                    name: 'EventTix',
                    id: window.location.hostname,
                },
                user: {
                    id: new Uint8Array(16),
                    name: 'user@eventtix.com', // Replace with actual user email
                    displayName: 'EventTix User',
                },
                pubKeyCredParams: [
                    { alg: -7, type: 'public-key' }, // ES256
                    { alg: -257, type: 'public-key' }, // RS256
                ],
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    userVerification: 'required',
                },
                timeout: 60000,
                attestation: 'none',
            };

            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
            });

            if (credential) {
                // Store credential ID
                localStorage.setItem('biometric-auth-enabled', 'true');
                localStorage.setItem('biometric-credential-id', credential.id);
                setIsEnabled(true);

                toast.success('Biometric authentication enabled!', {
                    description: `You can now use ${biometricType} to sign in quickly.`
                });

                onSuccess?.();
            }
        } catch (error: any) {
            console.error('Error enabling biometric:', error);
            let errorMessage = 'Failed to enable biometric authentication';

            if (error.name === 'NotAllowedError') {
                errorMessage = 'Biometric authentication was cancelled';
            } else if (error.name === 'InvalidStateError') {
                errorMessage = 'Biometric authentication is already set up';
            }

            toast.error(errorMessage);
            onError?.(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const disableBiometric = () => {
        localStorage.removeItem('biometric-auth-enabled');
        localStorage.removeItem('biometric-credential-id');
        setIsEnabled(false);
        toast.success('Biometric authentication disabled');
    };

    const authenticateWithBiometric = async () => {
        setLoading(true);
        try {
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            const credentialId = localStorage.getItem('biometric-credential-id');
            if (!credentialId) {
                throw new Error('No credential found');
            }

            const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
                challenge,
                allowCredentials: [{
                    id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
                    type: 'public-key',
                    transports: ['internal'],
                }],
                timeout: 60000,
                userVerification: 'required',
            };

            const assertion = await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions,
            });

            if (assertion) {
                toast.success('Authentication successful!');
                onSuccess?.();
                return true;
            }
        } catch (error: any) {
            console.error('Error authenticating:', error);
            let errorMessage = 'Authentication failed';

            if (error.name === 'NotAllowedError') {
                errorMessage = 'Authentication was cancelled';
            }

            toast.error(errorMessage);
            onError?.(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    if (!isAvailable) {
        return (
            <Card className="border-2 border-muted">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-muted-foreground">
                        <Fingerprint className="w-5 h-5" />
                        Biometric Authentication
                    </CardTitle>
                    <CardDescription>
                        Not available on this device
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <X className="w-4 h-4" />
                        <span>Your device doesn't support biometric authentication</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    Biometric Authentication
                </CardTitle>
                <CardDescription>
                    Use {biometricType} for quick and secure access
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        {isEnabled ? (
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-500" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <Shield className="w-5 h-5 text-muted-foreground" />
                            </div>
                        )}
                        <div>
                            <p className="font-medium">
                                {isEnabled ? 'Enabled' : 'Not enabled'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isEnabled
                                    ? `Quick sign-in with ${biometricType}`
                                    : 'Set up for faster access'}
                            </p>
                        </div>
                    </div>
                    {isEnabled ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={disableBiometric}
                            disabled={loading}
                        >
                            Disable
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-purple-600"
                            onClick={enableBiometric}
                            disabled={loading}
                        >
                            <Fingerprint className="w-4 h-4 mr-2" />
                            Enable
                        </Button>
                    )}
                </div>

                {isEnabled && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Benefits:</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Instant sign-in without password</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Enhanced security</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Works offline</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={authenticateWithBiometric}
                            disabled={loading}
                        >
                            <Fingerprint className="w-4 h-4 mr-2" />
                            Test {biometricType}
                        </Button>
                    </div>
                )}

                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                        <Shield className="w-3 h-3 inline mr-1" />
                        Your biometric data never leaves your device and is protected by your device's security.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default BiometricAuth;
