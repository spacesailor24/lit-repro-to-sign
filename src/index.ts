import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork, LIT_RPC, AuthMethodScope } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";
import Hash from "typestub-ipfs-only-hash";

import { getEnv } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");

export const runExample = async (
  pkp?: {
    tokenId: any;
    publicKey: string;
    ethAddress: string;
  },
  capacityTokenId?: string
) => {
  let litNodeClient: LitNodeClient;

  try {
    const ethersSigner = new ethers.Wallet(
      ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    console.log("🔄 Connecting LitNodeClient to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.Datil,
      debug: true,
    });
    await litNodeClient.connect();
    console.log("✅ Connected LitNodeClient to Lit network");

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      network: LitNetwork.DatilTest,
      debug: true,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    if (!pkp) {
      console.log("🔄 Minting new PKP...");
      pkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
      console.log(
        `✅ Minted new PKP with public key: ${pkp.publicKey} and ETH address: ${pkp.ethAddress}`
      );
    }

    console.log("🔄 Adding example permitted Lit Action to the PKP");
    const litActionCode = `(() => {
      if (swallowError) {
        LitActions.signEcdsa({
          toSign,
          publicKey,
          sigName,
        })
      } else {
        LitActions.signEcdsa({
        toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
        publicKey,
        sigName,
      })
      }
    })();`;
    const litActionCodeIpfsCid = await Hash.of(litActionCode);

    await litContracts.addPermittedAction({
      ipfsId: litActionCodeIpfsCid,
      pkpTokenId: pkp.tokenId,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });
    console.log("✅ Example Lit Action permissions added to the PKP");

    console.log("🔄 Getting Session Sigs via an Auth Sig...");
    await litNodeClient.getLitActionSessionSigs({
      pkpPublicKey: pkp.publicKey,
      litActionCode: Buffer.from(litActionCode).toString("base64"),
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
      ],
      jsParams: {
        toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
        publicKey: pkp.publicKey,
        sigName: "sig1",
        swallowError: true,
      },
    });
    console.log("✅ Got Session Sigs via Lit Action");
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
