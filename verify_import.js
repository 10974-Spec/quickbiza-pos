import xlsx from 'xlsx';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const TEST_FILE = 'test_products.xlsx';

async function testImport() {
    try {
        console.log('Creating test Excel file...');
        const workbook = xlsx.utils.book_new();
        const data = [
            {
                'Product Name': 'Test Product ' + Date.now(),
                'Category': 'Test Category',
                'Price': 100,
                'Initial Stock (Finished)': 50,
                'Description': 'Test Description',
                'Barcode': '123456789'
            }
        ];
        const sheet = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(workbook, sheet, 'Products');
        xlsx.writeFile(workbook, TEST_FILE);

        console.log('Uploading file...');
        const form = new FormData();
        form.append('file', fs.createReadStream(TEST_FILE));

        const response = await axios.post('http://localhost:5000/api/import/products', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Import Response:', response.data);

        if (response.data.success && response.data.imported === 1) {
            console.log('✅ Import Verified Successfully');
        } else {
            console.error('❌ Import Failed', response.data);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
        if (error.response) console.error('Response Data:', error.response.data);
        process.exit(1);
    } finally {
        if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
    }
}

testImport();
