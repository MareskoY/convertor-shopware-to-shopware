const fs = require('fs');
const csv = require('csv-parser');
const { writeToPath } = require('@fast-csv/format');
const path = require('path');

const inputFile = path.join(__dirname, 'input.csv');
let outputFile = path.join(__dirname, 'output.csv');

// Check if the output file already exists and create a unique file if it does
function getUniqueOutputFile(file) {
    if (!fs.existsSync(file)) {
        return file;
    }

    const dir = path.dirname(file);
    const ext = path.extname(file);
    const base = path.basename(file, ext);

    let counter = 1;
    let newFile = path.join(dir, `${base} (${counter})${ext}`);

    while (fs.existsSync(newFile)) {
        counter++;
        newFile = path.join(dir, `${base} (${counter})${ext}`);
    }

    return newFile;
}

outputFile = getUniqueOutputFile(outputFile);

// Function to create handle from URL
const createHandleFromURL = (url) => {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1].split('?')[0];
};

const transformRow = (row) => {
    const price = row.price ? row.price.replace(/[^\d.-]/g, '') : '0';
    const weight = row.shipping_weight ? (parseFloat(row.shipping_weight.replace(/[^\d.-]/g, '')) * 1000).toString() : '0';

    return {
        Handle: createHandleFromURL(row.link),
        Title: row.title || "",
        "Body (HTML)": row.description || "",
        Vendor: row.brand || "",
        "Product Category": row.product_type || "",
        Type: row.google_product_category || "",
        Tags: [row.color, row.pattern, row.material].filter(Boolean).join(', '),
        Published: "TRUE",
        "Option1 Name": "Title",
        "Option1 Value": "Default Title",
        "Option2 Name": "",
        "Option2 Value": "",
        "Option3 Name": "",
        "Option3 Value": "",
        "Variant SKU": row.id || "",
        "Variant Grams": weight,
        "Variant Inventory Tracker": "",
        "Variant Inventory Qty": "0",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": price,
        "Variant Compare At Price": "",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Variant Barcode": row.id || "",
        "Image Src": row.image_link || "",
        "Image Position": "1",
        "Image Alt Text": row.title || "",
        "Gift Card": "FALSE",
        "SEO Title": row.title || "",
        "SEO Description": row.description || "",
        "Google Shopping / Google Product Category": row.google_product_category || "",
        "Google Shopping / Gender": "",
        "Google Shopping / Age Group": "",
        "Google Shopping / MPN": "",
        "Google Shopping / AdWords Grouping": "",
        "Google Shopping / AdWords Labels": "",
        "Google Shopping / Condition": row.condition || "",
        "Google Shopping / Custom Product": "TRUE",
        "Google Shopping / Custom Label 0": "",
        "Google Shopping / Custom Label 1": "",
        "Google Shopping / Custom Label 2": "",
        "Google Shopping / Custom Label 3": "",
        "Google Shopping / Custom Label 4": "",
        "Variant Image": row.image_link || "",
        "Variant Weight Unit": "g",
        "Variant Tax Code": "",
        "Cost per item": "",
        "Price / International": "",
        "Compare At Price / International": "",
        Status: "active"
    };
};

const results = [];
const headers = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
    "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
    "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty",
    "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
    "Variant Requires Shipping", "Variant Taxable", "Variant Barcode", "Image Src", "Image Position",
    "Image Alt Text", "Gift Card", "SEO Title", "SEO Description", "Google Shopping / Google Product Category",
    "Google Shopping / Gender", "Google Shopping / Age Group", "Google Shopping / MPN",
    "Google Shopping / AdWords Grouping", "Google Shopping / AdWords Labels", "Google Shopping / Condition",
    "Google Shopping / Custom Product", "Google Shopping / Custom Label 0", "Google Shopping / Custom Label 1",
    "Google Shopping / Custom Label 2", "Google Shopping / Custom Label 3", "Google Shopping / Custom Label 4",
    "Variant Image", "Variant Weight Unit", "Variant Tax Code", "Cost per item", "Price / International",
    "Compare At Price / International", "Status"
];

let skipFirstLine = true;

fs.createReadStream(inputFile)
    .pipe(csv({
        separator: '\t', // This line sets the separator to tab
        headers: [
            'id', 'title', 'description', 'link', 'image_link', 'additional_image_links', 'gtin', 'condition', 'availability', 'product_type',
            'price', 'shipping', 'shipping_weight', 'color', 'pattern_color', 'pattern', 'surface', 'look', 'suitability_for_bathrooms',
            'width', 'height', 'sales_unit', 'pattern_repeat', 'grammage', 'characteristics', 'brand'
        ]
    }))
    .on('data', (data) => {
        if (skipFirstLine) {
            skipFirstLine = false;
            return;
        }
        results.push(transformRow(data));
    })
    .on('end', () => {
        writeToPath(outputFile, results, { headers: headers })
            .on('finish', () => {
                console.log(`CSV file has been processed and saved as ${outputFile}`);
            });
    });
