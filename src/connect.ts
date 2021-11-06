import { Endpoint } from "@ndn/endpoint";
import { Certificate, CertNaming, generateSigningKey, KeyChain, ValidityPeriod } from "@ndn/keychain";
import { CaProfile, ClientNopChallenge, requestCertificate } from "@ndn/ndncert";
import { enableNfdPrefixReg } from "@ndn/nfdmgmt";
import { Data, Signer } from "@ndn/packet";
import { Decoder } from "@ndn/tlv";
import { WsTransport } from "@ndn/ws-transport";

import { env } from "./env";

const keyChain = KeyChain.open("3ec5a464-ac23-488e-95d2-81b6798f3080");

export interface ConnectResult {
  myID: string;
  signer: Signer;
  userCert: Certificate;
  caCert: Certificate;
}

export async function connect(): Promise<ConnectResult> {
  const [profile, uplink] = await Promise.all([
    (async () => {
      const resp = await fetch("profile.data");
      const wire = new Uint8Array(await resp.arrayBuffer());
      const data = new Decoder(wire).decode(Data);
      return CaProfile.fromData(data);
    })(),
    WsTransport.createFace({}, env.ROUTER),
  ]);

  let userCert: Certificate | undefined;
  const validTime = Date.now() + 1800000;
  for (const certName of await keyChain.listCerts()) {
    const cert = await keyChain.getCert(certName);
    if (CertNaming.toSubjectName(cert.issuer!).equals(env.CA_PREFIX) &&
        cert.validity.includes(validTime)) {
      userCert = cert;
      break;
    }
  }
  if (!userCert) {
    userCert = await requestCert(profile);
  }
  new Endpoint().produce(
    CertNaming.toKeyName(userCert.name),
    async () => userCert!.data,
    { announcement: false },
  );

  const signer = await keyChain.getSigner(userCert.name);
  enableNfdPrefixReg(uplink, { signer });
  return {
    myID: CertNaming.toSubjectName(userCert.name).at(-1).text,
    signer,
    userCert,
    caCert: profile.cert,
  };
}

async function requestCert(profile: CaProfile): Promise<Certificate> {
  const myID = Math.trunc(Math.random() * 1e9).toString().padStart(8, "0");
  const subjectName = env.USER_PREFIX.append(myID);
  const [privateKey, publicKey] = await generateSigningKey(keyChain, subjectName);
  const cert = await requestCertificate({
    profile,
    publicKey,
    privateKey,
    validity: ValidityPeriod.MAX,
    challenges: [new ClientNopChallenge()],
  });
  await keyChain.insertCert(cert);
  return cert;
}
