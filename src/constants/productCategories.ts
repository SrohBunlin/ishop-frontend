// src/constants/productCategories.ts
// ជម្រើសប្រភេទ/ប្រភេទរង និងស្លាកសម្រាប់ Form បន្ថែម/កែសម្រួលទំនិញ

export interface SubCategoryOption {
    id: number;
    name: string;
}

export interface CategoryOption {
    id: number;
    name: string;
    subCategories: SubCategoryOption[];
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
    {
        id: 1,
        name: 'អេឡិចត្រូនិក',
        subCategories: [
            { id: 101, name: 'ទូរស័ព្ទដៃ' },
            { id: 102, name: 'កុំព្យូទ័រ/Laptop' },
            { id: 103, name: 'គ្រឿងបន្លាស់ & Accessories' },
            { id: 104, name: 'ទូរទស្សន៍ & សម្លេង' },
        ],
    },
    {
        id: 2,
        name: 'សម្លៀកបំពាក់',
        subCategories: [
            { id: 201, name: 'សម្លៀកបំពាក់បុរស' },
            { id: 202, name: 'សម្លៀកបំពាក់ស្ត្រី' },
            { id: 203, name: 'ស្បែកជើង' },
            { id: 204, name: 'ថង់ & គ្រឿងបន្លាស់ម៉ូដ' },
        ],
    },
    {
        id: 3,
        name: 'គ្រឿងសម្អាង & សុខភាព',
        subCategories: [
            { id: 301, name: 'ថែទាំស្បែក' },
            { id: 302, name: 'គ្រឿងសំអាង' },
            { id: 303, name: 'ទឹកអប់' },
        ],
    },
    {
        id: 4,
        name: 'របស់ប្រើប្រាស់ក្នុងផ្ទះ',
        subCategories: [
            { id: 401, name: 'គ្រឿងបរិក្ខារផ្ទះបាយ' },
            { id: 402, name: 'គ្រឿងសង្ហារឹម' },
            { id: 403, name: 'ការតុបតែងផ្ទះ' },
        ],
    },
];

// ស្លាក/ម៉ាកទូទៅសម្រាប់ Multi-select (Checkbox)
// ម៉ាក (Apple, Samsung...) ជា Proper noun ដូច្នេះមិនប្តូរភាសា។ ស្លាកទូទៅផ្សេងទៀតអាចប្តូរភាសាបានតាម TAG_LABEL_KEYS
export const TAG_OPTIONS: string[] = [
    'Apple', 'Samsung', 'Xiaomi', 'Sony', 'ថ្មីមកដល់', 'លក់ដាច់បំផុត', 'បញ្ចុះតម្លៃ', 'ផលិតក្នុងស្រុក',
];

// កូនសោបកប្រែសម្រាប់ស្លាកទូទៅ (មិនមែនម៉ាក) - ប្រើជាមួយ t() ដើម្បីបង្ហាញតាមភាសាដែលបានជ្រើសរើស
export const TAG_LABEL_KEYS: Record<string, string> = {
    'ថ្មីមកដល់': 'tag.newArrival',
    'លក់ដាច់បំផុត': 'tag.bestSeller',
    'បញ្ចុះតម្លៃ': 'tag.discount',
    'ផលិតក្នុងស្រុក': 'tag.localMade',
};

export const STATUS_OPTIONS = [
    { value: 'PUBLISHED', label: 'បោះពុម្ពផ្សាយ', icon: 'bi-check-circle-fill' },
    { value: 'DRAFT', label: 'ទុកសិន', icon: 'bi-file-earmark-text' },
    { value: 'HIDDEN', label: 'លាក់', icon: 'bi-eye-slash-fill' },
];
