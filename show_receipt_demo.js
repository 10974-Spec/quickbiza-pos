
const sale = {
    id: 1024,
    receipt_number: "RCP-2024-001",
    created_at: new Date().toISOString(),
    user_name: "Jane Doe",
    payment_method: "cash",
    total: 1250,
    amount_tendered: 1500
};

const cartItems = [
    { product_name: "Blueberry Muffin", quantity: 2, price: 150 },
    { product_name: "Cappuccino", quantity: 1, price: 350 },
    { product_name: "Sourdough Loaf", quantity: 1, price: 600 }
];

const reportData = {
    totals: {
        total_sales: 45000,
        total_transactions: 32,
        avg_transaction: 1406
    },
    data: [
        { date: "2024-02-16", total_transactions: 15, total_sales: 22000 },
        { date: "2024-02-15", total_transactions: 17, total_sales: 23000 }
    ]
};

function printCentered(text, width = 32) {
    const pad = Math.max(0, Math.floor((width - text.length) / 2));
    console.log(" ".repeat(pad) + text + " ".repeat(width - text.length - pad));
}

function printRow(col1, col2, col3, width = 32) {
    const c1 = col1.toString().padEnd(16); // 50%
    const c2 = col2.toString().padStart(5);  // ~15%
    const c3 = col3.toString().padStart(11); // ~35%
    console.log(c1 + c2 + c3);
}

function printLine(width = 32) {
    console.log("-".repeat(width));
}

console.log("\n--- RECEIPT PREVIEW ---\n");
console.log("================================");
console.log(" [   AROMA BAKERY LOGO HERE   ] ");
console.log("          AROMA BAKERY          ");
console.log("  Delicious Moments, Baked Fresh");
console.log("       Tel: +254 700 000 000    ");
console.log("--------------------------------");
console.log(`Receipt #: ${sale.receipt_number}`);
console.log(`Date: ${new Date(sale.created_at).toLocaleString()}`);
console.log(`Server: ${sale.user_name}`);
console.log(`Payment: ${sale.payment_method.toUpperCase()}`);
console.log("--------------------------------");
printRow("Item", "Qty", "Total");
cartItems.forEach(item => {
    printRow(item.product_name, item.quantity, (item.price * item.quantity).toLocaleString());
});
console.log("--------------------------------");
console.log(`           Total: KES ${sale.total.toLocaleString()}`);
console.log(`            Cash: KES ${sale.amount_tendered.toLocaleString()}`);
console.log(`          Change: KES ${(sale.amount_tendered - sale.total).toLocaleString()}`);
console.log("");
console.log("  Thank you for shopping with us!");
console.log("          Karibu Tena!          ");
console.log("       Powered by QuickBizaPOS      ");
console.log("================================");

console.log("\n\n--- REPORT PREVIEW (Sales) ---\n");
console.log("================================");
console.log("          AROMA BAKERY          ");
console.log("          SALES REPORT          ");
console.log(`Date: ${new Date().toLocaleString()}`);
console.log("--------------------------------");
console.log(`Total Sales: KES ${reportData.totals.total_sales.toLocaleString()}`);
console.log(`Transactions: ${reportData.totals.total_transactions}`);
console.log(`Avg Transaction: KES ${reportData.totals.avg_transaction.toFixed(0)}`);
console.log("--------------------------------");
printRow("Date", "Txns", "Sales");
reportData.data.forEach(row => {
    printRow(row.date, row.total_transactions, row.total_sales.toLocaleString());
});
console.log("");
console.log("       --- End of Report ---    ");
console.log("================================");
