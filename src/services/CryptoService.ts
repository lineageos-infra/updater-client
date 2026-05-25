import CryptoWorker from './CryptoService.worker.ts?worker'

export interface SignInfo {
  commonName: string | undefined
  countryName: string | undefined
  localityName: string | undefined
  organizationalUnitName: string | undefined
  organizationName: string | undefined
  stateOrProvinceName: string | undefined
  publicKeyFingerprint: string
  serialNumber: string
  validity: { notBefore: Date; notAfter: Date }
}

export type VerifyResult =
  | { status: boolean; msg: string; signInfo: SignInfo }
  | { status: false; msg: string; signInfo?: undefined }

export default class CryptoService {
  static verifyPackage(blob: Blob): Promise<VerifyResult> {
    return new Promise((resolve, reject) => {
      const worker = new CryptoWorker()
      worker.onmessage = (event: MessageEvent<VerifyResult>) => {
        resolve(event.data)
        worker.terminate()
      }
      worker.onerror = (event) => {
        reject(new Error(event.message || 'Worker error'))
        worker.terminate()
      }
      worker.postMessage(blob)
    })
  }
}
