/**
 * modules/payments/paymentsController.js
 * Student-facing payment operations.
 */
const PaymentModel         = require("./paymentModel");
const { sendNotification } = require("../../utils/notify");

async function getMyPayments(req, res, next) {
  try {
    const { student_id } = req.student;
    const payments = await PaymentModel.findByStudent(student_id);
    const summary  = await PaymentModel.computeSummary(student_id);
    res.json({ payments, summary });
  } catch (err) { next(err); }
}

async function submitPayment(req, res, next) {
  try {
    const { student_id }       = req.student;
    const { fee_item, amount } = req.body;

    if (!fee_item || typeof fee_item !== "string" || fee_item.trim().length === 0) {
      return res.status(400).json({ error: "fee_item is required." });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0.01 || parsedAmount > 999999999.99) {
      return res.status(400).json({
        error: "Amount must be between ₱0.01 and ₱999,999,999.99.",
      });
    }

    const payment = await PaymentModel.create({
      student_id,
      fee_item: fee_item.trim(),
      amount:   parsedAmount,
    });

    sendNotification({
      student_id,
      message: `Your payment of ₱${parsedAmount.toLocaleString()} (${fee_item.trim()}) has been received and is pending verification.`,
      type:    "payment",
    });

    res.status(201).json({ message: "Payment submitted successfully.", payment });
  } catch (err) { next(err); }
}

module.exports = { getMyPayments, submitPayment };
