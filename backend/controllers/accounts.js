const db = require("../model")
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePDFInvoice = (transaction) => {
    const { customerId, amount, dispensedBills, transactionDate } = transaction;
    const invoicePath = path.join(__dirname, 'invoices', `${customerId}-${Date.now()}.pdf`);
  
    // Create a new PDF document
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(invoicePath));
  
    // Add content to the PDF
    doc
      .fontSize(20)
      .text('ATM Withdrawal Invoice', { align: 'center' })
      .moveDown();
  
    doc
      .fontSize(14)
      .text(`Customer ID: ${customerId}`)
      .text(`Withdrawal Amount: PKR ${amount}`)
      .text(`Transaction Date: ${transactionDate}`)
      .moveDown();
  
    doc.text('Bills Dispensed:', { underline: true });
    for (const [denom, count] of Object.entries(dispensedBills)) {
      doc.text(`${denom} PKR: ${count} bills`);
    }
  
    // Finalize the PDF
    doc.end();
  
    return invoicePath;
}

exports.authenticate = async (req, res) => {
    const { customerId, pin } = req.body;

    if (!customerId || !pin) {
        return res.status(400).json({ message: 'Customer ID and PIN are required.' });
    }

    try {
        const customer = await db.accounts.findOne({ cnic: customerId });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        if (pin == customer.pin) {
            return res.status(200).json({ message: 'Authentication successful.' });
        } else {
            return res.status(401).json({ message: 'Invalid PIN.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
}

exports.createCustomer = async (req, res) => {
    try {
        await db.accounts({ cnic: "4240173238379", pin: 4444 }).save()
        res.status(200).json({ m: "Ok" })
    } catch (err) {
        res.json({ err })
    }
}

exports.initATM = async (req, res) => {
    const { denomination5000, denomination1000, denomination500 } = req.body;

    try {
        await db.atmBalance.deleteMany();
        await db.atmBalance({ denomination5000, denomination1000, denomination500 }).save();

        return res.status(201).json({ message: 'ATM initialized successfully.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
}

exports.withdraw = async (req, res) => {
    const { amount, customerId } = req.body;
    if (!amount || amount % 500 !== 0) {
        return res.status(400).json({ message: 'Amount must be in multiples of 500.' });
    }

    try {
        const atmBalance = await db.atmBalance.findOne();
        if (!atmBalance) {
            return res.status(500).json({ message: 'ATM balance data not available.' });
        }

        let remainingAmount = amount;
        const billsToDispense = { 5000: 0, 1000: 0, 500: 0 };
        const denominations = [5000, 1000, 500];
        for (const denom of denominations) {
            const availableBills = atmBalance[`denomination${denom}`];
            const billsNeeded = Math.floor(remainingAmount / denom);

            if (billsNeeded > 0) {
                const billsUsed = Math.min(billsNeeded, availableBills);
                billsToDispense[denom] = billsUsed;
                remainingAmount -= billsUsed * denom;
            }
        }

        if (remainingAmount > 0) {
            return res.status(400).json({ message: 'Insufficient funds or cannot dispense exact amount.' });
        }

        // Update ATM balance
        for (const denom of denominations) {
            atmBalance[`denomination${denom}`] -= billsToDispense[denom];
        }

        await atmBalance.save();
        const transaction = {
            customerId:"4240173238379",
            amount,
            dispensedBills:billsToDispense,
            transactionDate: new Date().toISOString(),
          };
          const invoicePath = generatePDFInvoice(transaction)
        return res.status(200).json({
            message: 'Withdrawal successful.',
            dispensedBills: billsToDispense,
            invoiceURL: `http://localhost:9000/invoices/${path.basename(invoicePath)}`,
        });

    } catch (error) {
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
}  
