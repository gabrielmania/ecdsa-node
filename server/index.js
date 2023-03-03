const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "047d75dba108f0401b3bba06cb16b773a48b7476897be4bb16ff202073f1a9236f46f94f813c3e9445d136ca8dbd26dca4f03508e163c33df6d714d6fb07f26650": 100, // a88889f4c32d2b82f2a034b9c96b4670d6d90a214f04c60c682994960e626de9
  "0403c897cd4de5783f94a7dc4f9142d4c7bb0748f51e5d66faadb77e6f6a60cb53e4952c8e3c3a8fbc38a8b3ec165cf63c19d13e31e7b864c7ba9a52fae1b46799": 50, // a951d6d155473af654b6fbe9a7dae178339e8cea09f6d03dc66d99f4decdb0df
  "049efbc61c8dafed4c255772bf0f5d922ab05182184a681a92f22e7b05017e718ab30e9ca78dbc8d50ac29fd8e0e11c34a5124cd6034bbb14a9b249d4a35f75bcd": 75, // 4393c792279ece60f4a2f365429f77e4ad019a2674c7a957e59a8242bd2994b6
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // TODO: Get a signature from the client-side application
  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  // TODO: Recover the public address from the signature
  const publicKey = secp.recoverPublicKey(
    keccak256(utf8ToBytes(amount.toString())),
    signature,
    recoveryBit
  );

  console.log("The public key of the sender is:", toHex(publicKey));

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
