import React, { useState } from 'react';
import axios from 'axios';

// ១. កំណត់ប្រភេទ Props សម្រាប់ Component នេះ
interface AddOrderFormProps {
    onOrderAdded: () => void; // ជា Function ដែលមិនផ្ញើអ្វីទៅវិញ និងមិនមាន Return (void)
}

// ២. កំណត់រចនាសម្ព័ន្ធទិន្នន័យរបស់ Form (Form Data Interface)
interface OrderFormData {
    customer_name: string;
    total_amount: string | number; // អាចជា string ពេលនៅលើ Form និងជា number ពេលផ្ញើទៅ API
    status: string;
    items: any[]; // ប្រសិនបើមាន Item លម្អិត អាចប្ដូរពី any[] ទៅជា Interface របស់ Item បាន
}

const AddOrderForm: React.FC<AddOrderFormProps> = ({ onOrderAdded }) => {
    // ៣. ប្រកាស State ដោយភ្ជាប់ជាមួយប្រភេទ OrderFormData
    const [formData, setFormData] = useState<OrderFormData>({
        customer_name: '',
        total_amount: '',
        status: 'PENDING',
        items: []
    });

    // ៤. កំណត់ប្រភេទព្រឹត្តិការណ៍ Submit ជា React.FormEvent
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "https://practical-light-production-55fd.up.railway.app/api/orders/add",
                formData
            );

            if (response.status === 200) {
                alert("រក្សាទុកការបញ្ជាទិញបានជោគជ័យ!");
                setFormData({ customer_name: '', total_amount: '', status: 'PENDING', items: [] }); // សម្អាត Form
                onOrderAdded(); // ហៅអនុគមន៍ដើម្បី Update តារាង Dashboard ភ្លាមៗ
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // ប្រសិនបើជា Error របស់ Axios យើងអាចទាញទិន្នន័យមកមើលដោយសុវត្ថិភាព
                console.error("Error saving order:", error.response?.data || error.message);
            } else {
                console.error("Unexpected error:", error);
            }
            alert("មានបញ្ហាក្នុងការរក្សាទុក!");
        }
    };

    return (
        <div className="card p-4 mb-4 shadow-sm">
            <h5 className="mb-3" style={{ color: '#124F9C' }}>បន្ថែមការបញ្ជាទិញថ្មី</h5>
            <form onSubmit={handleSubmit} className="row row-cols-3 g-3">
                <div className="col">
                    <input
                        type="text"
                        placeholder="ឈ្មោះអតិថិជន"
                        className="form-control"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        required
                    />
                </div>
                <div className="col">
                    <input
                        type="number"
                        placeholder="តម្លៃសរុប ($)"
                        className="form-control"
                        value={formData.total_amount}
                        onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                        required
                    />
                </div>
                <div className="col">
                    <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: '#124F9C' }}>
                        រក្សាទុក
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddOrderForm;