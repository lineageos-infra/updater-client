import forge from 'node-forge'

export default class CryptoService {
  static arrayBufferToString(data: ArrayBuffer): string {
    return this.u8ArrayToString(new Uint8Array(data))
  }

  static u8ArrayToString(data: Uint8Array): string {
    return String.fromCharCode.apply(null, Array.from(data))
  }

  static async verifyPackage(data: Uint8Array) {
    if (data.length < 6) {
      return {
        status: false,
        msg: 'No signature in file (too small)'
      }
    }

    const footer = data.subarray(-6)
    const commentSize = (footer[4]! & 0xff) | ((footer[5]! & 0xff) << 8)
    const signatureStart = (footer[0]! & 0xff) | ((footer[1]! & 0xff) << 8)

    if (footer[2] != 0xff || footer[3] != 0xff) {
      return {
        status: false,
        msg: 'No signature in file (no footer)'
      }
    }

    // Check that we have found the start of the
    // end-of-central-directory record.
    const eocd = data.subarray(-(commentSize + 22), data.byteLength)

    if (eocd[0] != 0x50 || eocd[1] != 0x4b || eocd[2] != 0x05 || eocd[3] != 0x06) {
      return {
        status: false,
        msg: 'No signature in file (bad footer)'
      }
    }

    for (let i = 4; i < eocd.length - 3; ++i) {
      if (eocd[i] == 0x50 && eocd[i + 1] == 0x4b && eocd[i + 2] == 0x05 && eocd[i + 3] == 0x06) {
        return {
          status: false,
          msg: 'EOCD marker found after start of EOCD'
        }
      }
    }

    const signature = data.subarray(-signatureStart, data.byteLength - footer.length)
    const asn = forge.asn1.fromDer(this.u8ArrayToString(signature))
    const pkcs = forge.pkcs7.messageFromAsn1(asn)
    const certificate = (pkcs as forge.pkcs7.PkcsSignedData).certificates[0]!

    const signInfo = {
      // Subject
      commonName: certificate.subject.getField('CN')?.value,
      countryName: certificate.subject.getField('C')?.value,
      localityName: certificate.subject.getField('L')?.value,
      organizationalUnitName: certificate.subject.getField('OU')?.value,
      organizationName: certificate.subject.getField('O')?.value,
      stateOrProvinceName: certificate.subject.getField('ST')?.value,

      // Public key fingerprint
      publicKeyFingerprint: forge.pki.getPublicKeyFingerprint(certificate.publicKey, {
        encoding: 'hex',
        delimiter: ':'
      }),

      // Miscellaneous
      serialNumber: certificate.serialNumber,
      validity: certificate.validity
    }

    const message = data.subarray(0, data.byteLength - commentSize - 2) as Uint8Array<ArrayBuffer>
    let messageDigest = undefined

    switch (certificate.siginfo.algorithmOid) {
      case forge.pki.oids.sha1WithRSAEncryption:
        messageDigest = this.arrayBufferToString(await crypto.subtle.digest('SHA-1', message))
        break
      case forge.pki.oids.sha256WithRSAEncryption:
        messageDigest = this.arrayBufferToString(await crypto.subtle.digest('SHA-256', message))
        break
      default:
        return {
          status: false,
          msg: `Unsupported algorithmOid ${certificate.siginfo.algorithmOid}`,
          signInfo: signInfo
        }
    }

    const publicKey = certificate.publicKey as forge.pki.rsa.PublicKey
    if (!publicKey.verify(messageDigest, pkcs.rawCapture.signature)) {
      return {
        status: false,
        msg: 'Signature check failed (checksum mismatch)',
        signInfo: signInfo
      }
    }

    if (
      signInfo.publicKeyFingerprint !==
      '72:96:32:27:d6:6c:4c:4d:5f:a0:91:6a:c2:2c:79:3c:d4:5f:43:5c'
    ) {
      return {
        status: false,
        msg: 'Signature check failed (file is not signed by LineageOS)',
        signInfo: signInfo
      }
    }

    return {
      status: true,
      msg: 'Signature check passed',
      signInfo: signInfo
    }
  }
}
