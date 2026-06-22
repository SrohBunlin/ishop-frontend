import { ReportHandler } from 'web-vitals';

// កំណត់ប្រភេទ Type ឱ្យ Parameter ជា ReportHandler និងដាក់សញ្ញាសួរ (?) មានន័យថាអាចផ្ញើមក ឬមិនផ្ញើមកក៏មិនខុសច្បាប់
const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;