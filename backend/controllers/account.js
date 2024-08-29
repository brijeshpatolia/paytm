const { default: mongoose } = require("mongoose");
const Account = require("../models/account");

exports.getBalance = async (req, res) => {
  try {
    // Get the userId from auth middleware
    const userId = req.userId;

    // Check the balance
    const account = await Account.findOne({ userId: userId });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // Return the balance
    res.status(200).json({
      balance: account.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the balance.",
    });
  }
};

exports.transferBalance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Extract the amount and recipient userId from the request body
    const { amount, to } = req.body;

    // Validate the amount
    if (amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Amount cannot be negative/Zero" });
    }

    // Get the sender's account
    const account = await Account.findOne({ userId: req.userId }).session(session);
    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Get the recipient's account
    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid account" });
    }

    // Perform the balance transfer
    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    ).session(session);

    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return success response
    res.status(200).json({
      message: "Transfer successful",
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred during the transfer.",
    });
  }
};
