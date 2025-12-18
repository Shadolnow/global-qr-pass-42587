import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bell, Fingerprint, Download, Smartphone } from 'lucide-react';
import PushNotificationManager from '@/components/PushNotificationManager';
import BiometricAuth from '@/components/BiometricAuth';
import OfflineTicketStorage from '@/components/OfflineTicketStorage';

const MobileSettings = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gradient-cyber mb-2">Mobile Settings</h1>
                    <p className="text-muted-foreground">
                        Configure your mobile experience for EventTix
                    </p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="notifications" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="w-4 h-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Fingerprint className="w-4 h-4" />
                            <span className="hidden sm:inline">Security</span>
                        </TabsTrigger>
                        <TabsTrigger value="offline" className="gap-2">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Offline</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="notifications" className="space-y-4">
                        <PushNotificationManager />
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                        <BiometricAuth />
                    </TabsContent>

                    <TabsContent value="offline" className="space-y-4">
                        <OfflineTicketStorage />
                    </TabsContent>
                </Tabs>

                {/* Mobile-First Features Info */}
                <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">Mobile-First Experience</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                EventTix is optimized for mobile devices with features designed for on-the-go event management.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Installable as app</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Works offline</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Push notifications</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Biometric login</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Fast QR scanning</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Cached tickets</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileSettings;
