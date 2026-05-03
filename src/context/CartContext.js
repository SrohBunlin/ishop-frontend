import React, {createContext, useState, useContext, useEffect} from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // ១. ទាញទិន្នន័យមកវិញពេលបើក Web ដំបូង
    useEffect(() => {
        const savedCart = localStorage.getItem('iShop_cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    // ២. រក្សាទុកទិន្នន័យរាល់ពេលកន្ត្រកមានការប្រែប្រួល
    useEffect(() => {
        localStorage.setItem('iShop_cart', JSON.stringify(cartItems));
    }, [cartItems]);
    // មុខងារបន្ថែមទំនិញទៅក្នុងកន្ត្រក
    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const isExist = prevItems.find(item => item.id === product.id);
            if (isExist) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prevItems, { ...product, qty: 1 }];
        });
    };

    // មុខងារលុបទំនិញ
    const removeFromCart = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    // បង្កើន ឬ បន្ថយចំនួនទំនិញ
    const updateQty = (id, action) => {
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
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart,updateQty,
            clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);