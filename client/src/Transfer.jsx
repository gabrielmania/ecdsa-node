import { useState } from "react";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import server from "./server";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    
    try {
      const [signature, recoveryBit] = await signAmount(sendAmount, privateKey);
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: toHex(signature), // convert signature to hex
        recoveryBit,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  // `signAmount` takes the amount and private key and signs it
  // return the `signedAmount` in Uint8Array data type
  async function signAmount(amount, key) {
    const signedAmount = await secp.sign(hashAmount(amount), key, {
      recovered: true,
    });
    return signedAmount;
  }

  // `hashAmount` takes the amount and hashes
  // returns the `hashedAmount` in Uint8Array data type
  function hashAmount(amount) {
    const hashedAmount = keccak256(utf8ToBytes(amount));
    return hashedAmount;
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
