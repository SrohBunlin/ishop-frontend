import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// ១. កំណត់រចនាសម្ព័ន្ធទំនិញនៅក្នុងបញ្ជីចង់បាន (Wishlist Item Type)
export interface WishlistItem {
    id: number;
    name: string;
    price: number;
    image?: string;
}

// ២. កំណត់ប្រភេទលីង Function និង State ទាំងអស់ដែលមាននៅក្នុង Context
interface WishlistContextType {
    wishlistItems: WishlistItem[];
    addToWishlist: (product: WishlistItem) => void;
    removeFromWishlist: (id: number) => void;
    isInWishlist: (id: number) => boolean;
    toggleWishlist: (product: WishlistItem) => void;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
    children: ReactNode;
}

const STORAGE_KEY = 'iShop_wishlist';

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

    // ទាញទិន្នន័យមកវិញពេលបើក Web ដំបូង
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setWishlistItems(JSON.parse(saved));
            } catch (error) {
                console.error('Error parsing wishlist from localStorage', error);
            }
        }
    }, []);

    // រក្សាទុកទិន្នន័យរាល់ពេលបញ្ជីមានការប្រែប្រួល
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (product: WishlistItem) => {
        setWishlistItems((prevItems) => {
            if (prevItems.find((item) => item.id === product.id)) return prevItems;
            return [...prevItems, product];
        });
    };

    const removeFromWishlist = (id: number) => {
        setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const isInWishlist = (id: number): boolean => wishlistItems.some((item) => item.id === id);

    const toggleWishlist = (product: WishlistItem) => {
        setWishlistItems((prevItems) => {
            const exists = prevItems.find((item) => item.id === product.id);
            if (exists) return prevItems.filter((item) => item.id !== product.id);
            return [...prevItems, product];
        });
    };

    const clearWishlist = () => setWishlistItems([]);

    return (
        <WishlistContext.Provider
            value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, clearWishlist }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
