import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // External CSS for styling

const POList = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [poData, setPOData] = useState([]);
    const [woData, setWOData] = useState([]);

    useEffect(() => {
        fetchPOData();
        fetchWOData();
    }, []);

    const fetchPOData = async () => {
        try {
            const response = await axios.get('http://13.233.156.29/api/po-data');
            setPOData(response.data);
        } catch (error) {
            console.error('Error fetching PO data', error);
        }
    };

    const fetchWOData = async () => {
        try {
            const response = await axios.get('http://13.233.156.29/api/wo-data');
            setWOData(response.data);
        } catch (error) {
            console.error('Error fetching WO data', error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file');
            return;
        }
    
        const formData = new FormData();
        formData.append('pdf', file);
        
    
        try {
            const response = await axios.post('http://13.233.156.29/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            const { poNumber, poDate, fileUrl } = response.data; // Extract data from response
    
            setMessage(
                `✅ File uploaded successfully! 
                 📌 PO Number: ${poNumber} 
                 📅 PO Date: ${poDate} 
                 🔗 View File: ` +
                `<a>Click here</a>`
            );
    
            fetchPOData(); // Refresh PO data in the table
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error uploading file');
        }
    };
    
    

    const handleConvert = async (poNumber) => {
        try {
            const response = await axios.post('http://13.233.156.29/api/convert-to-wo', { poNumber });
            alert(`WO Number Created: ${response.data.woNumber}`);
            fetchWOData(); // Refresh WO table after conversion
        } catch (error) {
            alert(error.response?.data?.message || 'Conversion failed');
        }
    };

    return (
        <div className="container">
            <h1>PO Management</h1>

            {/* File Upload Section */}
            <div className="upload-section">
                <h2>Upload PO PDF</h2>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <br></br>
                <button onClick={handleUpload}>Upload</button>
                <p className="message">{message}</p>
            </div>

            {/* PO List */}
            <h2>PO List</h2>
            <table>
                <thead>
                    <tr>
                        <th>PO Number</th>
                        <th>PO Date</th>
                        <th>File Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {poData.map((po) => (
                        <tr key={po._id}>
                            <td>{po.poNumber}</td>
                            <td>{po.poDate}</td>
                            <td>{po.fileName}</td>
                            <td>
                                <button className="convert-btn" onClick={() => handleConvert(po.poNumber)}>
                                    Convert to WO
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* WO List */}
            <h2>WO List</h2>
            <table>
                <thead>
                    <tr>
                        <th>WO Number</th>
                        <th>PO Number</th>
                        <th>PO Date</th>
                    </tr>
                </thead>
                <tbody>
                    {woData.map((wo) => (
                        <tr key={wo._id}>
                            <td>{wo.woNumber}</td>
                            <td>{wo.poNumber}</td>
                            <td>{wo.poDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default POList;
