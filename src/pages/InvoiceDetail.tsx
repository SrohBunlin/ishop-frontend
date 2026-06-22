import React from 'react';
import { useParams } from 'react-router-dom';

// កំណត់ប្រភេទ Params ដែលយើងរំពឹងថានឹងចាប់បានពី URL Route (ឧទាហរណ៍៖ /invoice/:id)
type InvoiceParams = {
    id: string;
};

const InvoiceDetail: React.FC = () => {
    // ប្រើប្រាស់ Generic Type <InvoiceParams> ដើម្បីប្រាប់ TypeScript ថា Params នេះមាន field ឈ្មោះ id ជា string
    const { id } = useParams<InvoiceParams>();

    return (
        <div className="container mt-5 p-4 bg-white shadow-sm" style={{ maxWidth: '600px' }}>
            <h2 className="text-center">វិក្កយបត្រ iShop</h2>
            <hr />
            <p><strong>លេខវិក្កយបត្រ:</strong> #{id}</p>

            {/* ប្អូនអាចទាញទិន្នន័យពី Database មកបង្ហាញលម្អិតនៅទីនេះតាមក្រោយ */}
            <div className="alert alert-info">
                ព័ត៌មានលម្អិតនៃការបញ្ជាទិញនឹងបង្ហាញនៅទីនេះ។
            </div>

            <button className="btn btn-primary no-print" onClick={() => window.print()}>
                បោះពុម្ពវិក្កយបត្រ
            </button>
        </div>
    );
};

export default InvoiceDetail;