import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// ១. កំណត់រចនាសម្ព័ន្ធទំនិញនៅក្នុងកន្ត្រក (Cart Item Type)
export interface CartItem {
    id: number;
    name: string;
    price: number;
    image?: string;
    qty: number; // ចំនួនទំនិញដែលបានកម្ម៉ង់
}

// ២. កំណត់ប្រភេទលីង Function និង State ទាំងអស់ដែលមាននៅក្នុង Context
interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: { id: number; name: string; price: number; quantity: number; image: string | undefined }) => void; // ទទួល product ដែលមិនទាន់មាន qty
    removeFromCart: (id: number) => void;
    updateQty: (id: number, action: 'inc' | 'dec') => void; // action បង្ខំឱ្យយកតែ 'inc' ឬ 'dec'
    clearCart: () => void;
}

// ៣. បង្កើត Context ជាមួយទម្រង់ Type (ដំបូងឡើយកំណត់ជា undefined)
const CartContext = createContext<CartContextType | undefined>(undefined);

// ៤. កំណត់ប្រភេទ Props សម្រាប់ Provider (ត្រូវមាន children ជា ReactNode)
interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // ទាញទិន្នន័យមកវិញពេលបើក Web ដំបូង
    useEffect(() => {
        const savedCart = localStorage.getItem('iShop_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Error parsing cart from localStorage", error);
            }
        }
    }, []);

    // រក្សាទុកទិន្នន័យរាល់ពេលកន្ត្រកមានការប្រែប្រួល
    useEffect(() => {
        localStorage.setItem('iShop_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // មុខងារបន្ថែមទំនិញទៅក្នុងកន្ត្រក
    const addToCart = (product: Omit<CartItem, 'qty'>) => {
        setCartItems((prevItems) => {
            const isExist = prevItems.find(item => item.id === product.id);
            if (isExist) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            // បើមិនទាន់មានក្នុងកន្ត្រកទេ បន្ថែមចូលទៅហើយថែម qty: 1
            return [...prevItems, { ...product, qty: 1 }];
        });
    };

    // មុខងារលុបទំនិញ
    const removeFromCart = (id: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    // បង្កើន ឬ បន្ថយចំនួនទំនិញ
    const updateQty = (id: number, action: 'inc' | 'dec') => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    let newQty = action === 'inc' ? item.qty + 1 : item.qty - 1;
                    // មិនឱ្យចំនួនតិចជាង 1 ឡើយ
                    return { ...item, qty: newQty < 1 ? 1 : newQty };
                }
                return item;
            })
        );
    };

    // លុបទំនិញទាំងអស់ចេញពីកន្ត្រក
    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

// ៥. បង្កើត Custom Hook សម្រាប់យកទៅប្រើប្រាស់ក្នុងរឹងមាំ (លែងខ្លាចត្រឡប់មកវិញជា undefined)
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};