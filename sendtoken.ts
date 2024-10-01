import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from "@solana/spl-token";
import { Connection, Keypair, ParsedAccountData, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
const secret = [95,22,183,155,111,22,177,227,146,33,163,150,181,84,68,205,97,139,70,239,7,162,24,193,235,116,220,148,219,137,171,18,96,205,128,218,39,183,228,22,165,119,20,210,32,46,81,114,19,104,201,57,71,68,97,34,19,75,130,3,161,230,205,26];
const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(secret));
console.log(`My public key is: ${FROM_KEYPAIR.publicKey.toString()}.`);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const DESTINATION_WALLET = 'DemoKMZWkk483hX4mUrcJoo3zVvsKhm8XXs28TuwZw9H'; 
const MINT_ADDRESS = 'EENnPYFGpryPtgt7SmfxgNh6WSdbqZDf9Fnbu8k9ZHik'; //You must change this value!
const TRANSFER_AMOUNT = 1;

async function getNumberDecimals(mintAddress: string):Promise<number> {
    const info = await connection.getParsedAccountInfo(new PublicKey(MINT_ADDRESS));
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
    return result;
}
async function sendTokens() {
    console.log(`Sending ${TRANSFER_AMOUNT} ${(MINT_ADDRESS)} from ${(FROM_KEYPAIR.publicKey.toString())} to ${(DESTINATION_WALLET)}.`)
    //Step 1
    console.log(`1 - Getting Source Token Account`);
    let sourceAccount = await getOrCreateAssociatedTokenAccount(
        connection, 
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS),
        FROM_KEYPAIR.publicKey
    );
    console.log(`    Source Account: ${sourceAccount.address.toString()}`);

    //Step 2
    console.log(`2 - Getting Destination Token Account`);
    let destinationAccount = await getOrCreateAssociatedTokenAccount(
        connection, 
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS),
        new PublicKey(DESTINATION_WALLET)
    );
    console.log(`    Destination Account: ${destinationAccount.address.toString()}`);

    //Step 3
    console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS}`);
    const numberDecimals = await getNumberDecimals(MINT_ADDRESS);
    console.log(`    Number of Decimals: ${numberDecimals}`);
    
    //Step 4
    console.log(`4 - Creating and Sending Transaction`);
    const tx = new Transaction();
    tx.add(createTransferInstruction(
        sourceAccount.address,
        destinationAccount.address,
        FROM_KEYPAIR.publicKey,
        TRANSFER_AMOUNT * Math.pow(10, numberDecimals)
    ))

    const latestBlockHash = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = await latestBlockHash.blockhash;    
    const signature = await sendAndConfirmTransaction(connection,tx,[FROM_KEYPAIR]);
    console.log(
        '\x1b[32m', //Green Text
        `   Transaction Success!🎉`,
        `\n    https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
}
sendTokens();