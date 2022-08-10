// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction,
    SystemInstruction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        99,  83,  25, 100, 213, 187, 201, 240,  26, 186, 181,
       173,  80, 211, 117, 184,  84, 159, 221,  71,  92, 193,
        13, 162,   0, 251, 213,  16,  55,  12, 113, 240,  65,
        38,  68, 116, 163,  13, 201,  70, 134,  30, 186, 130,
       176, 183, 151, 115,  51, 209, 156, 137, 107, 192,  72,
       123, 119,  37, 244,  36,  81, 162, 234, 193
    ]            
);

var senderWallet = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
var receiverWallet = Keypair.generate();

const checkBalance = async() => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        var senderBalance = await connection.getBalance(
            new PublicKey(senderWallet.publicKey)
        );
        console.log(`Sender Wallet Balance: ${parseInt(senderBalance) / LAMPORTS_PER_SOL} SOL`);

        var receiverBalance = await connection.getBalance(
            new PublicKey(receiverWallet.publicKey)
        );
        console.log(`Receiver Wallet Balance: ${parseInt(receiverBalance) / LAMPORTS_PER_SOL} SOL`);

    } catch (err) {
        console.log(err);
    }
}

const airdropSoltoSender = async() => {
    try{
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // Aidrop 2 SOL to Sender wallet
        console.log("Airdopping some SOL to Sender wallet!");
        const fromAirDropSignature = await connection.requestAirdrop(
            new PublicKey(senderWallet.publicKey),
            2 * LAMPORTS_PER_SOL
        );

        // Latest blockhash (unique identifer of the block) of the cluster
        let latestBlockHash = await connection.getLatestBlockhash();

        // Confirm transaction using the last valid block height (refers to its time)
        // to check for transaction expiration
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: fromAirDropSignature
        });

        console.log("Airdrop completed for the Sender account");
    } catch (err) {
        console.log(err);
    }
}

const transerSolToReciever = async() => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        
        var senderBalance = await connection.getBalance(
            new PublicKey(senderWallet.publicKey)
        );

        var totalLamports = (parseInt(senderBalance) / LAMPORTS_PER_SOL) / 2;
        console.log("total SOL to send: ", totalLamports);
        console.log(`Sending ${totalLamports / LAMPORTS_PER_SOL} SOL to receiver's wallet`);

        // Send money from "from" wallet and into "to" wallet
        var transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: senderWallet.publicKey,
                toPubkey: receiverWallet.publicKey,
                lamports: LAMPORTS_PER_SOL * totalLamports
            })
        );

        // Sign transaction
        var signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [senderWallet]
        );
        console.log("Successfully Sent!");
        console.log('Signature is ', signature);
    } catch (err) {
        console.log(err);
    }
}

const mainFunction = async() =>
{
    await checkBalance();
    await airdropSoltoSender();
    await checkBalance();
    await transerSolToReciever();
    await checkBalance();
}

mainFunction();