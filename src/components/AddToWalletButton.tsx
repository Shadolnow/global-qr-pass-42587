import { Wallet } from "lucide-react";
import { toast } from "sonner";

export const AddToWalletButton = () => {
    const handleAddToWallet = () => {
        toast.success("Pass added to Wallet!", {
            description: "Feature coming soon with PKPass support."
        });
    };

    return (
        <button
            onClick={handleAddToWallet}
            className="inline-flex items-center gap-2 px-6 py-3 mt-2 bg-black hover:bg-gray-900 text-white rounded-xl border border-white/20 hover:scale-105 transition-transform font-medium text-sm"
            aria-label="Add to Apple Wallet"
        >
            <Wallet className="w-4 h-4" />
            <span>Add to Wallet</span>
        </button>
    );
};
