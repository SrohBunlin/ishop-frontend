import React, { useState } from 'react';
import axios from 'axios';

const AddOrderForm = ({ onOrderAdded }) => {
    // ១. កំណត់ State ឱ្យត្រូវនឹង Field ក្នុង Java Entity (មាន underscore)
    const [formData, setFormData] = useState({
        customer_name: '', // ត្រូវនឹង @JsonProperty("customer_name") ក្នុង Java
        total_amount: '',  // ត្រូវនឹង @JsonProperty("total_amount") ក្នុង Java
        status: 'PENDING',
        items: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ២. បាញ់ទិន្នន័យទៅកាន់ API /add ដែលប្អូនទើបតែបង្កើត
            const response = await axios.post("http://localhost:8081/api/orders/add", formData);

            if (response.status === 200) {
                alert("រក្សាទុកការបញ្ជាទិញបានជោគជ័យ!");
                setFormData({ customer_name: '', total_amount: '', status: 'PENDING' }); // សម្អាត Form
                onOrderAdded(); // ហៅអនុគមន៍ដើម្បី Update តារាង Dashboard ភ្លាមៗ
            }
        } catch (error) {
            console.error("Error saving order:", error.response?.data || error.message);
            alert("មានបញ្ហាក្នុងការរក្សាទុក!");
        }
    };

    return (
        <div className="card p-4 mb-4 shadow-sm">
            <h5 className="mb-3" style={{color:'#124F9C'}}>បន្ថែមការបញ្ជាទិញថ្មី</h5>
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-5">
                    <input
                        type="text"
                        placeholder="ឈ្មោះអតិថិជន"
                        className="form-control"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="number"
                        placeholder="តម្លៃសរុប ($)"
                        className="form-control"
                        value={formData.total_amount}
                        onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                        required
                    />
                </div>
                <div className="col-md-3">
                    <button type="submit" className="btn btn-primary w-100" style={{backgroundColor:'#124F9C'}}>រក្សាទុក</button>
                </div>
            </form>
        </div>
    );
};

export default AddOrderForm;