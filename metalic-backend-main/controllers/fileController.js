const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const POMeta = require('../models/POModel');
const WOModel = require('../models/WOModel');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `PO_${file.originalname}`);
    }
});

const upload = multer({ storage: storage }).single('pdf');


exports.uploadFile = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ message: 'File upload failed' });

        const pdfPath = req.file.path;
        const fileName = req.file.filename;

        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(dataBuffer);
            const text = data.text;

            console.log("Extracted PDF Text:", text); // Debugging Purpose

            // More Flexible Regex for PO Number & Date
            const poNumberMatch = text.match(/(PO|Po|P\.O\.)\s*Number:\s*([\w-]+)/i);
            const poDateMatch = text.match(/(PO|Po|P\.O\.)\s*Date:\s*([\dA-Z-]+)/i);

            if (!poNumberMatch || !poDateMatch) {
                return res.status(400).json({ message: "Could not extract PO details", extractedText: text });
            }

            const poNumber = poNumberMatch[2]; // Adjusted for correct extraction
            const poDate = poDateMatch[2];

            console.log("Extracted PO Number:", poNumber);
            console.log("Extracted PO Date:", poDate);

            if (!poNumber) {
                return res.status(400).json({ message: "PO Number extraction failed", extractedText: text });
            }

            // Check if PO Number already exists before inserting
            const existingPO = await POMeta.findOne({ poNumber });
            if (existingPO) {
                return res.status(400).json({
                    message: `Error: PO Number "${poNumber}" already exists.`,
                    existingPO
                });
            }

            // Save new PO Entry
            const newPO = new POMeta({ poNumber, poDate, fileName });
            await newPO.save();

            res.json({ message: 'File uploaded successfully', poNumber, poDate });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    message: `Duplicate PO Number "${error.keyValue.poNumber}". Please check your document.`,
                });
            }
            console.error(error);
            res.status(500).json({ message: 'Error processing PDF' });
        }
    });
};

exports.getPOData = async (req, res) => {
    try {
        const data = await POMeta.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data' });
    }
};

exports.convertToWO = async (req, res) => {
    try {
        const { poNumber } = req.body;

        // Find the PO record
        const poRecord = await POMeta.findOne({ poNumber });
        if (!poRecord) {
            return res.status(404).json({ message: 'PO Number not found' });
        }

        const poDate = poRecord.poDate;

        // Convert PO Number to WO Number
        const poParts = poNumber.split('-');
        if (poParts.length < 2) {
            return res.status(400).json({ message: 'Invalid PO Number format' });
        }

        poParts.splice(1, 0, 'W'); // Insert "W" in the second position
        const woNumber = poParts.join('-');

        // Check if WO already exists
        const existingWO = await WOModel.findOne({ woNumber });
        if (existingWO) {
            return res.status(400).json({ message: 'WO Number already exists' });
        }

        // Save new WO entry
        const newWO = new WOModel({ poNumber, woNumber, poDate });
        await newWO.save();

        res.json({ message: 'WO Number created successfully', woNumber, poNumber, poDate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error converting PO to WO' });
    }
};

// Get all WO entries
exports.getWOData = async (req, res) => {
    try {
        const data = await WOModel.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching WO data' });
    }
};