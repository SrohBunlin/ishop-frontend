import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/apiService';
import { Product } from '../types';

const ProductList: React.FC = () => {
    // កំណត់ State ឱ្យច្បាស់ថាជា Array នៃ Product
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        getProducts()
            .then((res) => {
                setProducts(res.data); // TypeScript នឹងដឹងភ្លាមថា res.data គឺជា Product[]
            })
            .catch((err) => console.error(err));
    }, []);

    return (
        <div>
            {products.map((p) => (
                    <div key={p.id}>
                        {p.product_name} - ${p.price}
    </div>
))}
    </div>
);
};