import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, Instagram, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
    url: string;
    title: string;
    description?: string;
    image?: string;
    hashtags?: string[];
    className?: string;
}

export const SocialShareButtons = ({
    url,
    title,
    description = '',
    image = '',
    hashtags = [],
    className = ''
}: SocialShareButtonsProps) => {

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const hashtagString = hashtags.map(tag => tag.replace('#', '')).join(',');

    const shareToFacebook = () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        window.open(fbUrl, '_blank', 'width=600,height=400');
    };

    const shareToTwitter = () => {
        let twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        if (hashtagString) {
            twitterUrl += `&hashtags=${hashtagString}`;
        }
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };

    const shareToLinkedIn = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        window.open(linkedInUrl, '_blank', 'width=600,height=400');
    };

    const copyForInstagram = () => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied! Paste in Instagram bio or story link');
    };

    const useNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: description,
                    url
                });
                toast.success('Shared successfully!');
            } catch (error) {
                // User cancelled share
                console.log('Share cancelled');
            }
        } else {
            // Fallback to copy link
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {/* Native Share (Mobile) */}
            {navigator.share && (
                <Button
                    onClick={useNativeShare}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </Button>
            )}

            {/* Facebook */}
            <Button
                onClick={shareToFacebook}
                variant="outline"
                className="flex-1 sm:flex-none hover:bg-blue-600 hover:text-white hover:border-blue-600"
            >
                <Facebook className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Facebook</span>
            </Button>

            {/* Twitter/X */}
            <Button
                onClick={shareToTwitter}
                variant="outline"
                className="flex-1 sm:flex-none hover:bg-black hover:text-white hover:border-black"
            >
                <Twitter className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Twitter</span>
            </Button>

            {/* LinkedIn */}
            <Button
                onClick={shareToLinkedIn}
                variant="outline"
                className="flex-1 sm:flex-none hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5]"
            >
                <Linkedin className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">LinkedIn</span>
            </Button>

            {/* Instagram (Copy Link) */}
            <Button
                onClick={copyForInstagram}
                variant="outline"
                className="flex-1 sm:flex-none hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-transparent"
            >
                <Instagram className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Instagram</span>
            </Button>
        </div>
    );
};
